<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Node } from '@vue-flow/core'
import { useGraphData } from '~/composables/useGraphData'

const { nodes, edges, config, loading, error, fetchAndBuild } = useGraphData()
const selectedNode = ref<Node | null>(null)

function onNodeClick(node: Node) {
  selectedNode.value = node
}

function closePanel() {
  selectedNode.value = null
}

onMounted(() => {
  fetchAndBuild()
})
</script>

<template>
  <div class="flex h-screen flex-col">
    <UiAppHeader
      :project-name="config?.project.name || 'Claude Inspect'"
      @refresh="fetchAndBuild"
    />

    <div class="relative flex-1">
      <UiLoadingOverlay v-if="loading" />
      <UiErrorOverlay v-else-if="error" :message="error" @retry="fetchAndBuild" />

      <ClientOnly>
        <GraphInspectGraph
          :nodes="nodes"
          :edges="edges"
          @node-click="onNodeClick"
        />
      </ClientOnly>

      <UiNodeDetailPanel
        :node="selectedNode"
        @close="closePanel"
      />
    </div>
  </div>
</template>
