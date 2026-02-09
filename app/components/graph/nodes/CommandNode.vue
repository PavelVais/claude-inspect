<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { ComputedRef } from 'vue'
import type { CommandNodeData } from '~/types/graph'

const props = defineProps<{ data: CommandNodeData; nodeId: string }>()

const connectedSourceNodes = inject<ComputedRef<Set<string>>>('connectedSourceNodes')
const hasSourceEdge = computed<boolean>(() => connectedSourceNodes?.value.has(props.nodeId) ?? false)
</script>

<template>
  <div
    class="relative w-[220px] rounded-xl border border-green-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/80 px-3 py-2.5 transition-all hover:border-green-500/50"
    style="box-shadow: 0 0 8px rgba(34, 197, 94, 0.08), 0 4px 12px rgba(0, 0, 0, 0.3)"
  >
    <div class="mb-0.5 flex items-center gap-1.5">
      <IconsIconCommand class="h-3.5 w-3.5 shrink-0 text-green-400" />
      <span class="rounded-md bg-green-500/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-green-300 ring-1 ring-green-500/20">/{{ data.command.name }}</span>
    </div>
    <div class="pl-5 text-sm font-medium text-green-300">{{ data.command.title }}</div>
    <p v-if="data.command.description" class="line-clamp-1 pl-5 text-xs text-slate-400">
      {{ data.command.description }}
    </p>
    <Handle id="target" type="target" :position="Position.Left" class="!bg-green-500" />
    <Handle id="source" type="source" :position="Position.Right" class="!bg-green-500" :style="{ opacity: hasSourceEdge ? 1 : 0 }" />
  </div>
</template>
