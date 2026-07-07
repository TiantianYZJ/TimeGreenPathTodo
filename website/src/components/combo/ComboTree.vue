<script setup lang="ts">
import { onMounted } from 'vue'
import { useCombosStore } from '@/stores/combos'

const combosStore = useCombosStore()

onMounted(() => {
  if (combosStore.items.length === 0) {
    combosStore.fetchCombos()
  }
})

function selectCombo(id: number | null) {
  combosStore.selectCombo(id)
}
</script>

<template>
  <div class="combo-tree">
    <div class="panel-header">
      <span class="panel-title">组合</span>
    </div>

    <t-loading v-if="combosStore.loading" :loading="true" size="small" />

    <div class="combo-list">
      <!-- 全部待办 -->
      <div
        class="combo-item"
        :class="{ active: combosStore.selectedId === null }"
        @click="selectCombo(null)"
      >
        <t-icon name="list" size="18px" />
        <span class="combo-name">全部待办</span>
      </div>

      <!-- 组合列表 -->
      <div
        v-for="combo in combosStore.items"
        :key="combo.id"
        class="combo-item"
        :class="{ active: combosStore.selectedId === combo.id }"
        @click="selectCombo(combo.id)"
      >
        <t-icon :name="combo.icon || 'folder'" size="18px" :style="{ color: combo.color }" />
        <span class="combo-name">{{ combo.name }}</span>
      </div>
    </div>

    <div v-if="!combosStore.loading && combosStore.items.length === 0" class="empty-hint">
      暂无组合
    </div>
  </div>
</template>

<style scoped>
.combo-tree {
  padding: var(--spacing-sm) 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.combo-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.combo-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--border-radius);
  cursor: pointer;
  color: var(--text-secondary);
  transition: background 0.15s, color 0.15s;
}

.combo-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.combo-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.combo-name {
  font-size: var(--font-size-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-hint {
  padding: var(--spacing-md);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
}
</style>
