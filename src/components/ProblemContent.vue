<template>
  <article class="problem-content">
    <div class="tabs" role="tablist">
      <button 
        class="tab-btn"
        :class="{ active: activeTab === 'problem' }"
        @click="activeTab = 'problem'"
        role="tab"
        :aria-selected="activeTab === 'problem'"
      >
        📝 题目
      </button>
      <button 
        class="tab-btn"
        :class="{ active: activeTab === 'solution' }"
        @click="activeTab = 'solution'"
        role="tab"
        :aria-selected="activeTab === 'solution'"
      >
        💡 题解
      </button>
      <button 
        class="tab-btn"
        :class="{ active: activeTab === 'comments' }"
        @click="activeTab = 'comments'"
        role="tab"
        :aria-selected="activeTab === 'comments'"
      >
        💬 评论
      </button>
    </div>

    <div class="tab-content">
      <!-- 题目标签页 -->
      <div v-show="activeTab === 'problem'" class="tab-panel" role="tabpanel">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        <div 
          v-else
          class="markdown-content" 
          v-html="renderedProblem"
        ></div>
      </div>

      <!-- 题解标签页 -->
      <div v-show="activeTab === 'solution'" class="tab-panel" role="tabpanel">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        <div v-else class="code-content">
          <pre><code class="language-c" v-html="highlightedSolution"></code></pre>
        </div>
      </div>

      <!-- 评论标签页 -->
      <div v-show="activeTab === 'comments'" class="tab-panel" role="tabpanel">
        <CommentSection :problem-id="problem.id" />
      </div>
    </div>

    <!-- 图片放大模态框 -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="showImageModal" 
          class="image-modal"
          @click="closeImageModal"
        >
          <img 
            :src="modalImageSrc" 
            :alt="modalImageAlt"
            @click.stop="closeImageModal"
          />
        </div>
      </Transition>
    </Teleport>
  </article>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useProblemStore } from '../stores/problem'
import { useMarkdown } from '../composables/useMarkdown'
import CommentSection from './CommentSection.vue'
import hljs from 'highlight.js'

const props = defineProps({
  problem: {
    type: Object,
    required: true
  }
})

const problemStore = useProblemStore()
const { renderMarkdown, renderMath } = useMarkdown()

const activeTab = ref('problem')
const loading = computed(() => problemStore.loading)
const showImageModal = ref(false)
const modalImageSrc = ref('')
const modalImageAlt = ref('')

const renderedProblem = computed(() => {
  return renderMarkdown(problemStore.currentProblemContent)
})

const highlightedSolution = computed(() => {
  const code = problemStore.currentSolutionContent
  if (!code) return ''
  
  try {
    return hljs.highlight(code, { language: 'c' }).value
  } catch (err) {
    console.error('代码高亮失败:', err)
    return code
  }
})

// 图片点击放大
const openImageModal = (src, alt) => {
  modalImageSrc.value = src
  modalImageAlt.value = alt
  showImageModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeImageModal = () => {
  showImageModal.value = false
  document.body.style.overflow = ''
}

// 监听 ESC 键关闭模态框
const handleKeydown = (e) => {
  if (e.key === 'Escape' && showImageModal.value) {
    closeImageModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

// 监听内容变化,重新渲染数学公式和绑定图片点击事件
watch([renderedProblem, activeTab], async () => {
  await nextTick()
  renderMath()
  
  // 为所有图片绑定点击事件
  if (activeTab.value === 'problem') {
    const images = document.querySelectorAll('.markdown-content img')
    images.forEach(img => {
      img.style.cursor = 'zoom-in'
      img.onclick = () => openImageModal(img.src, img.alt)
    })
  }
}, { flush: 'post' })
</script>

<style lang="scss" scoped>
.problem-content {
  max-width: 900px;
  margin: 0 auto;

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid var(--border-color);

    .tab-btn {
      padding: 0.75rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: var(--transition-normal);

      &:hover {
        color: var(--text-color);
        background: var(--hover-bg);
        border-radius: var(--border-radius) var(--border-radius) 0 0;
      }

      &.active {
        color: var(--primary-dark);
        border-bottom-color: var(--primary-dark);
        font-weight: 600;
      }
    }
  }

  .tab-content {
    .tab-panel {
      animation: fadeIn 0.3s ease;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--border-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }
    }

    .markdown-content {
      background: var(--card-bg);
      padding: 2rem;
      border-radius: 12px;
      line-height: 1.8;

      :deep(h1), :deep(h2), :deep(h3) {
        color: var(--text-color);
        margin-top: 2rem;
        margin-bottom: 1rem;
      }

      :deep(p) {
        margin-bottom: 1rem;
        color: var(--text-color);
      }

      :deep(pre) {
        background: var(--code-bg);
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        margin: 1rem 0;
        border: 1px solid var(--border-color);

        code {
          color: var(--code-text);
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
        }
      }

      :deep(code) {
        background: rgba(175, 184, 193, 0.2);
        color: var(--text-color);
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 0.9em;
      }

      :deep(pre code) {
        background: transparent;
        padding: 0;
        border-radius: 0;
      }

      :deep(img) {
        max-width: 400px;
        width: 100%;
        height: auto;
        border-radius: 0.5rem;
        margin: 1.5rem auto;
        display: block;
        box-shadow: var(--shadow-md);
        transition: var(--transition-normal);
        cursor: zoom-in;

        &:hover {
          transform: scale(1.02);
          box-shadow: var(--shadow-lg);
        }
      }

      :deep(blockquote) {
        border-left: 4px solid var(--primary-color);
        padding-left: 1rem;
        margin: 1rem 0;
        color: var(--text-secondary);
      }
    }

    .code-content {
      background: var(--card-bg);
      padding: 2rem;
      border-radius: 12px;

      pre {
        background: var(--code-bg);
        padding: 1.5rem;
        border-radius: 8px;
        overflow-x: auto;
        margin: 0;
        border: 1px solid var(--border-color);

        code {
          color: var(--code-text);
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
        }
      }
    }
  }
}

// 图片放大模态框样式
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  cursor: zoom-out;
  
  img {
    max-width: 90%;
    max-height: 90vh;
    border-radius: 0.5rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    cursor: zoom-out;
    animation: zoomIn 0.3s ease-in-out;
  }
}

// 删除之前的暗色模式增强样式
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// Transition 动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .problem-content {
    .tabs {
      .tab-btn {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }
    }

    .tab-content {
      .markdown-content,
      .code-content {
        padding: 1rem;
      }
    }
  }
}
</style>
