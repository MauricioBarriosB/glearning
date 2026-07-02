import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addToast, Button, Spinner } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { getErrorMessage } from "@services/apiConfig";
import { DEFAULT_TUNING_ID } from "@/config/music";
import type { CustomScale } from "@/types";
import CustomScaleEditor from "../components/CustomScaleEditor";
import { useMyCustomScales } from "../hooks/useCustomScales";

/**
 * Página de detalle/edición de una escala. La ruta /custom-scales/new crea una nueva;
 * /custom-scales/:id edita una existente (se busca en la lista del usuario, ya cacheada).
 */
export default function CustomScalesDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tunings } = useContent();
    const { data: scales, isPending, isFetching, isError, error } = useMyCustomScales();

    useEffect(() => {
        if (isError) addToast({ title: "Error", description: getErrorMessage(error), color: "danger" });
    }, [isError, error]);

    const isNew = id === undefined || id === "new";
    const scale: CustomScale | null = isNew ? null : (scales?.find((s) => s.id === Number(id)) ?? null);

    const defaultTuningId = tunings.some((t) => t.id === DEFAULT_TUNING_ID) ? DEFAULT_TUNING_ID : tunings[0]?.id;

    const goToList = () => navigate("/custom-scales");
    const handleSaved = (saved: CustomScale) => {
        // Al crear, refleja la escala guardada en la URL; al editar ya estamos en su ruta.
        if (isNew) navigate(`/custom-scales/${saved.id}`, { replace: true });
    };

    // Escala no encontrada: distingue "cargando/actualizando" de "no existe".
    let notFound = null;
    if (!isNew && !scale) {
        notFound =
            isPending || isFetching ? (
                <div className="flex justify-center py-12">
                    <Spinner />
                </div>
            ) : (
                <p className="rounded-medium border border-dashed border-default-200 p-8 text-center text-default-400">
                    No se encontró la escala.
                </p>
            );
    }

    return (
        <div className="space-y-4">
            <Button variant="light" size="sm" startContent={<ArrowLeft size={16} />} onPress={goToList} className="w-fit">
                Volver a mis escalas
            </Button>

            {notFound ??
                (defaultTuningId ? (
                    <CustomScaleEditor
                        key={id ?? "new"}
                        scale={scale}
                        tunings={tunings}
                        defaultTuningId={defaultTuningId}
                        onSaved={handleSaved}
                        onDeleted={goToList}
                    />
                ) : (
                    <p className="text-default-400">No hay afinaciones disponibles.</p>
                ))}
        </div>
    );
}
