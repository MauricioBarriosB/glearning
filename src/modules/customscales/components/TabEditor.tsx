import { useState } from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { Eraser, Plus, SeparatorVertical } from "lucide-react";
import { pitchAtFret } from "@/helpers/music";
import type { TabNote } from "@/types";

interface TabEditorProps {
    /** Cuerdas al aire con octava, de la más grave (índice 0) a la más aguda. */
    strings: string[];
    /** Secuencia de notas actual, en el orden en que se tocan. */
    notes: TabNote[];
    onChange: (notes: TabNote[]) => void;
    /** Divisores cosméticos: nº de notas a la izquierda de cada línea (0..N). */
    dividers?: number[];
    onDividersChange?: (dividers: number[]) => void;
    maxFret?: number;
    /** Índice de la nota que suena ahora (para resaltar durante la reproducción). */
    activeIndex?: number;
}

// Geometría de la tablatura (SVG).
const LEFT_PAD = 44;
const COL_W = 34;
const ROW_H = 24;
const TOP_PAD = 14;
const BOTTOM_PAD = 30;
// Espacio horizontal en blanco que inserta cada divisor (para darle margen a ambos lados).
const DIVIDER_PAD = 18;

/**
 * Tablatura editable como una única vista: el usuario agrega notas eligiendo una cuerda e
 * indicando el número de traste; cada nota se añade al final de la secuencia, por lo que una
 * misma cuerda+traste puede repetirse cuantas veces se quiera. Las notas se tocan de izquierda a
 * derecha (una por columna). Al hacer clic en una nota de la tablatura se elimina.
 */
