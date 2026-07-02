import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Link as HeroLink,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";
import { ListMusic, AudioLines, Grid3x3, User, LogOut, Shield, LogIn, UserPlus, Sparkles, UserCog } from "lucide-react";
import glearningIcon from "@/assets/glearning-icon.svg";
import { useAuth } from "@/context/AuthContext";

interface NavLink {
    label: string;
    to: string;
    icon: ReactNode;
}

const NAV_LINKS: NavLink[] = [
    { label: "Escalas", to: "/scales", icon: <AudioLines size={18} /> },
    { label: "Acordes", to: "/chords", icon: <Grid3x3 size={18} /> },
    { label: "Modos", to: "/modes", icon: <ListMusic size={18} /> },
];

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: Readonly<LayoutProps>) {
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, isAuthenticated, isAdmin, logout } = useAuth();

    const isActive = (to: string) => location.pathname === to;

    // "Mis escalas" solo para usuarios autenticados.
    const navLinks: NavLink[] = isAuthenticated
        ? [...NAV_LINKS, { label: "Mis escalas", to: "/custom-scales", icon: <Sparkles size={18} /> }]
        : NAV_LINKS;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div
            className="flex min-h-screen flex-col bg-background text-foreground"
            style={{
                backgroundImage: `
                    linear-gradient(to right, rgba(99, 102, 241, 0.06) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(99, 102, 241, 0.06) 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
                backgroundAttachment: "fixed",
            }}
        >
            <Navbar isMenuOpen={menuOpen} onMenuOpenChange={setMenuOpen} maxWidth="xl" isBordered>
                <NavbarContent>
                    <NavbarMenuToggle className="sm:hidden" />
                    <NavbarBrand>
                        <Link to="/" className="flex items-center gap-2 font-semibold">
                            <span className="flex h-8 w-8 items-center justify-center rounded-medium bg-primary text-primary-foreground">
                                <img src={glearningIcon} alt="G-Learning" className="h-7 w-7" />
                            </span>
                            <span className="text-lg tracking-tight">G-Learning</span>
                        </Link>
                    </NavbarBrand>
                </NavbarContent>

                <NavbarContent className="hidden gap-7 sm:flex" justify="center">
                    {navLinks.map((link) => (
                        <NavbarItem key={link.to} isActive={isActive(link.to)}>
                            <HeroLink
                                as={Link}
                                to={link.to}
                                color={isActive(link.to) ? "primary" : "foreground"}
                                className="flex items-center gap-1.5 text-sm"
                            >
                                {link.icon}
                                {link.label}
                            </HeroLink>
                        </NavbarItem>
                    ))}
                </NavbarContent>

                <NavbarContent justify="end">
                    {isAuthenticated && user ? (
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Button
                                    variant="flat"
                                    className="hidden sm:flex"
                                    startContent={
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                                            <User size={14} />
                                        </span>
                                    }
                                >
                                    {user.name}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Menú de usuario">
                                <DropdownItem key="role" isReadOnly className="opacity-100">
                                    <span className="text-xs text-default-500">
                                        {isAdmin ? "Administrador" : "Usuario"} · {user.email}
                                    </span>
                                </DropdownItem>
                                <DropdownItem
                                    key="account"
                                    startContent={<UserCog size={16} />}
                                    onPress={() => navigate("/account")}
                                >
                                    Mi cuenta
                                </DropdownItem>
                                {isAdmin ? (
                                    <DropdownItem
                                        key="admin"
                                        startContent={<Shield size={16} />}
                                        onPress={() => navigate("/admin")}
                                    >
                                        Administración
                                    </DropdownItem>
                                ) : null}
                                {isAdmin ? (
                                    <DropdownItem
                                        key="admin-scales"
                                        startContent={<ListMusic size={16} />}
                                        onPress={() => navigate("/admin/custom-scales")}
                                    >
                                        Escalas de usuarios
                                    </DropdownItem>
                                ) : null}
                                <DropdownItem
                                    key="logout"
                                    color="danger"
                                    startContent={<LogOut size={16} />}
                                    onPress={handleLogout}
                                >
                                    Cerrar sesión
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    ) : (
                        <>
                            <NavbarItem className="hidden sm:flex">
                                <Button
                                    as={Link}
                                    to="/register"
                                    variant="light"
                                    size="sm"
                                    startContent={<UserPlus size={16} />}
                                >
                                    Crear cuenta
                                </Button>
                            </NavbarItem>
                            <NavbarItem>
                                <Button
                                    as={Link}
                                    to="/login"
                                    variant="light"
                                    size="sm"
                                    startContent={<LogIn size={16} />}
                                >
                                    Iniciar sesión
                                </Button>
                            </NavbarItem>
                        </>
                    )}
                </NavbarContent>

                <NavbarMenu>
                    {navLinks.map((link) => (
                        <NavbarMenuItem key={link.to} isActive={isActive(link.to)}>
                            <HeroLink
                                as={Link}
                                to={link.to}
                                color={isActive(link.to) ? "primary" : "foreground"}
                                className="flex w-full items-center gap-2 py-1"
                                onPress={() => setMenuOpen(false)}
                            >
                                {link.icon}
                                {link.label}
                            </HeroLink>
                        </NavbarMenuItem>
                    ))}
                    {isAuthenticated && (
                        <NavbarMenuItem>
                            <HeroLink
                                as={Link}
                                to="/account"
                                color="foreground"
                                className="flex w-full items-center gap-2 py-1"
                                onPress={() => setMenuOpen(false)}
                            >
                                <UserCog size={18} />
                                Mi cuenta
                            </HeroLink>
                        </NavbarMenuItem>
                    )}
                    {isAdmin && (
                        <NavbarMenuItem>
                            <HeroLink
                                as={Link}
                                to="/admin"
                                color="foreground"
                                className="flex w-full items-center gap-2 py-1"
                                onPress={() => setMenuOpen(false)}
                            >
                                <Shield size={18} />
                                Administración
                            </HeroLink>
                        </NavbarMenuItem>
                    )}
                    {isAdmin && (
                        <NavbarMenuItem>
                            <HeroLink
                                as={Link}
                                to="/admin/custom-scales"
                                color="foreground"
                                className="flex w-full items-center gap-2 py-1"
                                onPress={() => setMenuOpen(false)}
                            >
                                <ListMusic size={18} />
                                Escalas de usuarios
                            </HeroLink>
                        </NavbarMenuItem>
                    )}
                    <NavbarMenuItem>
                        {isAuthenticated ? (
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    handleLogout();
                                }}
                                className="flex w-full items-center gap-2 py-1 text-danger"
                            >
                                <LogOut size={18} />
                                Cerrar sesión
                            </button>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <HeroLink
                                    as={Link}
                                    to="/login"
                                    color="foreground"
                                    className="flex w-full items-center gap-2 py-1"
                                    onPress={() => setMenuOpen(false)}
                                >
                                    <LogIn size={18} />
                                    Iniciar sesión
                                </HeroLink>
                                <HeroLink
                                    as={Link}
                                    to="/register"
                                    color="foreground"
                                    className="flex w-full items-center gap-2 py-1"
                                    onPress={() => setMenuOpen(false)}
                                >
                                    <UserPlus size={18} />
                                    Crear cuenta
                                </HeroLink>
                            </div>
                        )}
                    </NavbarMenuItem>
                </NavbarMenu>
            </Navbar>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>

            <footer className="border-t border-default-100 bg-black px-8 py-6">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-sm text-default-600">
                        © {new Date().getFullYear()} G-Learning. Todos los derechos reservados.
                    </p>
                    <p className="text-sm text-default-500">Escalas · Acordes · Modos</p>
                </div>
            </footer>
        </div>
    );
}
