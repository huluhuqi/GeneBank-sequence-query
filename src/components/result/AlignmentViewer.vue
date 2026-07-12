<script setup lang="ts">
import { computed } from 'vue'
import { useResultStore } from '../../stores/result'
import { useSequenceStore } from '../../stores/sequence'
import { getMismatchPositions } from '../../utils/alignmentHighlight'
import { reverseComplement } from '../../engine/sequence/reverseComplement'
import { calculateCoverage } from '../../engine/alignment/statistics'
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

// 生成匹配线
const matchLine = computed(() => {
  if (!alignmentData.value) return ''
  const refSeq = alignmentData.value.refSeq
  const querySeq = alignmentData.value.querySeq
  let line = ''
  for (let i = 0; i < refSeq.length; i++) {
    if (refSeq[i] === '-' || querySeq[i] === '-') {
      line += ' '
    } else if (refSeq[i] === querySeq[i]) {
      line += '|'
    } else {
      line += ' '
    }
  }
  return line
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

function getBaseClass(index: number): string {
  if (!alignmentData.value) return ''
  const refBase = alignmentData.value.refSeq[index]
  const queryBase = alignmentData.value.querySeq[index]
  if (refBase === queryBase) {
    return 'match-base'
  }
  if (refBase === '-' || queryBase === '-') {
    return 'gap-base'
  }
  return 'mismatch-base'
}

function getMatchClass(base: string): string {
  if (base === '|') {
    return 'match-symbol'
  }
  if (base === ' ') {
    return 'gap-symbol'
  }
  return 'mismatch-symbol'
}

// Query 覆盖率
const queryCoverage = computed(() => {
  if (!item.value) return 0
  const qryLen = item.value.querySequence?.length ?? 0
  return calculateCoverage(qryLen, item.value.match, item.value.mismatch)
})

</script>

<template>
  <div v-if="item" class="alignment-viewer">
    <h3 class="viewer-title">{{ t.result.viewerTitle }}</h3>

    <!-- 基本信息 -->
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">{{ t.result.referenceLabel }}</span>
        <span class="info-value sequence-name">{{ alignmentData?.refName || item.referenceName }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">{{ t.result.queryLabel }}</span>
        <span class="info-value sequence-name">{{ alignmentData?.queryName || item.queryName }}</span>
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
        <span class="info-label">{{ t.result.gapLabel }}</span>
        <span class="info-value font-mono" :class="item.gap > 0 ? 'gap-text' : ''">
          {{ item.gap }}
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
      <div class="info-item">
        <span class="info-label">{{ t.result.queryCoverageLabel }}</span>
        <span class="info-value font-mono">{{ queryCoverage }}%</span>
      </div>
    </div>

    <!-- 对齐序列可视化 -->
    <div v-if="alignmentData" class="alignment-section">
      <div class="alignment-box">
        <!-- Ref -->
        <div class="alignment-row">
          <div class="alignment-label">Ref</div>
          <div class="alignment-sequence">
            <span
              v-for="(base, index) in alignmentData.refSeq"
              :key="'ref-' + index"
              :class="getBaseClass(index)"
            >{{ base }}</span>
          </div>
        </div>

        <!-- Match -->
        <div class="alignment-row">
          <div class="alignment-label"></div>
          <div class="alignment-sequence match-line">
            <span
              v-for="(base, index) in matchLine"
              :key="'match-' + index"
              :class="getMatchClass(base)"
            >{{ base }}</span>
          </div>
        </div>

        <!-- Query -->
        <div class="alignment-row">
          <div class="alignment-label">Query</div>
          <div class="alignment-sequence">
            <span
              v-for="(base, index) in alignmentData.querySeq"
              :key="'qry-' + index"
              :class="getBaseClass(index)"
            >{{ base }}</span>
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
  overflow: hidden;
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
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}

.info-label {
  color: var(--textSecondary);
}

.info-value {
  font-weight: 500;
  color: var(--text);
  min-width: 0;
  word-break: break-word;
}

.sequence-name {
  max-width: 260px;
  white-space: normal;
  word-break: break-all;
  overflow-wrap: anywhere;
  line-height: 1.5;
}

.mismatch-text {
  color: var(--danger);
  font-weight: 600;
}

.gap-text {
  color: var(--warning);
  font-weight: 600;
}

.alignment-section {
  margin-top: 8px;
}

.alignment-box {
  width: 100%;
  overflow-x: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  font-family: 'Courier New', monospace;
}

.alignment-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.alignment-row:last-child {
  margin-bottom: 0;
}

.alignment-label {
  width: 60px;
  flex: none;
  font-weight: 700;
  color: var(--textSecondary);
}

.alignment-sequence {
  display: flex;
  white-space: nowrap;
}

.alignment-sequence span {
  width: 22px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  flex: none;
  font-size: 14px;
}

.match-base {
  color: var(--success);
}

.mismatch-base {
  color: var(--danger);
}

.gap-base {
  color: var(--textSecondary);
}

.match-symbol {
  color: var(--success);
  font-weight: bold;
}

.gap-symbol {
  color: var(--textSecondary);
}

.mismatch-symbol {
  color: var(--danger);
}

.sequence-container {
  max-width: 100%;
  overflow-x: auto;
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

  .alignment-box {
    padding: 12px;
  }
}
</style>
