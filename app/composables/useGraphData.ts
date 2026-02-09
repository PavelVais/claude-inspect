import { ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import type { ClaudeConfig } from '~/types/claude-config'
import type {
  CategoryType,
  ProjectNodeData,
  CategoryNodeData,
  SkillNodeData,
  CommandNodeData,
  AgentNodeData,
  PermissionNodeData,
  McpToolNodeData,
} from '~/types/graph'
import { useGraphLayout } from './useGraphLayout'

const CATEGORY_COLORS: Record<CategoryType, string> = {
  skills: '#3b82f6',
  commands: '#22c55e',
  agents: '#06b6d4',
  permissions: '#f59e0b',
  mcpTools: '#8b5cf6',
}

const CATEGORY_LABELS: Record<CategoryType, string> = {
  skills: 'Skills',
  commands: 'Commands',
  agents: 'Agents',
  permissions: 'Permissions',
  mcpTools: 'MCP Tools',
}

export function useGraphData() {
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])
  const config = ref<ClaudeConfig | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { layoutGraph } = useGraphLayout()

  async function fetchAndBuild() {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<ClaudeConfig>('/api/claude-config')
      config.value = data
      buildGraph(data)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load config'
    } finally {
      loading.value = false
    }
  }

  function buildGraph(data: ClaudeConfig) {
    const rawNodes: Node[] = []
    const rawEdges: Edge[] = []

    // Project node
    rawNodes.push({
      id: 'project',
      type: 'project',
      position: { x: 0, y: 0 },
      data: {
        name: data.project.name,
        overview: data.project.overview,
      } satisfies ProjectNodeData,
    })

    // Category nodes + items
    const categories: { type: CategoryType; items: unknown[] }[] = [
      { type: 'skills', items: data.skills },
      { type: 'commands', items: data.commands },
      { type: 'agents', items: data.agents },
      { type: 'mcpTools', items: data.mcpTools },
      { type: 'permissions', items: data.permissions },
    ]

    for (const cat of categories) {
      if (cat.items.length === 0) continue

      const catId = `cat-${cat.type}`
      rawNodes.push({
        id: catId,
        type: 'category',
        position: { x: 0, y: 0 },
        data: {
          category: cat.type,
          label: CATEGORY_LABELS[cat.type],
          count: cat.type === 'permissions'
            ? data.permissions.reduce((sum, g) => sum + g.entries.length, 0)
            : cat.items.length,
          color: CATEGORY_COLORS[cat.type],
        } satisfies CategoryNodeData,
      })

      rawEdges.push({
        id: `e-project-${catId}`,
        source: 'project',
        target: catId,
        type: 'glow',
        data: { color: CATEGORY_COLORS[cat.type] },
      })

      // Item nodes per category
      if (cat.type === 'skills') {
        for (const [i, skill] of (data.skills).entries()) {
          const id = `skill-${i}`
          rawNodes.push({
            id,
            type: 'skill',
            position: { x: 0, y: 0 },
            data: { skill } satisfies SkillNodeData,
          })
          rawEdges.push({
            id: `e-${catId}-${id}`,
            source: catId,
            target: id,
            type: 'glow',
            data: { color: CATEGORY_COLORS.skills },
          })
        }
      }

      if (cat.type === 'commands') {
        for (const [i, command] of (data.commands).entries()) {
          const id = `cmd-${i}`
          rawNodes.push({
            id,
            type: 'command',
            position: { x: 0, y: 0 },
            data: { command } satisfies CommandNodeData,
          })
          rawEdges.push({
            id: `e-${catId}-${id}`,
            source: catId,
            target: id,
            type: 'glow',
            data: { color: CATEGORY_COLORS.commands },
          })
        }
      }

      if (cat.type === 'agents') {
        for (const [i, agent] of (data.agents).entries()) {
          const id = `agent-${i}`
          rawNodes.push({
            id,
            type: 'agent',
            position: { x: 0, y: 0 },
            data: { agent } satisfies AgentNodeData,
          })
          rawEdges.push({
            id: `e-${catId}-${id}`,
            source: catId,
            target: id,
            type: 'glow',
            data: { color: CATEGORY_COLORS.agents },
          })
        }
      }

      if (cat.type === 'permissions') {
        for (const [i, group] of (data.permissions).entries()) {
          const id = `perm-${i}`
          rawNodes.push({
            id,
            type: 'permission',
            position: { x: 0, y: 0 },
            data: { group } satisfies PermissionNodeData,
          })
          rawEdges.push({
            id: `e-${catId}-${id}`,
            source: catId,
            target: id,
            type: 'glow',
            data: { color: CATEGORY_COLORS.permissions },
          })
        }
      }

      if (cat.type === 'mcpTools') {
        for (const [i, tool] of (data.mcpTools).entries()) {
          const id = `mcp-${i}`
          rawNodes.push({
            id,
            type: 'mcpTool',
            position: { x: 0, y: 0 },
            data: { tool } satisfies McpToolNodeData,
          })
          rawEdges.push({
            id: `e-${catId}-${id}`,
            source: catId,
            target: id,
            type: 'glow',
            data: { color: CATEGORY_COLORS.mcpTools },
          })
        }
      }
    }

    const layouted = layoutGraph(rawNodes, rawEdges)
    nodes.value = layouted.nodes
    edges.value = layouted.edges
  }

  return { nodes, edges, config, loading, error, fetchAndBuild }
}
