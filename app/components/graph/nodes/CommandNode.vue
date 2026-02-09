<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { CommandNodeData } from '~/types/graph'

defineProps<{ data: CommandNodeData }>()
</script>

<template>
  <div
    class="relative w-[220px] rounded-lg border border-green-500/30 bg-slate-900/80 px-3 py-2.5 shadow-sm transition-all hover:border-green-500/50 hover:shadow-green-500/10"
  >
    <div class="mb-0.5 flex items-center gap-1.5">
      <IconsIconCommand class="h-3.5 w-3.5 shrink-0 text-green-400" />
      <span class="rounded bg-green-500/15 px-1.5 py-0.5 font-mono text-[10px] text-green-400">/{{ data.command.name }}</span>
    </div>
    <div class="pl-5 text-sm font-medium text-green-300">{{ data.command.title }}</div>
    <p v-if="data.command.description" class="line-clamp-1 pl-5 text-xs text-slate-400">
      {{ data.command.description }}
    </p>
    <Handle type="target" :position="Position.Left" class="!bg-green-500" />
  </div>
</template>
