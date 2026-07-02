import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createCustomScale,
    deleteCustomScale,
    fetchAllCustomScales,
    fetchMyCustomScales,
    updateCustomScale,
} from "@services/customScalesApi";
import type {
    CreateCustomScaleRequest,
    CustomScale,
    CustomScaleListPayload,
    UpdateCustomScaleRequest,
} from "@/types";

/** Escalas por página en el panel de administración. */
export const ADMIN_SCALE_PAGE_SIZE = 20;

const customScaleKeys = {
    mine: ["custom-scales", "mine"] as const,
    admin: ["custom-scales", "admin"] as const,
    adminList: (offset: number, search: string) => [...customScaleKeys.admin, { offset, search }] as const,
};

// ---------------------------------------------------------------- usuario

/** Escalas personalizadas del usuario autenticado. */
export function useMyCustomScales() {
    return useQuery<CustomScale[]>({
        queryKey: customScaleKeys.mine,
        queryFn: fetchMyCustomScales,
        staleTime: 60 * 1000,
    });
}

function useInvalidateMine() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: customScaleKeys.mine });
}

export function useCreateCustomScale() {
    const invalidate = useInvalidateMine();
    return useMutation({
        mutationFn: (payload: CreateCustomScaleRequest) => createCustomScale(payload),
        onSuccess: invalidate,
    });
}

export function useUpdateCustomScale() {
    const invalidate = useInvalidateMine();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateCustomScaleRequest }) => updateCustomScale(id, payload),
        onSuccess: invalidate,
    });
}

export function useDeleteCustomScale() {
    const invalidate = useInvalidateMine();
    return useMutation({
        mutationFn: (id: number) => deleteCustomScale(id),
        onSuccess: invalidate,
    });
}

// ---------------------------------------------------------------- admin

interface UseAdminCustomScalesParams {
    offset: number;
    search: string;
}

/** Listado global paginado de escalas (solo admin). */
export function useAdminCustomScales({ offset, search }: UseAdminCustomScalesParams) {
    return useQuery<CustomScaleListPayload>({
        queryKey: customScaleKeys.adminList(offset, search),
        queryFn: () => fetchAllCustomScales({ limit: ADMIN_SCALE_PAGE_SIZE, offset, search }),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
    });
}
