# WorldWideView — Agent Rules

## 1. Project Identity

WorldWideView is a **real-time geospatial intelligence engine** that visualizes live global data on an interactive 3D globe. Built with **Next.js 16**, **CesiumJS**, **React 19**, and **Zustand**, it renders everything from live aircraft and maritime vessels to conflict events, satellites, and environmental data — all through a modular plugin architecture.

### Target Inspiration
Our primary design, feature-set, and operational layout goal is to mimic the structure and capabilities of `www.worldmonitor.app`.
- **Reference Codebase**: [GitHub - koala73/worldmonitor](https://github.com/koala73/worldmonitor)
---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, `output: "standalone"`) |
| Language | TypeScript 5, strict mode |
| 3D Engine | CesiumJS + Resium (Google Photorealistic 3D Tiles) |
| State | Zustand (slice-based: globe, layers, timeline, UI, filters, data, config, favorites, geojson) |
| Event Bus | Custom typed `DataBus` (pub/sub singleton) |
| Styling | Vanilla CSS — **no Tailwind** |
| Database | PostgreSQL via Prisma 7 (local and cloud) |
| Auth | NextAuth v5 beta (Credentials provider, JWT sessions) |
| Package Manager | pnpm (monorepo with `pnpm-workspace.yaml`) |
| Testing | Vitest + jsdom + React Testing Library |
| Deployment | Docker multi-stage build → Coolify |
| Analytics | Vercel Analytics / custom `trackEvent` |

---

## 3. Directory Structure

```
worldwideview/
├── src/
│   ├── app/               # Next.js App Router (pages, API routes, layouts)
│   │   ├── api/           # Server-side API routes (auth, aviation, camera, etc.)
│   │   ├── login/         # Login page
│   │   ├── setup/         # First-time setup page
│   │   └── globals.css    # Root stylesheet
│   ├── components/
│   │   ├── common/        # Shared UI: BootOverlay, FloatingWindow, PluginIcon
│   │   ├── layout/        # AppShell, Header, SearchBar, DataBusSubscriber
│   │   ├── panels/        # LayerPanel, EntityInfoCard, FilterPanel, GraphicsSettings
│   │   ├── timeline/      # Timeline component
│   │   ├── marketplace/   # Plugin install/unverified dialogs
│   │   ├── ui/            # Tooltip, ReloadToast
│   │   └── video/         # Floating video manager
│   ├── core/
│   │   ├── data/          # DataBus, PollingManager, CacheLayer, SmartFetcher
│   │   ├── filters/       # filterEngine (applies plugin filters to entities)
│   │   ├── globe/         # GlobeView, EntityRenderer, AnimationLoop, StackManager,
│   │   │   │                CameraController, InteractionHandler, SelectionHandler,
│   │   │   │                ModelManager, ImageryProviderFactory
│   │   │   └── hooks/     # useCameraActions, useEntityRendering, useModelRendering, etc.
│   │   ├── hooks/         # useBootSequence, useIsMobile, useMarketplaceSync
│   │   ├── plugins/       # PluginManager, PluginRegistry, PluginManifest,
│   │   │   │                loadPluginFromManifest, validateManifest, InstalledPluginsLoader
│   │   │   └── loaders/   # DeclarativePlugin, StaticDataPlugin, mapJsonToEntities
│   │   └── state/         # Zustand store + slices (config, data, globe, layers, timeline, ui, etc.)
│   ├── lib/               # auth, db, rateLimit, analytics, AIS stream, marketplace APIs
│   ├── plugins/           # GeoJSON plugin registrations
│   ├── styles/            # HUD animations CSS
│   ├── types/             # GeoJSON types, Umami types
│   └── generated/         # Prisma generated client (gitignored)
├── local-plugins/         # Local sandbox for developing plugins (gitignored)
├── packages/              # pnpm monorepo workspace packages
│   ├── wwv-plugin-sdk/    # Plugin SDK: type definitions, manifest schema
│   ├── wwv-plugin-aviation/
│   ├── wwv-plugin-maritime/
│   ├── wwv-plugin-wildfire/
│   ├── wwv-plugin-borders/
│   ├── wwv-plugin-camera/
│   ├── wwv-plugin-military-aviation/
│   ├── wwv-plugin-satellite/
│   ├── wwv-plugin-iranwarlive/   # Standalone plugin with custom endpoints
│   └── wwv-plugin-{airports,embassies,lighthouses,nuclear,seaports,spaceports,volcanoes}/
├── prisma/                # schema.prisma, migrations/
├── public/                # Static assets, Cesium workers, plugin GeoJSON data
├── scripts/               # Build scripts (copy-cesium, scaffold-osm-plugin, setup)
├── data/                  # PostgreSQL data volume (gitignored)
├── Dockerfile             # Multi-stage production build
├── docker-compose.yml     # Main app + data engine runner + local seeders
└── .agents/               # Agent documentation, rules, skills, workflows
```

