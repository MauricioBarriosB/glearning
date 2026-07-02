/**
 * Configuración de UI del dominio musical: orden de familias, etiquetas y selecciones por
 * defecto. NO contiene la data (escalas/acordes/modos/afinaciones): esa viene de la API
 * (ver services/contentApi.ts + context/ContentContext.tsx). Aquí solo vive lo que decide
 * cómo se presenta esa data.
 */

import type { ChordFamily, ScaleFamily } from "@/types";

// ---------------------------------------------------------------- escalas
/** Orden en que se muestran las familias de escalas en el acordeón. */
export const SCALE_FAMILIES: ScaleFamily[] = [
    "Pentatónicas y blues",
    "Modos griegos",
    "Modos menor melódica",
    "Modos menor armónica",
    "Modos armónica mayor",
    "Modos doble armónica",
    "Simétricas",
    "Exóticas y del mundo",
    "Bebop / jazz",
];

export const DEFAULT_SCALE_ID = "minor-pentatonic";

// ---------------------------------------------------------------- afinaciones
export const DEFAULT_TUNING_ID = "e-standard";

// ---------------------------------------------------------------- acordes
/** Orden en que se muestran las familias de acordes. */
export const CHORD_FAMILIES: ChordFamily[] = [
    "Mayores",
    "Menores",
    "Power chords (5)",
    "Dominantes (7)",
    "Novena (9)",
    "Séptima mayor (maj7)",
    "Séptima menor (m7)",
    "Sextas (6)",
    "Añadida (add9)",
    "Suspendidos (sus)",
    "Semidisminuido (m7b5)",
    "Aumentados",
    "Disminuidos",
    "Disminuido 7 (dim7)",
];

/** Descripción corta de cada familia de acordes (texto de UI, no viene de la API). */
export const CHORD_FAMILY_INFO: Record<ChordFamily, string> = {
    "Mayores": "Tríadas mayores: sonido pleno y estable. La base de casi todo.",
    "Menores": "Tríadas menores: color melancólico y oscuro.",
    "Power chords (5)": "Solo tónica y 5ª (sin 3ª). El pilar del rock y el metal con distorsión.",
    "Dominantes (7)": "Tríada mayor + 7ª menor: tensión que 'pide' resolver. Blues y rock.",
    "Novena (9)": "Dominante + 9ª: más color y tensión; funk, blues y rock.",
    "Séptima mayor (maj7)": "Tríada mayor + 7ª mayor: sonido suave y sofisticado.",
    "Séptima menor (m7)": "Tríada menor + 7ª menor: menor suavizado, muy usado en funk y fusión.",
    "Sextas (6)": "Tríada + 6ª: sonido alegre y retro; mayor (6) o menor (m6).",
    "Añadida (add9)": "Tríada + 9ª (sin 7ª): brillo abierto muy usado en rock y pop.",
    "Suspendidos (sus)": "Se reemplaza la 3ª por la 2ª o la 4ª: sonido abierto y sin resolver.",
    "Semidisminuido (m7b5)": "Menor con 5ª bemol y 7ª menor: tenso, típico de progresiones menores y jazz.",
    "Aumentados": "5ª aumentada: sonido tenso e inestable, ideal para transiciones.",
    "Disminuidos": "3ª y 5ª menores: muy tenso y disonante, pide resolución inmediata.",
    "Disminuido 7 (dim7)": "Tríada disminuida + 7ª disminuida: simétrico y muy tenso; puente entre acordes.",
};

export const DEFAULT_CHORD_FAMILY: ChordFamily = "Mayores";

// ---------------------------------------------------------------- modos
export const DEFAULT_MODE_FAMILY: ScaleFamily = "Modos griegos";
