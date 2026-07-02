import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";

/**
 * Evento de reproducción: qué tono(s) suenan y qué columna de la tablatura resaltar.
 * `pitch` puede ser un arreglo para tocar varias notas a la vez (acorde) en el mismo tiempo.
 */
export interface PlayEvent {
    pitch: string | string[];
    tabIndex: number;
}

/** Nº de voces del sintetizador; permite tocar acordes (varias cuerdas a la vez). */
const VOICE_COUNT = 8;

export interface PlayOptions {
    bpm: number;
    loop?: boolean;
    metronome?: boolean;
}

/**
 * Reproduce una secuencia de eventos con un sintetizador de cuerda pulsada
 * (Karplus-Strong, suena parecido a una guitarra), usando el Transport de Tone.js para
 * un scheduling exacto.
 *
 * Las notas se agendan en *ticks* musicales (no en segundos), de modo que el tempo se
 * puede cambiar en vivo (`setTempo`) sin reprogramar nada. El metrónomo también se
 * enciende/apaga en vivo (`setMetronome`). Los cambios que alteran la secuencia o el
 * loop se aplican reiniciando `play` desde la página.
 */
export function useScalePlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const voicesRef = useRef<Tone.PluckSynth[]>([]);
    const clickRef = useRef<Tone.MembraneSynth | null>(null);
    const partRef = useRef<Tone.Part | null>(null);
    const metronomeRef = useRef(false);

    const disposeNodes = useCallback(() => {
        const transport = Tone.getTransport();
        transport.stop();
        transport.cancel();
        partRef.current?.dispose();
        partRef.current = null;
        voicesRef.current.forEach((voice) => voice.dispose());
        voicesRef.current = [];
        clickRef.current?.dispose();
        clickRef.current = null;
    }, []);

    useEffect(() => disposeNodes, [disposeNodes]);

    const stop = useCallback(() => {
        disposeNodes();
        setIsPlaying(false);
        setActiveIndex(-1);
    }, [disposeNodes]);

    const play = useCallback(
        async (events: PlayEvent[], options: PlayOptions) => {
            if (events.length === 0) return;
            await Tone.start();
            disposeNodes();

            const transport = Tone.getTransport();
            const draw = Tone.getDraw();
            const eighth = Tone.Time("8n").toTicks();

            transport.bpm.value = options.bpm;
            metronomeRef.current = Boolean(options.metronome);

            // Pool de voces: una secuencia monofónica usa siempre la voz 0 (cada nota corta la
            // anterior, como antes); un acorde reparte sus notas en voces distintas para que
            // suenen a la vez.
            const voices = Array.from({ length: VOICE_COUNT }, () => {
                const v = new Tone.PluckSynth({ attackNoise: 1.2, dampening: 2800, resonance: 0.96 }).toDestination();
                v.volume.value = -4;
                return v;
            });
            voicesRef.current = voices;

            const click = new Tone.MembraneSynth({ octaves: 2, envelope: { attack: 0.001, decay: 0.15, sustain: 0 } });
            click.toDestination();
            click.volume.value = -10;
            clickRef.current = click;

            const part = new Tone.Part(
                (time: number, value: PlayEvent) => {
                    const pitches = Array.isArray(value.pitch) ? value.pitch : [value.pitch];
                    pitches.forEach((pitch, v) => voices[v % voices.length].triggerAttack(pitch, time));
                    draw.schedule(() => setActiveIndex(value.tabIndex), time);
                },
                events.map((event, i) => ({ time: `${i * eighth}i`, pitch: event.pitch, tabIndex: event.tabIndex })),
            );
            part.loop = Boolean(options.loop);
            part.loopEnd = `${events.length * eighth}i`;
            part.start(0);
            partRef.current = part;

            // El metrónomo siempre está agendado; suena solo si la bandera está activa.
            transport.scheduleRepeat(
                (time) => {
                    if (metronomeRef.current) click.triggerAttackRelease("C2", "16n", time);
                },
                "4n",
                0,
            );

            if (!options.loop) {
                transport.scheduleOnce((time) => {
                    draw.schedule(() => {
                        // Detiene el Transport y libera los nodos (incluido el metrónomo).
                        disposeNodes();
                        setIsPlaying(false);
                        setActiveIndex(-1);
                    }, time);
                }, `${(events.length + 1) * eighth}i`);
            }

            transport.start();
            setIsPlaying(true);
        },
        [disposeNodes],
    );

    /** Cambia el tempo en vivo, sin cortar la reproducción. */
    const setTempo = useCallback((bpm: number) => {
        Tone.getTransport().bpm.value = bpm;
    }, []);

    /** Enciende/apaga el metrónomo en vivo. */
    const setMetronome = useCallback((on: boolean) => {
        metronomeRef.current = on;
    }, []);

    return { isPlaying, activeIndex, play, stop, setTempo, setMetronome };
}
