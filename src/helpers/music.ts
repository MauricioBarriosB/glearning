import type { FretPosition, Note } from "@/types";

/** Notas cromáticas en orden, usando sostenidos. */
export const CHROMATIC: Note[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** Afinación estándar de la guitarra, de la 6ª (grave) a la 1ª (aguda). */
export const STANDARD_TUNING: Note[] = ["E", "A", "D", "G", "B", "E"];

/** Índice cromático (0-11) de cada nota. */
const NOTE_INDEX: Record<Note, number> = {
    C: 0,
    "C#": 1,
    D: 2,
    "D#": 3,
    E: 4,
    F: 5,
    "F#": 6,
    G: 7,
    "G#": 8,
    A: 9,
    "A#": 10,
    B: 11,
};

/** Nombre del grado según su distancia en semitonos desde la tónica (0-11). */
export const DEGREE_LABELS = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];

/** Transpone una nota `semitones` semitonos (envuelve en la octava). */
export function transpose(note: Note, semitones: number): Note {
    const index = CHROMATIC.indexOf(note);
    if (index === -1) return note;
    const next = (index + (semitones % 12) + 12) % 12;
    return CHROMATIC[next];
}

/**
 * Devuelve las notas de una escala/modo dados su tónica y patrón de intervalos.
 */
export function notesFromIntervals(root: Note, intervals: number[]): Note[] {
    return intervals.map((semitones) => transpose(root, semitones));
}

/** Nota que suena en una cuerda (al aire) al pisar un traste dado. */
export function noteAtFret(openString: Note, fret: number): Note {
    return transpose(openString, fret);
}

// ================================================================
// Tonos con octava (para audio) y posiciones en el mástil
// ================================================================

/** Convierte un tono con octava ("A2", "F#3") a número MIDI. */
export function pitchToMidi(pitch: string): number {
    const match = /^([A-G]#?)(-?\d+)$/.exec(pitch);
    if (!match) return 0;
    const note = match[1] as Note;
    const octave = Number(match[2]);
    return (octave + 1) * 12 + NOTE_INDEX[note];
}

/** Clase de altura (0-11) resultante de pisar `fret` sobre una cuerda al aire. */
export function pitchClassAtFret(openPitch: string, fret: number): number {
    return (pitchToMidi(openPitch) + fret) % 12;
}

/** Tono con octava ("A2") resultante de pisar `fret` sobre una cuerda al aire. */
export function pitchAtFret(openPitch: string, fret: number): string {
    const midi = pitchToMidi(openPitch) + fret;
    const note = CHROMATIC[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${note}${octave}`;
}

/**
 * Todas las posiciones de una escala en el mástil, entre los trastes 0 y `maxFret`.
 * Sirve para pintar el diapasón completo.
 */
export function getFretboardNotes(strings: string[], root: Note, intervals: number[], maxFret: number): FretPosition[] {
    const rootPc = NOTE_INDEX[root];
    const relSet = new Set(intervals.map((i) => ((i % 12) + 12) % 12));
    const positions: FretPosition[] = [];

    strings.forEach((open, stringIndex) => {
        for (let fret = 0; fret <= maxFret; fret++) {
            const pc = pitchClassAtFret(open, fret);
            const rel = (pc - rootPc + 12) % 12;
            if (relSet.has(rel)) {
                positions.push({
                    stringIndex,
                    fret,
                    pitch: pitchAtFret(open, fret),
                    note: CHROMATIC[pc],
                    isRoot: rel === 0,
                    degree: DEGREE_LABELS[rel],
                });
            }
        }
    });
    return positions;
}

/** Intervalos únicos (clases 0-11) de la escala, en orden ascendente. */
function uniqueRels(intervals: number[]): number[] {
    return [...new Set(intervals.map((i) => ((i % 12) + 12) % 12))].sort((a, b) => a - b);
}

/** Cuántas posiciones (cajas) tiene la escala: una por cada grado. */
export function positionCount(intervals: number[]): number {
    return uniqueRels(intervals).length;
}

function makePosition(open: string, stringIndex: number, fret: number, rootPc: number): FretPosition {
    const pc = pitchClassAtFret(open, fret);
    const rel = (pc - rootPc + 12) % 12;
    return {
        stringIndex,
        fret,
        pitch: pitchAtFret(open, fret),
        note: CHROMATIC[pc],
        isRoot: rel === 0,
        degree: DEGREE_LABELS[rel],
    };
}

/** Menor traste (dentro de una octava) sobre una cuerda cuya nota es `targetPc`. */
function lowestFretOf(open: string, targetPc: number): number {
    for (let fret = 0; fret <= 11; fret++) {
        if (pitchClassAtFret(open, fret) === targetPc) return fret;
    }
    return 0;
}

/**
 * Patrón "caja" de la escala en una posición concreta. La posición `position` (base 0)
 * ancla la caja en el grado nº position de la escala sobre la cuerda más grave, y desde
 * ahí recoge las notas dentro de una ventana de trastes, cuerda por cuerda.
 * Devuelve la secuencia ascendente por altura, sin alturas repetidas.
 */
export function getBoxPattern(
    strings: string[],
    root: Note,
    intervals: number[],
    position = 0,
    span = 4,
): FretPosition[] {
    const rootPc = NOTE_INDEX[root];
    const rels = uniqueRels(intervals);
    const relSet = new Set(rels);
    const anchorPc = (rootPc + rels[position % rels.length]) % 12;
    const start = lowestFretOf(strings[0], anchorPc);

    const positions: FretPosition[] = [];
    strings.forEach((open, stringIndex) => {
        for (let fret = start; fret <= start + span; fret++) {
            const rel = (pitchClassAtFret(open, fret) - rootPc + 12) % 12;
            if (relSet.has(rel)) positions.push(makePosition(open, stringIndex, fret, rootPc));
        }
    });

    positions.sort((a, b) => pitchToMidi(a.pitch) - pitchToMidi(b.pitch));
    return positions.filter((pos, i) => i === 0 || pitchToMidi(pos.pitch) !== pitchToMidi(positions[i - 1].pitch));
}

/**
 * Patrón de N notas por cuerda (3 por defecto). Empieza en la tónica de la cuerda más
 * grave y va subiendo: en cada cuerda toma N notas de la escala y continúa en la siguiente
 * cuerda desde la nota inmediatamente superior. Ideal para shred; ya viene ascendente.
 */
export function get3npsPattern(
    strings: string[],
    root: Note,
    intervals: number[],
    notesPerString = 3,
): FretPosition[] {
    const rootPc = NOTE_INDEX[root];
    const relSet = new Set(uniqueRels(intervals));
    const positions: FretPosition[] = [];

    let minMidi = pitchToMidi(strings[0]) + lowestFretOf(strings[0], rootPc);

    strings.forEach((open, stringIndex) => {
        const openMidi = pitchToMidi(open);
        let count = 0;
        let lastMidi = minMidi;
        for (let fret = 0; fret <= 24 && count < notesPerString; fret++) {
            const midi = openMidi + fret;
            if (midi < minMidi) continue;
            const rel = ((midi % 12) - rootPc + 12) % 12;
            if (relSet.has(rel)) {
                positions.push(makePosition(open, stringIndex, fret, rootPc));
                lastMidi = midi;
                count++;
            }
        }
        if (count > 0) minMidi = lastMidi + 1;
    });

    return positions;
}
