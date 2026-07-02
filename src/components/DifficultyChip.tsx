import { Chip } from "@heroui/react";
import type { Difficulty } from "@/types";

const LABELS: Record<Difficulty, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
};

const COLORS: Record<Difficulty, "success" | "warning" | "danger"> = {
    beginner: "success",
    intermediate: "warning",
    advanced: "danger",
};

export default function DifficultyChip({ level }: { level: Difficulty }) {
    return (
        <Chip size="sm" variant="flat" color={COLORS[level]}>
            {LABELS[level]}
        </Chip>
    );
}
