interface IconProps {
    size?: number;
    className?: string;
}

/**
 * Icono de guitarra eléctrica tipo **Flying V** (line-art estilo lucide): cuerpo en V,
 * mástil con trastes y clavijero. Usa `currentColor`.
 */
export default function ElectricGuitar({ size = 24, className }: Readonly<IconProps>) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <g transform="rotate(32 12 12)">
                {/* Clavijero */}
                <path d="M10.8 2.4h2.4l-.35 1.6h-1.7z" />
                {/* Mástil */}
                <path d="M11.15 4v8.2" />
                <path d="M12.85 4v8.2" />
                {/* Trastes */}
                <path d="M11.15 6.1h1.7M11.15 8.1h1.7M11.15 10.1h1.7" />
                {/* Cuerpo Flying V */}
                <path d="M11.15 12.2 5.3 20.8 12 16.6 18.7 20.8 12.85 12.2Z" />
                {/* Puente / pastilla */}
                <path d="M10.4 13.5h3.2" />
            </g>
        </svg>
    );
}
