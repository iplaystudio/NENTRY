import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ref as dbRef, push, onValue, set, remove } from 'firebase/database'
import { getDB } from '../firebase'
import { storage, generateId } from '../utils/helpers'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref({})
  const loading = ref(false)
  const submitting = ref(false)

  const userId = ref(storage.get('anonymousUserId') || generateId())
  const username = ref(storage.get('anonymousUsername') || generateRandomUsername())
  const avatar = ref(storage.get('anonymousAvatar') || getRandomAvatar())
  const isAvatarImage = ref(storage.get('isAvatarImage') === 'true')

  if (!storage.get('anonymousUserId')) {
    storage.set('anonymousUserId', userId.value)
  }
  if (!storage.get('anonymousUsername')) {
    storage.set('anonymousUsername', username.value)
  }
  if (!storage.get('anonymousAvatar')) {
    storage.set('anonymousAvatar', avatar.value)
    storage.set('isAvatarImage', 'false')
  }

  function updateUserProfile(newUsername, newAvatar, isImage = false) {
    username.value = newUsername
    avatar.value = newAvatar
    isAvatarImage.value = isImage

    storage.set('anonymousUsername', newUsername)
    storage.set('anonymousAvatar', newAvatar)
    storage.set('isAvatarImage', isImage ? 'true' : 'false')
    
    console.log('✅ 用户资料已保存:', { newUsername, isImage })
  }

  async function loadComments(problemId) {
    if (comments.value[problemId]) return

    loading.value = true

    try {
      console.log(`📥 从 Firebase 加载题目 ${problemId} 的评论...`)
      await loadCommentsFromFirebase(problemId)
      console.log(`✅ 加载完成，共 ${comments.value[problemId]?.length || 0} 条评论`)
    } catch (error) {
      console.error('加载评论失败:', error)
    } finally {
      loading.value = false
    }
  }

  function loadCommentsFromFirebase(problemId) {
    return new Promise((resolve, reject) => {
      const db = getDB()
      const commentsRef = dbRef(db, `comments/${problemId}`)

      onValue(commentsRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const commentList = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
            replies: value.replies ? Object.entries(value.replies).map(([k, v]) => ({
              id: k,
              ...v
            })) : []
          }))
          comments.value[problemId] = commentList.sort((a, b) => b.timestamp - a.timestamp)
        } else {
          comments.value[problemId] = []
        }
        resolve()
      }, reject)
    })
  }

  async function addComment(problemId, content, images = []) {
    if (!content.trim()) return

    submitting.value = true

    const comment = {
      content: content.trim(),
      author: username.value,
      avatar: avatar.value,
      isAvatarImage: isAvatarImage.value,
      userId: userId.value,
      timestamp: Date.now(),
      images: images,
      likes: 0,
      replies: []
    }

    try {
      const db = getDB()
      const commentsRef = dbRef(db, `comments/${problemId}`)
      await push(commentsRef, comment)
    } catch (error) {
      console.error('发表评论失败:', error)
      throw error
    } finally {
      submitting.value = false
    }
  }

  async function addReply(problemId, commentId, content) {
    if (!content.trim()) return

    const reply = {
      content: content.trim(),
      author: username.value,
      avatar: avatar.value,
      isAvatarImage: isAvatarImage.value,
      userId: userId.value,
      timestamp: Date.now()
    }

    try {
      const db = getDB()
      const replyRef = dbRef(db, `comments/${problemId}/${commentId}/replies`)
      await push(replyRef, reply)
    } catch (error) {
      console.error('回复失败:', error)
      throw error
    }
  }

  async function deleteComment(problemId, commentId) {
    try {
      const db = getDB()
      const commentRef = dbRef(db, `comments/${problemId}/${commentId}`)
      await remove(commentRef)
    } catch (error) {
      console.error('删除评论失败:', error)
      throw error
    }
  }

  async function likeComment(problemId, commentId, delta) {
    try {
      const db = getDB()
      const likesRef = dbRef(db, `comments/${problemId}/${commentId}/likes`)
      
      const commentList = comments.value[problemId] || []
      const comment = commentList.find(c => c.id === commentId)
      const currentLikes = comment?.likes || 0
      
      await set(likesRef, currentLikes + delta)
    } catch (error) {
      console.error('点赞失败:', error)
      throw error
    }
  }

  return {
    comments,
    loading,
    submitting,
    userId,
    username,
    avatar,
    isAvatarImage,
    updateUserProfile,
    loadComments,
    addComment,
    addReply,
    deleteComment,
    likeComment
  }
})

function generateRandomUsername() {
  const adjectives = ['快乐的', '聪明的', '勇敢的', '可爱的', '神秘的', '优雅的']
  const nouns = ['小猫', '小狗', '小熊', '小兔', '小鸟', '小鱼']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adj}${noun}`
}

function getRandomAvatar() {
  const avatars = ['😀', '😃', '😄', '😁', '😆', '😊', '😎', '🤓', '🤗', '🥳', 
    '😺', '😸', '😹', '😻', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊']
  return avatars[Math.floor(Math.random() * avatars.length)]
}
