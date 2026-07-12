<script setup lang="ts">
import { computed } from 'vue'
import { useResultStore } from '../../stores/result'
import { useSequenceStore } from '../../stores/sequence'
import { compareAlignment, getMismatchPositions } from '../../utils/alignmentHighlight'
import { reverseComplement } from '../../engine/sequence/reverseComplement'
import { useI18n } from '../../i18n'

const resultStore = useResultStore()
const seqStore = useSequenceStore()
const { t } = useI18n()

const item = computed(() => resultStore.selectedResult)

// 对齐数据：优先使用 alignedReference/alignedQuery，回退到从原始序列截取
const alignmentData = computed(() => {
  if (!item.value) return null

  const result = item.value

  // 优先使用已对齐序列
  if (result.alignedReference && result.alignedQuery) {
    return {
      refSeq: result.alignedReference,
      querySeq: result.alignedQuery,
      refName: result.referenceId || result.referenceName,
      queryName: result.queryId || result.queryName,
    }
  }

  // 回退：从原始序列截取
  const refItem = seqStore.reference.find(
    (s) => s.id === result.referenceId || s.name === result.referenceName,
  )
  const queryItem = seqStore.query.find(
    (s) => s.id === result.queryId || s.name === result.queryName,
  )

  if (!refItem || !queryItem) return null

  // 空坐标保护
  if (!result.referenceStart || !result.referenceEnd) {
    return {
      refSeq: '',
      querySeq: '',
      refName: refItem.id || refItem.name,
      queryName: queryItem.id || queryItem.name,
    }
  }

  const refStart = result.referenceStart - 1
  const refEnd = result.referenceEnd
  const refSeq = refItem.sequence.substring(refStart, refEnd)
  let querySeq = queryItem.sequence

  // 统一使用 reverseComplement 函数（支持完整 IUPAC）
  if (result.orientation === 'Reverse Complement' || result.method === 'Reverse Complement') {
    querySeq = reverseComplement(querySeq)
  }

  return {
    refSeq,
    querySeq,
    refName: refItem.id || refItem.name,
    queryName: queryItem.id || queryItem.name,
  }
})

// 碱基级对比
const basePairs = computed(() => {
  if (!alignmentData.value) return []
  return compareAlignment(alignmentData.value.refSeq, alignmentData.value.querySeq)
})

// 错配位置列表
const mismatchPositions = computed(() => {
  if (!alignmentData.value) return []
  return getMismatchPositions(alignmentData.value.refSeq, alignmentData.value.querySeq)
})

function identityColor(val: number): string {
  if (val >= 80) return 'var(--success)'
  if (val >= 50) return 'var(--warning)'
  return 'var(--danger)'
}
</script>

