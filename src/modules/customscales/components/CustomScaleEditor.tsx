import { useEffect, useMemo, useRef, useState } from "react";
import {
    addToast,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Slider,
    Switch,
    Textarea,
} from "@heroui/react";
import { Eraser, Music4, Save, Square, Trash2, Volume2 } from "lucide-react";
import DifficultyChip from "@components/DifficultyChip";
import { getErrorMessage } from "@services/apiConfig";
import { CHROMATIC, pitchAtFret, pitchToMidi } from "@/helpers/music";
import type { CustomScale, Difficulty, FretPosition, TabNote, Tuning } from "@/types";
import TabStaff from "@modules/scales/components/TabStaff";
import { useScalePlayer, type PlayEvent } from "@modules/scales/hooks/useScalePlayer";
import { useCreateCustomScale, useDeleteCustomScale, useUpdateCustomScale } from "../hooks/useCustomScales";
import TabEditor from "./TabEditor";

interface CustomScaleEditorProps {
    /** Escala en edición, o null para crear una nueva. */
    scale: CustomScale | null;
    tunings: Tuning[];
    defaultTuningId: string;
    /** Se llama tras crear/actualizar/eliminar para que el contenedor actualice su selección. */
    onSaved: (scale: CustomScale) => void;
    onDeleted: () => void;
}

type Direction = "up" | "down" | "updown";

const DIFFICULTY_OPTIONS: { key: Difficulty; label: string }[] = [
    { key: "beginner", label: "Principiante" },
    { key: "intermediate", label: "Intermedia" },
    { key: "advanced", label: "Avanzada" },
];

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

