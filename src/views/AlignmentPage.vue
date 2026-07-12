<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SequenceInput from '../components/input/SequenceInput.vue'
import SequenceTransform from '../components/preprocess/SequenceTransform.vue'
import AnalysisSetting from '../components/analysis/AnalysisSetting.vue'
import PerformancePanel from '../components/analysis/PerformancePanel.vue'
import ResultTable from '../components/result/ResultTable.vue'
import AlignmentViewer from '../components/result/AlignmentViewer.vue'
import ResultDetail from '../components/result/ResultDetail.vue'
import ModuleTransition from '../components/common/animation/ModuleTransition.vue'
import { useResultStore } from '../stores/result'
import ResponsiveGrid from '../components/layout/ResponsiveGrid.vue'
import { APP_CONFIG } from '../config/app'

const resultStore = useResultStore()
const hasSelection = computed(() => resultStore.selectedResult !== null)

// 错峰挂载：让 Transition 真正触发进入动画
const pageReady = ref(false)
const showInput = ref(false)
const showProcess = ref(false)
const showAnalysis = ref(false)
const showPerformance = ref(false)
const showResult = ref(false)

onMounted(() => {
  setTimeout(() => { pageReady.value = true }, 100)
  setTimeout(() => { showInput.value = true }, 150)
  setTimeout(() => { showProcess.value = true }, 300)
  setTimeout(() => { showAnalysis.value = true }, 450)
  setTimeout(() => { showPerformance.value = true }, 550)
  setTimeout(() => { showResult.value = true }, 600)
})
</script>

<template>
  <div v-if="pageReady" class="alignment-page">
    <ModuleTransition>
      <SequenceInput v-if="showInput" />
    </ModuleTransition>

    <ModuleTransition>
      <SequenceTransform v-if="showProcess" />
    </ModuleTransition>

    <ModuleTransition>
      <AnalysisSetting v-if="showAnalysis" />
    </ModuleTransition>

    <ModuleTransition>
      <PerformancePanel v-if="showPerformance && APP_CONFIG.DEV_MODE" />
    </ModuleTransition>

    <ModuleTransition>
      <ResultTable v-if="showResult" />
    </ModuleTransition>

    <ModuleTransition v-if="hasSelection">
      <div class="detail-section">
        <ResponsiveGrid>
          <AlignmentViewer />
          <ResultDetail />
        </ResponsiveGrid>
      </div>
    </ModuleTransition>
  </div>
</template>

<style scoped>
.alignment-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0;
}

.detail-section {
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .alignment-page {
    gap: 16px;
    padding: 4px 0;
  }
}
</style>
