import { useEffect, useMemo, useRef, useState } from "react";
import {
    Accordion,
    AccordionItem,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Select,
    SelectItem,
    Slider,
    Switch,
} from "@heroui/react";
import { Volume2, Square, Music4 } from "lucide-react";
import DifficultyChip from "@components/DifficultyChip";
import { SCALE_FAMILIES, DEFAULT_SCALE_ID, DEFAULT_TUNING_ID } from "@/config/music";
import { useContent } from "@/context/ContentContext";
import { CHROMATIC, get3npsPattern, getBoxPattern, notesFromIntervals, positionCount } from "@/helpers/music";
import type { Note } from "@/types";
import Fretboard from "../components/Fretboard";
import TabStaff from "../components/TabStaff";
import { useScalePlayer, type PlayEvent } from "../hooks/useScalePlayer";

type PatternMode = "box" | "3nps";
type Direction = "up" | "down" | "updown";

export default function ScalesPage() {
    const [scaleId, setScaleId] = useState(DEFAULT_SCALE_ID);
    const [tuningId, setTuningId] = useState(DEFAULT_TUNING_ID);
    const [root, setRoot] = useState<Note>("E");
    const [showDegrees, setShowDegrees] = useState(false);
    const [patternMode, setPatternMode] = useState<PatternMode>("box");
    const [position, setPosition] = useState(0);
    const [bpm, setBpm] = useState(100);
    const [direction, setDirection] = useState<Direction>("up");
    const [loop, setLoop] = useState(false);
    const [metronome, setMetronome] = useState(false);

    const { scales, tunings } = useContent();
    const { isPlaying, activeIndex, play, stop, setTempo, setMetronome: setLiveMetronome } = useScalePlayer();
    const playingRef = useRef(false);
    useEffect(() => {
        playingRef.current = isPlaying;
    }, [isPlaying]);

    const scale = useMemo(() => scales.find((s) => s.id === scaleId) ?? scales[0], [scaleId, scales]);
    const tuning = useMemo(() => tunings.find((t) => t.id === tuningId) ?? tunings[0], [tuningId, tunings]);

    const posCount = positionCount(scale.intervals);
    const safePosition = Math.min(position, posCount - 1);

    const scaleNotes = useMemo(() => notesFromIntervals(root, scale.intervals), [root, scale]);
    const pattern = useMemo(
        () =>
            patternMode === "box"
                ? getBoxPattern(tuning.strings, root, scale.intervals, safePosition)
                : get3npsPattern(tuning.strings, root, scale.intervals),
        [patternMode, tuning, root, scale, safePosition],
    );

    const highlightKeys = useMemo(() => new Set(pattern.map((p) => `${p.stringIndex}:${p.fret}`)), [pattern]);
    const activeKey =
        activeIndex >= 0 && pattern[activeIndex]
            ? `${pattern[activeIndex].stringIndex}:${pattern[activeIndex].fret}`
            : undefined;

    const events = useMemo<PlayEvent[]>(() => {
        const up = pattern.map((p, i) => ({ pitch: p.pitch, tabIndex: i }));
        if (direction === "down") return [...up].reverse();
        if (direction === "updown") return up.concat([...up].reverse().slice(1));
        return up;
    }, [pattern, direction]);

    // Firma que identifica la secuencia; al cambiar (escala, tónica, afinación, patrón,
    // posición, dirección) o el loop, se reinicia la reproducción si está sonando.
    const sequenceKey = `${scaleId}|${tuningId}|${root}|${patternMode}|${safePosition}|${direction}|${loop}`;
    useEffect(() => {
        if (playingRef.current) play(events, { bpm, loop, metronome });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sequenceKey]);

    // Tempo y metrónomo se aplican en vivo, sin cortar el audio.
    useEffect(() => {
        if (playingRef.current) setTempo(bpm);
    }, [bpm, setTempo]);
    useEffect(() => {
        if (playingRef.current) setLiveMetronome(metronome);
    }, [metronome, setLiveMetronome]);

    const handlePlay = () => {
        if (isPlaying) stop();
        else play(events, { bpm, loop, metronome });
    };

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-3xl font-bold">Escalas</h1>
                <p className="text-default-500">
                    Elige una escala, la tónica y tu afinación. Verás el patrón en el diapasón y en tablatura, y podrás
                    escucharlo.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
                {/* Lista de escalas en acordeón por familia (una abierta a la vez) */}
                <aside>
                    <Accordion selectionMode="single" variant="splitted" defaultExpandedKeys={[scale.family]}>
                        {SCALE_FAMILIES.map((family) => {
                            const items = scales.filter((s) => s.family === family);
                            if (items.length === 0) return null;
                            return (
                                <AccordionItem
                                    key={family}
                                    aria-label={family}
                                    title={
                                        <span className="text-sm font-semibold">
                                            {family}{" "}
                                            <span className="text-xs font-normal text-default-400">
                                                ({items.length})
                                            </span>
                                        </span>
                                    }
                                >
                                    <div className="flex flex-col gap-2 pb-2">
                                        {items.map((s) => {
                                            const selected = s.id === scaleId;
                                            return (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setScaleId(s.id)}
                                                    className={`flex flex-col gap-0.5 rounded-medium border px-3 py-2 text-left transition-colors ${
                                                        selected
                                                            ? "border-primary bg-primary/10"
                                                            : "border-default-100 bg-content1 hover:border-default-300"
                                                    }`}
                                                >
                                                    <span
                                                        className={`font-medium ${selected ? "text-primary" : "text-foreground"}`}
                                                    >
                                                        {s.name}
                                                    </span>
                                                    <span className="font-mono text-xs text-default-500">
                                                        {s.formula}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </aside>

                {/* Panel de visualización */}
                <section className="space-y-5">
                    {/* Controles */}
                    <Card className="border border-default-100 bg-content1">
                        <CardBody className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-end gap-3">
                                <Select
                                    label="Tónica"
                                    size="sm"
                                    selectedKeys={[root]}
                                    onSelectionChange={(keys) => {
                                        const value = Array.from(keys as Set<string>)[0];
                                        if (value) setRoot(value as Note);
                                    }}
                                    className="w-24"
                                >
                                    {CHROMATIC.map((note) => (
                                        <SelectItem key={note}>{note}</SelectItem>
                                    ))}
                                </Select>

                                <Select
                                    label="Afinación"
                                    size="sm"
                                    selectedKeys={[tuningId]}
                                    onSelectionChange={(keys) => {
                                        const value = Array.from(keys as Set<string>)[0];
                                        if (value) setTuningId(value);
                                    }}
                                    className="w-56"
                                >
                                    {tunings.map((t) => (
                                        <SelectItem key={t.id}>{t.name}</SelectItem>
                                    ))}
                                </Select>

                                <Select
                                    label="Patrón"
                                    size="sm"
                                    selectedKeys={[patternMode]}
                                    onSelectionChange={(keys) => {
                                        const value = Array.from(keys as Set<string>)[0];
                                        if (value) setPatternMode(value as PatternMode);
                                    }}
                                    className="w-40"
                                >
                                    <SelectItem key="box">Caja (posición)</SelectItem>
                                    <SelectItem key="3nps">3 por cuerda</SelectItem>
                                </Select>

                                {patternMode === "box" && (
                                    <Select
                                        label="Posición"
                                        size="sm"
                                        selectedKeys={[String(safePosition)]}
                                        onSelectionChange={(keys) => {
                                            const value = Array.from(keys as Set<string>)[0];
                                            if (value) setPosition(Number(value));
                                        }}
                                        className="w-32"
                                    >
                                        {Array.from({ length: posCount }, (_, i) => (
                                            <SelectItem key={String(i)}>{`Posición ${i + 1}`}</SelectItem>
                                        ))}
                                    </Select>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
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
                                    className="w-44"
                                >
                                    <SelectItem key="up">Ascendente</SelectItem>
                                    <SelectItem key="down">Descendente</SelectItem>
                                    <SelectItem key="updown">Ida y vuelta</SelectItem>
                                </Select>

                                <Switch size="sm" isSelected={showDegrees} onValueChange={setShowDegrees}>
                                    <span className="text-sm text-default-500">Grados</span>
                                </Switch>

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
                                    startContent={isPlaying ? <Square size={16} /> : <Volume2 size={16} />}
                                >
                                    {isPlaying ? "Detener" : "Reproducir"}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Info de la escala */}
                    <Card className="border border-default-100 bg-content1">
                        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Music4 className="text-primary" size={20} />
                                <h2 className="text-xl font-semibold">
                                    {root} {scale.name}
                                </h2>
                                <DifficultyChip level={scale.difficulty} />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {scale.genres.map((genre) => (
                                    <Chip key={genre} size="sm" variant="flat">
                                        {genre}
                                    </Chip>
                                ))}
                            </div>
                        </CardHeader>
                        <CardBody className="gap-3 pt-0">
                            <p className="text-default-500">{scale.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {scaleNotes.map((note, i) => (
                                    <Chip key={`${note}-${i}`} variant="flat" color={i === 0 ? "primary" : "default"}>
                                        {note}
                                    </Chip>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Diapasón */}
                    <Card className="border border-default-100 bg-content1">
                        <CardHeader className="pb-0 text-sm font-semibold text-default-500">Diapasón</CardHeader>
                        <CardBody>
                            <Fretboard
                                strings={tuning.strings}
                                root={root}
                                intervals={scale.intervals}
                                labelMode={showDegrees ? "degree" : "note"}
                                highlightKeys={highlightKeys}
                                activeKey={activeKey}
                            />
                        </CardBody>
                    </Card>

                    {/* Tablatura */}
                    <Card className="border border-default-100 bg-content1">
                        <CardHeader className="pb-0 text-sm font-semibold text-default-500">
                            Tablatura ({patternMode === "box" ? `caja · posición ${safePosition + 1}` : "3 por cuerda"})
                        </CardHeader>
                        <CardBody>
                            <TabStaff strings={tuning.strings} positions={pattern} activeIndex={activeIndex} />
                        </CardBody>
                    </Card>
                </section>
            </div>
        </div>
    );
}
