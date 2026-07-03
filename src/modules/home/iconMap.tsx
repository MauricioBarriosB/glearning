import type { ComponentType } from "react";
import { AudioLines, Eye, Gauge, Grid3x3, ListMusic, Sparkles, Volume2, type LucideProps } from "lucide-react";

/**
 * Mapa nombre → componente de icono lucide, para el contenido de la Home que llega
 * desde la API como texto (columna `icon` de contents_features / contents_highlights).
 * Si el nombre no existe, se usa `Sparkles` como fallback.
 */
const ICONS: Record<string, ComponentType<LucideProps>> = {
    AudioLines,
    Eye,
    Gauge,
    Grid3x3,
    ListMusic,
    Sparkles,
    Volume2,
};

export function resolveIcon(name: string): ComponentType<LucideProps> {
    return ICONS[name] ?? Sparkles;
}
