import { useState } from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Volume2 } from "lucide-react";
import DifficultyChip from "@components/DifficultyChip";
import { CHORD_FAMILIES, CHORD_FAMILY_INFO, DEFAULT_CHORD_FAMILY, DEFAULT_TUNING_ID } from "@/config/music";
import { useContent } from "@/context/ContentContext";
import { CHROMATIC } from "@/helpers/music";
import { applyTuning, buildChord } from "@/helpers/chords";
import type { Chord, ChordFamily, Note } from "@/types";
import ChordDiagram from "../components/ChordDiagram";
import { useChordPlayer } from "../hooks/useChordPlayer";

export default function ChordsPage() {
    const { chordShapes, openChords, tunings } = useContent();
    const [family, setFamily] = useState<ChordFamily>(DEFAULT_CHORD_FAMILY);
    const [root, setRoot] = useState<Note>("C");
    const [tuningId, setTuningId] = useState(DEFAULT_TUNING_ID);
    const { playingKey, activeString, strum } = useChordPlayer();

    // El diagrama de acordes es de 6 cuerdas: usamos las afinaciones de 6 cuerdas.
    const chordTunings = tunings.filter((t) => t.strings.length === 6);
    const tuning = chordTunings.find((t) => t.id === tuningId) ?? chordTunings[0];
    const stringLabels = tuning.strings.map((p) => p.replace(/\d+$/, ""));

    // Formas abiertas (fijas) de la tónica + formas móviles transpuestas, todas
    // reposicionadas a la afinación elegida.
    type ChordItem = { key: string; chord: Chord; shapeLabel: string; notes: { stringIndex: number; pitch: string }[] };

    const toItem = (baseChord: Chord, key: string, shapeLabel: string): ChordItem => {
        const { chord, notes } = applyTuning(baseChord, tuning.strings);
        return { key, chord, shapeLabel, notes };
    };

    const openItems: ChordItem[] = openChords.filter((c) => c.family === family && c.root === root).map((c) =>
        toItem(c, c.id, c.shapeLabel),
    );

    const movableItems: ChordItem[] = chordShapes.filter((s) => s.family === family).map((s) =>
        toItem(buildChord(s, root).chord, s.id, s.shapeLabel),
    );

    const items = [...openItems, ...movableItems];

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-3xl font-bold">Acordes</h1>
                <p className="text-default-500">
                    Elige la tónica y una familia. Verás el acorde en cada forma, con su digitación, y puedes
                    escucharlo.
                </p>
            </header>

            {/* Selector de tónica */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-default-500">Tónica:</span>
                {CHROMATIC.map((note) => {
                    const selected = note === root;
                    return (
                        <button
                            key={note}
                            onClick={() => setRoot(note)}
                            className={`h-9 min-w-9 rounded-medium border px-2 text-sm font-semibold transition-colors ${
                                selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-default-100 bg-content1 text-foreground hover:border-default-300"
                            }`}
                        >
                            {note}
                        </button>
                    );
                })}
            </div>

            {/* Selector de afinación */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-default-500">Afinación:</span>
                {chordTunings.map((t) => {
                    const selected = t.id === tuningId;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTuningId(t.id)}
                            className={`rounded-medium border px-3 py-1.5 text-sm font-medium transition-colors ${
                                selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-default-100 bg-content1 text-foreground hover:border-default-300"
                            }`}
                        >
                            {t.name}
                        </button>
                    );
                })}
            </div>

            {/* Selector de familias */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-default-500">Familia:</span>
                {CHORD_FAMILIES.map((fam) => {
                    const selected = fam === family;
                    return (
                        <button
                            key={fam}
                            onClick={() => setFamily(fam)}
                            className={`rounded-medium border px-3 py-1.5 text-sm font-medium transition-colors ${
                                selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-default-100 bg-content1 text-foreground hover:border-default-300"
                            }`}
                        >
                            {fam}
                        </button>
                    );
                })}
            </div>

            {/* Detalle: el acorde de la familia en la tónica elegida, en cada forma */}
            <section className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">{family}</h2>
                    <p className="text-default-500">{CHORD_FAMILY_INFO[family]}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((item) => (
                        <Card key={item.key} className="border border-default-100 bg-content1">
                            <CardHeader className="flex items-start justify-between pb-0">
                                <div>
                                    <h3 className="text-lg font-semibold">{item.chord.name}</h3>
                                    <p className="text-xs text-default-500">{item.shapeLabel}</p>
                                </div>
                                <DifficultyChip level={item.chord.difficulty} />
                            </CardHeader>
                            <CardBody className="items-center gap-3">
                                <ChordDiagram
                                    chord={item.chord}
                                    activeString={playingKey === item.key ? activeString : -1}
                                    stringLabels={stringLabels}
                                />
                                <Button
                                    size="sm"
                                    color="primary"
                                    startContent={<Volume2 size={16} />}
                                    onPress={() => strum(item.key, item.notes)}
                                >
                                    Reproducir
                                </Button>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
