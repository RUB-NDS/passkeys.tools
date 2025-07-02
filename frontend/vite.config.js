import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import includeHtml from "vite-plugin-include-html"

export default defineConfig({
    appType: "spa",
    plugins: [
        nodePolyfills(),
        includeHtml(),
    ],
})
