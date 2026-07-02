/**
 * Servicios de escalas personalizadas.
 * Rutas de usuario detrás de jwtAuth; la de admin detrás de jwtAuth + adminAuth.
 * Espejo de backend/app/Config/Routes.php. El envelope de la API es { success, data }.
 */

import { apiClient } from "./apiConfig";
import type {
    CreateCustomScaleRequest,
    CustomScale,
    CustomScaleListPayload,
    UpdateCustomScaleRequest,
} from "@/types";

interface Envelope<T> {
    success: boolean;
    data: T;
}

/** GET /api/custom-scales — escalas del usuario autenticado. */
export async function fetchMyCustomScales(): Promise<CustomScale[]> {
    return apiClient.get<Envelope<CustomScale[]>>("/custom-scales").then((r) => r.data.data);
}

/** POST /api/custom-scales */
export async function createCustomScale(payload: CreateCustomScaleRequest): Promise<CustomScale> {
    return apiClient.post<Envelope<CustomScale>>("/custom-scales", payload).then((r) => r.data.data);
}

/** PUT /api/custom-scales/:id */
export async function updateCustomScale(id: number, payload: UpdateCustomScaleRequest): Promise<CustomScale> {
    return apiClient.put<Envelope<CustomScale>>(`/custom-scales/${id}`, payload).then((r) => r.data.data);
}

/** DELETE /api/custom-scales/:id — soft delete. */
export async function deleteCustomScale(id: number): Promise<void> {
    return apiClient.delete(`/custom-scales/${id}`).then(() => undefined);
}

export interface AdminCustomScaleQuery {
    limit: number;
    offset: number;
    search?: string;
}

/** GET /api/admin/custom-scales — todas las escalas (admin). */
export async function fetchAllCustomScales(query: AdminCustomScaleQuery): Promise<CustomScaleListPayload> {
    return apiClient
        .get<Envelope<CustomScaleListPayload>>("/admin/custom-scales", {
            params: {
                limit: query.limit,
                offset: query.offset,
                search: query.search?.trim() || undefined,
            },
        })
        .then((r) => r.data.data);
}

/** GET /api/admin/custom-scales/:id — detalle de cualquier escala (admin). */
export async function fetchCustomScaleDetail(id: number): Promise<CustomScale> {
    return apiClient.get<Envelope<CustomScale>>(`/admin/custom-scales/${id}`).then((r) => r.data.data);
}
