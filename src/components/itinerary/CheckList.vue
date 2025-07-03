<template>
  <div class="check-list">
    <!-- Header -->
    <header class="check-list__header">
      <div class="check-list__title">
        <span class="check-list__icon">📋</span>
        攜帶清單
      </div>
      <div class="check-list__stats">
        <span class="check-list__stats-item">
          總計: {{ checkItems.length }}
        </span>
        <span class="check-list__stats-item">
          已攜帶: {{ packedCount }}
        </span>
        <span class="check-list__stats-item">
          待攜帶: {{ unpackedCount }}
        </span>
      </div>
    </header>

    <!-- Add Item Form -->
    <form class="check-list__add-form" @submit="handleSubmit">
      <div class="check-list__input-group">
        <input v-model="newItem" type="text" class="check-list__input" placeholder="新增攜帶物品..."
          @keypress="handleKeyPress" />
        <button type="submit" class="check-list__add-button" :disabled="!newItem.trim()">
          <span class="check-list__add-icon">+</span>
          新增
        </button>
      </div>
    </form>

    <!-- Filter Buttons -->
    <div class="check-list__filters">
      <button v-for="filterOption in filterOptions" :key="filterOption.value"
        :class="['check-list__filter-btn', { 'check-list__filter-btn--active': filter === filterOption.value }]"
        @click="setFilter(filterOption.value)">
        {{ filterOption.label }}
      </button>
    </div>

    <!-- Check List -->
    <div class="check-list__items">
      <div v-if="filteredItems.length === 0" class="check-list__empty">
        <p class="check-list__empty-message">
          {{ getEmptyMessage() }}
        </p>
      </div>

      <div v-else class="check-list__items-container">
        <div v-for="item in filteredItems" :key="item.id"
          :class="['check-list__item', { 'check-list__item--packed': item.packed }]">
          <div class="check-list__checkbox" @click="toggleItem(item.id)">
            <input type="checkbox" :checked="item.packed" @change="toggleItem(item.id)" />
            <span class="check-list__checkmark"></span>
          </div>

          <div class="check-list__content">
            <span class="check-list__text">{{ item.text }}</span>
            <span class="check-list__date">
              {{ formatDate(item.createdAt) }}
            </span>
          </div>

          <button class="check-list__delete-button" @click="deleteItem(item.id)" :aria-label="`刪除 ${item.text}`">
            <span class="check-list__delete-icon">×</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="checkItems.length > 0" class="check-list__progress">
      <div class="check-list__progress-label">
        攜帶進度: {{ Math.round(progressPercentage) }}%
      </div>
      <div class="check-list__progress-bar">
        <div class="check-list__progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

// ===================================
// 型別定義
// ===================================

interface CheckItem {
  id: number;
  text: string;
  packed: boolean;
  createdAt: Date;
}

type FilterType = 'all' | 'unpacked' | 'packed';

interface FilterOption {
  value: FilterType;
  label: string;
}

// ===================================
// 響應式狀態
// ===================================

const checkItems = ref<CheckItem[]>([]);
const newItem = ref<string>('');
const filter = ref<FilterType>('all');

// ===================================
// 常數定義
// ===================================

const filterOptions: FilterOption[] = [
  { value: 'all', label: '全部' },
  { value: 'unpacked', label: '待攜帶' },
  { value: 'packed', label: '已攜帶' }
];

// ===================================
// 計算屬性
// ===================================

const filteredItems = computed((): CheckItem[] => {
  switch (filter.value) {
    case 'unpacked':
      return checkItems.value.filter(item => !item.packed);
    case 'packed':
      return checkItems.value.filter(item => item.packed);
    default:
      return checkItems.value;
  }
});

const packedCount = computed((): number => {
  return checkItems.value.filter(item => item.packed).length;
});

const unpackedCount = computed((): number => {
  return checkItems.value.filter(item => !item.packed).length;
});

const progressPercentage = computed((): number => {
  if (checkItems.value.length === 0) return 0;
  return (packedCount.value / checkItems.value.length) * 100;
});

// ===================================
// 方法定義
// ===================================

