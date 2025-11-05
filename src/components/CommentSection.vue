<template>
  <div class="comment-section">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-avatar">
        <img v-if="commentStore.isAvatarImage" :src="commentStore.avatar" alt="头像" />
        <span v-else class="avatar-emoji">{{ commentStore.avatar }}</span>
      </div>
      <div class="user-info">
        <div class="username">{{ commentStore.username }}</div>
        <div class="user-id">ID: {{ commentStore.userId.slice(0, 8) }}</div>
      </div>
      <button class="btn-edit" @click="showProfileModal = true">
        ✏️ 编辑资料
      </button>
    </div>

    <!-- 发表评论 -->
    <div class="comment-form">
      <textarea
        v-model="newComment"
        placeholder="说点什么吧..."
        rows="4"
        :disabled="submitting"
      ></textarea>
      
      <div class="form-actions">
        <button class="btn-upload" @click="triggerImageUpload">
          🖼️ 添加图片 ({{ uploadedImages.length }}/3)
        </button>
        <input
          ref="imageInput"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="handleImageUpload"
        />
        <button 
          class="btn-submit"
          :disabled="!newComment.trim() || submitting"
          @click="handleSubmit"
        >
          {{ submitting ? '发送中...' : '发表评论' }}
        </button>
      </div>

      <!-- 图片预览 -->
      <div v-if="uploadedImages.length > 0" class="image-previews">
        <div v-for="(img, index) in uploadedImages" :key="index" class="preview-item">
          <img :src="img" alt="预览" />
          <button class="btn-remove" @click="removeImage(index)">×</button>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <h3>评论 ({{ commentList.length }})</h3>
      
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="commentList.length === 0" class="empty">
        还没有评论，来抢沙发吧！
      </div>
      
      <CommentItem
        v-else
        v-for="comment in commentList"
        :key="comment.id"
        :comment="comment"
        :problem-id="problemId"
        :current-user-id="commentStore.userId"
        @reply="handleReply"
        @delete="handleDelete"
        @like="handleLike"
      />
    </div>

    <!-- 编辑资料弹窗 -->
    <ProfileModal
      v-if="showProfileModal"
      :username="commentStore.username"
      :avatar="commentStore.avatar"
      :is-avatar-image="commentStore.isAvatarImage"
      @close="showProfileModal = false"
      @save="handleProfileSave"
    />

    <!-- Toast 提示 -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCommentStore } from '../stores/comment'
import CommentItem from './CommentItem.vue'
import ProfileModal from './ProfileModal.vue'
import Toast from './Toast.vue'

const props = defineProps({
  problemId: {
    type: Number,
    required: true
  }
})

const commentStore = useCommentStore()

const newComment = ref('')
const uploadedImages = ref([])
const imageInput = ref(null)
const submitting = ref(false)
const showProfileModal = ref(false)
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const loading = computed(() => commentStore.loading)
const commentList = computed(() => commentStore.comments[props.problemId] || [])

onMounted(() => {
  commentStore.loadComments(props.problemId)
})

function triggerImageUpload() {
  if (uploadedImages.value.length >= 3) {
    alert('最多只能上传3张图片')
    return
  }
  imageInput.value?.click()
}

async function handleImageUpload(event) {
  const files = Array.from(event.target.files)
  
  for (const file of files) {
    if (uploadedImages.value.length >= 3) {
      alert('最多只能上传3张图片')
      break
    }

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      continue
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      continue
    }

    try {
      // 上传到 imgBB
      const url = await uploadToImgBB(file)
      uploadedImages.value.push(url)
    } catch (error) {
      console.error('上传图片失败:', error)
      alert('图片上传失败，请重试')
    }
  }

  // 清空 input
  event.target.value = ''
}

// 上传图片到 imgBB
async function uploadToImgBB(file) {
  // 将文件转换为 base64
  const base64 = await fileToBase64(file)
  const base64Data = base64.split(',')[1] // 移除 data:image/xxx;base64, 前缀

  const formData = new FormData()
  formData.append('image', base64Data)

  // 使用 imgBB API
  const apiKey = '579c73963d6c9735042f0465cfe43f12' // 公共测试 key
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('上传失败')
  }

  const result = await response.json()
  
  if (result.success && result.data && result.data.url) {
    return result.data.url
  } else {
    throw new Error('上传失败')
  }
}

// 将文件转换为 base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function removeImage(index) {
  uploadedImages.value.splice(index, 1)
}

async function handleSubmit() {
  if (!newComment.value.trim()) return

  submitting.value = true

  try {
    await commentStore.addComment(
      props.problemId,
      newComment.value,
      uploadedImages.value
    )
    
    newComment.value = ''
    uploadedImages.value = []
    
    // 显示成功提示
    showToast('评论发表成功! 🎉', 'success')
  } catch (error) {
    showToast('发表评论失败，请重试', 'error')
  } finally {
    submitting.value = false
  }
}

function showToast(message, type = 'success') {
  toast.value = {
    show: true,
    message,
    type
  }
}

async function handleReply(commentId, content) {
  try {
    await commentStore.addReply(props.problemId, commentId, content)
    showToast('回复成功! 💬', 'success')
  } catch (error) {
    showToast('回复失败，请重试', 'error')
  }
}

async function handleDelete(commentId) {
  if (!confirm('确定要删除这条评论吗？')) return

  try {
    await commentStore.deleteComment(props.problemId, commentId)
    showToast('评论已删除', 'info')
  } catch (error) {
    showToast('删除失败，请重试', 'error')
  }
}

async function handleLike(commentId, delta) {
  try {
    await commentStore.likeComment(props.problemId, commentId, delta)
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

function handleProfileSave(profile) {
  commentStore.updateUserProfile(
    profile.username,
    profile.avatar,
    profile.isImage
  )
  showProfileModal.value = false
}
</script>

<style lang="scss" scoped>
.comment-section {
  max-width: 800px;
  margin: 0 auto;

  .user-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--card-bg);
    border-radius: 12px;
    margin-bottom: 2rem;

    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--hover-bg);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-emoji {
        font-size: 2rem;
      }
    }

    .user-info {
      flex: 1;

      .username {
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 0.25rem;
      }

      .user-id {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-family: monospace;
      }
    }

    .btn-edit {
      padding: 0.5rem 1rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
    }
  }

  .comment-form {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;

    textarea {
      width: 100%;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--bg-color);
      color: var(--text-color);
      font-size: 0.875rem;
      font-family: inherit;
      resize: vertical;
      transition: border-color 0.2s ease;

      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;

      button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s ease;

        &.btn-upload {
          background: var(--hover-bg);
          color: var(--text-color);

          &:hover {
            background: var(--border-color);
          }
        }

        &.btn-submit {
          background: var(--primary-color);
          color: white;

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }

    .image-previews {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;

      .preview-item {
        position: relative;
        width: 100px;
        height: 100px;
        border-radius: 8px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            background: rgba(255, 0, 0, 0.8);
          }
        }
      }
    }
  }

  .comments-list {
    h3 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      color: var(--text-color);
    }

    .loading,
    .empty {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }
  }
}

@media (max-width: 768px) {
  .comment-section {
    .user-card {
      flex-direction: column;
      text-align: center;

      .btn-edit {
        width: 100%;
      }
    }

    .comment-form .form-actions {
      flex-direction: column;
      gap: 0.5rem;

      button {
        width: 100%;
      }
    }
  }
}
</style>
