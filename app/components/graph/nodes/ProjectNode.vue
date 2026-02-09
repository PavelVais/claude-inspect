<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { ProjectNodeData } from '~/types/graph'

defineProps<{ data: ProjectNodeData }>()
</script>

<template>
  <div
    class="relative w-[280px] rounded-xl border border-blue-500/40 bg-gradient-to-br from-slate-900 to-slate-800 px-5 py-4 shadow-lg shadow-blue-500/10"
  >
    <div class="mb-1 flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
        <IconsIconProject class="h-5 w-5" />
      </div>
      <h3 class="text-base font-semibold text-white">{{ data.name }}</h3>
    </div>
    <p v-if="data.overview" class="line-clamp-2 text-xs leading-relaxed text-slate-400">
      {{ data.overview }}
    </p>
    <Handle type="source" :position="Position.Right" class="!bg-blue-500" />
  </div>
</template>
