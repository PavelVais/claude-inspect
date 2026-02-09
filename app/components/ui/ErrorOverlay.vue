<script setup lang="ts">
defineProps<{
  message: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0e1a]/80 backdrop-blur-sm">
    <div class="flex max-w-sm flex-col items-center gap-3 rounded-xl border border-red-500/30 bg-slate-900 p-6 text-center">
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <p class="text-sm text-slate-300">{{ message }}</p>
      <button
        class="rounded-md bg-slate-800 px-4 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
        @click="emit('retry')"
      >
        Retry
      </button>
    </div>
  </div>
</template>
