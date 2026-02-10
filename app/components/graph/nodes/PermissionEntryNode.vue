<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { PermissionEntryNodeData } from '~/types/graph'

defineProps<{ data: PermissionEntryNodeData }>()
</script>

<template>
  <div
    class="relative flex w-[200px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-all"
    :class="data.entry.type === 'allow'
      ? 'border-green-500/30 hover:border-green-500/50'
      : 'border-red-500/30 hover:border-red-500/50'"
    :style="{
      background: data.entry.type === 'allow'
        ? 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(20,30,48,0.8))'
        : 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,20,20,0.8))',
      boxShadow: data.entry.type === 'allow'
        ? '0 0 6px rgba(34,197,94,0.08), 0 2px 8px rgba(0,0,0,0.3)'
        : '0 0 6px rgba(239,68,68,0.08), 0 2px 8px rgba(0,0,0,0.3)',
    }"
  >
    <span
      class="shrink-0 text-xs font-bold"
      :class="data.entry.type === 'allow' ? 'text-green-400' : 'text-red-400'"
    >
      {{ data.entry.type === 'allow' ? '+' : '-' }}
    </span>
    <span class="truncate font-mono text-[10px] text-slate-300">
      {{ data.entry.pattern }}
    </span>
    <Handle id="target" type="target" :position="Position.Left" :class="data.entry.type === 'allow' ? '!bg-green-500' : '!bg-red-500'" />
  </div>
</template>
