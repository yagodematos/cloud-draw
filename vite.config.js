import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
function resolveBase() {
    var repository = process.env.GITHUB_REPOSITORY;
    if (!repository) {
        return "/";
    }
    var _a = repository.split("/"), repoName = _a[1];
    return repoName ? "/".concat(repoName, "/") : "/";
}
export default defineConfig({
    base: resolveBase(),
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./tests/setup.ts"
    }
});
