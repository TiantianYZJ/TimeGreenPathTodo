<script setup lang="ts">
import { onMounted } from 'vue'
import { useTagsStore } from '@/stores/tags'

const tagsStore = useTagsStore()

onMounted(() => {
  if (tagsStore.items.length === 0) {
    tagsStore.fetchTags()
  }
})
</script>

<template>
  <div class="tag-filter">
    <div class="panel-header">
      <span class="panel-title">标签</span>
    </div>

    <t-loading v-if="tagsStore.loading" :loading="true" size="small" />

    <div class="tag-list">
      <div
        v-for="tag in tagsStore.items"
        :key="tag.id"
        class="tag-chip"
        :class="{ active: tagsStore.selectedIds.includes(tag.id) }"
        :style="{
          '--tag-color': tag.color,
          '--tag-bg': tag.color + '1a',
        }"
        @click="tagsStore.toggleTag(tag.id)"
      >
        <t-icon v-if="tagsStore.selectedIds.includes(tag.id)" name="check" size="14px" />
        <span class="tag-name">{{ tag.name }}</span>
      </div>
    </div>

    <div v-if="!tagsStore.loading && tagsStore.items.length === 0" class="empty-hint">
      暂无标签
    </div>
  </div>
</template>

<style scoped>
.tag-filter {
  padding: var(--spacing-sm) 0;
}

.panel-header {
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.panel-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  padding: 0 var(--spacing-sm);
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: var(--font-size-xs);
  color: var(--tag-color);
  background: var(--tag-bg);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
  white-space: nowrap;
}

.tag-chip:hover {
  opacity: 0.8;
}

.tag-chip.active {
  background: var(--tag-color);
  color: #ffffff;
  border-color: var(--tag-color);
}

.tag-name {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-hint {
  padding: var(--spacing-md);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
}
</style>
