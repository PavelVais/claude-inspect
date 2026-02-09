<script setup lang="ts">
import { ref } from 'vue'
import type { CategoryType } from '~/types/graph'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '~/composables/useGraphData'

defineProps<{
  projectName: string
  searchQuery: string
  visibleSections: Record<CategoryType, boolean>
  availableSections: CategoryType[]
  showCrossRefs: boolean
  hasCrossRefs: boolean
}>()

const emit = defineEmits<{
  refresh: []
  'update:searchQuery': [value: string]
  toggleSection: [category: CategoryType]
  toggleCrossRefs: []
}>()

const searchInput = ref<HTMLInputElement | null>(null)

function focusSearch(): void {
  searchInput.value?.focus()
}

function clearSearch(): void {
  emit('update:searchQuery', '')
}

function onSearchKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    clearSearch()
    searchInput.value?.blur()
  }
}

defineExpose({ focusSearch })
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

    <!-- Section toggles -->
    <div class="flex items-center gap-1.5">
      <button
        v-for="section in availableSections"
        :key="section"
        v-tooltip="(visibleSections[section] ? 'hide ' : 'show ') + CATEGORY_LABELS[section]"
        class="flex h-7 w-7 items-center justify-center rounded-lg border transition-all"
        :class="visibleSections[section]
          ? 'border-transparent'
          : 'border-slate-700/50 hover:border-slate-600'"
        :style="visibleSections[section]
          ? {
              background: `linear-gradient(135deg, ${CATEGORY_COLORS[section]}25, ${CATEGORY_COLORS[section]}10)`,
              boxShadow: `0 0 8px ${CATEGORY_COLORS[section]}15`,
              color: CATEGORY_COLORS[section],
            }
          : { background: 'rgba(30, 41, 59, 0.5)', color: '#475569' }"
        @click="emit('toggleSection', section)"
      >
        <IconsIconSkill v-if="section === 'skills'" class="h-3.5 w-3.5" />
        <IconsIconCommand v-else-if="section === 'commands'" class="h-3.5 w-3.5" />
        <IconsIconAgent v-else-if="section === 'agents'" class="h-3.5 w-3.5" />
        <IconsIconHook v-else-if="section === 'hooks'" class="h-3.5 w-3.5" />
        <IconsIconTodo v-else-if="section === 'todos'" class="h-3.5 w-3.5" />
        <IconsIconMcpTool v-else-if="section === 'mcpTools'" class="h-3.5 w-3.5" />
        <IconsIconPermission v-else-if="section === 'permissions'" class="h-3.5 w-3.5" />
      </button>

      <!-- Cross-references toggle -->
      <template v-if="hasCrossRefs">
        <div class="mx-1 h-4 w-px bg-slate-700"></div>
        <button
          v-tooltip="(showCrossRefs ? 'hide' : 'show') + ' Cross References'"
          class="flex h-7 w-7 items-center justify-center rounded-lg border transition-all"
          :class="showCrossRefs
            ? 'border-transparent'
            : 'border-slate-700/50 hover:border-slate-600'"
          :style="showCrossRefs
            ? {
                background: 'linear-gradient(135deg, #f59e0b25, #f59e0b10)',
                boxShadow: '0 0 8px #f59e0b15',
                color: '#f59e0b',
              }
            : { background: 'rgba(30, 41, 59, 0.5)', color: '#475569' }"
          @click="emit('toggleCrossRefs')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="5" cy="18" r="2" stroke-dasharray="2 2" />
            <circle cx="19" cy="6" r="2" stroke-dasharray="2 2" />
            <path d="M7 17C10 17 14 6 17 6" stroke-dasharray="3 3" />
          </svg>
        </button>
      </template>
    </div>

    <div class="flex items-center gap-2">
      <!-- Search -->
      <div class="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input
          ref="searchInput"
          type="text"
          :value="searchQuery"
          placeholder="Search nodes..."
          class="h-8 w-52 rounded-md border border-slate-700 bg-slate-800 pl-8 pr-8 text-xs text-slate-300 placeholder-slate-500 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          @keydown="onSearchKeydown"
        />
        <button
          v-if="searchQuery"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-slate-300"
          @click="clearSearch"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <kbd
          v-if="!searchQuery"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-[9px] text-slate-500"
        >
          ⌘K
        </kbd>
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
    </div>
  </header>
</template>
