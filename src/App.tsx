import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Layout from "@components/Layout";
import PageLoader from "@components/PageLoader";
import { AuthProvider } from "@/context/AuthContext";
import { ContentProvider } from "@/context/ContentContext";
import { RequireAdmin } from "@components/guards/RequireAdmin";
import { RequireAuth } from "@components/guards/RequireAuth";

const Home = lazy(() => import("@modules/home/pages/Home"));
const ScalesPage = lazy(() => import("@modules/scales/pages/ScalesPage"));
const ModesPage = lazy(() => import("@modules/modes/pages/ModesPage"));
const ChordsPage = lazy(() => import("@modules/chords/pages/ChordsPage"));
const CustomScalesListPage = lazy(() => import("@modules/customscales/pages/CustomScalesListPage"));
const CustomScalesDetailPage = lazy(() => import("@modules/customscales/pages/CustomScalesDetailPage"));
const Login = lazy(() => import("@modules/user/pages/Login"));
const Register = lazy(() => import("@modules/user/pages/Register"));
const AccountPage = lazy(() => import("@modules/user/pages/AccountPage"));
const AdminUsers = lazy(() => import("@modules/admin/pages/AdminUsers"));
const AdminCustomScales = lazy(() => import("@modules/customscales/pages/AdminCustomScales"));

/**
 * Layout de rutas que necesitan la data de contenido: monta el ContentProvider una vez
 * (permanece montado al navegar entre páginas, así la data se carga una sola vez).
 */
function ContentLayout() {
    return (
        <ContentProvider>
            <Outlet />
        </ContentProvider>
    );
}

function App() {
    return (
        <BrowserRouter basename="/glearning">
            <AuthProvider>
                <Layout>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/account"
                                element={
                                    <RequireAuth>
                                        <AccountPage />
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="/admin"
                                element={
                                    <RequireAdmin>
                                        <AdminUsers />
                                    </RequireAdmin>
                                }
                            />
                            <Route
                                path="/admin/custom-scales"
                                element={
                                    <RequireAdmin>
                                        <AdminCustomScales />
                                    </RequireAdmin>
                                }
                            />
                            <Route element={<ContentLayout />}>
                                <Route path="/scales" element={<ScalesPage />} />
                                <Route path="/modes" element={<ModesPage />} />
                                <Route path="/chords" element={<ChordsPage />} />
                                <Route
                                    path="/custom-scales"
                                    element={
                                        <RequireAuth>
                                            <CustomScalesListPage />
                                        </RequireAuth>
                                    }
                                />
                                <Route
                                    path="/custom-scales/new"
                                    element={
                                        <RequireAuth>
                                            <CustomScalesDetailPage />
                                        </RequireAuth>
                                    }
                                />
                                <Route
                                    path="/custom-scales/:id"
                                    element={
                                        <RequireAuth>
                                            <CustomScalesDetailPage />
                                        </RequireAuth>
                                    }
                                />
                            </Route>
                        </Routes>
                    </Suspense>
                </Layout>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
