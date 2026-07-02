import { useState, type FormEvent } from "react";
import { Button, Card, CardBody, CardHeader, Input, Link as HeroLink } from "@heroui/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@services/apiConfig";
import glearningIcon from "@/assets/glearning-icon.svg";

export default function Register() {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await register({ name, email, password });
            navigate("/", { replace: true });
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-[70vh] items-center justify-center p-4">
            <Card className="w-full max-w-md border border-default-100 bg-content1 p-2">
                <CardHeader className="flex flex-col items-start gap-1 pb-0">
                    <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
                        <span className="flex h-8 w-8 items-center justify-center rounded-medium bg-primary text-primary-foreground">
                            <img src={glearningIcon} alt="G-Learning" className="h-7 w-7" />
                        </span>
                        <span className="text-lg tracking-tight">G-Learning</span>
                    </Link>
                    <h1 className="text-xl font-semibold">Crear cuenta</h1>
                    <p className="text-sm text-default-500">Regístrate para acceder a la plataforma.</p>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input isRequired label="Nombre" value={name} onValueChange={setName} autoComplete="name" autoFocus />
                        <Input
                            isRequired
                            type="email"
                            label="Correo electrónico"
                            value={email}
                            onValueChange={setEmail}
                            autoComplete="email"
                        />
                        <Input
                            isRequired
                            type="password"
                            label="Contraseña"
                            value={password}
                            onValueChange={setPassword}
                            autoComplete="new-password"
                            description="Mínimo 8 caracteres."
                        />
                        {error && (
                            <p role="alert" className="text-sm text-danger">
                                {error}
                            </p>
                        )}
                        <div className="flex gap-2">
                            <Button
                                variant="flat"
                                type="button"
                                onPress={() => navigate("/")}
                                startContent={<ArrowLeft size={18} />}
                                className="flex-1 font-medium"
                            >
                                Volver
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                isLoading={submitting}
                                endContent={<ArrowRight size={18} />}
                                className="flex-1 font-medium"
                            >
                                Registrarme
                            </Button>
                        </div>
                        <p className="text-center text-sm text-default-500">
                            ¿Ya tienes cuenta?{" "}
                            <HeroLink as={Link} to="/login" size="sm" className="font-bold">
                                Inicia sesión
                            </HeroLink>
                        </p>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
