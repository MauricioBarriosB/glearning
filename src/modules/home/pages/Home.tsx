import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import {
    AudioLines,
    Eye,
    Gauge,
    Grid3x3,
    ListMusic,
    Plus,
    Sparkles,
    Volume2,
} from "lucide-react";
import glearningIcon from "@/assets/glearning-icon.svg";

interface FeatureCard {
    title: string;
    description: string;
    to: string;
    icon: ReactNode;
}

const FEATURES: FeatureCard[] = [
    {
        title: "Escalas",
        description:
            "Explora escalas mayores, menores, pentatónicas y modales sobre el diapasón. Visualiza sus notas e intervalos en cualquier tonalidad y descubre los patrones que las conectan a lo largo del mástil.",
        to: "/scales",
        icon: <AudioLines className="text-primary" />,
    },
    {
        title: "Acordes",
        description:
            "Consulta diagramas de digitación claros para guitarra eléctrica: mayores, menores, séptimas y voicings con cejilla. Aprende dónde colocar cada dedo y cómo desplazar las formas por todo el diapasón.",
        to: "/chords",
        icon: <Grid3x3 className="text-primary" />,
    },
    {
        title: "Modos",
        description:
            "Domina los siete modos griegos —jónico, dórico, frigio, lidio, mixolidio, eólico y locrio— entendiendo el carácter sonoro de cada uno y cómo usarlos para dar color a tus solos e improvisaciones.",
        to: "/modes",
        icon: <ListMusic className="text-primary" />,
    },
    {
        title: "Mis escalas",
        description:
            "Crea tus propias escalas nota a nota directamente en la tablatura. Elige la afinación, coloca las notas que quieras, escúchalas y guárdalas en tu cuenta para practicarlas cuando quieras.",
        to: "/custom-scales",
        icon: <Sparkles className="text-primary" />,
    },
];

interface Highlight {
    title: string;
    description: string;
    icon: ReactNode;
}

const HIGHLIGHTS: Highlight[] = [
    {
        title: "Visualiza en el diapasón",
        description: "Patrones de notas y grados dibujados sobre el mástil, en la afinación que elijas.",
        icon: <Eye className="text-primary" size={22} />,
    },
    {
        title: "Escúchalo de verdad",
        description: "Reproduce escalas y acordes con un sonido de guitarra y sigue la nota que suena.",
        icon: <Volume2 className="text-primary" size={22} />,
    },
    {
        title: "Controla el tempo",
        description: "Ajusta la velocidad (BPM), el metrónomo y la dirección para practicar a tu ritmo.",
        icon: <Gauge className="text-primary" size={22} />,
    },
    {
        title: "Crea las tuyas",
        description: "Diseña tus propias escalas nota a nota en la tablatura y guárdalas en tu cuenta.",
        icon: <Sparkles className="text-primary" size={22} />,
    },
];

export default function Home() {
    return (
        <div className="space-y-14">
            {/* Hero */}
            <section className="space-y-6 pt-4 text-center">
                <div className="flex items-center justify-center gap-4 font-semibold">
                    <span className="flex h-16 w-16 items-center justify-center rounded-large bg-primary text-primary-foreground">
                        <img src={glearningIcon} alt="G-Learning" className="h-14 w-14" />
                    </span>
                    <span className="text-6xl tracking-tight">G-Learning</span>
                </div>

                <p className="mx-auto max-w-2xl text-lg text-default-500">
                    Escalas, acordes y modos para guitarra eléctrica en un solo lugar. Visualízalos en el diapasón,
                    escúchalos y crea tus propias escalas.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button as={Link} to="/scales" color="primary" size="lg" startContent={<AudioLines size={18} />}>
                        Explorar escalas
                    </Button>
                </div>
            </section>


            
            {/* CTA final */}
            <section className="rounded-large border border-default-100 bg-primary/5 px-6 py-10 text-center">
                <div className="mx-auto max-w-xl space-y-4">
                    <h1 className="text-2xl font-bold">Diseña tu propia escala</h1>
                    <p className="text-default-500">
                        Crea escalas a tu medida colocando las notas en la tablatura, escúchalas y guárdalas en tu cuenta.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button as={Link} to="/custom-scales" color="default" size="lg" startContent={<Sparkles size={18} />}>
                            Ir a mis escalas
                        </Button>
                        <Button as={Link} to="/custom-scales/new" color="default" size="lg" startContent={<Plus size={18} />}>
                            Crear nueva escala
                        </Button>
                    </div>
                </div>
            </section>

            {/* Módulos */}
            <section className="space-y-5">
                <div className="space-y-1 text-center">
                    <h2 className="text-2xl font-bold">Explora los módulos</h2>
                    <p className="text-default-500">Elige una temática y empieza a practicar.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((feature) => (
                        <Card
                            key={feature.to}
                            as={Link}
                            to={feature.to}
                            isPressable
                            isHoverable
                            className="h-full border border-default-100 bg-content1"
                        >
                            <CardHeader className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-medium bg-primary/10">
                                    {feature.icon}
                                </span>
                                <h3 className="text-xl font-semibold">{feature.title}</h3>
                            </CardHeader>
                            <CardBody className="pt-0 text-sm text-default-500">{feature.description}</CardBody>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Qué puedes hacer */}
            <section className="space-y-5">
                <div className="space-y-1 text-center">
                    <h2 className="text-2xl font-bold">Todo lo que puedes hacer</h2>
                    <p className="text-default-500">Herramientas visuales y sonoras para aprender más rápido.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {HIGHLIGHTS.map((item) => (
                        <div
                            key={item.title}
                            className="flex flex-col gap-2 rounded-large border border-default-100 bg-content1 p-5"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-medium bg-primary/10">
                                {item.icon}
                            </span>
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-default-500">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
