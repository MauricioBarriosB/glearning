import { useState, type ComponentType } from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Spinner,
} from "@heroui/react";
import {
    CircleHelp,
    ListMusic,
    Music4,
    Save,
    Sparkles,
    Volume2,
    type LucideProps,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchHelpSections } from "@services/contentApi";
import { getErrorMessage } from "@services/apiConfig";

/**
 * Mapa nombre → icono lucide para las secciones de ayuda (columna `icon` de
 * contents_help). Si el nombre no existe, se usa `Sparkles` como fallback.
 */
const HELP_ICONS: Record<string, ComponentType<LucideProps>> = {
    ListMusic,
    Music4,
    Save,
    Sparkles,
    Volume2,
};

interface HelpButtonProps {
    /** Clave del módulo cuya ayuda se carga desde la API (ej. "custom-scales"). */
    module: string;
    /** Título del pop-up de ayuda. */
    title?: string;
    /** Texto del botón. */
    label?: string;
}

/**
 * Botón «Ayuda» reutilizable. Al pulsarlo abre un pop-up y carga desde la API las
 * secciones de ayuda del módulo indicado (tabla contents_help), renderizándolas.
 * La carga es diferida: solo se hace la petición cuando el pop-up está abierto.
 */
export default function HelpButton({ module, title = "Ayuda", label = "Ayuda" }: Readonly<HelpButtonProps>) {
    const [open, setOpen] = useState(false);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["content", "help", module],
        queryFn: () => fetchHelpSections(module),
        enabled: open,
        staleTime: 5 * 60 * 1000,
    });

    const sections = data ?? [];

    return (
        <>
            <Button
                size="sm"
                variant="flat"
                startContent={<CircleHelp size={16} />}
                onPress={() => setOpen(true)}
            >
                {label}
            </Button>

            <Modal isOpen={open} onClose={() => setOpen(false)} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader className="flex items-center gap-2">
                        <CircleHelp className="text-primary" size={20} />
                        {title}
                    </ModalHeader>
                    <ModalBody className="gap-5 pb-2">
                        {isLoading && (
                            <div className="flex justify-center py-8">
                                <Spinner label="Cargando ayuda…" />
                            </div>
                        )}

                        {isError && (
                            <p className="text-sm text-danger">
                                No se pudo cargar la ayuda: {getErrorMessage(error)}
                            </p>
                        )}

                        {!isLoading && !isError && sections.length === 0 && (
                            <p className="text-sm text-default-500">No hay ayuda disponible para este módulo.</p>
                        )}

                        {sections.map((section) => {
                            const Icon = HELP_ICONS[section.icon] ?? Sparkles;
                            return (
                                <div key={section.id} className="flex gap-3">
                                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-medium bg-primary/10">
                                        <Icon className="text-primary" size={18} />
                                    </span>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">{section.title}</h3>
                                        <p className="text-sm leading-relaxed text-default-500">{section.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
