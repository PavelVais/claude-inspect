import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@vue-flow/core'

type NodeType = 'project' | 'category' | 'skill' | 'command' | 'agent' | 'permission' | 'mcpTool' | 'hook' | 'todo' | 'permissionEntry'

const CATEGORY_GAP: number = 50
const CHILD_GAP: number = 12
const SHIFTED_OFFSET: number = 380

export function useGraphLayout() {
  function layoutGraph(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Separate hierarchy edges from cross-reference edges
    const hierarchyEdges = edges.filter(e => e.type !== 'crossRef')
    const crossRefEdges = edges.filter(e => e.type === 'crossRef')

    // 1. Use dagre only to determine X positions (ranks) for LR layout
    const g = new dagre.graphlib.Graph()
    g.setDefaultEdgeLabel(() => ({}))
    g.setGraph({ rankdir: 'LR', nodesep: 20, ranksep: 360, marginx: 40, marginy: 40 })

    for (const node of nodes) {
      g.setNode(node.id, { width: getNodeWidth(node.type), height: getNodeHeight(node.type) })
    }
    for (const edge of hierarchyEdges) {
      g.setEdge(edge.source, edge.target)
    }
    dagre.layout(g)

    // Build a map of node id -> dagre position (center-based)
    const dagrePos = new Map<string, { x: number; y: number }>()
    for (const node of nodes) {
      const pos = g.node(node.id)
      dagrePos.set(node.id, { x: pos.x, y: pos.y })
    }

    // 2. Build parent->children map from hierarchy edges only
    const childrenOf = new Map<string, string[]>()
    for (const edge of hierarchyEdges) {
      if (!childrenOf.has(edge.source)) childrenOf.set(edge.source, [])
      childrenOf.get(edge.source)!.push(edge.target)
    }

    // 2b. Identify nodes that should be shifted right (cross-ref targets)
    // Exclude mutual references (A→B and B→A) — neither gets shifted
    const crossRefTargets = new Set<string>()
    const crossRefSources = new Set<string>()
    for (const edge of crossRefEdges) {
      crossRefTargets.add(edge.target)
      crossRefSources.add(edge.source)
    }
    const mutualNodes = new Set<string>()
    for (const edge of crossRefEdges) {
      // If target is also a source pointing back to source, it's mutual
      if (crossRefEdges.some(e => e.source === edge.target && e.target === edge.source)) {
        mutualNodes.add(edge.source)
        mutualNodes.add(edge.target)
      }
    }
    const shiftedNodeIds = new Set<string>()
    for (const id of crossRefTargets) {
      if (!mutualNodes.has(id)) {
        shiftedNodeIds.add(id)
      }
    }

    // 3. Identify category nodes (children of project) in insertion order
    const projectNode = nodes.find((n) => n.type === 'project')
    const categoryIds = projectNode ? (childrenOf.get(projectNode.id) ?? []) : []
    const categoryNodes = categoryIds
      .map((id) => nodes.find((n) => n.id === id))
      .filter((n): n is Node => !!n)

    // 4. For each category, compute the block height (category + its children stacked)
    type Block = {
      category: Node
      normalChildren: Node[]
      shiftedChildren: Node[]
      blockHeight: number
    }
    const blocks: Block[] = []

    for (const cat of categoryNodes) {
      const childIds = childrenOf.get(cat.id) ?? []
      // Preserve insertion order of children, split into normal and shifted
      const allChildren = childIds
        .map((id) => nodes.find((n) => n.id === id))
        .filter((n): n is Node => !!n)

      const normalChildren = allChildren.filter(n => !shiftedNodeIds.has(n.id))
      const shiftedChildren = allChildren.filter(n => shiftedNodeIds.has(n.id))

      const catH = getNodeHeight(cat.type)

      let normalHeight = 0
      for (const child of normalChildren) {
        normalHeight += getNodeHeight(child.type)
      }
      if (normalChildren.length > 1) {
        normalHeight += (normalChildren.length - 1) * CHILD_GAP
      }

      let shiftedHeight = 0
      for (const child of shiftedChildren) {
        shiftedHeight += getNodeHeight(child.type)
      }
      if (shiftedChildren.length > 1) {
        shiftedHeight += (shiftedChildren.length - 1) * CHILD_GAP
      }

      // Block height = max of (category height, normal column, shifted column)
      const blockHeight = Math.max(catH, normalHeight, shiftedHeight)
      blocks.push({ category: cat, normalChildren, shiftedChildren, blockHeight })
    }

    // 5. Stack blocks vertically
    const totalHeight = blocks.reduce((sum, b) => sum + b.blockHeight, 0)
      + Math.max(0, blocks.length - 1) * CATEGORY_GAP
    let currentY = -totalHeight / 2

    // X positions from dagre
    const catX = categoryNodes.length > 0
      ? (dagrePos.get(categoryNodes[0]!.id)?.x ?? 0)
      : 0

    // Determine child X from dagre (use first normal child's X as the column position)
    let childX = catX + 200
    for (const block of blocks) {
      const firstChild = block.normalChildren[0] || block.shiftedChildren[0]
      if (firstChild) {
        childX = dagrePos.get(firstChild.id)?.x ?? childX
        break
      }
    }
    const shiftedX = childX + SHIFTED_OFFSET

    const positionMap = new Map<string, { x: number; y: number }>()

    for (const block of blocks) {
      const catH = getNodeHeight(block.category.type)
      const catW = getNodeWidth(block.category.type)

      // Category node: vertically centered within its block
      const catCenterY = currentY + block.blockHeight / 2
      positionMap.set(block.category.id, {
        x: catX - catW / 2,
        y: catCenterY - catH / 2,
      })

      // Stack normal children within the block
      let normalHeight = 0
      for (const child of block.normalChildren) {
        normalHeight += getNodeHeight(child.type)
      }
      if (block.normalChildren.length > 1) {
        normalHeight += (block.normalChildren.length - 1) * CHILD_GAP
      }

      let normalY = catCenterY - normalHeight / 2
      for (const child of block.normalChildren) {
        const cH = getNodeHeight(child.type)
        const cW = getNodeWidth(child.type)
        positionMap.set(child.id, {
          x: childX - cW / 2,
          y: normalY,
        })
        normalY += cH + CHILD_GAP
      }

      // Stack shifted children in the next column
      let shiftedHeight = 0
      for (const child of block.shiftedChildren) {
        shiftedHeight += getNodeHeight(child.type)
      }
      if (block.shiftedChildren.length > 1) {
        shiftedHeight += (block.shiftedChildren.length - 1) * CHILD_GAP
      }

      let shiftedY = catCenterY - shiftedHeight / 2
      for (const child of block.shiftedChildren) {
        const cH = getNodeHeight(child.type)
        const cW = getNodeWidth(child.type)
        positionMap.set(child.id, {
          x: shiftedX - cW / 2,
          y: shiftedY,
        })
        shiftedY += cH + CHILD_GAP
      }

      currentY += block.blockHeight + CATEGORY_GAP
    }

    // 6. Project node: centered vertically, use dagre X
    if (projectNode) {
      const pW = getNodeWidth(projectNode.type)
      const pH = getNodeHeight(projectNode.type)
      const pX = dagrePos.get(projectNode.id)?.x ?? 0
      positionMap.set(projectNode.id, {
        x: pX - pW / 2,
        y: -pH / 2,
      })
    }

    // 7. Any remaining nodes (cross-ref targets etc.) — use dagre positions
    for (const node of nodes) {
      if (!positionMap.has(node.id)) {
        const pos = dagrePos.get(node.id)
        const w = getNodeWidth(node.type)
        const h = getNodeHeight(node.type)
        if (pos) {
          positionMap.set(node.id, { x: pos.x - w / 2, y: pos.y - h / 2 })
        }
      }
    }

    const layoutedNodes = nodes.map((node) => ({
      ...node,
      position: positionMap.get(node.id) ?? { x: 0, y: 0 },
    }))

    return { nodes: layoutedNodes, edges }
  }

  return { layoutGraph }
}

function getNodeWidth(type: NodeType | string | undefined): number {
  switch (type) {
    case 'project':
      return 320
    case 'category':
      return 240
    case 'permissionEntry':
      return 240
    default:
      return 240
  }
}

function getNodeHeight(type: NodeType | string | undefined): number {
  switch (type) {
    case 'project':
      return 140
    case 'category':
      return 60
    case 'permission':
      return 110
    case 'hook':
      return 70
    case 'todo':
      return 100
    case 'agent':
      return 120
    case 'mcpTool':
      return 60
    case 'permissionEntry':
      return 40
    default:
      return 80
  }
}
