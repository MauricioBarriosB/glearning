/**
 * Servicios de administración de usuarios (detrás de jwtAuth + adminAuth).
 * Rutas espejo de backend/app/Config/Routes.php.
 */

import { apiClient } from "./apiConfig";
import type { CreateUserRequest, UpdateUserRequest, User, UserListPayload } from "@/types";

interface Envelope<T> {
    success: boolean;
    data: T;
}

export interface AdminUserQuery {
    limit: number;
    offset: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
}

/** GET /api/admin/users */
export async function fetchUsers(query: AdminUserQuery): Promise<UserListPayload> {
    return apiClient
        .get<Envelope<UserListPayload>>("/admin/users", {
            params: {
                limit: query.limit,
                offset: query.offset,
                search: query.search?.trim() || undefined,
                sort: query.sort || undefined,
                order: query.order || undefined,
            },
        })
        .then((r) => r.data.data);
}

/** POST /api/admin/users — 409 USER_EXISTS si el email ya existe. */
export async function createUser(payload: CreateUserRequest): Promise<User> {
    return apiClient.post<Envelope<User>>("/admin/users", payload).then((r) => r.data.data);
}

/** PUT /api/admin/users/:id */
export async function updateUser(id: number, payload: UpdateUserRequest): Promise<User> {
    return apiClient.put<Envelope<User>>(`/admin/users/${id}`, payload).then((r) => r.data.data);
}

/** PUT /api/admin/users/:id/toggle-active */
export async function toggleUserActive(id: number): Promise<User> {
    return apiClient.put<Envelope<User>>(`/admin/users/${id}/toggle-active`, {}).then((r) => r.data.data);
}

/** DELETE /api/admin/users/:id — soft delete. */
export async function deleteUser(id: number): Promise<void> {
    return apiClient.delete(`/admin/users/${id}`).then(() => undefined);
}
