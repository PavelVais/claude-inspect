<script setup lang="ts">
defineProps<{
  projectName: string
}>()

const emit = defineEmits<{
  refresh: []
}>()
</script>

<template>
  <header class="flex h-12 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 backdrop-blur-sm">
    <div class="flex items-center gap-3">
      <div class="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      </div>
      <h1 class="text-sm font-semibold text-white">{{ projectName || 'Claude Inspect' }}</h1>
      <span class="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">CONFIG VIEWER</span>
    </div>

    <button
      class="flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
      @click="emit('refresh')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
      </svg>
      Refresh
    </button>
  </header>
</template>
