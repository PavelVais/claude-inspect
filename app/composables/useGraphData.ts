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
  HookNodeData,
  TodoNodeData,
  PermissionEntryNodeData,
} from '~/types/graph'
import { useGraphLayout } from './useGraphLayout'
import { useNodeExpansion } from './useNodeExpansion'

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  skills: '#3b82f6',
  commands: '#22c55e',
  agents: '#06b6d4',
  permissions: '#f59e0b',
  mcpTools: '#8b5cf6',
  hooks: '#f43f5e',
  todos: '#f97316',
}

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  skills: 'Skills',
  commands: 'Commands',
  agents: 'Agents',
  permissions: 'Permissions',
  mcpTools: 'MCP Tools',
  hooks: 'Hooks',
  todos: 'Todos',
}

export function useGraphData() {
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])
  const config = ref<ClaudeConfig | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let activeVisibleSections: Record<CategoryType, boolean> | null = null
  let activeCrossRefs = false

  const { layoutGraph } = useGraphLayout()

  async function fetchAndBuild(visibleSections?: Record<CategoryType, boolean>, showCrossRefs?: boolean) {
    loading.value = true
    error.value = null
    if (visibleSections) activeVisibleSections = visibleSections
    if (showCrossRefs !== undefined) activeCrossRefs = showCrossRefs

    try {
      const baseURL = useRuntimeConfig().app.baseURL || '/'
      const data = await $fetch<ClaudeConfig>(`${baseURL}api/claude-config`)
      config.value = data
      buildGraph(data, activeVisibleSections ?? undefined, activeCrossRefs)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load config'
    } finally {
      loading.value = false
    }
  }

  function rebuildGraph(visibleSections: Record<CategoryType, boolean>, showCrossRefs?: boolean): void {
    activeVisibleSections = visibleSections
    if (showCrossRefs !== undefined) activeCrossRefs = showCrossRefs
    if (config.value) {
      buildGraph(config.value, visibleSections, activeCrossRefs)
    }
  }

  function buildGraph(data: ClaudeConfig, visibleSections?: Record<CategoryType, boolean>, showCrossRefs = false) {
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
      { type: 'hooks', items: data.hooks },
      { type: 'todos', items: data.todos },
      { type: 'mcpTools', items: data.mcpTools },
      { type: 'permissions', items: data.permissions },
    ]

    for (const cat of categories) {
      if (cat.items.length === 0) continue
      if (visibleSections && !visibleSections[cat.type]) continue

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
            : cat.type === 'hooks'
              ? data.hooks.reduce((sum, g) => sum + g.totalHandlers, 0)
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
            targetHandle: 'target',
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
            targetHandle: 'target',
            type: 'glow',
            data: { color: CATEGORY_COLORS.commands },
          })
        }
      }

      if (cat.type === 'agents') {
        for (const [i, agent] of (data.agents).entries()) {
          const id = `agent-${i}`
          const crossRefCount = data.crossReferences.filter(
            r => r.fromType === 'agent' && r.fromIndex === i,
          ).length + (agent.mcpServers?.length ?? 0)
          rawNodes.push({
            id,
            type: 'agent',
            position: { x: 0, y: 0 },
            data: { agent, crossRefCount } satisfies AgentNodeData,
          })
          rawEdges.push({
            id: `e-${catId}-${id}`,
            source: catId,
            target: id,
            targetHandle: 'target',
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

      if (cat.type === 'hooks') {
        for (const [i, hookGroup] of (data.hooks).entries()) {
          const id = `hook-${i}`
          rawNodes.push({
            id,
            type: 'hook',
            position: { x: 0, y: 0 },
            data: { hookGroup } satisfies HookNodeData,
          })
          rawEdges.push({
            id: `e-${catId}-${id}`,
            source: catId,
            target: id,
            type: 'glow',
            data: { color: CATEGORY_COLORS.hooks },
          })
        }
      }

      if (cat.type === 'todos') {
        for (const [i, todo] of (data.todos).entries()) {
          const id = `todo-${i}`
          rawNodes.push({
            id,
            type: 'todo',
            position: { x: 0, y: 0 },
            data: { todo } satisfies TodoNodeData,
          })
          rawEdges.push({
            id: `e-${catId}-${id}`,
            source: catId,
            target: id,
            type: 'glow',
            data: { color: CATEGORY_COLORS.todos },
          })
        }
      }
    }

    // Inject expanded child nodes (permission entries, agent cross-refs)
    injectExpandedNodes(rawNodes, rawEdges, data, visibleSections, showCrossRefs)

    // Cross-reference edges (dashed, between item nodes)
    if (!showCrossRefs) {
      const layouted = layoutGraph(rawNodes, rawEdges)
      nodes.value = layouted.nodes
      edges.value = layouted.edges
      return
    }

    const nodeIdMap: Record<string, string> = {
      skill: 'skill',
      command: 'cmd',
      agent: 'agent',
    }

    const crossRefColors: Record<string, string> = {
      skill: CATEGORY_COLORS.skills,
      command: CATEGORY_COLORS.commands,
      agent: CATEGORY_COLORS.agents,
    }

    for (const ref of data.crossReferences) {
      const sourcePrefix = nodeIdMap[ref.fromType]
      const targetPrefix = nodeIdMap[ref.toType]
      if (!sourcePrefix || !targetPrefix) continue

      const sourceId = `${sourcePrefix}-${ref.fromIndex}`
      const targetId = `${targetPrefix}-${ref.toIndex}`

      // Only add if both nodes exist
      if (!rawNodes.some((n) => n.id === sourceId) || !rawNodes.some((n) => n.id === targetId)) continue

      rawEdges.push({
        id: `xref-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        sourceHandle: 'source',
        targetHandle: 'target',
        type: 'crossRef',
        data: { color: crossRefColors[ref.fromType] || '#f59e0b' },
      })
    }

    const layouted = layoutGraph(rawNodes, rawEdges)
    nodes.value = layouted.nodes
    edges.value = layouted.edges
  }

  function injectExpandedNodes(
    rawNodes: Node[],
    rawEdges: Edge[],
    data: ClaudeConfig,
    visibleSections?: Record<CategoryType, boolean>,
    showCrossRefs = false,
  ): void {
    const { isExpanded } = useNodeExpansion()

    // Permission group expansion
    for (const [i, group] of data.permissions.entries()) {
      const parentId = `perm-${i}`
      if (!isExpanded(parentId)) continue
      if (!rawNodes.some(n => n.id === parentId)) continue

      for (const [j, entry] of group.entries.entries()) {
        const childId = `${parentId}-entry-${j}`
        rawNodes.push({
          id: childId,
          type: 'permissionEntry',
          position: { x: 0, y: 0 },
          data: { entry, parentId } satisfies PermissionEntryNodeData,
        })
        rawEdges.push({
          id: `e-${parentId}-${childId}`,
          source: parentId,
          sourceHandle: 'source',
          target: childId,
          targetHandle: 'target',
          type: 'glow',
          data: { color: entry.type === 'allow' ? '#22c55e' : '#ef4444' },
        })
      }
    }

    // Agent expansion — show all cross-references (agents, skills, commands) + mcp servers
    const nodeIdMap: Record<string, string> = {
      skill: 'skill',
      command: 'cmd',
      agent: 'agent',
    }
    const crossRefColors: Record<string, string> = {
      skill: CATEGORY_COLORS.skills,
      command: CATEGORY_COLORS.commands,
      agent: CATEGORY_COLORS.agents,
    }
    const addedEdges = new Set<string>()

    for (const [i, agent] of data.agents.entries()) {
      const parentId = `agent-${i}`
      if (!showCrossRefs && !isExpanded(parentId)) continue
      if (!rawNodes.some(n => n.id === parentId)) continue

      // Cross-reference edges from data.crossReferences (agent→agent, agent→skill, agent→command)
      for (const ref of data.crossReferences) {
        if (ref.fromType !== 'agent' || ref.fromIndex !== i) continue
        const targetPrefix = nodeIdMap[ref.toType]
        if (!targetPrefix) continue
        const targetId = `${targetPrefix}-${ref.toIndex}`
        if (!rawNodes.some(n => n.id === targetId)) continue

        const edgeId = `expand-${parentId}-${targetId}`
        if (addedEdges.has(edgeId)) continue
        addedEdges.add(edgeId)

        rawEdges.push({
          id: edgeId,
          source: parentId,
          sourceHandle: 'source',
          target: targetId,
          targetHandle: 'target',
          type: 'crossRef',
          data: { color: crossRefColors[ref.toType] || CATEGORY_COLORS.agents },
        })
      }

      // MCP server edges (from frontmatter, not in crossReferences)
      if (agent.mcpServers?.length) {
        const mcpVisible = !visibleSections || visibleSections.mcpTools
        if (mcpVisible) {
          for (const serverName of agent.mcpServers) {
            for (const [mi, tool] of data.mcpTools.entries()) {
              if (tool.service === serverName) {
                const targetId = `mcp-${mi}`
                const edgeId = `expand-${parentId}-${targetId}`
                if (addedEdges.has(edgeId)) continue
                if (!rawNodes.some(n => n.id === targetId)) continue
                addedEdges.add(edgeId)

                rawEdges.push({
                  id: edgeId,
                  source: parentId,
                  sourceHandle: 'source',
                  target: targetId,
                  targetHandle: 'target',
                  type: 'crossRef',
                  data: { color: CATEGORY_COLORS.mcpTools },
                })
              }
            }
          }
        }
      }
    }
  }

  return { nodes, edges, config, loading, error, fetchAndBuild, rebuildGraph }
}
