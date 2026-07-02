import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, deleteUser, fetchUsers, toggleUserActive, updateUser } from "@services/usersApi";
import type { CreateUserRequest, UpdateUserRequest, UserListPayload } from "@/types";

/** Usuarios por página en el panel admin. */
export const ADMIN_USER_PAGE_SIZE = 20;

const adminUserKeys = {
    all: ["admin", "users"] as const,
    list: (offset: number, search: string) => [...adminUserKeys.all, { offset, search }] as const,
};

interface UseAdminUsersParams {
    offset: number;
    search: string;
}

/** Lista paginada (offset/limit) de usuarios, con búsqueda. */
export function useAdminUsers({ offset, search }: UseAdminUsersParams) {
    return useQuery<UserListPayload>({
        queryKey: adminUserKeys.list(offset, search),
        queryFn: () => fetchUsers({ limit: ADMIN_USER_PAGE_SIZE, offset, search }),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
    });
}

function useInvalidateUsers() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
}

export function useCreateUser() {
    const invalidate = useInvalidateUsers();
    return useMutation({
        mutationFn: (payload: CreateUserRequest) => createUser(payload),
        onSuccess: invalidate,
    });
}

export function useUpdateUser() {
    const invalidate = useInvalidateUsers();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateUserRequest }) => updateUser(id, payload),
        onSuccess: invalidate,
    });
}

export function useToggleUserActive() {
    const invalidate = useInvalidateUsers();
    return useMutation({
        mutationFn: (id: number) => toggleUserActive(id),
        onSuccess: invalidate,
    });
}

export function useDeleteUser() {
    const invalidate = useInvalidateUsers();
    return useMutation({
        mutationFn: (id: number) => deleteUser(id),
        onSuccess: invalidate,
    });
}
