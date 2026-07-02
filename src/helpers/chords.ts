import type { Chord, ChordShape, Note } from "@/types";
import { CHROMATIC, pitchAtFret, pitchToMidi } from "./music";

/** Traste máximo al que reposicionamos un acorde antes de mutear la cuerda. */
const MAX_FRET = 16;

/** Cuerdas al aire (con octava) en afinación estándar, de la 6ª a la 1ª. */
const STANDARD_PITCHES = ["E2", "A2", "D3", "G3", "B3", "E4"];

/** Clase de altura de la cuerda de referencia: 6ª = Mi (4), 5ª = La (9), 4ª = Re (2). */
const ROOT_STRING_PC = [4, 9, 2];

/** Traste base para el diagrama: 1 si es posición abierta, si no el menor traste pisado. */
function baseFretFor(frets: number[]): number {
    const positives = frets.filter((f) => f > 0);
    if (positives.length === 0) return 1;
    return Math.max(...frets) <= 4 ? 1 : Math.min(...positives);
}

export interface RenderedChord {
    chord: Chord;
    /** Notas (con octava) de la 6ª a la 1ª cuerda, sin las muteadas: para el rasgueo. */
    pitches: string[];
}

/** Notas (con octava) de un acorde a partir de sus trastes, en afinación estándar. */
export function pitchesFromFrets(frets: number[]): string[] {
    return frets
        .map((f, i) => (f < 0 ? null : pitchAtFret(STANDARD_PITCHES[i], f)))
        .filter((p): p is string => p !== null);
}

/** Notas del rasgueo con su índice de cuerda (6ª→1ª), omitiendo las muteadas. */
export function strumNotesFromFrets(frets: number[]): { stringIndex: number; pitch: string }[] {
    const notes: { stringIndex: number; pitch: string }[] = [];
    frets.forEach((f, i) => {
        if (f >= 0) notes.push({ stringIndex: i, pitch: pitchAtFret(STANDARD_PITCHES[i], f) });
    });
    return notes;
}

/**
 * Reposiciona un acorde (definido en afinación estándar) a otra afinación de 6 cuerdas,
 * preservando las notas: en cada cuerda busca el traste que produce el mismo tono. Si ese
 * traste queda fuera de rango, mutea la cuerda. Devuelve el acorde reposicionado y sus
 * notas para el rasgueo.
 */
export function applyTuning(chord: Chord, tuning: string[]): { chord: Chord; notes: { stringIndex: number; pitch: string }[] } {
    const frets = chord.frets.map((f, i) => {
        if (f < 0) return -1;
        const targetMidi = pitchToMidi(STANDARD_PITCHES[i]) + f;
        const newFret = targetMidi - pitchToMidi(tuning[i]);
        return newFret >= 0 && newFret <= MAX_FRET ? newFret : -1;
    });

    const notes: { stringIndex: number; pitch: string }[] = [];
    frets.forEach((f, i) => {
        if (f >= 0) notes.push({ stringIndex: i, pitch: pitchAtFret(tuning[i], f) });
    });

    return { chord: { ...chord, frets, baseFret: baseFretFor(frets) }, notes };
}

/** Transpone una forma móvil a una tónica concreta y devuelve el acorde y sus notas. */
export function buildChord(shape: ChordShape, root: Note): RenderedChord {
    const rootPc = CHROMATIC.indexOf(root);
    const openPc = ROOT_STRING_PC[shape.rootString];
    const offset = ((rootPc - openPc) % 12 + 12) % 12;

    const frets = shape.relFrets.map((f) => (f < 0 ? -1 : f + offset));
    const pitches = frets
        .map((f, i) => (f < 0 ? null : pitchAtFret(STANDARD_PITCHES[i], f)))
        .filter((p): p is string => p !== null);

    const chord: Chord = {
        id: `${shape.id}-${root}`,
        name: `${root}${shape.suffix}`,
        root,
        quality: shape.quality,
        family: shape.family,
        frets,
        fingers: shape.fingers,
        baseFret: baseFretFor(frets),
        difficulty: shape.difficulty,
    };

    return { chord, pitches };
}
