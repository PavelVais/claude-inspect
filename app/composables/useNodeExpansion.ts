import { reactive } from 'vue'

const expandedNodes = reactive(new Set<string>())

export function useNodeExpansion() {
  function toggle(nodeId: string): void {
    if (expandedNodes.has(nodeId)) {
      expandedNodes.delete(nodeId)
    } else {
      expandedNodes.add(nodeId)
    }
  }

  function isExpanded(nodeId: string): boolean {
    return expandedNodes.has(nodeId)
  }

  function collapseAll(): void {
    expandedNodes.clear()
  }

  return { expandedNodes, toggle, isExpanded, collapseAll }
}
