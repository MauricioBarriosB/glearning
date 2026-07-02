import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import ApiErrorNotification from "./components/ApiErrorNotification.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <HeroUIProvider>
                <ToastProvider placement="top-right" toastOffset={20} />
                <ApiErrorNotification />
                <App />
            </HeroUIProvider>
        </QueryClientProvider>
    </StrictMode>,
);
