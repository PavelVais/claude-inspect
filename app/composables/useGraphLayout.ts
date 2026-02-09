import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@vue-flow/core'

export function useGraphLayout() {
  function layoutGraph(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const g = new dagre.graphlib.Graph()
    g.setDefaultEdgeLabel(() => ({}))

    g.setGraph({
      rankdir: 'LR',
      nodesep: 30,
      ranksep: 80,
      marginx: 40,
      marginy: 40,
    })

    for (const node of nodes) {
      const width = getNodeWidth(node.type)
      const height = getNodeHeight(node.type)
      g.setNode(node.id, { width, height })
    }

    for (const edge of edges) {
      g.setEdge(edge.source, edge.target)
    }

    dagre.layout(g)

    const layoutedNodes = nodes.map((node) => {
      const pos = g.node(node.id)
      const width = getNodeWidth(node.type)
      const height = getNodeHeight(node.type)

      return {
        ...node,
        position: {
          x: pos.x - width / 2,
          y: pos.y - height / 2,
        },
      }
    })

    // Force vertical order: dagre may reorder nodes at the same rank.
    // Group nodes by their x position (rank), then within each rank
    // sort by the original insertion order (index in the nodes array).
    const orderMap = new Map<string, number>()
    nodes.forEach((n, i) => orderMap.set(n.id, i))

    const rankGroups = new Map<number, typeof layoutedNodes>()
    for (const node of layoutedNodes) {
      // Round x to group nodes at the same rank
      const rankX = Math.round(node.position.x / 10) * 10
      if (!rankGroups.has(rankX)) rankGroups.set(rankX, [])
      rankGroups.get(rankX)!.push(node)
    }

    for (const group of rankGroups.values()) {
      if (group.length <= 1) continue

      // Capture current y positions sorted by dagre
      const currentYs = group.map((n) => n.position.y).sort((a, b) => a - b)

      // Sort group by original insertion order
      group.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))

      // Reassign y positions preserving spacing but in insertion order
      group.forEach((node, i) => {
        node.position.y = currentYs[i]
      })
    }

    return { nodes: layoutedNodes, edges }
  }

  return { layoutGraph }
}

function getNodeWidth(type?: string): number {
  switch (type) {
    case 'project':
      return 280
    case 'category':
      return 200
    default:
      return 220
  }
}

function getNodeHeight(type?: string): number {
  switch (type) {
    case 'project':
      return 120
    case 'category':
      return 70
    case 'permission':
      return 80
    default:
      return 70
  }
}
