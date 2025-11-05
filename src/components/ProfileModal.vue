<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>编辑资料</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <!-- 昵称 -->
        <div class="form-group">
          <label>昵称</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="输入你的昵称"
            maxlength="20"
          />
          <span class="hint">最多 20 个字符</span>
        </div>

        <!-- 头像类型选择 -->
        <div class="form-group">
          <label>头像类型</label>
          <div class="avatar-tabs">
            <button
              class="tab"
              :class="{ active: avatarType === 'emoji' }"
              @click="avatarType = 'emoji'"
            >
              😀 表情
            </button>
            <button
              class="tab"
              :class="{ active: avatarType === 'image' }"
              @click="avatarType = 'image'"
            >
              🖼️ 图片
            </button>
          </div>
        </div>

        <!-- 表情头像选择 -->
        <div v-if="avatarType === 'emoji'" class="form-group">
          <label>选择表情头像</label>
          <div class="emoji-grid">
            <div
              v-for="emoji in emojiList"
              :key="emoji"
              class="emoji-option"
              :class="{ selected: form.avatar === emoji && !form.isImage }"
              @click="selectEmoji(emoji)"
            >
              {{ emoji }}
            </div>
          </div>
        </div>

        <!-- 图片头像上传 -->
        <div v-if="avatarType === 'image'" class="form-group">
          <label>上传图片头像</label>
          <div class="image-upload">
            <div
              class="upload-area"
              @click="$refs.fileInput.click()"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <div v-if="!imagePreview" class="upload-placeholder">
                <span class="upload-icon">📁</span>
                <p>点击或拖拽上传图片</p>
                <span class="hint">支持 JPG、PNG，最大 5MB</span>
              </div>
              <img v-else :src="imagePreview" alt="预览" class="preview-image" />
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileSelect"
            />
          </div>
          
          <!-- 上传进度 -->
          <div v-if="uploading" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <span class="progress-text">{{ uploadProgress }}%</span>
          </div>
        </div>

        <!-- 预览 -->
        <div class="form-group">
          <label>预览</label>
          <div class="profile-preview">
            <div class="preview-avatar">
              <img v-if="form.isImage && form.avatar" :src="form.avatar" alt="头像" />
              <span v-else class="avatar-emoji">{{ form.avatar }}</span>
            </div>
            <div class="preview-name">{{ form.username || '未设置昵称' }}</div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-cancel" @click="$emit('close')">取消</button>
        <button class="btn btn-save" @click="handleSave" :disabled="!canSave">
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const props = defineProps({
  username: String,
  avatar: String,
  isAvatarImage: Boolean
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  username: props.username,
  avatar: props.avatar,
  isImage: props.isAvatarImage
})

const avatarType = ref(props.isAvatarImage ? 'image' : 'emoji')
const imagePreview = ref(props.isAvatarImage ? props.avatar : null)
const uploading = ref(false)
const uploadProgress = ref(0)

const emojiList = [
  '😀', '😃', '😄', '😁', '😆', '😊', '😎', '🤓', '🤗', '🥳',
  '😺', '😸', '😹', '😻', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
  '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🦄', '🦋', '🐙', '🦖', '🦕', '🐉', '🌸', '🌺', '🌻', '🌹',
  '⭐', '🌟', '✨', '💫', '🔥', '💧', '🌈', '☀️', '🌙', '⚡'
]

const canSave = computed(() => {
  if (!form.username.trim()) return false
  if (avatarType.value === 'image' && !imagePreview.value) return false
  return true
})

function selectEmoji(emoji) {
  form.avatar = emoji
  form.isImage = false
  imagePreview.value = null
}

async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    await processImage(file)
  }
}

async function handleDrop(event) {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    await processImage(file)
  }
}

async function processImage(file) {
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过 5MB')
    return
  }

  uploading.value = true
  uploadProgress.value = 0

  try {
    uploadProgress.value = 10
    
    // 将文件转换为 base64
    const base64 = await fileToBase64(file)
    const base64Data = base64.split(',')[1]
    
    uploadProgress.value = 30

    const formData = new FormData()
    formData.append('image', base64Data)
    
    uploadProgress.value = 50

    const apiKey = '579c73963d6c9735042f0465cfe43f12'
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    })

    uploadProgress.value = 80

    if (!response.ok) {
      throw new Error('上传失败')
    }

    const result = await response.json()
    
    if (result.success && result.data && result.data.url) {
      uploadProgress.value = 100
      
      form.avatar = result.data.url
      form.isImage = true
      imagePreview.value = result.data.url

      setTimeout(() => {
        uploading.value = false
        uploadProgress.value = 0
      }, 500)
    } else {
      throw new Error('上传失败')
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    alert('图片上传失败，请重试\n建议：使用表情头像或稍后再试')
    uploading.value = false
    uploadProgress.value = 0
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

function handleSave() {
  if (!canSave.value) return

  emit('save', {
    username: form.username.trim(),
    avatar: form.avatar,
    isImage: avatarType.value === 'image'
  })
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);

    h3 {
      margin: 0;
      color: var(--text-color);
    }

    .btn-close {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: var(--hover-bg);
        color: var(--text-color);
      }
    }
  }

  .modal-body {
    padding: 1.5rem;

    .form-group {
      margin-bottom: 1.5rem;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
      }

      input[type="text"] {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-color);
        color: var(--text-color);
        font-size: 1rem;
        transition: border-color 0.2s ease;

        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }

      .hint {
        display: block;
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-top: 0.25rem;
      }

      .avatar-tabs {
        display: flex;
        gap: 0.5rem;

        .tab {
          flex: 1;
          padding: 0.75rem;
          background: var(--hover-bg);
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--text-color);
          transition: all 0.2s ease;

          &:hover {
            background: var(--border-color);
          }

          &.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
          }
        }
      }

      .emoji-grid {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.5rem;
        background: var(--bg-color);
        border-radius: 8px;

        .emoji-option {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
          border: 2px solid transparent;

          &:hover {
            background: var(--hover-bg);
            transform: scale(1.1);
          }

          &.selected {
            background: var(--primary-color);
            border-color: var(--primary-color);
          }
        }
      }

      .image-upload {
        .upload-area {
          border: 2px dashed var(--border-color);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--bg-color);

          &:hover {
            border-color: var(--primary-color);
            background: var(--hover-bg);
          }

          .upload-placeholder {
            .upload-icon {
              font-size: 3rem;
              display: block;
              margin-bottom: 0.5rem;
            }

            p {
              margin: 0 0 0.5rem;
              color: var(--text-color);
            }

            .hint {
              color: var(--text-secondary);
            }
          }

          .preview-image {
            max-width: 200px;
            max-height: 200px;
            border-radius: 8px;
          }
        }

        .upload-progress {
          margin-top: 1rem;

          .progress-bar {
            height: 6px;
            background: var(--hover-bg);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 0.5rem;

            .progress-fill {
              height: 100%;
              background: var(--primary-color);
              transition: width 0.3s ease;
            }
          }

          .progress-text {
            font-size: 0.75rem;
            color: var(--text-secondary);
          }
        }
      }

      .profile-preview {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--bg-color);
        border-radius: 8px;

        .preview-avatar {
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

        .preview-name {
          font-weight: 600;
          color: var(--text-color);
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);

    .btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s ease;

      &.btn-cancel {
        background: var(--hover-bg);
        color: var(--text-color);

        &:hover {
          background: var(--border-color);
        }
      }

      &.btn-save {
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
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal-content {
    .modal-body .form-group .emoji-grid {
      grid-template-columns: repeat(8, 1fr);
    }
  }
}
</style>
