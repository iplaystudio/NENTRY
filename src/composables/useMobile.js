import { ref, onMounted, onUnmounted } from 'vue'

export function useMobile() {
  const isMobile = ref(false)
  const isSidebarOpen = ref(false)

  // 检测是否移动端
  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
    // 桌面端默认显示侧边栏
    if (!isMobile.value) {
      isSidebarOpen.value = false
    }
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  // 关闭侧边栏
  const closeSidebar = () => {
    isSidebarOpen.value = false
  }

  // 监听窗口大小变化
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
