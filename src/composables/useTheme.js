import { ref, onMounted, onUnmounted } from 'vue'
import { storage } from '../utils/helpers'

export function useTheme() {
  const isDark = ref(false)

  // 初始化主题
  const initTheme = () => {
    // 从本地存储读取
    const saved = storage.get('theme')
    if (saved) {
      isDark.value = saved === 'dark'
      return
    }

    // 检测系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
  }

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    storage.set('theme', isDark.value ? 'dark' : 'light')
    
    // 更新 body 类名（用于 CSS 变量切换）
    document.body.classList.toggle('dark-mode', isDark.value)
  }

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (e) => {
    if (!storage.get('theme')) {
      isDark.value = e.matches
      document.body.classList.toggle('dark-mode', isDark.value)
    }
  }

  onMounted(() => {
    initTheme()
    document.body.classList.toggle('dark-mode', isDark.value)
    mediaQuery.addEventListener('change', handleChange)
  })

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleChange)
  })

  return {
    isDark,
    toggleTheme
  }
}
