<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { McpToolNodeData } from '~/types/graph'

defineProps<{ data: McpToolNodeData }>()
</script>

<template>
  <div
    class="relative w-[220px] rounded-lg border border-violet-500/30 bg-slate-900/80 px-3 py-2.5 shadow-sm transition-all hover:border-violet-500/50 hover:shadow-violet-500/10"
  >
    <div class="mb-0.5 flex items-center gap-1.5">
      <IconsIconMcpTool class="h-3.5 w-3.5 shrink-0 text-violet-400" />
      <span class="text-[10px] font-medium uppercase tracking-wider text-violet-400/70">{{ data.tool.service }}</span>
    </div>
    <div class="truncate pl-5 text-sm font-medium text-violet-300">{{ data.tool.tool }}</div>
    <Handle type="target" :position="Position.Left" class="!bg-violet-500" />
  </div>
</template>
