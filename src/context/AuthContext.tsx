import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { login as loginRequest, logout as logoutRequest, register as registerRequest } from "@services/authApi";
import type { AuthSession, LoginRequest, RegisterRequest, User } from "@/types";

// Mismas claves que lee el interceptor de apiConfig para adjuntar el token.
const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_TOKEN;
const REFRESH_KEY = import.meta.env.VITE_APP_REFRESH_TOKEN;
const USER_KEY = import.meta.env.VITE_APP_USER;

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (payload: LoginRequest) => Promise<void>;
    register: (payload: RegisterRequest) => Promise<void>;
    logout: () => void;
    /** Actualiza el usuario en memoria y en localStorage (p. ej. tras editar el perfil). */
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readUser(): User | null {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? (JSON.parse(raw) as User) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    // Restaura el usuario cacheado en el primer render para que los guards resuelvan.
    const [user, setUser] = useState<User | null>(readUser);

    const applySession = useCallback((session: AuthSession) => {
        localStorage.setItem(ACCESS_KEY, session.accessToken);
        localStorage.setItem(REFRESH_KEY, session.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(session.user));
        setUser(session.user);
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    }, []);

    const login = useCallback(
        async (payload: LoginRequest) => {
            applySession(await loginRequest(payload));
        },
        [applySession],
    );

    const register = useCallback(
        async (payload: RegisterRequest) => {
            applySession(await registerRequest(payload));
        },
        [applySession],
    );

    const logout = useCallback(() => {
        // Revocación server-side best-effort; limpia el estado local igualmente.
        if (user) void logoutRequest(user.id).catch(() => undefined);
        clearSession();
    }, [user, clearSession]);

    const updateUser = useCallback((next: User) => {
        localStorage.setItem(USER_KEY, JSON.stringify(next));
        setUser(next);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: user !== null,
            isAdmin: user?.role === "admin",
            login,
            register,
            logout,
            updateUser,
        }),
        [user, login, register, logout, updateUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    }
    return ctx;
}
