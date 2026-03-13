# CloudDSL

CloudDSL is a browser-based diagram-as-code editor for cloud architecture. It is a static React + TypeScript application with a Peggy parser on the main thread, ELK layout in a web worker, and an imperative SVG renderer for the canvas.

## Phase 1 MVP

The current implementation includes:

- Live DSL editing with immediate parse feedback
- Nested groups, nodes, and labeled connections
- Debounced worker layout using ELK
- Imperative SVG rendering with diff-based updates
- Generic icon set and built-in examples
- GitHub Pages-ready Vite build

Out of scope for this phase:

- URL sharing
- PNG/SVG export flows
- Service worker/offline mode
- Cloud-provider icon packs beyond the generic starter set

## Local development

```bash
pnpm install
pnpm dev
```

## Quality checks

```bash
pnpm lint
pnpm test
pnpm build
```

## Architecture notes

- `src/core/parser`: Peggy grammar, AST normalization, and parse errors
- `src/core/layout`: ELK adapter, worker, and debounced bridge
- `src/core/renderer`: Imperative SVG canvas renderer
- `src/components`: React shell only; the canvas itself is not React-rendered

## Deployment

GitHub Pages deployment is configured in [deploy.yml](/Users/yago/dev/cloud-draw/.github/workflows/deploy.yml). The Vite `base` path is derived from `GITHUB_REPOSITORY` in CI and defaults to `/` locally.
