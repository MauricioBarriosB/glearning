import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";

/** Nota del rasgueo: qué cuerda (0 = 6ª … 5 = 1ª) y qué tono suena. */
export interface StrumNote {
    stringIndex: number;
    pitch: string;
}

/** Desfase entre cuerdas (arpegio/rasgueo lento). */
const GAP = 0.16;

/**
 * Reproduce un acorde como rasgueo: dispara sus notas (una cuerda pulsada por nota) con
 * un pequeño desfase de la 6ª a la 1ª cuerda. Expone qué acorde (`playingKey`) y qué
 * cuerda (`activeString`) suenan para poder resaltarlos en el diagrama.
 */
export function useChordPlayer() {
    const [playingKey, setPlayingKey] = useState<string | null>(null);
    const [activeString, setActiveString] = useState(-1);
    const voicesRef = useRef<Tone.PluckSynth[]>([]);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const cleanup = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        voicesRef.current.forEach((voice) => voice.dispose());
        voicesRef.current = [];
    }, []);

    useEffect(() => cleanup, [cleanup]);

    const strum = useCallback(
        async (key: string, notes: StrumNote[]) => {
            if (notes.length === 0) return;
            await Tone.start();
            cleanup();

            const now = Tone.now();
            setPlayingKey(key);
            setActiveString(-1);

            notes.forEach((note, i) => {
                const voice = new Tone.PluckSynth({ attackNoise: 1, dampening: 3600, resonance: 0.93 }).toDestination();
                voice.volume.value = -6;
                voice.triggerAttack(note.pitch, now + i * GAP);
                voicesRef.current.push(voice);
                timersRef.current.push(setTimeout(() => setActiveString(note.stringIndex), i * GAP * 1000));
            });

            const reset = setTimeout(
                () => {
                    setActiveString(-1);
                    setPlayingKey(null);
                },
                (notes.length * GAP + 0.5) * 1000,
            );
            const dispose = setTimeout(cleanup, (notes.length * GAP + 2) * 1000);
            timersRef.current.push(reset, dispose);
        },
        [cleanup],
    );

    return { playingKey, activeString, strum };
}
