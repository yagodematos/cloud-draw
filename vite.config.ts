import { defineConfig } from "vite"
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
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts"
  }
})
