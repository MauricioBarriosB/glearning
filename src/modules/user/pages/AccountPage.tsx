import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, CardBody, CardHeader, Chip, Input } from "@heroui/react";
import { addToast } from "@heroui/react";
import { KeyRound, UserCog } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@services/apiConfig";
import { updatePassword, updateProfile } from "@services/authApi";

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function AccountPage() {
    const { user, updateUser } = useAuth();

    // --- perfil ---
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileTouched, setProfileTouched] = useState(false);

    // --- contraseña ---
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    useEffect(() => {
        setName(user?.name ?? "");
        setEmail(user?.email ?? "");
    }, [user]);

    if (!user) return null;

    const nameInvalid = profileTouched && name.trim().length < 2;
    const emailInvalid = profileTouched && !isValidEmail(email.trim());

    const newPasswordInvalid = passwordTouched && newPassword.length < 8;
    const confirmInvalid = passwordTouched && confirmPassword !== newPassword;

    async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setProfileTouched(true);
        if (name.trim().length < 2 || !isValidEmail(email.trim())) return;

        setSavingProfile(true);
        try {
            const updated = await updateProfile({ name: name.trim(), email: email.trim() });
            updateUser(updated);
            addToast({ title: "Perfil actualizado", color: "success" });
        } catch (err) {
            addToast({ title: "Error", description: getErrorMessage(err), color: "danger" });
        } finally {
            setSavingProfile(false);
        }
    }

    async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPasswordTouched(true);
        if (currentPassword === "" || newPassword.length < 8 || confirmPassword !== newPassword) return;

        setSavingPassword(true);
        try {
            await updatePassword({ currentPassword, newPassword });
            addToast({ title: "Contraseña actualizada", color: "success" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordTouched(false);
        } catch (err) {
            addToast({ title: "Error", description: getErrorMessage(err), color: "danger" });
        } finally {
            setSavingPassword(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <header className="flex items-center gap-2">
                <UserCog className="text-primary" />
                <h1 className="text-3xl font-bold">Mi cuenta</h1>
                <Chip size="sm" variant="flat" color={user.role === "admin" ? "primary" : "default"} className="ml-auto">
                    {user.role === "admin" ? "Administrador" : "Usuario"}
                </Chip>
            </header>

            {/* Datos de perfil */}
            <Card className="border border-default-100 bg-content1">
                <CardHeader>
                    <h2 className="text-lg font-semibold">Datos de perfil</h2>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Nombre"
                            value={name}
                            onValueChange={setName}
                            onBlur={() => setProfileTouched(true)}
                            isRequired
                            isInvalid={nameInvalid}
                            errorMessage={nameInvalid ? "El nombre debe tener al menos 2 caracteres." : undefined}
                            autoComplete="name"
                        />
                        <Input
                            type="email"
                            label="Correo electrónico"
                            value={email}
                            onValueChange={setEmail}
                            onBlur={() => setProfileTouched(true)}
                            isRequired
                            isInvalid={emailInvalid}
                            errorMessage={emailInvalid ? "Introduce un correo válido." : undefined}
                            autoComplete="email"
                        />
                        <div className="flex justify-end">
                            <Button color="primary" type="submit" isLoading={savingProfile}>
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>

            {/* Cambio de contraseña */}
            <Card className="border border-default-100 bg-content1">
                <CardHeader className="flex items-center gap-2">
                    <KeyRound className="text-primary" size={18} />
                    <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                        <Input
                            type="password"
                            label="Contraseña actual"
                            value={currentPassword}
                            onValueChange={setCurrentPassword}
                            isRequired
                            autoComplete="current-password"
                        />
                        <Input
                            type="password"
                            label="Nueva contraseña"
                            value={newPassword}
                            onValueChange={setNewPassword}
                            onBlur={() => setPasswordTouched(true)}
                            isRequired
                            isInvalid={newPasswordInvalid}
                            errorMessage={newPasswordInvalid ? "Mínimo 8 caracteres." : undefined}
                            autoComplete="new-password"
                        />
                        <Input
                            type="password"
                            label="Confirmar nueva contraseña"
                            value={confirmPassword}
                            onValueChange={setConfirmPassword}
                            onBlur={() => setPasswordTouched(true)}
                            isRequired
                            isInvalid={confirmInvalid}
                            errorMessage={confirmInvalid ? "Las contraseñas no coinciden." : undefined}
                            autoComplete="new-password"
                        />
                        <div className="flex justify-end">
                            <Button color="primary" type="submit" isLoading={savingPassword}>
                                Actualizar contraseña
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
