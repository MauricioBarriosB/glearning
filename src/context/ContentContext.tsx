import { createContext, useContext, type ReactNode } from "react";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import PageLoader from "@components/PageLoader";
import { getErrorMessage } from "@services/apiConfig";
import { fetchChords, fetchModes, fetchScales, fetchTunings } from "@services/contentApi";
import type { ChordShape, ModeFamily, OpenChord, ScaleDef, Tuning } from "@/types";

interface ContentValue {
    tunings: Tuning[];
    scales: ScaleDef[];
    chordShapes: ChordShape[];
    openChords: OpenChord[];
    modeFamilies: ModeFamily[];
}

const ContentContext = createContext<ContentValue | null>(null);

/** Acceso a la data de contenido cargada desde la API. */
export function useContent(): ContentValue {
    const ctx = useContext(ContentContext);
    if (!ctx) {
        throw new Error("useContent debe usarse dentro de <ContentProvider>");
    }
    return ctx;
}

/**
 * Carga toda la data de contenido desde la API con react-query (una vez; es estática, así
 * que `staleTime: Infinity`). Muestra un loader mientras carga y un mensaje con reintento
 * si falla; solo entonces expone la data a la app.
 */
export function ContentProvider({ children }: Readonly<{ children: ReactNode }>) {
    const results = useQueries({
        queries: [
            { queryKey: ["content", "tunings"], queryFn: () => fetchTunings(), staleTime: Infinity },
            { queryKey: ["content", "scales"], queryFn: () => fetchScales(), staleTime: Infinity },
            { queryKey: ["content", "chords"], queryFn: () => fetchChords(), staleTime: Infinity },
            { queryKey: ["content", "modes"], queryFn: () => fetchModes(), staleTime: Infinity },
        ],
    });

    const [tuningsQ, scalesQ, chordsQ, modesQ] = results;
    const isLoading = results.some((r) => r.isLoading);
    const failed = results.find((r) => r.error);

    if (failed) {
        return (
            <div className="flex min-h-96 flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="text-warning" size={40} />
                <div>
                    <p className="font-semibold">No se pudo cargar el contenido</p>
                    <p className="max-w-md text-sm text-default-500">{getErrorMessage(failed.error)}</p>
                </div>
                <Button color="primary" variant="flat" onPress={() => results.forEach((r) => r.refetch())}>
                    Reintentar
                </Button>
            </div>
        );
    }

    if (isLoading || !tuningsQ.data || !scalesQ.data || !chordsQ.data || !modesQ.data) {
        return <PageLoader />;
    }

    const value: ContentValue = {
        tunings: tuningsQ.data,
        scales: scalesQ.data,
        chordShapes: chordsQ.data.shapes,
        openChords: chordsQ.data.open,
        modeFamilies: modesQ.data,
    };

    return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
