<script setup lang="ts">
import { ref, computed } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import type { SequenceItem } from '../../types/sequence'
import SequenceItemCard from './SequenceItemCard.vue'
import SequenceEmpty from './SequenceEmpty.vue'
import { useI18n } from '../../i18n'

const { t } = useI18n()

const props = defineProps<{
  items: SequenceItem[]
  type?: 'reference' | 'query'
  search?: string
  selectedIds?: string[]
  showSelect?: boolean
}>()

const emit = defineEmits<{
  remove: [id: string]
  reorder: [newList: SequenceItem[]]
  'toggle-select': [id: string]
}>()

const VIRTUAL_THRESHOLD = 100

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const filteredItems = computed(() => {
  if (!props.search?.trim()) return props.items
  const key = props.search.trim().toUpperCase()
  return props.items.filter(
    (item) =>
      item.id.toUpperCase().includes(key) ||
      item.sequence.toUpperCase().includes(key),
  )
})

const isVirtual = computed(() => props.items.length > VIRTUAL_THRESHOLD)

const selectedSet = computed(() => new Set(props.selectedIds || []))

function isSelected(id: string) {
  return selectedSet.value.has(id)
}

function onDragStart(index: number) {
  dragIndex.value = index
}

function onDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  dragOverIndex.value = index
}

function onDrop(e: DragEvent, index: number) {
  e.preventDefault()
  if (dragIndex.value === null || dragIndex.value === index) {
    dragIndex.value = null
    dragOverIndex.value = null
    return
  }
  // 拖拽基于原始 items 顺序，不在过滤状态下
  const newList = [...props.items]
  const [moved] = newList.splice(dragIndex.value, 1)
  newList.splice(index, 0, moved)
  emit('reorder', newList)
  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragLeave() {
  dragOverIndex.value = null
}
</script>

<template>
  <div class="sequence-list">
    <!-- 空状态 -->
    <SequenceEmpty v-if="items.length === 0" :type="type" />

    <!-- 过滤后无结果 -->
    <div v-else-if="filteredItems.length === 0" class="no-result">
      {{ t.input.noSearchResult }}
    </div>

    <!-- 虚拟列表（大数据） -->
    <DynamicScroller
      v-else-if="isVirtual"
      :items="filteredItems"
      :min-item-size="130"
      key-field="id"
      class="virtual-list"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.id, item.sequence, isSelected(item.id)]"
          :data-index="index"
        >
          <div class="card-wrapper">
            <SequenceItemCard
              :item="item"
              :index="index"
              :selected="isSelected(item.id)"
              :show-select="showSelect"
              @remove="emit('remove', $event)"
              @toggle-select="emit('toggle-select', $event)"
            />
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>

    <!-- 普通列表（含动画） -->
    <TransitionGroup v-else name="list" tag="div" class="list-container">
      <div
        v-for="(item, index) in filteredItems"
        :key="item.id"
        class="list-item-wrapper"
        :class="{
          'drag-over': dragOverIndex === index,
          'dragging': dragIndex === index,
        }"
        @dragstart="onDragStart(index)"
        @dragover="onDragOver($event, index)"
        @drop="onDrop($event, index)"
        @dragleave="onDragLeave"
      >
        <SequenceItemCard
          :item="item"
          :index="index"
          :selected="isSelected(item.id)"
          :show-select="showSelect"
          @remove="emit('remove', $event)"
          @toggle-select="emit('toggle-select', $event)"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.sequence-list {
  width: 100%;
  max-height: 560px;
  overflow-y: auto;
  overflow-x: hidden;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

.card-wrapper {
  padding: 4px 0;
}

.virtual-list {
  overflow-y: auto;
  max-height: 520px;
}

.list-item-wrapper {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.list-item-wrapper.drag-over {
  transform: scale(1.01);
}

.list-item-wrapper.dragging {
  opacity: 0.5;
}

.no-result {
  padding: 24px;
  text-align: center;
  color: var(--textSecondary);
  font-size: 13px;
}

/* 新增/删除动画 */
.list-enter-active {
  transition:
    opacity 0.3s var(--ease-smooth),
    transform 0.3s var(--ease-smooth);
}

.list-leave-active {
  transition:
    opacity 0.25s var(--ease-default),
    transform 0.25s var(--ease-default);
  position: absolute;
  width: calc(100% - 0px);
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.list-move {
  transition: transform 0.35s var(--ease-smooth);
}
</style>
