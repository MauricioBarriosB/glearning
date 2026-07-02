/**
 * Cliente Axios de la API de GLearning.
 *
 * - Adjunta `Authorization: Bearer <accessToken>` cuando hay token.
 * - Firma cada petición con HMAC (cabeceras X-Client-Id/Timestamp/Nonce/Signature).
 * - En 401 intenta UN refresh del token y reintenta la petición.
 * - Normaliza los errores al envelope { error, code, message, userMessage } y notifica a
 *   los listeners (toasts).
 */

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { signRequest } from "./sign";

const API_URL = import.meta.env.VITE_APP_API_URL;
const API_PREFIX = "/api";

export const API_ERROR_CODES = {
    AUTH_MISSING: "AUTH_MISSING",
    AUTH_EXPIRED: "AUTH_EXPIRED",
    AUTH_INVALID: "AUTH_INVALID",
    TOKEN_MISSING: "TOKEN_MISSING",
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    TOKEN_INVALID: "TOKEN_INVALID",
    NOT_FOUND: "NOT_FOUND",
    METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
    SERVER_ERROR: "SERVER_ERROR",
    NETWORK_ERROR: "NETWORK_ERROR",
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export interface ApiError {
    code: ApiErrorCode;
    message: string;
    userMessage: string;
    timestamp?: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: boolean;
    code?: string;
    message?: string;
    userMessage?: string;
}

type ErrorListener = (error: ApiError) => void;
const errorListeners: Set<ErrorListener> = new Set();

export function onApiError(listener: ErrorListener): () => void {
    errorListeners.add(listener);
    return () => errorListeners.delete(listener);
}

function notifyError(error: ApiError): void {
    errorListeners.forEach((listener) => {
        try {
            listener(error);
        } catch (e) {
            console.error("Error in API error listener:", e);
        }
    });
}

function createApiError(code: ApiErrorCode, message: string, userMessage: string): ApiError {
    return { code, message, userMessage, timestamp: Date.now() };
}

/** Claves de almacenamiento de tokens/usuario (del .env). */
const ACCESS_TOKEN_KEY = import.meta.env.VITE_APP_ACCESS_TOKEN;
const REFRESH_TOKEN_KEY = import.meta.env.VITE_APP_REFRESH_TOKEN;
const USER_KEY = import.meta.env.VITE_APP_USER;

function clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: { Accept: "application/json" },
    timeout: 30000,
});

/** Quita el query string de una url relativa. */
function stripQuery(url: string): string {
    const q = url.indexOf("?");
    return q === -1 ? url : url.slice(0, q);
}

/**
 * Request interceptor — adjunta el Bearer (si hay) y SIEMPRE firma la petición.
 * La firma HMAC es independiente del JWT (aplica también a endpoints públicos).
 */
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }

    const method = (config.method ?? "get").toUpperCase();
    const signedPath = `${API_PREFIX}${stripQuery(config.url ?? "")}`;
    const sig = await signRequest(method, signedPath);
    config.headers.set("X-Client-Id", sig.clientId);
    config.headers.set("X-Timestamp", sig.timestamp);
    config.headers.set("X-Nonce", sig.nonce);
    config.headers.set("X-Signature", sig.signature);

    return config;
});

// ---------------------------------------------------------------- refresh
let refreshInFlight: Promise<boolean> | null = null;

/** Intenta refrescar el access token (colapsa 401 concurrentes en un solo round-trip). */
async function tryRefresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (!refreshToken || !userRaw) return false;

    let userId: number;
    try {
        userId = JSON.parse(userRaw).id;
    } catch {
        return false;
    }

    refreshInFlight ??= (async () => {
        try {
            // Llamada axios cruda (evita los interceptores): la firmamos explícitamente.
            const sig = await signRequest("POST", `${API_PREFIX}/auth/refresh`);
            const res = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string; user: unknown }>>(
                `${API_URL}/auth/refresh`,
                { refreshToken, userId },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "X-Client-Id": sig.clientId,
                        "X-Timestamp": sig.timestamp,
                        "X-Nonce": sig.nonce,
                        "X-Signature": sig.signature,
                    },
                },
            );
            const data = res.data?.data;
            if (!res.data?.success || !data) {
                clearAuth();
                return false;
            }
            localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            return true;
        } catch {
            clearAuth();
            return false;
        } finally {
            refreshInFlight = null;
        }
    })();

    return refreshInFlight;
}

/**
 * Response interceptor — en 401 intenta un refresh + reintento; si no, normaliza el error.
 */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiResponse<unknown>>) => {
        const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
        const status = error.response?.status;
        const url = config?.url ?? "";
        const isAuthCall = /\/auth\/(login|register|refresh)/.test(url);

        // 401 → un refresh + replay (salvo endpoints de auth o si ya se reintentó).
        if (
            status === 401 &&
            config &&
            !config._retried &&
            !isAuthCall &&
            localStorage.getItem(REFRESH_TOKEN_KEY)
        ) {
            const ok = await tryRefresh();
            if (ok) {
                config._retried = true;
                return apiClient.request(config);
            }
        }

        let apiError: ApiError;

        if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK" || !error.response) {
            apiError = createApiError(
                API_ERROR_CODES.NETWORK_ERROR,
                "Network error: Unable to connect to API",
                "No se pudo conectar con el servidor. Revisa tu conexión.",
            );
        } else {
            const responseData = error.response.data;
            const errorCode = (responseData?.code as ApiErrorCode) || API_ERROR_CODES.UNKNOWN_ERROR;
            apiError = createApiError(
                errorCode,
                responseData?.message || `API error: ${error.response.status}`,
                responseData?.userMessage || "Ocurrió un error. Inténtalo nuevamente.",
            );

            // Sesión irrecuperable (refresh falló o token inválido): limpia y manda a login.
            if (status === 401 && !isAuthCall) {
                clearAuth();
                if (!window.location.pathname.endsWith("/login")) {
                    window.location.href = "/glearning/login";
                }
            }
        }

        notifyError(apiError);
        return Promise.reject(apiError);
    },
);

export function getErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "userMessage" in error) {
        return (error as ApiError).userMessage;
    }
    if (error instanceof Error) return error.message;
    return "Ocurrió un error inesperado.";
}
