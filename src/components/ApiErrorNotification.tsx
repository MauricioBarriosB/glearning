import { useEffect, useCallback } from "react";
import { addToast } from "@heroui/react";
import { onApiError, API_ERROR_CODES, type ApiError } from "@services/apiConfig";

function getToastColor(code: string): "danger" | "warning" {
    switch (code) {
        case API_ERROR_CODES.NETWORK_ERROR:
        case API_ERROR_CODES.AUTH_EXPIRED:
            return "warning";
        default:
            return "danger";
    }
}

function getErrorTitle(code: string): string {
    switch (code) {
        case API_ERROR_CODES.AUTH_MISSING:
            return "Error de configuración";
        case API_ERROR_CODES.AUTH_EXPIRED:
            return "Sesión expirada";
        case API_ERROR_CODES.AUTH_INVALID:
            return "Autenticación fallida";
        case API_ERROR_CODES.NOT_FOUND:
            return "No encontrado";
        case API_ERROR_CODES.SERVER_ERROR:
            return "Error del servidor";
        case API_ERROR_CODES.NETWORK_ERROR:
            return "Error de conexión";
        default:
            return "Error";
    }
}

export default function ApiErrorNotification() {
    const handleApiError = useCallback((error: ApiError) => {
        addToast({
            title: getErrorTitle(error.code),
            description: error.userMessage,
            color: getToastColor(error.code),
            timeout: 6000,
        });
    }, []);

    useEffect(() => {
        const unsubscribe = onApiError(handleApiError);
        return unsubscribe;
    }, [handleApiError]);

    return null;
}
