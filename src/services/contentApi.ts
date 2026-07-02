/**
 * Servicios de contenido: obtienen desde la API la data que antes estaba cableada en el
 * front (afinaciones, escalas, acordes, modos). El envelope de la API es
 * { success, data }, así que devolvemos `res.data.data`.
 */

import { apiClient } from "./apiConfig";
import type { ChordShape, ModeFamily, OpenChord, ScaleDef, Tuning } from "@/types";

interface Envelope<T> {
    success: boolean;
    data: T;
}

export async function fetchTunings(): Promise<Tuning[]> {
    return apiClient.get<Envelope<Tuning[]>>("/tunings").then((r) => r.data.data);
}

export async function fetchScales(): Promise<ScaleDef[]> {
    return apiClient.get<Envelope<ScaleDef[]>>("/scales").then((r) => r.data.data);
}

export async function fetchChords(): Promise<{ shapes: ChordShape[]; open: OpenChord[] }> {
    return apiClient.get<Envelope<{ shapes: ChordShape[]; open: OpenChord[] }>>("/chords").then((r) => r.data.data);
}

export async function fetchModes(): Promise<ModeFamily[]> {
    return apiClient.get<Envelope<ModeFamily[]>>("/modes").then((r) => r.data.data);
}
