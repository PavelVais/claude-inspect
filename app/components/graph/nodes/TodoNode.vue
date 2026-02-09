<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { TodoNodeData } from '~/types/graph'

defineProps<{ data: TodoNodeData }>()

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-slate-500/15', text: 'text-slate-400' },
  in_progress: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  completed: { bg: 'bg-green-500/15', text: 'text-green-400' },
}

function statusLabel(status: string): string {
  if (status === 'in_progress') return 'in progress'
  return status
}
</script>

<template>
  <div
    class="relative w-[220px] rounded-xl border border-orange-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/80 px-3 py-2.5 transition-all hover:border-orange-500/50"
    style="box-shadow: 0 0 8px rgba(249, 115, 22, 0.08), 0 4px 12px rgba(0, 0, 0, 0.3)"
  >
    <div class="mb-0.5 flex items-center gap-1.5">
      <IconsIconTodo class="h-3.5 w-3.5 shrink-0 text-orange-400" />
      <span class="truncate text-sm font-medium text-orange-300">{{ data.todo.subject }}</span>
    </div>
    <div class="mb-1 pl-5">
      <span
        class="rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase"
        :class="[statusColors[data.todo.status]?.bg, statusColors[data.todo.status]?.text]"
      >
        {{ statusLabel(data.todo.status) }}
      </span>
    </div>
    <p v-if="data.todo.description" class="line-clamp-2 pl-5 text-xs text-slate-400">
      {{ data.todo.description }}
    </p>
    <Handle type="target" :position="Position.Left" class="!bg-orange-500" />
  </div>
</template>