---

## 4. Architecture Patterns

### 4.1 Plugin System (Core Abstraction)

Every data source is a **plugin** implementing the `WorldPlugin` interface from `@worldwideview/wwv-plugin-sdk`. The lifecycle utilizes a real-time WebSocket Firehose pipeline:

```text
PluginRegistry.register() → PluginManager.registerPlugin()
  → plugin.initialize(context)
  
Visibility Toggle → DataBusSubscriber subscribes to layer via WsClient
  → Engine responds with instantaneous websocket snapshots over /stream
  → WsClient pipes to DataBus.emit("dataUpdated", WsStreamPayload) 
  → Store → EntityRenderer → Globe
```

Four plugin architectures exist (All-Bundle Model):
1. **Data Engine Seeder** — Lightweight `seeder.mjs` script executed by the dynamic `wwv-data-engine` runner (previously standalone microservices).
2. **Dynamic CDN Loaded (Bundle)** — Externally developed plugins dynamically imported at runtime via ES module CDNs (e.g., `unpkg.com` version-pinned URLs).
3. **Static Compiled (Bundle)** — Static GeoJSON data wrapped into JS bundles via `wwvStaticCompiler` during build/sync (previously `StaticDataPlugin`).
4. **Active Proxied (Bundle)** — Next.js API routes bundled to provide frontend interactions (previously `DeclarativePlugin`).

All plugins are now dynamically imported at runtime as ES module bundles via `loadPluginFromManifest` utilizing `import(/* webpackIgnore: true */ entry)`. The legacy `StaticDataPlugin` and `DeclarativePlugin` runtimes are fully deprecated.

Plugin types are re-exported from SDK through `src/core/plugins/PluginTypes.ts` and `PluginManifest.ts` — **source of truth is always `@worldwideview/wwv-plugin-sdk`**.

### 4.2 State Management

Zustand store with **nine slices**: `globe`, `layers`, `timeline`, `ui`, `filter`, `data`, `config`, `favorites`, `geojson`. Each slice is in its own file under `src/core/state/`.

- Access via `useStore` hook or `useStore.getState()` outside React
- Plugin settings stored in `configSlice.dataConfig.pluginSettings`
- Polling intervals stored in `configSlice.dataConfig.pollingIntervals`

### 4.3 Data Pipeline

```text
Engine push /stream → DataBusSubscriber WsClient router
  → WsClient.handleMessage() → DataBus.emit("websocketData") 
  → DataBusSubscriber → _hydrateSnapshot() → Store.entitiesByPlugin
  → GlobeView (memoized visible entities)
  → EntityRenderer (billboard/point primitives)
  → AnimationLoop (horizon culling, hover/selection)
  → StackManager (co-located entity grouping)
```

### 4.3.1 Engine & Seeders Architecture

The data engine is a **content-agnostic runner** (`wwv-data-engine`, public) that discovers and executes seeder scripts from a configurable directory.

- **Local Dev**: Engine runs via Docker Compose on port 5000, reading seeders dynamically from `local-seeders/`.
- **Production**: Engine container on Coolify, seeders are volume-mounted from the `wwv-seeders` (private) repository.
- **Split-routing**: `resolveEngineUrl` checks `localhost:5000/manifest` for local seeders, falls back to `dataengine.worldwideview.dev` for cloud-hosted ones.

### 4.4 Rendering Pipeline

- **Primitive-based**: Uses `PointPrimitiveCollection`, `BillboardCollection`, `LabelCollection` — NOT Cesium Entity API
- **Chunked processing**: Large datasets (10k+) rendered via `ChunkedProcessor`
- **LOD system**: Model-type entities promoted to 3D models at close range (`useModelRendering`)
- **Horizon culling**: Manual dot-product calculation against Earth radius (NOT depth testing)
- **Stack/Spiderifier**: `StackManager` groups co-located entities; `stackAnimation` handles expansion

### 4.5 Edition System

Three editions controlled by `NEXT_PUBLIC_WWV_EDITION`:
- **`local`** — Self-hosted, full features, auth enabled
- **`cloud`** — Managed cloud instance, full features
- **`demo`** — Public demo, auth disabled, optional admin via `WWV_DEMO_ADMIN_SECRET`