const addItem = (): void => {
  if (newItem.value.trim()) {
    const item: CheckItem = {
      id: Date.now(),
      text: newItem.value.trim(),
      packed: false,
      createdAt: new Date()
    };
    checkItems.value.push(item);
    newItem.value = '';
  }
};

const toggleItem = (id: number): void => {
  const item = checkItems.value.find(item => item.id === id);
  if (item) {
    item.packed = !item.packed;
  }
};

const deleteItem = (id: number): void => {
  const index = checkItems.value.findIndex(item => item.id === id);
  if (index > -1) {
    checkItems.value.splice(index, 1);
  }
};

const setFilter = (filterType: FilterType): void => {
  filter.value = filterType;
};

const getEmptyMessage = (): string => {
  switch (filter.value) {
    case 'unpacked':
      return '太棒了！所有物品都已攜帶完成 🎉';
    case 'packed':
      return '還沒有攜帶任何物品';
    default:
      return '清單是空的，開始新增攜帶物品吧！';
  }
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// ===================================
// 事件處理
// ===================================

const handleKeyPress = (event: KeyboardEvent): void => {
  if (event.key === 'Enter') {
    addItem();
  }
};

const handleSubmit = (event: Event): void => {
  event.preventDefault();
  addItem();
};

// ===================================
// 本地存儲
// ===================================

const saveItems = (): void => {
  localStorage.setItem('checkItems', JSON.stringify(checkItems.value));
};

const loadItems = (): void => {
  const stored = localStorage.getItem('checkItems');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as CheckItem[];
      checkItems.value = parsed.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }));
    } catch (error) {
      console.error('無法載入攜帶清單:', error);
    }
  }
};

// ===================================
// 生命週期和監聽
// ===================================

onMounted(() => {
  loadItems();
});

watch(checkItems, () => {
  saveItems();
}, { deep: true });
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

// ===================================
// Check List Container
// ===================================
.check-list {
  @include tablet {
    padding: $spacing-xl;
  }
  margin: 0 auto;
  padding: $spacing-lg;
  min-height: 100vh;
  max-width: 600px;
  background: $bg-primary;
}

// ===================================
// Header Section
// ===================================
.check-list__header {
  @include flex-between;
  @include mobile-only {
    flex-direction: column;

    gap: $spacing-md;
  }
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  border: 1px solid $border-light;
  border-radius: $border-radius-lg;
  background: $bg-card;
  box-shadow: 0 2px 8px $shadow-light;
}

.check-list__title {
  @include tablet {
    font-size: 1.75rem;
  }
  display: flex;
  align-items: center;
  margin: 0;
  color: $primary-color;
  font-weight: 600;
  font-size: 1.5rem;

  gap: $spacing-sm;
}

.check-list__icon {
  font-size: 1.25rem;
}

.check-list__stats {
  @include mobile-only {
    justify-content: space-between;
    width: 100%;
  }
  display: flex;

  gap: $spacing-md;
}

.check-list__stats-item {
  padding: $spacing-xs $spacing-sm;
  border: 1px solid $border-primary;
  border-radius: $border-radius-sm;
  background: $bg-sidebar;
  color: $text-secondary;
  font-size: 0.875rem;
}

// ===================================
// Add Item Form
// ===================================
.check-list__add-form {
  margin-bottom: $spacing-xl;
}

.check-list__input-group {
  @include mobile-only {
    flex-direction: column;
  }
  display: flex;
  padding: $spacing-md;
  border: 1px solid $border-light;
  border-radius: $border-radius-lg;
  background: $bg-card;
  box-shadow: 0 2px 8px $shadow-light;

  gap: $spacing-sm;
}

.check-list__input {
  flex: 1;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-primary;
  border-radius: $border-radius-md;
  background: $bg-primary;
  color: $text-primary;
  font-size: 1rem;

  &::placeholder {
    color: $text-muted;
  }

  &:focus {
    outline: none;
    border-color: $accent-color-1;
    box-shadow: 0 0 0 2px rgba($accent-color-1, 0.2);
  }
}

