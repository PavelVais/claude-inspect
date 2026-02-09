<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { McpToolNodeData } from '~/types/graph'

defineProps<{ data: McpToolNodeData }>()
</script>

<template>
  <div
    class="relative w-[220px] rounded-xl border border-violet-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/80 px-3 py-2.5 transition-all hover:border-violet-500/50"
    style="box-shadow: 0 0 8px rgba(139, 92, 246, 0.08), 0 4px 12px rgba(0, 0, 0, 0.3)"
  >
    <div class="mb-0.5 flex items-center gap-1.5">
      <IconsIconMcpTool class="h-3.5 w-3.5 shrink-0 text-violet-400" />
      <span class="text-[10px] font-medium uppercase tracking-wider text-violet-400/70">{{ data.tool.service }}</span>
    </div>
    <div class="truncate pl-5 text-sm font-medium text-violet-300">{{ data.tool.tool }}</div>
    <Handle type="target" :position="Position.Left" class="!bg-violet-500" />
  </div>
</template>
