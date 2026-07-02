import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
    base: "/glearning/",
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@components": path.resolve(__dirname, "./src/components"),
            "@modules": path.resolve(__dirname, "./src/modules"),
            "@services": path.resolve(__dirname, "./src/services"),
            "@types": path.resolve(__dirname, "./src/types"),
        },
    },
});
