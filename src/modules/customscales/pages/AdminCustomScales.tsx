import { useEffect, useMemo, useState } from "react";
import {
    addToast,
    Button,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
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
import { Eye, ListMusic, Search } from "lucide-react";
import DifficultyChip from "@components/DifficultyChip";
import { getErrorMessage } from "@services/apiConfig";
import { CHROMATIC, pitchAtFret, pitchToMidi } from "@/helpers/music";
import type { CustomScale, FretPosition, TabNote } from "@/types";
import TabStaff from "@modules/scales/components/TabStaff";
import { ADMIN_SCALE_PAGE_SIZE, useAdminCustomScales } from "../hooks/useCustomScales";

/** Convierte una nota (cuerda + traste) en una posición de tablatura. */
function toPosition(note: TabNote, strings: string[]): FretPosition {
    const pitch = pitchAtFret(strings[note.string], note.fret);
    return {
        stringIndex: note.string,
        fret: note.fret,
        pitch,
        note: CHROMATIC[pitchToMidi(pitch) % 12],
        isRoot: false,
        degree: "",
    };
}

function DetailBody({ scale }: Readonly<{ scale: CustomScale }>) {
    // Ordena por traste (izquierda→derecha); notas del mismo traste comparten columna.
    const { positions, columns } = useMemo(() => {
        const stepFrets = [...new Set(scale.notes.map((n) => n.fret))].sort((a, b) => a - b);
        const valid = scale.notes
            .filter((n) => n.string < scale.strings.length)
            .sort((a, b) => a.fret - b.fret || a.string - b.string);
        return {
            positions: valid.map((n) => toPosition(n, scale.strings)),
            columns: valid.map((n) => stepFrets.indexOf(n.fret)),
        };
    }, [scale]);
    return (
        <ModalBody className="gap-4 pb-6">
            {scale.description && <p className="text-default-500">{scale.description}</p>}
            <div className="flex flex-wrap items-center gap-2 text-sm text-default-500">
                <Chip size="sm" variant="flat">
                    {scale.tuningName}
                </Chip>
                <span>
                    {scale.notes.length} {scale.notes.length === 1 ? "nota" : "notas"}
                </span>
                <DifficultyChip level={scale.difficulty} />
            </div>
            {positions.length > 0 ? (
                <TabStaff strings={scale.strings} positions={positions} columns={columns} />
            ) : (
                <p className="text-sm text-default-400">Esta escala no tiene notas.</p>
            )}
        </ModalBody>
    );
}

export default function AdminCustomScales() {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [detail, setDetail] = useState<CustomScale | null>(null);

    // Debounce de búsqueda; al buscar, vuelve a la página 1.
    useEffect(() => {
        const t = setTimeout(() => {
            setPage(1);
            setSearch(searchInput);
        }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const { data, isPending, isError, error } = useAdminCustomScales({
        offset: (page - 1) * ADMIN_SCALE_PAGE_SIZE,
        search,
    });

    useEffect(() => {
        if (isError) addToast({ title: "Error", description: getErrorMessage(error), color: "danger" });
    }, [isError, error]);

    const scales = data?.scales ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_SCALE_PAGE_SIZE));

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-2">
                <ListMusic className="text-primary" />
                <h1 className="text-3xl font-bold">Escalas de usuarios</h1>
            </header>
            <p className="text-default-500">Todas las escalas personalizadas creadas por los usuarios de la plataforma.</p>

            <Input
                value={searchInput}
                onValueChange={setSearchInput}
                placeholder="Buscar por escala, usuario o email…"
                startContent={<Search size={18} className="text-default-400" />}
                className="max-w-sm"
                isClearable
                onClear={() => setSearchInput("")}
            />

            <Table aria-label="Escalas personalizadas" removeWrapper className="min-w-full">
                <TableHeader>
                    <TableColumn>ESCALA</TableColumn>
                    <TableColumn>USUARIO</TableColumn>
                    <TableColumn>AFINACIÓN</TableColumn>
                    <TableColumn>NOTAS</TableColumn>
                    <TableColumn>DIFICULTAD</TableColumn>
                    <TableColumn align="end">ACCIONES</TableColumn>
                </TableHeader>
                <TableBody
                    items={scales}
                    isLoading={isPending}
                    emptyContent={isPending ? "Cargando…" : "Sin escalas."}
                >
                    {(s) => (
                        <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell className="text-default-500">
                                <div className="flex flex-col">
                                    <span>{s.ownerName ?? "—"}</span>
                                    <span className="text-xs text-default-400">{s.ownerEmail}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Chip size="sm" variant="flat">
                                    {s.tuningName}
                                </Chip>
                            </TableCell>
                            <TableCell className="text-default-500">{s.notes.length}</TableCell>
                            <TableCell>
                                <DifficultyChip level={s.difficulty} />
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end">
                                    <Tooltip content="Ver detalle">
                                        <Button isIconOnly size="sm" variant="light" onPress={() => setDetail(s)}>
                                            <Eye size={16} />
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

            <Modal isOpen={detail !== null} onClose={() => setDetail(null)} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    {detail && (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <span className="text-lg font-semibold">{detail.name}</span>
                                <span className="text-xs font-normal text-default-400">
                                    {detail.ownerName} ({detail.ownerEmail})
                                </span>
                            </ModalHeader>
                            <DetailBody scale={detail} />
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
