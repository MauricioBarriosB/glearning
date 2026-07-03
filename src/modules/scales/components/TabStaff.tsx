import type { FretPosition } from "@/types";

interface TabStaffProps {
    /** Cuerdas al aire con octava, de la más grave a la más aguda. */
    strings: string[];
    /** Notas del patrón, en orden de reproducción. */
    positions: FretPosition[];
    /** Índice de la nota/columna que suena ahora (para resaltar). */
    activeIndex?: number;
    /**
     * Columna de cada posición (paralelo a `positions`). Permite que varias notas compartan
     * columna (p. ej. un acorde: mismo traste, distintas cuerdas). Por defecto cada posición
     * ocupa su propia columna. `activeIndex` se compara contra la columna.
     */
    columns?: number[];
    /**
     * Divisores cosméticos: líneas verticales dibujadas en el hueco anterior a la columna
     * indicada (0..nº de columnas). Solo decorativos; no afectan nada.
     */
    dividers?: number[];
}

const LEFT_PAD = 40;
const COL_W = 30;
const ROW_H = 24;
const TOP_PAD = 12;
const BOTTOM_PAD = 12;

export default function TabStaff({ strings, positions, activeIndex = -1, columns, dividers }: Readonly<TabStaffProps>) {
    const stringCount = strings.length;
    const colOf = (i: number) => columns?.[i] ?? i;
    const columnCount = positions.length > 0 ? Math.max(...positions.map((_, i) => colOf(i))) + 1 : 0;
    const width = LEFT_PAD + (columnCount + 1) * COL_W;
    const height = TOP_PAD + (stringCount - 1) * ROW_H + TOP_PAD + BOTTOM_PAD;

    // La cuerda más grave (índice 0) va abajo.
    const yFor = (stringIndex: number) => TOP_PAD + (stringCount - 1 - stringIndex) * ROW_H;
    const xFor = (col: number) => LEFT_PAD + (col + 0.5) * COL_W;
    const boardBottom = yFor(0);

    return (
        <div className="overflow-x-auto">
            <svg width={width} height={height} role="img" aria-label="Tablatura de la escala">
                {/* Líneas de cuerda + etiqueta al aire */}
                {strings.map((_, s) => {
                    const y = yFor(s);
                    return (
                        <g key={`line-${s}`}>
                            <line x1={LEFT_PAD} y1={y} x2={width - 6} y2={y} stroke="#3f3f46" strokeWidth={1} />
                            <text
                                x={LEFT_PAD - 10}
                                y={y + 4}
                                textAnchor="end"
                                fontSize={11}
                                fontWeight={600}
                                fill="#a1a1aa"
                                fontFamily="monospace"
                            >
                                {strings[s].replace(/\d+$/, "")}
                            </text>
                        </g>
                    );
                })}

                {/* Barra vertical inicial */}
                <line x1={LEFT_PAD} y1={yFor(stringCount - 1)} x2={LEFT_PAD} y2={boardBottom} stroke="#52525b" strokeWidth={2} />

                {/* Divisores cosméticos (líneas verticales blancas) */}
                {dividers?.map((p) => {
                    const x = LEFT_PAD + p * COL_W;
                    return <line key={`divider-${p}`} x1={x} y1={yFor(stringCount - 1) - 4} x2={x} y2={boardBottom + 4} stroke="#ffffff" strokeWidth={2} />;
                })}

                {/* Números de traste por columna */}
                {positions.map((pos, i) => {
                    const cx = xFor(colOf(i));
                    const cy = yFor(pos.stringIndex);
                    const text = String(pos.fret);
                    const active = colOf(i) === activeIndex;
                    return (
                        <g key={`fret-${pos.stringIndex}-${colOf(i)}`}>
                            <rect
                                x={cx - 9}
                                y={cy - 9}
                                width={18}
                                height={18}
                                rx={4}
                                fill={active ? "#6366f1" : "#0a0a0a"}
                            />
                            <text
                                x={cx}
                                y={cy + 4}
                                textAnchor="middle"
                                fontSize={12}
                                fontWeight={700}
                                fontFamily="monospace"
                                fill={active ? "#ffffff" : pos.isRoot ? "#a5b4fc" : "#e4e4e7"}
                            >
                                {text}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
