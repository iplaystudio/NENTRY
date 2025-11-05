import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/main.scss'

// 导入 highlight.js 的样式 (匹配原版的 github 主题)
import 'highlight.js/styles/github.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