Feature flags derived from edition in `src/core/edition.ts`.

---

## 5. Critical Conventions

### 5.1 File Size

**Max 150 lines per file.** If a file grows beyond this, modularize it. Extract helpers, split components, use hooks.

### 5.2 Import Aliases

- `@/*` → `./src/*`
- `@worldwideview/wwv-plugin-sdk` → `./packages/wwv-plugin-sdk/src`
- Each plugin has its own alias in `tsconfig.json`

### 5.3 CSS Rules

- **Vanilla CSS only** — no Tailwind, no CSS-in-JS
- Global styles in `src/app/globals.css`
- Component-scoped styles use CSS Modules (`.module.css`) or co-located `.css` files
- HUD animations in `src/styles/hud-animations.css`

### 5.4 Rendering Entity Rules

When returning `CesiumEntityOptions` from `renderEntity()`:

- **Points**: Use `type: "point"` with `color`, `size`, `outlineColor`, `outlineWidth`
- **Billboards**: Use `type: "billboard"` with `iconUrl`, `color`, `iconScale`
- **NEVER mix**: Do not use `size`/`outlineWidth`/`outlineColor` on billboard entities — causes GPU clipping

### 5.5 Plugin Registration

Built-in plugins are instantiated in `AppShell.tsx` and registered via `PluginRegistry` → `PluginManager`. Marketplace-installed plugins are loaded from the database via `InstalledPluginsLoader`.

### 5.6 Workspace Rules

- Always run `pnpm install` from project root after creating new packages or linking local plugins
- Official plugin packages go in `packages/wwv-plugin-<name>/`
- Experimental/local plugin sandboxes go in `local-plugins/wwv-plugin-<name>/`
- Globs for `packages/*`, `packages/*/backend`, and `local-plugins/*` are mapped in `pnpm-workspace.yaml` and `tsconfig.json` paths
- Add new `packages/` plugins to `transpilePackages` in `next.config.ts` if required

### 5.7 AI Meta-Directives: Antigravity Standard (Aditya and Mankshu Code)

> [!NOTE]
> This repository is orchestrated via the **Antigravity open standard** using **Aditya and Mankshu Code** as the active agent. The entry point for Aditya and Mankshu Code is `CLAUDE.md` at the project root.

> [!WARNING]
> - **Always** use standard `.md` file extensions for rules, skills, and workflows. 
> - **Never** use proprietary `.mdc` extensions.
> - **Never** reference Cursor IDE rules; we use the open `.agents/` standard.
> - **MUST**: You MUST update Semantic Versioning numbering inside the relevant `package.json` file prior to executing any code commits, adhering strictly to the `[/commit]` workflow rules (`feat:` -> Minor, `fix/refactor/perf:` -> Patch).
> - **MUST Detail Commit Levels & Bumps**: On description changes or release notes, you must detail the level of commit (Major/Minor/Fix) for *each* individual change. If there are multiple accumulated changes, you MUST EITHER commit them individually and bump the version each time, OR commit them all at once and bump the version multiple times.
> - **MUST Explain Complex Concepts Simply**: Whenever providing a complicated technical explanation to the user, you MUST include a simple explanation below it. Use an analogy with reference to the correct terminology, comparing the concept to something from everyday life to ensure the user easily understands it.
> - **MUST Be Transparent & Narrate Actions**: You MUST always be transparent about what you are doing. Narrate your goals, your current step in the process, and exactly what actions you are taking or tools you are executing **before** or **while** you do them, not after they are done. Do not work in silence or lock all your reasoning behind hidden "thought" blocks. Use visible chat messages to bring the user along the journey by describing your plan as it unfolds. **Crucially, keep this narration conversational and natural.** Avoid stiff, robotic templates (e.g., "My Goal: X. My Step: Y."). Just occasionally drop a brief, casual note about what you are checking or doing next so the user isn't left in the dark.

### 5.8 Workspace Hygiene
Whenever agents generate temporary debugging scripts, test REST endpoints via `.mjs`, or dump traces/JSON outputs, they **MUST** save these exclusively inside `/local-scripts/`. The root directory is strictly for production configuration files.

---

