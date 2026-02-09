import { ref } from 'vue'
import type { Node } from '@vue-flow/core'

export function useGraphSearch() {
  const searchQuery = ref<string>('')

  function getSearchableText(node: Node): string {
    const d = node.data
    switch (node.type) {
      case 'project':
        return `${d.name} ${d.overview}`
      case 'category':
        return d.label
      case 'skill':
        return `${d.skill.name} ${d.skill.description}`
      case 'command':
        return `${d.command.name} ${d.command.title} ${d.command.description}`
      case 'agent':
        return `${d.agent.name} ${d.agent.title} ${d.agent.description}`
      case 'permission':
        return `${d.group.category} ${d.group.entries.map((e: { pattern: string }) => e.pattern).join(' ')}`
      case 'mcpTool':
        return `${d.tool.fullName} ${d.tool.service} ${d.tool.tool}`
      case 'hook':
        return `${d.hookGroup.event} ${d.hookGroup.matchers.map((m: { matcher: string }) => m.matcher).join(' ')}`
      case 'todo':
        return `${d.todo.subject} ${d.todo.description} ${d.todo.status}`
      case 'permissionEntry':
        return `${d.entry.type} ${d.entry.pattern}`
      default:
        return ''
    }
  }

  function getFilteredNodeIds(nodes: Node[]): Set<string> | null {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return null

    const matchingIds = new Set<string>()

    // Find matching item nodes
    for (const node of nodes) {
      if (node.type === 'project' || node.type === 'category') continue
      const text = getSearchableText(node).toLowerCase()
      if (text.includes(query)) {
        matchingIds.add(node.id)
      }
    }

    // Auto-include parent when expanded child matches, and children when parent matches
    for (const node of nodes) {
      if (node.type === 'permissionEntry') {
        const parentId = node.data.parentId as string
        if (matchingIds.has(node.id)) {
          matchingIds.add(parentId)
        } else if (matchingIds.has(parentId)) {
          matchingIds.add(node.id)
        }
      }
    }

    // Auto-include category nodes that have matching children
    for (const node of nodes) {
      if (node.type !== 'category') continue
      const catType = node.data.category as string
      const hasMatchingChild = nodes.some(
        (n) => matchingIds.has(n.id) && n.id.startsWith(catType === 'mcpTools' ? 'mcp-' : catType === 'hooks' ? 'hook-' : catType === 'todos' ? 'todo-' : catType === 'permissions' ? 'perm-' : catType === 'commands' ? 'cmd-' : catType === 'agents' ? 'agent-' : catType === 'skills' ? 'skill-' : ''),
      )
      if (hasMatchingChild) {
        matchingIds.add(node.id)
      }
    }

    // Auto-include project node if any match
    if (matchingIds.size > 0) {
      matchingIds.add('project')
    }

    return matchingIds
  }

  return { searchQuery, getFilteredNodeIds }
}
