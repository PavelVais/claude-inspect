<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import type { Node } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import ProjectNode from './nodes/ProjectNode.vue'
import CategoryNode from './nodes/CategoryNode.vue'
import SkillNode from './nodes/SkillNode.vue'
import CommandNode from './nodes/CommandNode.vue'
import PermissionNode from './nodes/PermissionNode.vue'
import AgentNode from './nodes/AgentNode.vue'
import McpToolNode from './nodes/McpToolNode.vue'
import GlowEdge from './edges/GlowEdge.vue'

const props = defineProps<{
  nodes: Node[]
  edges: any[]
}>()

const emit = defineEmits<{
  nodeClick: [node: Node]
}>()

function handleNodeClick(nodeProps: any) {
  // Find the full node from our props by ID
  const node = props.nodes.find((n) => n.id === nodeProps.id)
  if (node) {
    emit('nodeClick', node)
  }
}

function minimapNodeColor(node: Node): string {
  switch (node.type) {
    case 'project': return '#3b82f6'
    case 'category': return node.data?.color || '#64748b'
    case 'skill': return '#3b82f6'
    case 'command': return '#22c55e'
    case 'agent': return '#06b6d4'
    case 'permission': return '#f59e0b'
    case 'mcpTool': return '#8b5cf6'
    default: return '#64748b'
  }
}
</script>

<template>
  <div class="h-full w-full">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :default-viewport="{ x: 50, y: 50, zoom: 0.85 }"
      :min-zoom="0.2"
      :max-zoom="2"
      fit-view-on-init
      :fit-view-options="{ padding: 0.15 }"
    >
      <template #node-project="nodeProps">
        <div @dblclick.stop="handleNodeClick(nodeProps)">
          <ProjectNode :data="nodeProps.data" />
        </div>
      </template>
      <template #node-category="nodeProps">
        <div @dblclick.stop="handleNodeClick(nodeProps)">
          <CategoryNode :data="nodeProps.data" />
        </div>
      </template>
      <template #node-skill="nodeProps">
        <div @dblclick.stop="handleNodeClick(nodeProps)">
          <SkillNode :data="nodeProps.data" />
        </div>
      </template>
      <template #node-command="nodeProps">
        <div @dblclick.stop="handleNodeClick(nodeProps)">
          <CommandNode :data="nodeProps.data" />
        </div>
      </template>
      <template #node-agent="nodeProps">
        <div @dblclick.stop="handleNodeClick(nodeProps)">
          <AgentNode :data="nodeProps.data" />
        </div>
      </template>
      <template #node-permission="nodeProps">
        <div @dblclick.stop="handleNodeClick(nodeProps)">
          <PermissionNode :data="nodeProps.data" />
        </div>
      </template>
      <template #node-mcpTool="nodeProps">
        <div @dblclick.stop="handleNodeClick(nodeProps)">
          <McpToolNode :data="nodeProps.data" />
        </div>
      </template>

      <template #edge-glow="edgeProps">
        <GlowEdge v-bind="edgeProps" />
      </template>

      <Background :gap="20" :size="1" pattern-color="#1e293b40" />
      <Controls position="bottom-left" />
      <MiniMap
        position="bottom-right"
        :node-color="minimapNodeColor"
        :node-border-radius="4"
        :mask-color="'#0a0e1a90'"
      />
    </VueFlow>
  </div>
</template>
