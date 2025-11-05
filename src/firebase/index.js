import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// 从环境变量读取 Firebase 配置
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// 检查是否启用 Firebase
const isFirebaseEnabled = import.meta.env.VITE_USE_FIREBASE === 'true'

let app = null
let database = null

// 初始化 Firebase
export function initFirebase() {
  if (!isFirebaseEnabled) {
    console.log('💾 使用本地存储模式（评论仅保存在浏览器中）')
    return false
  }

  // 检查配置是否完整
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your_')) {
    console.warn('⚠️ Firebase 配置不完整，使用本地存储模式')
    console.log('💡 提示：复制 .env.example 为 .env 并填入你的 Firebase 配置')
    return false
  }

  try {
    app = initializeApp(firebaseConfig)
    database = getDatabase(app)
    console.log('✅ Firebase 初始化成功，评论已同步到云端')
    return true
  } catch (error) {
    console.error('❌ Firebase 初始化失败:', error)
    console.warn('📦 使用本地存储作为降级方案')
    return false
  }
}

// 获取数据库实例
export function getDB() {
  return database
}

// 检查是否使用 Firebase
export function isUsingFirebase() {
  return !!database
}
