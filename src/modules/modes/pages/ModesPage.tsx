import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { Volume2, Square, Sparkles } from "lucide-react";
import DifficultyChip from "@components/DifficultyChip";
import Fretboard from "@modules/scales/components/Fretboard";
import { useScalePlayer } from "@modules/scales/hooks/useScalePlayer";
import { DEFAULT_MODE_FAMILY, DEFAULT_TUNING_ID } from "@/config/music";
import { useContent } from "@/context/ContentContext";
import { CHROMATIC, getBoxPattern, notesFromIntervals, transpose } from "@/helpers/music";
import type { ModeView, Note, ScaleFamily } from "@/types";

export default function ModesPage() {
    const { modeFamilies, tunings } = useContent();
    const [familyId, setFamilyId] = useState<ScaleFamily>(DEFAULT_MODE_FAMILY);
    const [root, setRoot] = useState<Note>("C");
    const [tuningId, setTuningId] = useState(DEFAULT_TUNING_ID);
    const [modeId, setModeId] = useState<string>("dorian");

    const { isPlaying, activeIndex, play, stop } = useScalePlayer();

    const family = modeFamilies.find((f) => f.family === familyId) ?? modeFamilies[0];
    const tuning = tunings.find((t) => t.id === tuningId) ?? tunings[0];
    const mode = family.modes.find((m) => m.id === modeId) ?? family.modes[0];

    // Relación con la escala madre (p. ej. Re Dórico = Do mayor desde el grado 2).
    const parentScale = family.modes.find((m) => m.degree === 1) ?? family.modes[0];
    const parentTonic = transpose(root, -(parentScale.intervals[mode.degree - 1] ?? 0));

    const notes = notesFromIntervals(root, mode.intervals);
    const box = useMemo(
        () => getBoxPattern(tuning.strings, root, mode.intervals),
        [tuning, root, mode],
    );
    const activeKey =
        activeIndex >= 0 && box[activeIndex] ? `${box[activeIndex].stringIndex}:${box[activeIndex].fret}` : undefined;

    // Detener el audio al cambiar cualquier parámetro.
    useEffect(() => {
        stop();
    }, [modeId, root, tuningId, familyId, stop]);

    const selectFamily = (f: ScaleFamily) => {
        const next = modeFamilies.find((x) => x.family === f);
        setFamilyId(f);
        if (next) setModeId(next.modes[0].id);
    };

    const handlePlay = () => {
        if (isPlaying) stop();
        else play(box.map((p, i) => ({ pitch: p.pitch, tabIndex: i })), { bpm: 96, loop: false, metronome: false });
    };

    // Espectro de brillo (más brillante → más oscuro).
    const sorted = [...family.modes].sort((a, b) => b.brightness - a.brightness);
    const brights = family.modes.map((m) => m.brightness);
    const minB = Math.min(...brights);
    const maxB = Math.max(...brights);
    const colorFor = (m: ModeView) => {
        const t = maxB === minB ? 0.5 : (m.brightness - minB) / (maxB - minB);
        return `hsl(${Math.round(45 + (1 - t) * 205)}, 70%, ${Math.round(28 + t * 20)}%)`;
    };

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-3xl font-bold">Modos</h1>
                <p className="text-default-500">
                    Explora los modos: su escala madre, la nota que les da carácter y su brillo. Elige la tónica y la
                    afinación, míralos en el diapasón y escúchalos.
                </p>
            </header>

            {/* Selectores */}
            <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="w-20 text-sm font-medium text-default-500">Tónica:</span>
                    {CHROMATIC.map((note) => (
                        <button
                            key={note}
                            onClick={() => setRoot(note)}
                            className={`h-9 min-w-9 rounded-medium border px-2 text-sm font-semibold transition-colors ${
                                note === root
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-default-100 bg-content1 text-foreground hover:border-default-300"
                            }`}
                        >
                            {note}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="w-20 text-sm font-medium text-default-500">Afinación:</span>
                    {tunings.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTuningId(t.id)}
                            className={`rounded-medium border px-3 py-1.5 text-sm font-medium transition-colors ${
                                t.id === tuningId
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-default-100 bg-content1 text-foreground hover:border-default-300"
                            }`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="w-20 text-sm font-medium text-default-500">Familia:</span>
                    {modeFamilies.map((f) => (
                        <button
                            key={f.family}
                            onClick={() => selectFamily(f.family)}
                            className={`rounded-medium border px-3 py-1.5 text-sm font-medium transition-colors ${
                                f.family === familyId
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-default-100 bg-content1 text-foreground hover:border-default-300"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Espectro de brillo (también selecciona el modo) */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-default-500">
                    <span>☀ Más brillante</span>
                    <span>Espectro de brillo</span>
                    <span>Más oscuro 🌑</span>
                </div>
                <div className="flex gap-1 overflow-hidden rounded-medium">
                    {sorted.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setModeId(m.id)}
                            title={m.name}
                            style={{ backgroundColor: colorFor(m) }}
                            className={`flex-1 truncate px-2 py-2 text-xs font-semibold text-white transition-all ${
                                m.id === mode.id ? "ring-2 ring-inset ring-white" : "opacity-85 hover:opacity-100"
                            }`}
                        >
                            {m.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Detalle del modo */}
            <Card className="border border-default-100 bg-content1">
                <CardHeader className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-semibold">
                            {root} {mode.name}
                        </h2>
                        <Chip size="sm" variant="flat" color="primary">
                            {mode.degree}º modo
                        </Chip>
                        <DifficultyChip level={mode.difficulty} />
                    </div>
                    <Button
                           size="sm"
                        color={isPlaying ? "danger" : "primary"}
                        onPress={handlePlay}
                        startContent={isPlaying ? <Square size={16} /> : <Volume2 size={16} />}
                    >
                        {isPlaying ? "Detener" : "Reproducir"}
                    </Button>
                </CardHeader>
                <CardBody className="gap-4 pt-0">
                    <p className="text-default-500">{mode.mood}</p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-medium bg-content2 p-3">
                            <p className="text-xs uppercase tracking-wide text-default-400">Escala madre</p>
                            <p className="font-medium">
                                {root} {mode.name} = {parentTonic} {parent(family.parent)} desde el grado {mode.degree}
                            </p>
                        </div>
                        <div className="rounded-medium bg-content2 p-3">
                            <p className="text-xs uppercase tracking-wide text-default-400">Nota característica</p>
                            <p className="font-medium">
                                <span className="text-amber-400">{mode.charLabel || "—"}</span>
                                <span className="ml-2 font-mono text-sm text-default-500">{mode.formula}</span>
                            </p>
                        </div>
                        <div className="rounded-medium bg-content2 p-3">
                            <p className="text-xs uppercase tracking-wide text-default-400">Acorde típico</p>
                            <p className="font-medium">
                                {root}
                                {mode.chord}
                                {mode.vamp ? <span className="ml-2 text-sm text-default-500">· {mode.vamp}</span> : null}
                            </p>
                        </div>
                        <div className="rounded-medium bg-content2 p-3">
                            <p className="text-xs uppercase tracking-wide text-default-400">Dónde se escucha</p>
                            <p className="text-sm text-default-500">{mode.examples || mode.genres.join(" · ")}</p>
                        </div>
                    </div>

                    {/* Notas del modo, con tónica (índigo) y característica (ámbar) */}
                    <div className="flex flex-wrap gap-2">
                        {notes.map((note, i) => {
                            const rel = ((mode.intervals[i] % 12) + 12) % 12;
                            const isRoot = i === 0;
                            const isChar = rel === mode.charSemitone && !isRoot;
                            return (
                                <Chip
                                    key={`${note}-${i}`}
                                    variant={isChar ? "solid" : "flat"}
                                    color={isRoot ? "primary" : "default"}
                                    className={isChar ? "bg-amber-500 text-black" : undefined}
                                >
                                    {note}
                                </Chip>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>

            {/* Diapasón */}
            <Card className="border border-default-100 bg-content1">
                <CardHeader className="flex items-center gap-2 pb-0 text-sm font-semibold text-default-500">
                    <Sparkles size={16} className="text-amber-400" />
                    Diapasón — tónica (índigo) y nota característica (ámbar)
                </CardHeader>
                <CardBody>
                    <Fretboard
                        strings={tuning.strings}
                        root={root}
                        intervals={mode.intervals}
                        characteristicSemitone={mode.charSemitone}
                        activeKey={activeKey}
                    />
                </CardBody>
            </Card>
        </div>
    );
}

/** La escala madre en minúsculas dentro de la frase. */
function parent(name: string): string {
    return name.toLowerCase();
}