<template>
  <div v-if="item" class="alignment-viewer">
    <h3 class="viewer-title">{{ t.result.viewerTitle }}</h3>

    <!-- 基本信息 -->
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">{{ t.result.referenceLabel }}</span>
        <span class="info-value">{{ alignmentData?.refName || item.referenceName }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">{{ t.result.queryLabel }}</span>
        <span class="info-value">{{ alignmentData?.queryName || item.queryName }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">{{ t.result.methodLabel }}</span>
        <span class="info-value">{{ item.method }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">{{ t.result.identityLabel }}</span>
        <span class="info-value font-mono font-bold" :style="{ color: identityColor(item.identity) }">
          {{ item.identity }}%
        </span>
      </div>
      <div class="info-item">
        <span class="info-label">{{ t.result.matchLabel }}</span>
        <span class="info-value font-mono">{{ item.match }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">{{ t.result.mismatchLabel }}</span>
        <span class="info-value font-mono" :class="item.mismatch > 0 ? 'mismatch-text' : ''">
          {{ item.mismatch }}
        </span>
      </div>
      <div class="info-item">
        <span class="info-label">{{ t.result.refRangeLabel }}</span>
        <span class="info-value font-mono">{{ item.referenceStart }} - {{ item.referenceEnd }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">{{ t.result.scoreLabel }}</span>
        <span class="info-value font-mono">{{ item.score }}</span>
      </div>
    </div>

    <!-- 对齐序列可视化 -->
    <div v-if="alignmentData" class="alignment-section">
      <div class="alignment-track">
        <!-- Reference -->
        <div class="track-row">
          <span class="track-label">Ref</span>
          <div class="track-sequence">
            <span
              v-for="(bp, i) in basePairs"
              :key="i"
              class="base"
              :class="{ 'base-match': bp.match, 'base-mismatch': !bp.match && !bp.isGap, 'base-gap': bp.isGap }"
            >{{ bp.refBase }}</span>
          </div>
        </div>

        <!-- 匹配线 -->
        <div class="track-row">
          <span class="track-label"></span>
          <div class="track-sequence">
            <span
              v-for="(bp, i) in basePairs"
              :key="i"
              class="match-mark"
              :class="{ 'mark-match': bp.match, 'mark-mismatch': !bp.match && !bp.isGap, 'mark-gap': bp.isGap }"
            >{{ bp.match ? '|' : (bp.isGap ? '-' : ' ') }}</span>
          </div>
        </div>

        <!-- Query -->
        <div class="track-row">
          <span class="track-label">Query</span>
          <div class="track-sequence">
            <span
              v-for="(bp, i) in basePairs"
              :key="i"
              class="base"
              :class="{ 'base-match': bp.match, 'base-mismatch': !bp.match && !bp.isGap, 'base-gap': bp.isGap }"
            >{{ bp.queryBase }}</span>
          </div>
        </div>
      </div>

      <!-- 错配位置列表 -->
      <div v-if="mismatchPositions.length > 0" class="mismatch-positions">
        <span class="mismatch-label">{{ t.result.mismatchAt }}:</span>
        <div class="position-tags">
          <span
            v-for="pos in mismatchPositions.slice(0, 30)"
            :key="pos"
            class="position-tag"
          >{{ pos }}</span>
          <span v-if="mismatchPositions.length > 30" class="position-more">
            +{{ mismatchPositions.length - 30 }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="no-alignment">
      {{ t.result.alignmentUnavailable }}
    </div>
  </div>
</template>

<style scoped>
.alignment-viewer {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  background: var(--card);
}

.viewer-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}

.info-label {
  color: var(--textSecondary);
}

.info-value {
  font-weight: 500;
  color: var(--text);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mismatch-text {
  color: var(--danger);
  font-weight: 600;
}

.alignment-section {
  margin-top: 8px;
}

.alignment-track {
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow-x: auto;
}

.track-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.track-label {
  flex-shrink: 0;
  width: 40px;
  font-size: 12px;
  font-weight: 600;
  color: var(--textSecondary);
  text-align: right;
}

.track-sequence {
  display: flex;
  flex-wrap: wrap;
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
}

.base {
  display: inline-block;
  width: 16px;
  text-align: center;
  border-radius: 2px;
  transition: background 0.15s ease;
}

.base-match {
  color: var(--text);
}

.base-mismatch {
  color: var(--danger);
  background: var(--danger-soft);
  font-weight: 700;
}

.base-gap {
  color: var(--textSecondary);
  background: var(--surface);
}

.match-mark {
  display: inline-block;
  width: 16px;
  text-align: center;
  font-size: 13px;
}

.mark-match {
  color: var(--success);
}

.mark-mismatch {
  color: var(--danger);
  opacity: 0.5;
}

.mark-gap {
  color: var(--textSecondary);
}

.mismatch-positions {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.mismatch-label {
  font-size: 13px;
  color: var(--textSecondary);
  flex-shrink: 0;
  margin-top: 2px;
}

.position-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.position-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 2px 6px;
  background: var(--danger-soft);
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  font-weight: 600;
}

.position-more {
  padding: 2px 6px;
  color: var(--textSecondary);
  font-size: 11px;
}

.no-alignment {
  margin-top: 8px;
  padding: 16px;
  text-align: center;
  color: var(--textSecondary);
  font-size: 13px;
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .alignment-track {
    padding: 12px;
  }
}
</style>
