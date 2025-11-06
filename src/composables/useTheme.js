import { ref, onMounted, onUnmounted } from 'vue'
import { storage } from '../utils/helpers'

export function useTheme() {
  const isDark = ref(false)

  const initTheme = () => {
    const saved = storage.get('theme')
    if (saved) {
      isDark.value = saved === 'dark'
      return
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    storage.set('theme', isDark.value ? 'dark' : 'light')
    
    document.body.classList.toggle('dark-mode', isDark.value)
  }

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
