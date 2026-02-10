# Claude Inspect

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Inspect is a dark-themed, node-based graph UI that visualizes Claude Code project configuration. The app reads a `.claude` directory (Skills, Commands, Permissions, MCP Tools) from any project mounted via Docker and displays it as an interactive left-to-right flow diagram.

A reference design screenshot is available at `reference.jpg`.

## Commands

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server at http://localhost:3000
npm run build                  # Production build
npm run preview                # Preview production build locally
npm run generate               # Static site generation
```

### Running with a target project

```bash
# Dev mode — inspect current directory
PROJECT_PATH=. npm run dev

# Dev mode — inspect another project
PROJECT_PATH=/path/to/project npm run dev

# Demo mode — use built-in demo data (ShopFlow e-commerce project)
npm run demo

# Docker — inspect any project (read-only mount)
TARGET_PROJECT_PATH=/path/to/project docker compose up

# Docker — rebuild and run
TARGET_PROJECT_PATH=/path/to/project docker compose up --build
```

### Demo Mode

The `demo/` directory contains a simulated `.claude` configuration for a fictional **ShopFlow** e-commerce project. It showcases all supported features:

- **4 Agents**: api-architect, frontend-designer, database-optimizer, security-auditor
- **10 Commands**: deploy, test, lint, migrate, seed, build, review, generate-api, performance-check, changelog
- **5 Skills**: api-generator, test-factory, migration-builder, component-creator, docker-setup
- **2 Hooks**: PreToolUse (Bash validation), PostToolUse (lint on edit)
- **2 Todos**: payment webhooks (pending), order tracking (in progress)
- **7 MCP Tools**: github (3), slack (2), datadog (2)
- **Cross-references**: `review` → `security-auditor` agent, `build` → `migration-builder` skill, `test` → `test-factory` skill

Run it with:
```bash
npm run demo
```

### Testing

```bash
npx playwright test            # Run Playwright E2E tests
```

## Tech Stack

- **Framework**: Nuxt 4 (`nuxt ^4.3.1`) with Vue 3
- **Graph library**: `@vue-flow/core` + `@vue-flow/background`, `@vue-flow/controls`, `@vue-flow/minimap`
- **Layout algorithm**: `@dagrejs/dagre` — automatic left-to-right tree layout
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin
- **YAML parsing**: `gray-matter` — for SKILL.md frontmatter
- **E2E testing**: Playwright
- **Containerization**: Docker + Docker Compose

## Architecture

### Nuxt 4 Conventions

Nuxt 4 auto-imports Vue APIs, composables, and components. Key directories:

- `app/components/` — auto-imported Vue components (subdirectory prefix: `ui/AppHeader.vue` → `<UiAppHeader>`)
- `app/composables/` — auto-imported composables
- `app/pages/` — file-based routing
- `app/types/` — TypeScript type definitions
- `app/assets/` — processed assets (CSS)

Server-side code in `server/` (auto-imported utils, API routes):

- `server/utils/` — auto-imported server utilities (no barrel files needed)
- `server/api/` — API routes

### Data Flow

```
.claude/ directory → Server parsers → /api/claude-config → useGraphData composable → VueFlow graph
```

1. **Server parsers** (`server/utils/parsers/`) read the target project's `.claude/` directory
2. **Single API endpoint** (`/api/claude-config`) returns all parsed data in one response
3. **Client composable** (`useGraphData`) fetches API data and transforms it into VueFlow nodes/edges
4. **Layout composable** (`useGraphLayout`) applies dagre auto-layout (left-to-right)
5. **InspectGraph** component renders the VueFlow canvas with custom node/edge types

### Data Sources (from target `.claude/` directory)

| Source | Extracts |
|--------|----------|
| `CLAUDE.md` | Project name (from directory name if heading is generic) + overview (first `## Project Overview` section) |
| `settings.local.json` | Permissions (allow/deny grouped by type: Bash, Web, FileSystem, Search, etc.), MCP tools (`mcp__*` entries) |
| `commands/*.md` | Command name (filename), title (first `#`), description (first non-heading line) |
| `skills/*/SKILL.md` | Skill name + description (from YAML frontmatter) |

### Graph Structure (Left-to-Right)

```
[Project] → [Skills]      → skill items...
           → [Commands]    → command items...
           → [MCP Tools]   → mcp tool items...
           → [Permissions]  → permission groups (by type)...
```

Category order: Skills → Commands → MCP Tools → Permissions.

Color scheme:
- **Skills** — blue (`#3b82f6`)
- **Commands** — green (`#22c55e`)
- **Permissions** — amber (`#f59e0b`)
- **MCP Tools** — violet (`#8b5cf6`)

Permissions are grouped by type (Bash, Web, FileSystem, Search, Other) to avoid 70+ individual nodes.

## File Structure