export default function TabEditor({
    strings,
    notes,
    onChange,
    dividers = [],
    onDividersChange,
    maxFret = 24,
    activeIndex = -1,
}: Readonly<TabEditorProps>) {
    const stringCount = strings.length;
    const [stringIndex, setStringIndex] = useState(0);
    const [fret, setFret] = useState("0");

    const safeString = Math.min(Math.max(stringIndex, 0), Math.max(stringCount - 1, 0));
    const fretNum = Number(fret);
    const fretValid = Number.isInteger(fretNum) && fretNum >= 0 && fretNum <= maxFret;

    const addNote = () => {
        if (!fretValid || stringCount === 0) return;
        onChange([...notes, { string: safeString, fret: fretNum }]);
    };

    const removeAt = (index: number) => {
        onChange(notes.filter((_, i) => i !== index));
        // Al quitar una nota, los divisores a su derecha se corren una posición para no descolocarse.
        onDividersChange?.([...new Set(dividers.map((p) => (p > index ? p - 1 : p)))].sort((a, b) => a - b));
    };

    const addDivider = () => {
        // Se agrega al final (tras la última nota); sin duplicar si ya existe uno ahí.
        const end = notes.length;
        if (dividers.includes(end)) return;
        onDividersChange?.([...dividers, end].sort((a, b) => a - b));
    };

    const removeDivider = (position: number) => onDividersChange?.(dividers.filter((p) => p !== position));

    // La cuerda más grave (índice 0) va abajo, como en una tablatura real.
    const yFor = (s: number) => TOP_PAD + (stringCount - 1 - s) * ROW_H;
    // Cada divisor inserta DIVIDER_PAD de espacio: las notas a su derecha se corren, y la línea
    // queda centrada en ese espacio con holgura simétrica a ambos lados.
    const xFor = (col: number) => LEFT_PAD + (col + 0.5) * COL_W + dividers.filter((p) => p <= col).length * DIVIDER_PAD;
    const dividerX = (p: number) => LEFT_PAD + p * COL_W + dividers.filter((d) => d < p).length * DIVIDER_PAD + DIVIDER_PAD / 2;
    const boardBottom = yFor(0);
    const width = LEFT_PAD + (notes.length + 1) * COL_W + dividers.length * DIVIDER_PAD;
    const height = TOP_PAD + Math.max(stringCount - 1, 0) * ROW_H + TOP_PAD + BOTTOM_PAD;

    return (
        <div className="space-y-4">
            {/* Alta de nota: cuerda + número de traste.
                Etiquetas al lado (outside-left) para que cada control sea de una sola altura y
                quede alineado verticalmente al centro con los botones de la fila. */}
            <div className="flex flex-wrap items-center gap-3">
                <Select
                    label="Cuerda"
                    labelPlacement="outside-left"
                    size="sm"
                    selectedKeys={[String(safeString)]}
                    onSelectionChange={(keys) => {
                        const value = Array.from(keys as Set<string>)[0];
                        if (value !== undefined) setStringIndex(Number(value));
                    }}
                    disallowEmptySelection
                    className="w-40"
                >
                    {/* De la más aguda (arriba) a la más grave, como en la tablatura. */}
                    {strings
                        .map((s, i) => ({ label: s.replace(/\d+$/, ""), value: i, pitch: s }))
                        .reverse()
                        .map(({ label, value, pitch }) => (
                            <SelectItem key={String(value)} textValue={label}>
                                {label} <span className="text-default-400">({pitch})</span>
                            </SelectItem>
                        ))}
                </Select>
                <Input
                    label="Traste"
                    labelPlacement="outside-left"
                    size="sm"
                    type="number"
                    min={0}
                    max={maxFret}
                    value={fret}
                    onValueChange={setFret}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") addNote();
                    }}
                    isInvalid={fret !== "" && !fretValid}
                    errorMessage={fret !== "" && !fretValid ? `Entre 0 y ${maxFret}.` : undefined}
                    className="w-28"
                />
                <Button
                    size="sm"
                    color="primary"
                    startContent={<Plus size={16} />}
                    onPress={addNote}
                    isDisabled={!fretValid || stringCount === 0}
                >
                    Agregar nota
                </Button>
                <Button
                    size="sm"
                    color="primary"
                    startContent={<SeparatorVertical size={16} />}
                    onPress={addDivider}
                    isDisabled={notes.length === 0 || !onDividersChange}
                >
                    Agregar divisor
                </Button>
                <Button
                    size="sm"
                    variant="flat"
                    startContent={<Eraser size={16} />}
                    onPress={() => {
                        onChange([]);
                        onDividersChange?.([]);
                    }}
                    isDisabled={notes.length === 0}
                >
                    Limpiar
                </Button>
            </div>

            {/* Tablatura */}
            {notes.length === 0 ? (
                <p className="text-sm text-default-400">
                    Aún no hay notas. Elige una cuerda, escribe el número de traste y pulsa «Agregar nota».
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <svg width={width} height={height} role="img" aria-label="Tablatura de la escala">
                        {/* Líneas de cuerda + etiqueta al aire */}
                        {strings.map((s, i) => {
                            const y = yFor(i);
                            return (
                                <g key={`line-${i}`}>
                                    <line x1={LEFT_PAD} y1={y} x2={width - 6} y2={y} stroke="#3f3f46" strokeWidth={1} />
                                    <text
                                        x={LEFT_PAD - 12}
                                        y={y + 4}
                                        textAnchor="end"
                                        fontSize={11}
                                        fontWeight={600}
                                        fill="#a1a1aa"
                                        fontFamily="monospace"
                                    >
                                        {s.replace(/\d+$/, "")}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Barra vertical inicial */}
                        <line x1={LEFT_PAD} y1={yFor(stringCount - 1)} x2={LEFT_PAD} y2={boardBottom} stroke="#52525b" strokeWidth={2} />

                        {/* Notas: una por columna, clic para quitar */}
                        {notes.map((note, i) => {
                            const cx = xFor(i);
                            const cy = yFor(note.string);
                            const active = i === activeIndex;
                            return (
                                <g
                                    key={`note-${i}`}
                                    className="cursor-pointer"
                                    onClick={() => removeAt(i)}
                                    role="button"
                                    aria-label={`Quitar traste ${note.fret} de la cuerda ${strings[note.string]?.replace(/\d+$/, "") ?? ""}`}
                                >
                                    <title>{`${pitchAtFret(strings[note.string], note.fret)} · traste ${note.fret} — clic para quitar`}</title>
                                    <rect x={cx - 10} y={cy - 9} width={20} height={18} rx={4} fill={active ? "#6366f1" : "#0a0a0a"} />
                                    <text
                                        x={cx}
                                        y={cy + 4}
                                        textAnchor="middle"
                                        fontSize={12}
                                        fontWeight={700}
                                        fontFamily="monospace"
                                        fill={active ? "#ffffff" : "#e4e4e7"}
                                    >
                                        {note.fret}
                                    </text>
                                    {/* Orden de reproducción */}
                                    <text x={cx} y={boardBottom + 24} textAnchor="middle" fontSize={9} fill="#71717a" fontFamily="monospace">
                                        {i + 1}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Divisores cosméticos (no afectan la reproducción); clic para quitar */}
                        {dividers.map((p) => {
                            const x = dividerX(p);
                            return (
                                <g
                                    key={`divider-${p}`}
                                    className="cursor-pointer"
                                    onClick={() => removeDivider(p)}
                                    role="button"
                                    aria-label={`Quitar divisor tras la nota ${p}`}
                                >
                                    <title>Divisor — clic para quitar</title>
                                    {/* Zona de clic más amplia que la línea */}
                                    <rect x={x - 5} y={TOP_PAD - 6} width={10} height={boardBottom - TOP_PAD + 12} fill="transparent" />
                                    <line x1={x} y1={TOP_PAD - 6} x2={x} y2={boardBottom + 6} stroke="#ffffff" strokeWidth={2} />
                                </g>
                            );
                        })}
                    </svg>
                </div>
            )}
        </div>
    );
}
