import { pitchAtFret } from "@/helpers/music";
import type { TabNote } from "@/types";

/** Clases de la celda según su estado. */
function cellClass(selected: boolean, isActive: boolean): string {
    if (isActive) return "border-cyan-300 bg-cyan-400 text-black";
    if (selected) return "border-primary bg-primary text-primary-foreground";
    return "border-default-100 bg-content2 text-default-300 hover:border-primary/60 hover:text-primary";
}

interface TabEditorProps {
    /** Cuerdas al aire con octava, de la más grave (índice 0) a la más aguda. */
    strings: string[];
    /** Secuencia de notas actual. */
    notes: TabNote[];
    onChange: (notes: TabNote[]) => void;
    maxFret?: number;
    /** Traste que suena ahora (para resaltar durante la reproducción). */
    activeFret?: number;
}

/**
 * Tablatura editable: una grilla de cuerdas × trastes. Al hacer clic en una celda se
 * agrega esa nota (o se quita si ya estaba). El número dentro de la celda es el traste; el
 * badge superior indica el paso de reproducción (las notas se tocan por traste ascendente,
 * y las que comparten traste suenan a la vez, por eso comparten número). Así el usuario
 * construye su propia escala nota a nota, sin partir de ninguna escala preexistente.
 */
export default function TabEditor({ strings, notes, onChange, maxFret = 24, activeFret = -1 }: Readonly<TabEditorProps>) {
    const frets = Array.from({ length: maxFret + 1 }, (_, f) => f);
    // Filas de arriba (aguda) hacia abajo (grave), como en una tablatura real.
    const rowOrder = strings.map((_, i) => strings.length - 1 - i);

    // Pasos de reproducción: trastes usados, en orden ascendente.
    const stepFrets = [...new Set(notes.map((n) => n.fret))].sort((a, b) => a - b);

    const orderOf = (string: number, fret: number) =>
        notes.findIndex((n) => n.string === string && n.fret === fret);

    const toggle = (string: number, fret: number) => {
        const idx = orderOf(string, fret);
        if (idx >= 0) {
            onChange(notes.filter((_, i) => i !== idx));
        } else {
            onChange([...notes, { string, fret }]);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="border-separate border-spacing-0 font-mono text-xs">
                <thead>
                    <tr>
                        <th className="sticky left-0 z-10 bg-content1 px-1" />
                        {frets.map((f) => (
                            <th key={f} className="min-w-8 pb-1 text-center font-normal text-default-400">
                                {f}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rowOrder.map((stringIndex) => {
                        const openLabel = strings[stringIndex].replace(/\d+$/, "");
                        return (
                            <tr key={stringIndex}>
                                <td className="sticky left-0 z-10 bg-content1 pr-2 text-right font-semibold text-default-400">
                                    {openLabel}
                                </td>
                                {frets.map((fret) => {
                                    const selected = orderOf(stringIndex, fret) >= 0;
                                    const isActive = selected && fret === activeFret;
                                    return (
                                        <td key={fret} className="p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => toggle(stringIndex, fret)}
                                                title={`${pitchAtFret(strings[stringIndex], fret)} · cuerda ${stringIndex + 1}, traste ${fret}`}
                                                aria-pressed={selected}
                                                className={`relative flex h-7 w-7 items-center justify-center rounded-medium border text-[11px] font-bold transition-colors ${cellClass(selected, isActive)}`}
                                            >
                                                {selected ? fret : "·"}
                                                {selected && (
                                                    <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-foreground px-0.5 text-[8px] text-background">
                                                        {stepFrets.indexOf(fret) + 1}
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
