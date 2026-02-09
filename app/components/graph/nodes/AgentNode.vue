<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { AgentNodeData } from '~/types/graph'

defineProps<{ data: AgentNodeData }>()
</script>

<template>
  <div
    class="relative w-[220px] rounded-lg border border-cyan-500/30 bg-slate-900/80 px-3 py-2.5 shadow-sm transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10"
  >
    <div class="mb-0.5 flex items-center gap-1.5">
      <IconsIconAgent class="h-3.5 w-3.5 shrink-0 text-cyan-400" />
      <span class="text-sm font-medium text-cyan-300">{{ data.agent.title }}</span>
    </div>
    <p v-if="data.agent.description" class="line-clamp-2 pl-5 text-xs text-slate-400">
      {{ data.agent.description }}
    </p>
    <Handle type="target" :position="Position.Left" class="!bg-cyan-500" />
  </div>
</template>
