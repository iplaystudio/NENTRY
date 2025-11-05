<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-header">
      <div class="logo">
        <h1>🎮 IPLAY</h1>
        <p class="subtitle">纳新题</p>
      </div>
      <button class="sidebar-toggle" @click="$emit('close')" aria-label="关闭侧边栏">
        ✕
      </button>
    </div>
    
    <nav class="problem-list">
      <h2>题目列表</h2>
      <ul role="list">
        <li 
          v-for="problem in problems" 
          :key="problem.id"
          :class="{ active: currentProblem && currentProblem.id === problem.id }"
        >
          <button 
            class="problem-item"
            @click="$emit('select-problem', problem.id)"
            :aria-current="currentProblem && currentProblem.id === problem.id ? 'page' : undefined"
          >
            <span class="problem-number">{{ problem.id }}</span>
            <span class="problem-title" v-html="problem.title"></span>
          </button>
        </li>
      </ul>
    </nav>
    
    <footer class="sidebar-footer">
      <p>2025 IPLAY</p>
      <p>感谢ACM工作室</p>
      <p>提供题目数据支持</p>
      <p>提供部分的题目</p>
    </footer>
  </aside>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  problems: Array,
  currentProblem: Object
})

defineEmits(['select-problem', 'close'])
</script>

<style lang="scss" scoped>
.sidebar {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  transition: var(--transition-normal);
  z-index: 1000;
  overflow-y: auto;
  scrollbar-width: thin;

  .sidebar-header {
    padding: 2rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .logo {
      flex: 1;
      text-align: center;

      h1 {
        font-size: 2rem;
        margin: 0 0 0.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .subtitle {
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-weight: 400;
        margin: 0;
      }
    }

    .sidebar-toggle {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-color);
      padding: 1rem;
      flex-shrink: 0;
      transition: var(--transition-normal);
      
      &:hover {
        color: var(--primary-color);
        transform: scale(1.1);
      }

      &:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
    }
  }

  .problem-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0;

    h2 {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      padding: 0.5rem 1.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin: 0.25rem 0.75rem;

        &.active .problem-item {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          font-weight: 500;
          box-shadow: var(--shadow-md);

          .problem-number {
            background: rgba(255, 255, 255, 0.2);
            color: white;
          }

          .problem-title {
            color: white;
          }
        }
      }
    }

    .problem-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: var(--transition-normal);
      text-align: left;
      font-size: 0.925rem;
      user-select: none;

      &:hover {
        background: var(--hover-bg);
        transform: translateX(4px);
      }

      &:active {
        transform: translateX(2px);
      }

      &:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      .problem-number {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border-radius: 50%;
        font-weight: 600;
        font-size: 0.85rem;
      }

      .problem-title {
        flex: 1;
        color: var(--text-color);
        line-height: 1.4;
      }
    }
  }

  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-align: center;

    p {
      margin: 0.25rem 0;
    }
  }
}

// 桌面端样式
@media (min-width: 769px) {
  .sidebar {
    display: flex !important;
    left: 0 !important;
    transform: translateX(0) !important;
  }

  .sidebar-toggle {
    display: none !important;
  }
}

// 移动端样式
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);

    &.open {
      transform: translateX(0);
    }

    .sidebar-header .sidebar-toggle {
      display: block;
    }
  }
}
</style>
