<template>
  <header class="header">
    <div class="header-content">
      <button 
        class="btn btn-icon mobile-menu-btn" 
        @click="$emit('toggle-sidebar')"
        aria-label="显示菜单"
      >
        <span class="theme-icon">☰</span>
      </button>
      
      <h1>{{ currentTitle }}</h1>
      
      <div class="header-actions">
        <button 
          class="btn btn-icon" 
          @click="$emit('toggle-theme')"
          aria-label="切换主题"
        >
          <span class="theme-icon">{{ isDark ? '🌙' : '☀️' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { inject } from 'vue'

defineProps({
  currentTitle: {
    type: String,
    default: 'IPLAY 纳新题'
  }
})

defineEmits(['toggle-theme', 'toggle-sidebar'])

const isDark = inject('isDark', false)
</script>

<style lang="scss" scoped>
.header {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;

    h1 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: var(--text-color);
      flex: 1;
      text-align: center;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      min-width: 40px; // 保持布局平衡
    }

    .btn {
      background: none;
      border: none;
      cursor: pointer;
      transition: var(--transition-normal);

      &.btn-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius);
        background: var(--hover-bg);

        &:hover {
          background: var(--primary-color);
          transform: scale(1.05);

          .theme-icon {
            color: white;
          }
        }
      }

      &.mobile-menu-btn {
        display: none;
      }

      .theme-icon {
        font-size: 1.25rem;
        color: var(--text-color);
        transition: color var(--transition-fast);
      }
    }
  }
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;

    .header-content {
      h1 {
        font-size: 1rem;
      }

      .btn.mobile-menu-btn {
        display: flex;
      }
    }
  }
}
</style>
