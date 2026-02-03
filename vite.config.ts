import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import moduleJSON from "./module.json" with { type: "json" };

export default defineConfig({
    root: "./src",
    base: `/modules/${moduleJSON.id}/dist`,
    server: {
        open: "/",
        port: 30001,
        proxy: {
            [`^(?!/modules/${moduleJSON.id}/dist/)`]: "http://localhost:30000",
            [`/modules/${moduleJSON.id}/dist/${moduleJSON.id}.js`]: {
                target: `http://localhost:30001/modules/${moduleJSON.id}/dist`,
                rewrite: () => "/index.ts"
            },
            "/socket.io": { target: "ws://localhost:30000", ws: true }
        }
    },
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        sourcemap: true,
        lib: { entry: "index.ts", formats: ["es"], fileName: moduleJSON.id },
        rollupOptions: {
            output: {
                manualChunks: () => {
                    return moduleJSON.id;
                }
            }
        }
    },
    plugins: [tsconfigPaths()]
});