export default function CustomScaleEditor({
    scale,
    tunings,
    defaultTuningId,
    onSaved,
    onDeleted,
}: Readonly<CustomScaleEditorProps>) {
    const isEdit = scale !== null;

    // --- estado del formulario ---
    const [name, setName] = useState("");
    const [tuningId, setTuningId] = useState(defaultTuningId);
    const [notes, setNotes] = useState<TabNote[]>([]);
    const [description, setDescription] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
    const [touched, setTouched] = useState(false);

    // --- reproducción ---
    const [bpm, setBpm] = useState(100);
    const [direction, setDirection] = useState<Direction>("up");
    const [loop, setLoop] = useState(false);
    const [metronome, setMetronome] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(false);

    const createMut = useCreateCustomScale();
    const updateMut = useUpdateCustomScale();
    const deleteMut = useDeleteCustomScale();
    const saving = createMut.isPending || updateMut.isPending;

    const { isPlaying, activeIndex, play, stop, setTempo, setMetronome: setLiveMetronome } = useScalePlayer();
    const playingRef = useRef(false);
    useEffect(() => {
        playingRef.current = isPlaying;
    }, [isPlaying]);

    // Cargar la escala seleccionada (o resetear al crear). Detiene cualquier audio.
    useEffect(() => {
        stop();
        setName(scale?.name ?? "");
        setTuningId(scale?.tuningId ?? defaultTuningId);
        setNotes(scale?.notes ? [...scale.notes] : []);
        setDescription(scale?.description ?? "");
        setDifficulty(scale?.difficulty ?? "beginner");
        setTouched(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale]);

    const tuning = useMemo(() => tunings.find((t) => t.id === tuningId) ?? tunings[0], [tuningId, tunings]);
    const strings = tuning?.strings ?? [];

    // Pasos de reproducción: trastes usados en orden ascendente (izquierda→derecha).
    const stepFrets = useMemo(() => [...new Set(notes.map((n) => n.fret))].sort((a, b) => a - b), [notes]);

    // Posiciones para la tablatura de solo lectura, con su columna = paso (traste).
    // Notas del mismo traste comparten columna → se apilan (acorde).
    const { positions, columns } = useMemo(() => {
        const valid = notes
            .filter((n) => n.string < strings.length)
            .sort((a, b) => a.fret - b.fret || a.string - b.string);
        return {
            positions: valid.map((n) => toPosition(n, strings)),
            columns: valid.map((n) => stepFrets.indexOf(n.fret)),
        };
    }, [notes, strings, stepFrets]);

    // Un evento por traste; toca a la vez todas las notas de ese traste (distintas cuerdas).
    const events = useMemo<PlayEvent[]>(
        () =>
            stepFrets.map((fret, i) => ({
                pitch: notes
                    .filter((n) => n.fret === fret && n.string < strings.length)
                    .map((n) => pitchAtFret(strings[n.string], fret)),
                tabIndex: i,
            })),
        [stepFrets, notes, strings],
    );

    // Aplica la dirección de reproducción sin cambiar el tabIndex de cada paso (así el
    // resaltado sigue apuntando a la columna correcta).
    const orderedEvents = useMemo<PlayEvent[]>(() => {
        if (direction === "down") return [...events].reverse();
        if (direction === "updown") return events.concat([...events].reverse().slice(1));
        return events;
    }, [events, direction]);

    const activeFret = activeIndex >= 0 ? stepFrets[activeIndex] ?? -1 : -1;

    // Reinicia la reproducción al cambiar la secuencia si está sonando.
    const sequenceKey = `${tuningId}|${notes.map((n) => `${n.string}.${n.fret}`).join(",")}|${direction}|${loop}`;
    useEffect(() => {
        if (playingRef.current) play(orderedEvents, { bpm, loop, metronome });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sequenceKey]);

    useEffect(() => {
        if (playingRef.current) setTempo(bpm);
    }, [bpm, setTempo]);
    useEffect(() => {
        if (playingRef.current) setLiveMetronome(metronome);
    }, [metronome, setLiveMetronome]);

    // Al cambiar de afinación, descarta notas cuya cuerda ya no exista.
    const handleTuningChange = (nextId: string) => {
        const next = tunings.find((t) => t.id === nextId);
        setTuningId(nextId);
        if (next) setNotes((prev) => prev.filter((n) => n.string < next.strings.length));
    };

    const handlePlay = () => {
        if (isPlaying) stop();
        else play(orderedEvents, { bpm, loop, metronome });
    };

    const nameInvalid = touched && name.trim() === "";

    const handleSave = async () => {
        setTouched(true);
        if (name.trim() === "") return;
        if (notes.length < 2) {
            addToast({
                title: "Agrega más notas",
                description: "La escala debe tener al menos 2 notas en la tablatura.",
                color: "warning",
            });
            return;
        }

        const payload = {
            name: name.trim(),
            tuningId,
            tuningName: tuning?.name ?? "",
            strings,
            notes,
            description: description.trim() || null,
            difficulty,
        };

        try {
            if (isEdit && scale) {
                const updated = await updateMut.mutateAsync({ id: scale.id, payload });
                addToast({ title: "Escala actualizada", color: "success" });
                onSaved(updated);
            } else {
                const created = await createMut.mutateAsync(payload);
                addToast({ title: "Escala creada", color: "success" });
                onSaved(created);
            }
        } catch (err) {
            addToast({ title: "Error", description: getErrorMessage(err), color: "danger" });
        }
    };

    const handleDelete = async () => {
        if (!scale) return;
        try {
            await deleteMut.mutateAsync(scale.id);
            addToast({ title: "Escala eliminada", color: "success" });
            setConfirmDelete(false);
            onDeleted();
        } catch (err) {
            addToast({ title: "Error", description: getErrorMessage(err), color: "danger" });
        }
    };

    const noteNames = positions.map((p) => p.note);

    return (
        <section className="space-y-5">
            {/* Datos de la escala */}
            <Card className="border border-default-100 bg-content1">
                <CardHeader className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold">{isEdit ? "Editar escala" : "Nueva escala"}</h2>
                    <div className="flex items-center gap-2">
                        {isEdit && (
                            <Button
                                size="sm"
                                variant="flat"
                                color="danger"
                                startContent={<Trash2 size={16} />}
                                onPress={() => setConfirmDelete(true)}
                            >
                                Eliminar
                            </Button>
                        )}
                        <Button
                            size="sm"
                            color="primary"
                            startContent={<Save size={16} />}
                            onPress={handleSave}
                            isLoading={saving}
                        >
                            {isEdit ? "Guardar cambios" : "Guardar escala"}
                        </Button>
                    </div>
                </CardHeader>
                <CardBody className="gap-4">
                    <div className="flex flex-wrap items-start gap-3">
                        <Input
                            label="Nombre de la escala"
                            value={name}
                            onValueChange={setName}
                            onBlur={() => setTouched(true)}
                            isRequired
                            isInvalid={nameInvalid}
                            errorMessage={nameInvalid ? "El nombre es obligatorio." : undefined}
                            className="min-w-56 flex-1"
                        />
                        <Select
                            label="Afinación"
                            selectedKeys={[tuningId]}
                            onSelectionChange={(keys) => {
                                const value = Array.from(keys as Set<string>)[0];
                                if (value) handleTuningChange(value);
                            }}
                            disallowEmptySelection
                            className="w-56"
                        >
                            {tunings.map((t) => (
                                <SelectItem key={t.id}>{t.name}</SelectItem>
                            ))}
                        </Select>
                        <Select
                            label="Dificultad"
                            selectedKeys={[difficulty]}
                            onSelectionChange={(keys) => {
                                const value = Array.from(keys as Set<string>)[0];
                                if (value) setDifficulty(value as Difficulty);
                            }}
                            disallowEmptySelection
                            className="w-48"
                        >
                            {DIFFICULTY_OPTIONS.map((opt) => (
                                <SelectItem key={opt.key}>{opt.label}</SelectItem>
                            ))}
                        </Select>
                    </div>

                    <Textarea
                        label="Descripción (opcional)"
                        value={description}
                        onValueChange={setDescription}
                        minRows={2}
                        placeholder="¿De qué trata esta escala, dónde la usarías…?"
                    />
                </CardBody>
            </Card>

            {/* Controles de audio + limpiar, en una sola fila arriba de la tablatura */}
            <Card className="border border-default-100 bg-content1">
                <CardBody className="flex flex-row! flex-wrap items-center gap-4">
                    <Slider
                        label="Velocidad (BPM)"
                        size="sm"
                        minValue={40}
                        maxValue={240}
                        step={5}
                        value={bpm}
                        onChange={(value) => setBpm(Array.isArray(value) ? value[0] : value)}
                        className="w-52"
                    />
                    <Select
                        label="Dirección"
                        size="sm"
                        selectedKeys={[direction]}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys as Set<string>)[0];
                            if (value) setDirection(value as Direction);
                        }}
                        disallowEmptySelection
                        className="w-44"
                    >
                        <SelectItem key="up">Ascendente</SelectItem>
                        <SelectItem key="down">Descendente</SelectItem>
                        <SelectItem key="updown">Ida y vuelta</SelectItem>
                    </Select>
                    <Switch size="sm" isSelected={loop} onValueChange={setLoop}>
                        <span className="text-sm text-default-500">Repetir</span>
                    </Switch>
                    <Switch size="sm" isSelected={metronome} onValueChange={setMetronome}>
                        <span className="text-sm text-default-500">Metrónomo</span>
                    </Switch>
                    <Button
                        size="sm"
                        className="ml-auto"
                        color={isPlaying ? "danger" : "primary"}
                        onPress={handlePlay}
                        isDisabled={positions.length === 0}
                        startContent={isPlaying ? <Square size={16} /> : <Volume2 size={16} />}
                    >
                        {isPlaying ? "Detener" : "Reproducir"}
                    </Button>
                    <Button
                        size="sm"
                        variant="flat"
                        startContent={<Eraser size={16} />}
                        onPress={() => setNotes([])}
                        isDisabled={notes.length === 0}
                    >
                        Limpiar
                    </Button>
                </CardBody>
            </Card>

            {/* Tablatura editable — el usuario agrega sus propias notas */}
            <Card className="border border-default-100 bg-content1">
                <CardHeader className="flex-col items-start gap-0.5">
                    <h3 className="text-sm font-semibold text-default-600">Tablatura</h3>
                    <p className="text-xs text-default-400">
                        Haz clic en la tablatura para agregar tus notas (vuelve a hacer clic para quitarlas). El número
                        pequeño indica el orden de reproducción.
                    </p>
                </CardHeader>
                <CardBody>
                    <TabEditor strings={strings} notes={notes} onChange={setNotes} activeFret={activeFret} />
                </CardBody>
            </Card>

            {/* Info + secuencia */}
            <Card className="border border-default-100 bg-content1">
                <CardHeader className="flex flex-wrap items-center gap-2">
                    <Music4 className="text-primary" size={20} />
                    <h2 className="text-xl font-semibold">{name.trim() || "(sin nombre)"}</h2>
                    <DifficultyChip level={difficulty} />
                    <Chip size="sm" variant="flat" className="ml-auto">
                        {notes.length} {notes.length === 1 ? "nota" : "notas"}
                    </Chip>
                </CardHeader>
                <CardBody className="gap-3 pt-0">
                    {description.trim() && <p className="text-default-500">{description}</p>}
                    {noteNames.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {noteNames.map((note, i) => (
                                <Chip key={`${note}-${i}`} variant="flat" color={i === 0 ? "primary" : "default"}>
                                    {note}
                                </Chip>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Secuencia en tablatura (solo lectura, con la nota que suena resaltada) */}
            <Card className="border border-default-100 bg-content1">
                <CardHeader className="pb-0 text-sm font-semibold text-default-500">Secuencia</CardHeader>
                <CardBody>
                    {positions.length > 0 ? (
                        <TabStaff strings={strings} positions={positions} columns={columns} activeIndex={activeIndex} />
                    ) : (
                        <p className="text-sm text-default-400">Agrega notas en la tablatura de arriba para ver la secuencia.</p>
                    )}
                </CardBody>
            </Card>

            {/* Confirmación de borrado */}
            <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} isDismissable={!deleteMut.isPending}>
                <ModalContent>
                    <ModalHeader>Eliminar escala</ModalHeader>
                    <ModalBody>
                        <p className="text-default-600">
                            ¿Seguro que quieres eliminar <strong>{scale?.name}</strong>? Esta acción no se puede deshacer.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={() => setConfirmDelete(false)} isDisabled={deleteMut.isPending}>
                            Cancelar
                        </Button>
                        <Button color="danger" onPress={handleDelete} isLoading={deleteMut.isPending}>
                            Eliminar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </section>
    );
}
