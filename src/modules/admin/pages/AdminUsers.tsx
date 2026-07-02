import { useEffect, useState } from "react";
import {
    addToast,
    Button,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
} from "@heroui/react";
import { Pencil, Plus, Power, Search, Trash2, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@services/apiConfig";
import type { CreateUserRequest, UpdateUserRequest, User } from "@/types";
import UserFormModal from "../components/UserFormModal";
import {
    ADMIN_USER_PAGE_SIZE,
    useAdminUsers,
    useCreateUser,
    useDeleteUser,
    useToggleUserActive,
    useUpdateUser,
} from "../hooks/useAdminUsers";

export default function AdminUsers() {
    const { user: currentUser } = useAuth();

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

    // Debounce de búsqueda; al buscar, vuelve a la página 1.
    useEffect(() => {
        const t = setTimeout(() => {
            setPage(1);
            setSearch(searchInput);
        }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const { data, isPending, isError, error } = useAdminUsers({ offset: (page - 1) * ADMIN_USER_PAGE_SIZE, search });
    const createMut = useCreateUser();
    const updateMut = useUpdateUser();
    const toggleMut = useToggleUserActive();
    const deleteMut = useDeleteUser();

    useEffect(() => {
        if (isError) addToast({ title: "Error", description: getErrorMessage(error), color: "danger" });
    }, [isError, error]);

    const users = data?.users ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_USER_PAGE_SIZE));

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };
    const openEdit = (u: User) => {
        setEditing(u);
        setFormOpen(true);
    };

    const handleCreate = async (payload: CreateUserRequest) => {
        try {
            await createMut.mutateAsync(payload);
            addToast({ title: "Usuario creado", color: "success" });
            setFormOpen(false);
        } catch (err) {
            addToast({ title: "Error", description: getErrorMessage(err), color: "danger" });
        }
    };

    const handleUpdate = async (id: number, payload: UpdateUserRequest) => {
        try {
            await updateMut.mutateAsync({ id, payload });
            addToast({ title: "Usuario actualizado", color: "success" });
            setFormOpen(false);
        } catch (err) {
            addToast({ title: "Error", description: getErrorMessage(err), color: "danger" });
        }
    };

    const handleToggle = async (u: User) => {
        try {
            await toggleMut.mutateAsync(u.id);
        } catch (err) {
            addToast({ title: "Error", description: getErrorMessage(err), color: "danger" });
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMut.mutateAsync(deleteTarget.id);
            addToast({ title: "Usuario eliminado", color: "success" });
            setDeleteTarget(null);
        } catch (err) {
            addToast({ title: "Error", description: getErrorMessage(err), color: "danger" });
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Users className="text-primary" />
                    <h1 className="text-3xl font-bold">Usuarios</h1>
                </div>
                <Button color="primary" startContent={<Plus size={18} />} onPress={openCreate}>
                    Nuevo usuario
                </Button>
            </header>

            <Input
                value={searchInput}
                onValueChange={setSearchInput}
                placeholder="Buscar por nombre o email…"
                startContent={<Search size={18} className="text-default-400" />}
                className="max-w-sm"
                isClearable
                onClear={() => setSearchInput("")}
            />

            <Table aria-label="Usuarios" removeWrapper className="min-w-full">
                <TableHeader>
                    <TableColumn>NOMBRE</TableColumn>
                    <TableColumn>EMAIL</TableColumn>
                    <TableColumn>ROL</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                    <TableColumn align="end">ACCIONES</TableColumn>
                </TableHeader>
                <TableBody items={users} isLoading={isPending} emptyContent={isPending ? "Cargando…" : "Sin usuarios."}>
                    {(u) => (
                        <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.name}</TableCell>
                            <TableCell className="text-default-500">{u.email}</TableCell>
                            <TableCell>
                                <Chip size="sm" variant="flat" color={u.role === "admin" ? "primary" : "default"}>
                                    {u.role === "admin" ? "Administrador" : "Usuario"}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <Chip size="sm" variant="dot" color={u.isActive ? "success" : "default"}>
                                    {u.isActive ? "Activo" : "Inactivo"}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                    <Tooltip content="Editar">
                                        <Button isIconOnly size="sm" variant="light" onPress={() => openEdit(u)}>
                                            <Pencil size={16} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content={u.isActive ? "Desactivar" : "Activar"}>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color={u.isActive ? "warning" : "success"}
                                            onPress={() => handleToggle(u)}
                                            isDisabled={u.id === currentUser?.id}
                                        >
                                            <Power size={16} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Eliminar" color="danger">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="danger"
                                            onPress={() => setDeleteTarget(u)}
                                            isDisabled={u.id === currentUser?.id}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination total={totalPages} page={page} onChange={setPage} showControls />
                </div>
            )}

            <UserFormModal
                isOpen={formOpen}
                user={editing}
                isLoading={createMut.isPending || updateMut.isPending}
                onClose={() => setFormOpen(false)}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
            />

            <Modal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                isDismissable={!deleteMut.isPending}
            >
                <ModalContent>
                    <ModalHeader>Eliminar usuario</ModalHeader>
                    <ModalBody>
                        <p className="text-default-600">
                            ¿Seguro que quieres eliminar a <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})?
                            Esta acción lo desactiva y lo oculta de la plataforma.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={() => setDeleteTarget(null)} isDisabled={deleteMut.isPending}>
                            Cancelar
                        </Button>
                        <Button color="danger" onPress={handleDelete} isLoading={deleteMut.isPending}>
                            Eliminar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