.check-list__add-button {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: $border-radius-md;
  background: $accent-color-1;
  color: $text-white;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  gap: $spacing-xs;

  &:hover:not(:disabled) {
    background: darken($accent-color-1, 10%);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.check-list__add-icon {
  font-size: 1.25rem;
  line-height: 1;
}

// ===================================
// Filter Buttons
// ===================================
.check-list__filters {
  display: flex;
  margin-bottom: $spacing-lg;
  padding: $spacing-sm;
  border: 1px solid $border-light;
  border-radius: $border-radius-lg;
  background: $bg-card;
  box-shadow: 0 2px 8px $shadow-light;

  gap: $spacing-xs;
}

.check-list__filter-btn {
  flex: 1;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-primary;
  border-radius: $border-radius-md;
  background: transparent;
  color: $text-secondary;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $bg-sidebar;
    color: $primary-color;
  }

  &--active {
    border-color: $accent-color-1;
    background: $accent-color-1;
    color: $text-white;
  }
}

// ===================================
// Items List
// ===================================
.check-list__items {
  margin-bottom: $spacing-xl;
}

.check-list__empty {
  padding: $spacing-2xl;
  border: 1px solid $border-light;
  border-radius: $border-radius-lg;
  background: $bg-card;
  text-align: center;
}

.check-list__empty-message {
  margin: 0;
  color: $text-muted;
  font-size: 1rem;
}

.check-list__items-container {
  display: flex;
  flex-direction: column;

  gap: $spacing-sm;
}

.check-list__item {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  border: 1px solid $border-light;
  border-radius: $border-radius-md;
  background: $bg-card;
  box-shadow: 0 1px 3px $shadow-light;
  transition: all 0.2s ease;

  gap: $spacing-md;

  &:hover {
    box-shadow: 0 2px 8px $shadow-medium;
    transform: translateY(-1px);
  }

  &--packed {
    background: $bg-sidebar;
    opacity: 0.8;

    .check-list__text {
      color: $text-muted;
      text-decoration: line-through;
    }
  }
}

.check-list__checkbox {
  position: relative;
  cursor: pointer;

  input[type="checkbox"] {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
}

.check-list__checkmark {
  position: relative;
  display: block;
  width: 20px;
  height: 20px;
  border: 2px solid $border-primary;
  border-radius: $border-radius-sm;
  background: $bg-card;
  transition: all 0.2s ease;

  &::after {
    position: absolute;
    top: 2px;
    left: 6px;
    width: 6px;
    height: 10px;
    border: 2px solid $text-white;
    border-top: none;
    border-left: none;
    content: '';
    transition: transform 0.2s ease;
    transform: rotate(45deg) scale(0);
  }

  input[type="checkbox"]:checked+& {
    border-color: $accent-color-1;
    background: $accent-color-1;

    &::after {
      transform: rotate(45deg) scale(1);
    }
  }
}

.check-list__content {
  display: flex;
  flex: 1;
  flex-direction: column;

  gap: $spacing-xs;
}

.check-list__text {
  color: $text-primary;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.check-list__date {
  color: $text-muted;
  font-size: 0.75rem;
}

.check-list__delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid $border-primary;
  border-radius: $border-radius-sm;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: $accent-color-2;
    background: rgba($accent-color-2, 0.1);
    color: $accent-color-2;
  }
}

.check-list__delete-icon {
  font-size: 1.25rem;
  line-height: 1;
}

// ===================================
// Progress Section
// ===================================
.check-list__progress {
  padding: $spacing-lg;
  border: 1px solid $border-light;
  border-radius: $border-radius-lg;
  background: $bg-card;
  box-shadow: 0 2px 8px $shadow-light;
}

.check-list__progress-label {
  margin-bottom: $spacing-sm;
  color: $text-secondary;
  font-weight: 500;
  font-size: 0.875rem;
}

.check-list__progress-bar {
  overflow: hidden;
  height: 8px;
  border-radius: $border-radius-sm;
  background: $border-light;
}

.check-list__progress-fill {
  height: 100%;
  border-radius: $border-radius-sm;
  background: linear-gradient(90deg, $city-gradient-start, $city-gradient-end);
  transition: width 0.3s ease;
}
</style>