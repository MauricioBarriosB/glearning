/**
 * Servicios de autenticación. El envelope de la API es { success, data }.
 * El token se adjunta automáticamente por el interceptor de apiConfig.
 */

import { apiClient } from "./apiConfig";
import type {
    AuthSession,
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
    User,
} from "@/types";

interface Envelope<T> {
    success: boolean;
    data: T;
}

/** POST /api/auth/login → tokens + usuario. */
export async function login(payload: LoginRequest): Promise<AuthSession> {
    return apiClient.post<Envelope<AuthSession>>("/auth/login", payload).then((r) => r.data.data);
}

/** POST /api/auth/register → crea cuenta 'user' e inicia sesión. */
export async function register(payload: RegisterRequest): Promise<AuthSession> {
    return apiClient.post<Envelope<AuthSession>>("/auth/register", payload).then((r) => r.data.data);
}

/** GET /api/auth/me → usuario actual. */
export async function fetchCurrentUser(): Promise<User> {
    return apiClient.get<Envelope<User>>("/auth/me").then((r) => r.data.data);
}

/** POST /api/auth/logout → revoca el refresh token (best-effort). */
export async function logout(userId: number): Promise<void> {
    return apiClient.post("/auth/logout", { userId }).then(() => undefined);
}

/** PUT /api/auth/profile → actualiza nombre/email; devuelve el usuario actualizado. */
export async function updateProfile(payload: UpdateProfileRequest): Promise<User> {
    return apiClient.put<Envelope<User>>("/auth/profile", payload).then((r) => r.data.data);
}

/** PUT /api/auth/password → cambia la contraseña (requiere la actual). */
export async function updatePassword(payload: ChangePasswordRequest): Promise<void> {
    return apiClient.put("/auth/password", payload).then(() => undefined);
}
