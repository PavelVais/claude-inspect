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
import HookNode from './nodes/HookNode.vue'
import TodoNode from './nodes/TodoNode.vue'
import PermissionEntryNode from './nodes/PermissionEntryNode.vue'
import GlowEdge from './edges/GlowEdge.vue'
import CrossRefEdge from './edges/CrossRefEdge.vue'

const props = defineProps<{
  nodes: Node[]
  edges: any[]
}>()

const showWidgets = ref<boolean>(true)

// Compute which nodes have source edges (for conditional handle visibility)
const connectedSourceNodes = computed<Set<string>>(() => {
  const set = new Set<string>()
  for (const edge of props.edges) {
    if (edge.sourceHandle === 'source') {
      set.add(edge.source)
    }
  }
  return set
})

provide('connectedSourceNodes', connectedSourceNodes)

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
    case 'hook': return '#f43f5e'
    case 'todo': return '#f97316'
    case 'permissionEntry': return '#f59e0b'
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
      :nodes-connectable="false"
      fit-view-on-init
      :fit-view-options="{ padding: 0.15 }"
    >
      <template #node-project="nodeProps">
        <div @click.stop="handleNodeClick(nodeProps)">
          <ProjectNode :data="nodeProps.data" />
        </div>
      </template>
      <template #node-category="nodeProps">
        <div @click.stop="handleNodeClick(nodeProps)">
          <CategoryNode :data="nodeProps.data" />
        </div>
      </template>
      <template #node-skill="nodeProps">
        <div @click.stop="handleNodeClick(nodeProps)">
          <SkillNode :data="nodeProps.data" :node-id="nodeProps.id" />
        </div>
      </template>
      <template #node-command="nodeProps">
        <div @click.stop="handleNodeClick(nodeProps)">
          <CommandNode :data="nodeProps.data" :node-id="nodeProps.id" />
        </div>
      </template>
      <template #node-agent="nodeProps">
        <div @click.stop="handleNodeClick(nodeProps)">
          <AgentNode :data="nodeProps.data" :node-id="nodeProps.id" />
        </div>
      </template>
      <template #node-permission="nodeProps">
        <div @click.stop="handleNodeClick(nodeProps)">
          <PermissionNode :data="nodeProps.data" :node-id="nodeProps.id" />
        </div>
      </template>
      <template #node-mcpTool="nodeProps">
        <div @click.stop="handleNodeClick(nodeProps)">
          <McpToolNode :data="nodeProps.data" />
        </div>
      </template>
      <template #node-hook="nodeProps">
        <div @click.stop="handleNodeClick(nodeProps)">
          <HookNode :data="nodeProps.data" />
        </div>
      </template>
      <template #node-todo="nodeProps">
        <div @click.stop="handleNodeClick(nodeProps)">
          <TodoNode :data="nodeProps.data" />
        </div>
      </template>
      <template #node-permissionEntry="nodeProps">
        <div @click.stop="handleNodeClick(nodeProps)">
          <PermissionEntryNode :data="nodeProps.data" />
        </div>
      </template>

      <template #edge-glow="edgeProps">
        <GlowEdge v-bind="{ ...edgeProps, style: edgeProps.style as Record<string, string> }" />
      </template>
      <template #edge-crossRef="edgeProps">
        <CrossRefEdge v-bind="{ ...edgeProps, style: edgeProps.style as Record<string, string> }" />
      </template>

      <Background :gap="20" :size="1" pattern-color="#1e293b40" />

      <Controls v-show="showWidgets" position="bottom-left" />
      <MiniMap
        v-show="showWidgets"
        position="bottom-right"
        :node-color="minimapNodeColor"
        :node-border-radius="4"
        :mask-color="'#0a0e1aDD'"
      />

      <button
        class="vue-flow__widget-toggle"
        :title="showWidgets ? 'Hide controls & minimap' : 'Show controls & minimap'"
        @click="showWidgets = !showWidgets"
      >
        <svg v-if="showWidgets" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
      </button>
    </VueFlow>
  </div>
</template>
