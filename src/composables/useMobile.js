import { ref, onMounted, onUnmounted } from 'vue'

export function useMobile() {
  const isMobile = ref(false)
  const isSidebarOpen = ref(false)

  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
    if (!isMobile.value) {
      isSidebarOpen.value = false
    }
  }

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  const closeSidebar = () => {
    isSidebarOpen.value = false
  }

  let resizeTimer = null
  const handleResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(checkMobile, 150)
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    isMobile,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar
  }
}