## 6. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | JWT signing secret (generate with `openssl rand -hex 32`) |
| `NEXT_PUBLIC_CESIUM_ION_TOKEN` | No | Cesium Ion access token |
| `NEXT_PUBLIC_BING_MAPS_KEY` | No | Bing Maps imagery |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | Google 3D Tiles |
| `NEXT_PUBLIC_WWV_EDITION` | No | `local` / `cloud` / `demo` (default: `local`) |
| `NEXT_PUBLIC_WWV_PLUGIN_DATA_ENGINE_URL` | No | Override engine WebSocket URL (default: cloud) |
| `OPENSKY_CREDENTIALS` | No | Comma-separated `id:secret` pairs for credential rotation |
| `WWV_BRIDGE_TOKEN` | No | Shared secret for marketplace → WWV install bridge |
| `WWV_DEMO_ADMIN_SECRET` | No | Demo edition admin password |
| `IRANWARLIVE_BACKEND_URL` | No | Override for IranWarLive custom backend URL |

Secrets go in `.env.local` (gitignored). Non-secrets go in `.env` (committed).

---

## 7. Development Commands

```bash
pnpm install          # Install all workspace dependencies
pnpm run setup        # Generate .env.local with AUTH_SECRET (first-time setup)
pnpm dev              # Next.js frontend only (auto-runs prisma db push + copy-cesium)
pnpm dev:all          # Frontend + wwv-data-engine (via Docker Compose) concurrently
pnpm dev:backends     # Starts the local data engine + Redis via Docker Compose
pnpm build            # Production build
pnpm test             # Run all Vitest tests (scoped to src/lib, src/core, src/plugins)
pnpm db:reset         # Reset and re-migrate the frontend database (destructive)
pnpm start:backends   # Legacy command for standalone Fastify backends
pnpm clean:backends   # Wipe all plugin database records
pnpm run scaffold-osm-plugin <name>  # Generate a new plugin from scaffold
pnpm dev:plugins      # File watcher for local-plugins/ directory (runs automatically in dev)
node packages/wwv-cli/dist/index.js create <name> --local # Scaffold a new local plugin
node packages/wwv-cli/dist/index.js link <name>           # Promote a local plugin to packages/
```

Frontend runs at `http://localhost:3000`.

---

## 8. Deployment

- **Docker**: Multi-stage Dockerfile using the Extractor Pattern (`deps` → `builder` → `runner`). The `node_modules` folders must be explicitly untracked in from `git` across the workspace to prevent corrupted BuildKit contextual cache overlaps during the `COPY . .` stage.
- **Standalone output**: `next.config.ts` uses `output: "standalone"`.
- **Cesium assets**: Copied to `public/cesium/` via `scripts/copy-cesium.mjs` at build time, excluded from output tracing.
- **Prisma Configuration**: `prisma.config.ts` must export a native javascript object instead of dynamically importing CLI wrapper binaries (`prisma/config` or `dotenv`). The standalone Next.js tracer strips CLI devDependencies during the build, which will cause fatal runtime container crashes if imported.
- **Data Engine**: The single runner container defined in `docker-compose.yml`, proxied via `next.config.ts` rewrites.
- **Coolify**: Deployed via Dockerfile builder natively mapping environment variables continuously into the container shell.
- **Docker volumes**: Ensure PostgreSQL data and Redis volumes are mounted for persistence.

---

## 9. Testing Strategy

- **Framework**: Vitest with jsdom environment
- **Coverage**: `src/lib/**`, `src/core/**`, `src/plugins/**`
- **Run**: `pnpm test` (or `vitest run`)
- **Key test files**: `rateLimit.test.ts`, `edition.test.ts`, `demoAdmin.test.ts`, `DeclarativePlugin.test.ts`, `cors.test.ts`, `repository.test.ts`, `marketplaceToken.test.ts`

---

## 10. Security Headers

Configured in `next.config.ts` `headers()`:
- **CSP**: Restrictive with exceptions for CesiumJS (`unsafe-eval`, `unsafe-inline`), camera streams (`http: https:`), and analytics
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: camera/microphone disabled, geolocation self-only

---

## 11. Related Repositories

| Repo | Purpose |
|---|---|
| `worldwideview` | Main application (this repo) |
| `wwv-data-engine` | Generic data engine runner (PUBLIC, runs via Docker) |
| `wwv-seeders` | Proprietary seeder scripts (PRIVATE, volume-mounted in prod) |
| `worldwideview-marketplace` | Plugin marketplace web app |
| `worldwideview-plugins` | Published npm plugin packages |
| `worldwideview-web` | Marketing / landing page |

---

## 12. On-Demand Rules

Read the relevant rule file when working in that domain:

