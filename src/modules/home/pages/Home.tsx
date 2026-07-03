import { Link } from "react-router-dom";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useQueries } from "@tanstack/react-query";
import { AudioLines, Plus, Sparkles } from "lucide-react";
import glearningIcon from "@/assets/glearning-icon.svg";
import { fetchHomeFeatures, fetchHomeHighlights } from "@services/contentApi";
import { resolveIcon } from "@modules/home/iconMap";

export default function Home() {
    const [featuresQ, highlightsQ] = useQueries({
        queries: [
            { queryKey: ["content", "home-features"], queryFn: fetchHomeFeatures, staleTime: Infinity },
            { queryKey: ["content", "home-highlights"], queryFn: fetchHomeHighlights, staleTime: Infinity },
        ],
    });

    const features = featuresQ.data ?? [];
    const highlights = highlightsQ.data ?? [];

    return (
        <div className="space-y-14">
            {/* Hero */}
            <section className="space-y-6 pt-4 text-center">
                <div className="flex items-center justify-center gap-2 font-semibold sm:gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-large bg-primary text-primary-foreground sm:h-16 sm:w-16">
                        <img src={glearningIcon} alt="G-Learning" className="h-8 w-8 sm:h-14 sm:w-14" />
                    </span>
                    <span className="text-3xl tracking-tight sm:text-6xl">G-Learning</span>
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
                    {features.map((feature) => {
                        const Icon = resolveIcon(feature.icon);
                        return (
                            <Card
                                key={feature.id}
                                as={Link}
                                to={feature.to}
                                isPressable
                                isHoverable
                                className="h-full border border-default-100 bg-content1"
                            >
                                <CardHeader className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-medium bg-primary/10">
                                        <Icon className="text-primary" />
                                    </span>
                                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                                </CardHeader>
                                <CardBody className="pt-0 text-sm text-default-500">{feature.description}</CardBody>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* Qué puedes hacer */}
            <section className="space-y-5">
                <div className="space-y-1 text-center">
                    <h2 className="text-2xl font-bold">Todo lo que puedes hacer</h2>
                    <p className="text-default-500">Herramientas visuales y sonoras para aprender más rápido.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {highlights.map((item) => {
                        const Icon = resolveIcon(item.icon);
                        return (
                            <div
                                key={item.id}
                                className="flex flex-col gap-2 rounded-large border border-default-100 bg-content1 p-5"
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-medium bg-primary/10">
                                    <Icon className="text-primary" size={22} />
                                </span>
                                <h3 className="font-semibold">{item.title}</h3>
                                <p className="text-sm text-default-500">{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

        </div>
    );
}
