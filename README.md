# 🔍 Claude Inspect

**Interactive graph visualizer for Claude Code project configuration.**

Point it at any project with a `.claude/` directory and get a beautiful, dark-themed node graph showing Skills,
Commands, Agents, MCP Tools, and Permissions.

![reference](reference.jpg)

---

## ✨ Features

- 🌐 **Interactive graph** — drag, zoom, pan with VueFlow
- 🎨 **Color-coded categories** — each type has its own accent color
- 🔎 **Detail modal** — double-click any node to see full details
- 📐 **Auto-layout** — dagre positions everything left-to-right
- 🗺️ **MiniMap + Controls** — navigate large configs easily
- 🐳 **Docker ready** — inspect any project via read-only mount

## 📦 What It Parses

| Source                | What you see                                        |
|-----------------------|-----------------------------------------------------|
| `CLAUDE.md`           | 📋 Project name & overview                          |
| `skills/*/SKILL.md`   | ⚡ Skills (name + description from YAML frontmatter) |
| `commands/*.md`       | 💻 Commands (name, title, description)              |
| `agents/*.md`         | 🤖 Agents (title + description)                     |
| `settings.local.json` | 🛡️ Permissions (grouped by type)                   |
| `settings.local.json` | 🔌 MCP Tools (`mcp__service__tool` entries)         |

## 🗺️ Graph Layout

```
                    ⚡ Skills      → skill items...
                    💻 Commands    → command items...
📋 Project    →     🤖 Agents     → agent items...
                    🔌 MCP Tools   → mcp tool items...
                    🛡️ Permissions → permission groups...
```

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run dev server (inspecting current directory)
PROJECT_PATH=. npm run dev
```

Open **http://localhost:3000** 🎉

### Inspect Another Project

```bash
PROJECT_PATH=/path/to/your/project npm run dev
```

### 🐳 Docker

```bash
# Inspect any project via Docker
TARGET_PROJECT_PATH=/path/to/project docker compose up

# Rebuild and run
TARGET_PROJECT_PATH=/path/to/project docker compose up --build
```

The target project is mounted **read-only** (`:ro`) for safety.

## 🛠️ Tech Stack

|    | Technology          | Purpose                  |
|----|---------------------|--------------------------|
| 💚 | **Nuxt 4** + Vue 3  | Framework                |
| 🌊 | **VueFlow**         | Interactive node graph   |
| 📐 | **Dagre**           | Automatic LR tree layout |
| 🎨 | **Tailwind CSS v4** | Styling (dark theme)     |
| 📄 | **gray-matter**     | YAML frontmatter parsing |
| 🎭 | **Playwright**      | E2E testing              |
| 🐳 | **Docker**          | Containerization         |

## 📁 Project Structure

```
app/
├── pages/index.vue                    # 🏠 Main page
├── components/
│   ├── graph/
│   │   ├── InspectGraph.vue           # 🌐 VueFlow canvas
│   │   ├── nodes/
│   │   │   ├── ProjectNode.vue        # 📋 Project card
│   │   │   ├── CategoryNode.vue       # 🏷️ Category card
│   │   │   ├── SkillNode.vue          # ⚡ Skill card
│   │   │   ├── CommandNode.vue        # 💻 Command card
│   │   │   ├── AgentNode.vue          # 🤖 Agent card
│   │   │   ├── PermissionNode.vue     # 🛡️ Permission group card
│   │   │   └── McpToolNode.vue        # 🔌 MCP tool card
│   │   └── edges/
│   │       └── GlowEdge.vue           # ✨ Colored glowing edge
│   └── ui/
│       ├── AppHeader.vue              # 📌 Top bar
│       ├── LoadingOverlay.vue         # ⏳ Loading spinner
│       ├── ErrorOverlay.vue           # ❌ Error state
│       └── NodeDetailPanel.vue        # 🔍 Detail modal
├── composables/
│   ├── useGraphData.ts                # 📊 API fetch + graph transform
│   └── useGraphLayout.ts             # 📐 Dagre layout engine
└── types/
    ├── claude-config.ts               # 📝 API response types
    └── graph.ts                       # 📝 Node data types

server/
├── api/
│   └── claude-config.get.ts           # 🔗 GET /api/claude-config
└── utils/
    ├── config.ts                      # ⚙️ Project path helpers
    └── parsers/
        ├── parseClaudeMd.ts           # 📋 CLAUDE.md parser
        ├── parseSettings.ts           # 🛡️ Permissions parser
        ├── parseCommands.ts           # 💻 Commands parser
        ├── parseSkills.ts             # ⚡ Skills parser
        ├── parseAgents.ts             # 🤖 Agents parser
        └── parseMcpTools.ts           # 🔌 MCP tools parser
```

## 🎨 Color Scheme

| Category        | Color     | Hex       |
|-----------------|-----------|-----------|
| ⚡ Skills        | 🔵 Blue   | `#3b82f6` |
| 💻 Commands     | 🟢 Green  | `#22c55e` |
| 🤖 Agents       | 🔵 Cyan   | `#06b6d4` |
| 🔌 MCP Tools    | 🟣 Violet | `#8b5cf6` |
| 🛡️ Permissions | 🟡 Amber  | `#f59e0b` |

## ⚙️ Environment Variables

| Variable              | Default    | Description                                  |
|-----------------------|------------|----------------------------------------------|
| `PROJECT_PATH`        | `/project` | Path to the project to inspect (server-side) |
| `TARGET_PROJECT_PATH` | `.`        | Path for Docker volume mount                 |

## 📜 Scripts

```bash
npm run dev        # 🔧 Start dev server
npm run build      # 📦 Production build
npm run preview    # 👀 Preview production build
npm run generate   # 📄 Static site generation
```

## 📄 License

MIT
