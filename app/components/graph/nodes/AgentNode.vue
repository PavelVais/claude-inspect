<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { ComputedRef } from 'vue'
import type { AgentNodeData } from '~/types/graph'
import { useNodeExpansion } from '~/composables/useNodeExpansion'

const props = defineProps<{ data: AgentNodeData; nodeId: string }>()

const connectedSourceNodes = inject<ComputedRef<Set<string>>>('connectedSourceNodes')
const { toggle, isExpanded } = useNodeExpansion()

const expanded = computed<boolean>(() => isExpanded(props.nodeId))
const hasSourceEdge = computed<boolean>(() => connectedSourceNodes?.value.has(props.nodeId) ?? false)
const showSourceHandle = computed<boolean>(() => expanded.value || hasSourceEdge.value)

const canExpand = computed(() => (props.data.crossRefCount ?? 0) > 0)

const hasBadges = computed(() =>
  props.data.agent.model || props.data.agent.tools?.length || props.data.agent.memory
)

function onToggle() {
  toggle(props.nodeId)
}
</script>

<template>
  <div
    class="relative w-[220px] rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/80 px-3 py-2.5 transition-all hover:border-cyan-500/50"
    style="box-shadow: 0 0 8px rgba(6, 182, 212, 0.08), 0 4px 12px rgba(0, 0, 0, 0.3)"
  >
    <div class="mb-0.5 flex items-center gap-1.5">
      <IconsIconAgent class="h-3.5 w-3.5 shrink-0 text-cyan-400" />
      <span class="text-sm font-medium text-cyan-300">{{ data.agent.title }}</span>
      <button
        v-if="canExpand"
        class="ml-auto flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-700 hover:text-cyan-400"
        :title="expanded ? 'Collapse' : 'Expand references'"
        @click.stop="onToggle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3 transition-transform"
          :class="{ 'rotate-90': expanded }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    <p v-if="data.agent.description" class="line-clamp-2 pl-5 text-xs text-slate-400">
      {{ data.agent.description }}
    </p>
    <div v-if="hasBadges" class="mt-1.5 flex flex-wrap gap-1 pl-5">
      <span v-if="data.agent.model" class="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400">
        {{ data.agent.model }}
      </span>
      <span v-if="data.agent.tools?.length" class="rounded bg-slate-500/20 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
        {{ data.agent.tools.length }} tools
      </span>
      <span v-if="data.agent.memory" class="rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-medium text-purple-400">
        memory
      </span>
    </div>
    <Handle id="target" type="target" :position="Position.Left" class="!bg-cyan-500" />
    <Handle id="source" type="source" :position="Position.Right" class="!bg-cyan-500" :style="{ opacity: showSourceHandle ? 1 : 0 }" />
  </div>
</template>
