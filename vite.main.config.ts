import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: "electron/main.ts",
            formats: ['cjs'],
            fileName: () => "main.cjs"
        },
    }
})