const LOCALE = "es-CL";

const integerFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 });

type NumericInput = number | string | null | undefined;

export function formatNumber(value: NumericInput, decimals = 0): string {
    if (value === null || value === undefined || value === "") return "";
    const num = typeof value === "string" ? parseNumber(value) : value;
    if (!Number.isFinite(num)) return "";
    return decimals > 0 ? decimalFormatter.format(num) : integerFormatter.format(num);
}

export function parseNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const normalized = value
        .replaceAll(".", "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");
    const num = Number.parseFloat(normalized);
    return Number.isFinite(num) ? num : 0;
}

export function percentage(part: number, total: number, clamp = false): number {
    if (total <= 0) return 0;
    const result = Math.round((part / total) * 100);
    return clamp ? Math.min(100, result) : result;
}
