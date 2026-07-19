import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png"],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: "NATO Alphabet Practice",
        short_name: "NATO Spell",
        description: "Practice spelling words using the NATO phonetic alphabet.",
        display: "standalone",
        theme_color: "#101820",
        background_color: "#101820",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        globIgnores: ["models/**"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
      }
    })
  ],
  test: {
    environment: "node"
  }
});