| Rule | When to use | Path |
|---|---|---|
| `monorepo-workflow` | pnpm commands, adding packages, workspace config | `.agents/rules/monorepo-workflow.md` |
| `plugin-architecture` | Creating/modifying plugins, lifecycle, registration | `.agents/rules/plugin-architecture.md` |
| `data-engine-architecture` | Data Engine backend seeder loading, pnpm workspace dependencies | `.agents/rules/data-engine-architecture.md` |
| `cesium-rendering` | Globe rendering, entity types, primitives, LOD, culling | `.agents/rules/cesium-rendering.md` |
| `state-management` | Zustand slices, store access, plugin settings | `.agents/rules/state-management.md` |
| `database-migrations` | Prisma schema changes, migrations, PostgreSQL | `.agents/rules/database-migrations.md` |
| `continuous-improvement` | When to create/update rules, skills, or workflows | `.agents/rules/continuous-improvement.md` |
| `context-and-memory` | How to orient and maintain project context between sessions | `.agents/rules/context-and-memory.md` |

---

## 13. Slash Commands / Workflows

Invoke by name. Read the skill/workflow file and follow its steps.

| Command | Description | File |
|---|---|---|
| `/commit` | **Required before every commit** — bump semver + conventional commit | `.agents/skills/commit/SKILL.md` |
| `/remember` | Save a lesson, constraint, or fact into `.agents/` permanent memory | `.agents/skills/remember/SKILL.md` |
| `/pr-review` | 6-role comprehensive pull request review | `.agents/skills/pr-review/SKILL.md` |
| `/update-context` | Sync `.agents/context/` with current project state | Global skill |
| `/local-dev` | Check, start, and troubleshoot local dev environment | `.agents/workflows/local-dev.md` |
| `/data-engine-cli` | Use the wwv-data-engine CLI wrapper | `.agents/workflows/data-engine-cli.md` |
| `/debugging-coolify` | Troubleshoot deployed apps on Coolify via MCP/SSH | `.agents/workflows/debugging-coolify.md` |
| `/five` | Five Whys root cause analysis | `.agents/workflows/five.md` |
| `/stitch-to-nextjs` | Generate UI with Stitch MCP, port into Next.js | `.agents/workflows/stitch-to-nextjs.md` |
| `/bing-news-hydration` | Hydrate event attributes with Bing RSS news | `.agents/workflows/bing-news-hydration.md` |
| `/generate-user-roadmap` | Generate updated user-facing roadmap | `.agents/workflows/generate-user-roadmap.md` |

---

## 14. Agent Skills Reference

Refer to these skill documents for specialized tasks:

### Project Skills (`.agents/skills/`)

| Skill | When to Use |
|---|---|
| `worldwideview-plugin-creation` | **Use when creating any plugin** — strict architectural checklist |
| `plugin-creation-master-guide.md` | Decision matrix for choosing plugin architecture |
| `osm-static-plugin-creation.md` | Creating static GeoJSON plugins from OpenStreetMap |
| `microservice-plugin-creation.md` | Legacy guide for standalone Fastify microservices |
| `database-operations.md` | Prisma schema changes, migrations, database queries |
| `database-incident-recovery-procedures.md` | Authoritative protocol for safely restoring a broken production database |
| `index-documentation.md` | Maintaining project documentation index |
| `context7` | Fetch up-to-date library docs via Context7 API |
| `cesium-context7` | CesiumJS-specific documentation lookup |

### Global Skills

52 skills are available across all projects. See `.agents/global-skills-index.md` for the full list and invocation paths.

---

## 15. Pull Request & Commit Guidelines

- **Commit Format**: We strictly enforce Conventional Commits (`feat:`, `fix:`, `refactor:`, `perf:`).
- **Workflow**: You **MUST** use the `/commit` workflow before every git commit to ensure proper semantic versioning bumps.
- **Required Checks**: Ensure `pnpm test` and `pnpm build` complete successfully before proposing a merge.
- **Review Process**: Use `/pr-review` to conduct a comprehensive multi-role review on any pull request.

---

## 16. Debugging and Troubleshooting

- **Prisma & PostgreSQL Sync Issues**: If the local database state falls out of sync with Prisma schema, do not manually drop tables. Instead, run `pnpm db:reset` to cleanly wipe and re-apply all migrations.
- **Cesium Entity Clipping**: If `billboard` entities are clipping or failing to render correctly, verify that you are not mixing `point` primitive properties (like `size` or `outlineWidth`) into the `billboard` options.
- **Build Exhaustion (Docker)**: Multi-stage pnpm builds generate massive cache layers. If a Coolify deployment fails silently or PostgreSQL crashes abruptly, check host disk space and run `docker builder prune -a -f`.
- **Next.js Typechecking Failures**: If backend-only `scripts/` fail during Next.js build, verify that the scripts directory is properly listed in the `exclude` array of `tsconfig.json`.
