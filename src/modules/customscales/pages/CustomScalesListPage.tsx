import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addToast, Button, Chip, Spinner } from "@heroui/react";
import { Plus, Sparkles } from "lucide-react";
import DifficultyChip from "@components/DifficultyChip";
import { getErrorMessage } from "@services/apiConfig";
import { useMyCustomScales } from "../hooks/useCustomScales";

export default function CustomScalesListPage() {
    const navigate = useNavigate();
    const { data: scales, isPending, isError, error } = useMyCustomScales();

    useEffect(() => {
        if (isError) addToast({ title: "Error", description: getErrorMessage(error), color: "danger" });
    }, [isError, error]);

    const list = scales ?? [];

    let content;
    if (isPending) {
        content = (
            <div className="flex justify-center py-12">
                <Spinner />
            </div>
        );
    } else if (list.length === 0) {
        content = (
            <p className="rounded-medium border border-dashed border-default-200 p-8 text-center text-default-400">
                Aún no has creado escalas. Usa «Nueva escala» para empezar.
            </p>
        );
    } else {
        content = (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => navigate(`/custom-scales/${s.id}`)}
                        className="flex flex-col gap-2 rounded-medium border border-default-100 bg-content1 p-4 text-left transition-colors hover:border-primary"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-foreground">{s.name}</span>
                            <Chip size="sm" variant="flat">
                                {s.notes.length} {s.notes.length === 1 ? "nota" : "notas"}
                            </Chip>
                        </div>
                        <span className="font-mono text-xs text-default-500">{s.tuningName}</span>
                        <DifficultyChip level={s.difficulty} />
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-primary" />
                        <h1 className="text-3xl font-bold">Mis escalas</h1>
                    </div>
                    <p className="text-default-500">
                        Tus escalas personalizadas. Crea una nueva o abre una para editarla y reproducirla.
                    </p>
                </div>
                <Button color="primary" startContent={<Plus size={18} />} onPress={() => navigate("/custom-scales/new")}>
                    Nueva escala
                </Button>
            </header>

            {content}
        </div>
    );
}
