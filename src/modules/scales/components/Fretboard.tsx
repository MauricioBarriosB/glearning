import { useMemo } from "react";
import type { Note } from "@/types";
import { CHROMATIC, getFretboardNotes } from "@/helpers/music";

interface FretboardProps {
    /** Cuerdas al aire con octava, de la más grave a la más aguda. */
    strings: string[];
    root: Note;
    intervals: number[];
    maxFret?: number;
    /** Qué texto mostrar en cada nota. */
    labelMode?: "note" | "degree";
    /** Claves "stringIndex:fret" del patrón activo; el resto del mapa se atenúa. */
    highlightKeys?: Set<string>;
    /** Clave "stringIndex:fret" de la nota que suena ahora. */
    activeKey?: string;
    /** Semitono (0-11) de la nota característica del modo, para destacarla en ámbar. */
    characteristicSemitone?: number;
}

const LEFT_PAD = 46;
const FRET_W = 48;
const ROW_H = 36;
const TOP_PAD = 14;
const BOTTOM_PAD = 26;
const RADIUS = 13;

const INLAY_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_INLAY = new Set([12, 24]);

export default function Fretboard({
    strings,
    root,
    intervals,
    maxFret = 15,
    labelMode = "note",
    highlightKeys,
    activeKey,
    characteristicSemitone = -1,
}: Readonly<FretboardProps>) {
    const rootPc = CHROMATIC.indexOf(root);
    const notes = useMemo(
        () => getFretboardNotes(strings, root, intervals, maxFret),
        [strings, root, intervals, maxFret],
    );

    const stringCount = strings.length;
    const width = LEFT_PAD + (maxFret + 1) * FRET_W + 14;
    const height = TOP_PAD + stringCount * ROW_H + BOTTOM_PAD;

    // La cuerda más grave (índice 0) va abajo.
    const yFor = (stringIndex: number) => TOP_PAD + (stringCount - 1 - stringIndex) * ROW_H + ROW_H / 2;
    const xFor = (fret: number) => LEFT_PAD + fret * FRET_W + FRET_W / 2;
    const boardTop = TOP_PAD + ROW_H / 2;
    const boardBottom = TOP_PAD + (stringCount - 1) * ROW_H + ROW_H / 2;

    return (
        <div className="overflow-x-auto">
            <svg width={width} height={height} role="img" aria-label="Diapasón de la escala">
                {/* Inlays (marcadores de traste) */}
                {Array.from({ length: maxFret }, (_, i) => i + 1).map((fret) => {
                    const cx = xFor(fret);
                    const cy = (boardTop + boardBottom) / 2;
                    if (DOUBLE_INLAY.has(fret)) {
                        return (
                            <g key={`inlay-${fret}`} fill="#27272a">
                                <circle cx={cx} cy={cy - ROW_H * 0.7} r={5} />
                                <circle cx={cx} cy={cy + ROW_H * 0.7} r={5} />
                            </g>
                        );
                    }
                    if (INLAY_FRETS.has(fret)) {
                        return <circle key={`inlay-${fret}`} cx={cx} cy={cy} r={5} fill="#27272a" />;
                    }
                    return null;
                })}

                {/* Trastes verticales (el nut, entre traste 0 y 1, más grueso) */}
                {Array.from({ length: maxFret + 1 }, (_, i) => i + 1).map((f) => (
                    <line
                        key={`wire-${f}`}
                        x1={LEFT_PAD + f * FRET_W}
                        y1={boardTop}
                        x2={LEFT_PAD + f * FRET_W}
                        y2={boardBottom}
                        stroke={f === 1 ? "#a1a1aa" : "#3f3f46"}
                        strokeWidth={f === 1 ? 4 : 1.5}
                    />
                ))}

                {/* Cuerdas horizontales (las graves más gruesas) */}
                {strings.map((_, s) => {
                    const y = yFor(s);
                    const thickness = 1 + ((stringCount - 1 - s) / stringCount) * 2.2;
                    return (
                        <g key={`string-${s}`}>
                            <line
                                x1={LEFT_PAD}
                                y1={y}
                                x2={LEFT_PAD + (maxFret + 1) * FRET_W}
                                y2={y}
                                stroke="#52525b"
                                strokeWidth={thickness}
                            />
                            <text x={LEFT_PAD - 12} y={y + 4} textAnchor="end" fontSize={12} fill="#a1a1aa" fontWeight={600}>
                                {strings[s].replace(/\d+$/, "")}
                            </text>
                        </g>
                    );
                })}

                {/* Números de traste */}
                {Array.from({ length: maxFret + 1 }, (_, f) => f).map((f) => (
                    <text
                        key={`num-${f}`}
                        x={xFor(f)}
                        y={height - 8}
                        textAnchor="middle"
                        fontSize={11}
                        fill={f === 0 ? "#71717a" : "#52525b"}
                    >
                        {f}
                    </text>
                ))}

                {/* Notas de la escala */}
                {notes.map((pos) => {
                    const cx = xFor(pos.fret);
                    const cy = yFor(pos.stringIndex);
                    const label = labelMode === "degree" ? pos.degree : pos.note;
                    const key = `${pos.stringIndex}:${pos.fret}`;
                    const inPattern = !highlightKeys || highlightKeys.has(key);
                    const isActive = activeKey === key;
                    const rel = (CHROMATIC.indexOf(pos.note) - rootPc + 12) % 12;
                    const isCharacteristic = !pos.isRoot && rel === characteristicSemitone;

                    let fill = "#18181b";
                    let stroke = "#6366f1";
                    let textFill = "#c7d2fe";
                    if (isActive) {
                        fill = "#22d3ee";
                        stroke = "#a5f3fc";
                        textFill = "#0a0a0a";
                    } else if (pos.isRoot) {
                        fill = "#6366f1";
                        stroke = "#a5b4fc";
                        textFill = "#ffffff";
                    } else if (isCharacteristic) {
                        fill = "#f59e0b";
                        stroke = "#fcd34d";
                        textFill = "#0a0a0a";
                    }

                    return (
                        <g key={`note-${key}`} opacity={inPattern ? 1 : 0.28}>
                            <circle
                                cx={cx}
                                cy={cy}
                                r={isActive ? RADIUS + 2 : RADIUS}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={pos.isRoot || isActive ? 2 : 1.5}
                            />
                            <text
                                x={cx}
                                y={cy + 4}
                                textAnchor="middle"
                                fontSize={label.length > 2 ? 9 : 11}
                                fontWeight={700}
                                fill={textFill}
                            >
                                {label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
