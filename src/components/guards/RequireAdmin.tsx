import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Protege rutas de administrador. No autenticados van a /login; autenticados no-admin
 * vuelven al home.
 */
export function RequireAdmin({ children }: Readonly<{ children: ReactNode }>) {
    const { isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}
