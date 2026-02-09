<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { PermissionNodeData } from '~/types/graph'

defineProps<{ data: PermissionNodeData }>()
</script>

<template>
  <div
    class="relative w-[220px] rounded-lg border border-amber-500/30 bg-slate-900/80 px-3 py-2.5 shadow-sm transition-all hover:border-amber-500/50 hover:shadow-amber-500/10"
  >
    <div class="mb-1 flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <IconsIconPermission class="h-3.5 w-3.5 shrink-0 text-amber-400" />
        <span class="text-sm font-medium text-amber-300">{{ data.group.category }}</span>
      </div>
      <span class="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
        {{ data.group.entries.length }} rules
      </span>
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
    <Handle type="target" :position="Position.Left" class="!bg-amber-500" />
  </div>
</template>