```
├── app/
│   ├── app.vue                              # Root component (dark bg + NuxtPage)
│   ├── pages/
│   │   └── index.vue                        # Main page — wires header, graph, detail panel
│   ├── components/
│   │   ├── graph/
│   │   │   ├── InspectGraph.vue             # VueFlow container (Background, Controls, MiniMap)
│   │   │   ├── nodes/
│   │   │   │   ├── ProjectNode.vue          # Large central card (blue border, glow)
│   │   │   │   ├── CategoryNode.vue         # Medium card with colored accent per category
│   │   │   │   ├── SkillNode.vue            # Skill name + truncated description
│   │   │   │   ├── CommandNode.vue          # /command indicator + title
│   │   │   │   ├── PermissionNode.vue       # Grouped permissions with allow/deny badges
│   │   │   │   └── McpToolNode.vue          # Service + tool name
│   │   │   └── edges/
│   │   │       └── GlowEdge.vue             # Colored glowing bezier edge
│   │   └── ui/
│   │       ├── AppHeader.vue                # Top bar with project name + refresh button
│   │       ├── LoadingOverlay.vue           # Spinner overlay
│   │       ├── ErrorOverlay.vue             # Error state with retry
│   │       └── NodeDetailPanel.vue          # Slide-out panel on node click (full details)
│   ├── composables/
│   │   ├── useGraphData.ts                  # Fetch API + transform to nodes/edges
│   │   └── useGraphLayout.ts                # Dagre LR layout algorithm
│   ├── types/
│   │   ├── claude-config.ts                 # API response types
│   │   └── graph.ts                         # Node data types per node type
│   └── assets/css/
│       └── main.css                         # Tailwind v4 + VueFlow dark theme overrides
├── server/
│   ├── api/
│   │   └── claude-config.get.ts             # GET /api/claude-config — unified response
│   └── utils/
│       ├── config.ts                        # getProjectPath(), getClaudeDir(), getClaudeMdPath()
│       └── parsers/
│           ├── parseClaudeMd.ts             # Project name + overview extraction
│           ├── parseSettings.ts             # Permissions + MCP tool entries from settings.local.json
│           ├── parseCommands.ts             # Commands from commands/*.md
│           ├── parseSkills.ts               # Skills from skills/*/SKILL.md (gray-matter)
│           └── parseMcpTools.ts             # MCP tool name parsing (mcp__service__tool)
├── demo/                                    # Built-in demo data (ShopFlow project)
│   ├── CLAUDE.md                            # Demo project description
│   └── .claude/
│       ├── settings.local.json              # Permissions, hooks, MCP tools
│       ├── todos.json                       # Sample todos
│       ├── agents/*.md                      # 4 demo agents
│       ├── commands/*.md                    # 10 demo commands
│       └── skills/*/SKILL.md               # 5 demo skills
├── nuxt.config.ts                           # Tailwind vite plugin, CSS, runtimeConfig.projectPath
├── Dockerfile                               # Multi-stage Node 22 Alpine build
├── docker-compose.yml                       # Mount target project at /inspect:ro
├── .dockerignore
└── .env.example
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PROJECT_PATH` | `/inspect` | Path to the project to inspect (server-side, set in nuxt runtimeConfig) |
| `TARGET_PROJECT_PATH` | `.` | Path for Docker volume mount (docker-compose.yml) |

### nuxt.config.ts

- `css`: `['~/assets/css/main.css']`
- `vite.plugins`: `[tailwindcss()]` — Tailwind v4 via Vite plugin (not `@nuxtjs/tailwindcss` module)
- `runtimeConfig.projectPath`: from `PROJECT_PATH` env var

## Design Decisions

- **Single API endpoint** — `.claude` directory is small, one request is simpler than multiple
- **Dagre LR layout** — automatic left-to-right positioning handles variable node counts
- **Permission grouping** — 70+ entries grouped by type (~5-6 nodes) to avoid clutter
- **`<ClientOnly>` wrapping** — VueFlow is not SSR-compatible
- **Read-only Docker mount** (`:ro`) — safety for the inspected project
- **Tailwind v4 via Vite plugin** — `@nuxtjs/tailwindcss` module is not compatible with v4
- **No barrel files in `server/utils/`** — Nuxt auto-imports all exports, barrel re-exports cause duplicate warnings

## Component Naming Convention

Nuxt auto-imports components with directory prefix:
- `components/ui/AppHeader.vue` → `<UiAppHeader>`
- `components/graph/InspectGraph.vue` → `<GraphInspectGraph>`
- `components/graph/nodes/ProjectNode.vue` → used via VueFlow slot `#node-project`

## Node Types (VueFlow)

Custom node types registered via template slots in `InspectGraph.vue`:
- `project` → `ProjectNode.vue`
- `category` → `CategoryNode.vue`
- `skill` → `SkillNode.vue`
- `command` → `CommandNode.vue`
- `permission` → `PermissionNode.vue`
- `mcpTool` → `McpToolNode.vue`

Custom edge type:
- `glow` → `GlowEdge.vue`

Handles use `Position.Left` (target) and `Position.Right` (source) for LR layout.
