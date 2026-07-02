import type { Chord } from "@/types";

interface ChordDiagramProps {
    chord: Chord;
    /** Índice de la cuerda (0 = 6ª … 5 = 1ª) que suena ahora, para resaltarla. */
    activeString?: number;
    /** Nombres de las cuerdas al aire (6ª→1ª) para rotularlas arriba, p.ej. E A D G B E. */
    stringLabels?: string[];
}

const ACTIVE_COLOR = "#22d3ee";

const STRINGS = 6;
const FRETS = 5;
const CELL = 28;
const MARGIN_X = 18;
const MARGIN_TOP = 42;

/**
 * Diagrama de acorde en SVG. `chord.frets` va de la 6ª cuerda (izquierda) a la 1ª
 * (derecha): -1 = muteada (X), 0 = al aire (O), n = traste pisado.
 */
export default function ChordDiagram({ chord, activeString = -1, stringLabels }: Readonly<ChordDiagramProps>) {
    const width = MARGIN_X * 2 + (STRINGS - 1) * CELL;
    const height = MARGIN_TOP + FRETS * CELL + 12;

    return (
        <svg width={width} height={height} className="text-foreground" role="img" aria-label={`Acorde ${chord.name}`}>
            {/* Nombres de las cuerdas al aire */}
            {stringLabels?.map((label, i) => (
                <text
                    key={`label-${i}`}
                    x={MARGIN_X + i * CELL}
                    y={12}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill={i === activeString ? ACTIVE_COLOR : "#a1a1aa"}
                >
                    {label}
                </text>
            ))}

            {/* Cejilla / traste base */}
            {chord.baseFret > 1 && (
                <text x={2} y={MARGIN_TOP + CELL - 8} fontSize={11} fill="currentColor" opacity={0.7}>
                    {chord.baseFret}fr
                </text>
            )}

            {/* Trastes horizontales */}
            {Array.from({ length: FRETS + 1 }).map((_, i) => (
                <line
                    key={`fret-${i}`}
                    x1={MARGIN_X}
                    y1={MARGIN_TOP + i * CELL}
                    x2={MARGIN_X + (STRINGS - 1) * CELL}
                    y2={MARGIN_TOP + i * CELL}
                    stroke="currentColor"
                    strokeWidth={i === 0 && chord.baseFret === 1 ? 3 : 1}
                    opacity={0.6}
                />
            ))}

            {/* Cuerdas verticales */}
            {Array.from({ length: STRINGS }).map((_, i) => (
                <line
                    key={`string-${i}`}
                    x1={MARGIN_X + i * CELL}
                    y1={MARGIN_TOP}
                    x2={MARGIN_X + i * CELL}
                    y2={MARGIN_TOP + FRETS * CELL}
                    stroke="currentColor"
                    strokeWidth={1}
                    opacity={0.6}
                />
            ))}

            {/* Marcadores por cuerda */}
            {chord.frets.map((fret, i) => {
                const x = MARGIN_X + i * CELL;
                const active = i === activeString;
                if (fret === -1) {
                    return (
                        <text key={`m-${i}`} x={x} y={MARGIN_TOP - 10} fontSize={13} textAnchor="middle" fill="currentColor">
                            ×
                        </text>
                    );
                }
                if (fret === 0) {
                    return (
                        <circle
                            key={`m-${i}`}
                            cx={x}
                            cy={MARGIN_TOP - 14}
                            r={active ? 6 : 5}
                            fill="none"
                            stroke={active ? ACTIVE_COLOR : "currentColor"}
                            strokeWidth={active ? 2.5 : 1.5}
                        />
                    );
                }
                const relativeFret = fret - (chord.baseFret - 1);
                const cy = MARGIN_TOP + (relativeFret - 0.5) * CELL;
                return (
                    <g key={`m-${i}`}>
                        <circle cx={x} cy={cy} r={active ? 11 : 9} fill={active ? ACTIVE_COLOR : "var(--heroui-primary)"} />
                        {chord.fingers[i] > 0 && (
                            <text x={x} y={cy + 4} fontSize={11} textAnchor="middle" fill={active ? "#0a0a0a" : "#ffffff"} fontWeight={600}>
                                {chord.fingers[i]}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
