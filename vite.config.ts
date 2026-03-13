import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

function resolveBase() {
  const repository = process.env.GITHUB_REPOSITORY
  if (!repository) {
    return "/"
  }

  const [, repoName] = repository.split("/")
  return repoName ? `/${repoName}/` : "/"
}

export default defineConfig({
  base: resolveBase(),
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@codemirror") || id.includes("@uiw/react-codemirror")) {
            return "editor"
          }

          if (id.includes("react") || id.includes("scheduler")) {
            return "react-vendor"
          }

          return undefined
        }
      }
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts"
  }
})
