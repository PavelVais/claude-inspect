<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { PermissionNodeData } from '~/types/graph'
import { useNodeExpansion } from '~/composables/useNodeExpansion'

const props = defineProps<{ data: PermissionNodeData; nodeId: string }>()

const { toggle, isExpanded } = useNodeExpansion()

const expanded = computed<boolean>(() => isExpanded(props.nodeId))
const canExpand = computed(() => props.data.group.entries.length > 0)

function onToggle() {
  toggle(props.nodeId)
}
</script>

<template>
  <div
    class="relative w-[220px] rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/80 px-3 py-2.5 transition-all hover:border-amber-500/50"
    style="box-shadow: 0 0 8px rgba(245, 158, 11, 0.08), 0 4px 12px rgba(0, 0, 0, 0.3)"
  >
    <div class="mb-1 flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <IconsIconPermission class="h-3.5 w-3.5 shrink-0 text-amber-400" />
        <span class="text-sm font-medium text-amber-300">{{ data.group.category }}</span>
      </div>
      <div class="flex items-center gap-1">
        <span
          v-if="data.group.entries.filter(e => e.type === 'allow').length"
          class="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium text-green-400"
        >
          ✓ {{ data.group.entries.filter(e => e.type === 'allow').length }}
        </span>
        <span
          v-if="data.group.entries.filter(e => e.type === 'deny').length"
          class="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-400"
        >
          ✗ {{ data.group.entries.filter(e => e.type === 'deny').length }}
        </span>
        <button
          v-if="canExpand"
          class="ml-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-700 hover:text-amber-400"
          :title="expanded ? 'Collapse' : 'Expand permissions'"
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
    </div>
    <div class="flex flex-wrap gap-1 pl-5">
      <span
        v-for="(entry, i) in data.group.entries.slice(0, 3)"
        :key="i"
        class="inline-block max-w-full truncate rounded px-1.5 py-0.5 text-[10px]"
        :class="entry.type === 'allow' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'"
      >
        {{ entry.type === 'allow' ? '+' : '-' }} {{ entry.pattern.substring(0, 30) }}
      </span>
      <span
        v-if="data.group.entries.length > 3"
        class="text-[10px] text-slate-500"
      >
        +{{ data.group.entries.length - 3 }} more
      </span>
    </div>
    <Handle id="target" type="target" :position="Position.Left" class="!bg-amber-500" />
    <Handle id="source" type="source" :position="Position.Right" class="!bg-amber-500" :style="{ opacity: expanded ? 1 : 0 }" />
  </div>
</template>
