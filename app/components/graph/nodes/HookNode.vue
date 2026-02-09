<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { HookNodeData } from '~/types/graph'

defineProps<{ data: HookNodeData }>()
</script>

<template>
  <div
    class="relative w-[220px] rounded-xl border border-rose-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/80 px-3 py-2.5 transition-all hover:border-rose-500/50"
    style="box-shadow: 0 0 8px rgba(244, 63, 94, 0.08), 0 4px 12px rgba(0, 0, 0, 0.3)"
  >
    <div class="mb-1 flex items-center gap-1.5">
      <IconsIconHook class="h-3.5 w-3.5 shrink-0 text-rose-400" />
      <span class="text-sm font-medium text-rose-300">{{ data.hookGroup.event }}</span>
      <span class="ml-auto rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-medium text-rose-400">
        {{ data.hookGroup.totalHandlers }}
      </span>
    </div>
    <div class="flex flex-wrap gap-1 pl-5">
      <span
        v-for="(m, i) in data.hookGroup.matchers.slice(0, 3)"
        :key="i"
        class="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400"
      >
        {{ m.matcher }}
      </span>
      <span
        v-if="data.hookGroup.matchers.length > 3"
        class="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500"
      >
        +{{ data.hookGroup.matchers.length - 3 }}
      </span>
    </div>
    <Handle type="target" :position="Position.Left" class="!bg-rose-500" />
  </div>
</template>
