<template>
  <div class="comment-item">
    <div class="comment-avatar">
      <img v-if="comment.isAvatarImage" :src="comment.avatar" alt="头像" />
      <span v-else class="avatar-emoji">{{ comment.avatar }}</span>
    </div>

    <div class="comment-content">
      <div class="comment-header">
        <span class="author">{{ comment.author }}</span>
        <span class="timestamp">{{ formattedTime }}</span>
      </div>

      <div class="comment-text">{{ comment.content }}</div>

      <!-- 图片 -->
      <div v-if="comment.images && comment.images.length > 0" class="comment-images">
        <img
          v-for="(img, index) in comment.images"
          :key="index"
          :src="img"
          alt="图片"
          @click="showImage(img)"
        />
      </div>

      <div class="comment-actions">
        <button 
          class="btn-action"
          :class="{ liked: hasLiked }"
          @click="handleLike"
        >
          {{ hasLiked ? '👍' : '👍' }} {{ comment.likes || 0 }}
        </button>
        <button class="btn-action" @click="toggleReply">
          💬 回复 {{ comment.replies?.length || 0 }}
        </button>
        <button
          v-if="comment.userId === currentUserId"
          class="btn-action btn-delete"
          @click="$emit('delete', comment.id)"
        >
          🗑️ 删除
        </button>
      </div>

      <!-- 回复表单 -->
      <div v-if="showReplyForm" class="reply-form">
        <textarea
          v-model="replyContent"
          placeholder="写下你的回复..."
          rows="3"
        ></textarea>
        <div class="reply-actions">
          <button class="btn-cancel" @click="cancelReply">取消</button>
          <button 
            class="btn-submit"
            :disabled="!replyContent.trim()"
            @click="submitReply"
          >
            发送
          </button>
        </div>
      </div>

      <!-- 回复列表 -->
      <div v-if="comment.replies && comment.replies.length > 0" class="replies">
        <div
          v-for="reply in comment.replies"
          :key="reply.id"
          class="reply-item"
        >
          <div class="reply-avatar">
            <img v-if="reply.isAvatarImage" :src="reply.avatar" alt="头像" />
            <span v-else class="avatar-emoji">{{ reply.avatar }}</span>
          </div>
          <div class="reply-content">
            <div class="reply-header">
              <span class="author">{{ reply.author }}</span>
              <span class="timestamp">{{ formatTime(reply.timestamp) }}</span>
            </div>
            <div class="reply-text">{{ reply.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatTime } from '../utils/helpers'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  problemId: {
    type: Number,
    required: true
  },
  currentUserId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['reply', 'delete', 'like'])

const showReplyForm = ref(false)
const replyContent = ref('')
const hasLiked = ref(checkIfLiked())

const formattedTime = computed(() => formatTime(props.comment.timestamp))

// 检查当前用户是否已点赞
function checkIfLiked() {
  const likedComments = JSON.parse(localStorage.getItem('likedComments') || '{}')
  return likedComments[props.comment.id] === true
}

function handleLike() {
  const likedComments = JSON.parse(localStorage.getItem('likedComments') || '{}')
  
  if (hasLiked.value) {
    // 取消点赞
    delete likedComments[props.comment.id]
    hasLiked.value = false
    emit('like', props.comment.id, -1)
  } else {
    // 点赞
    likedComments[props.comment.id] = true
    hasLiked.value = true
    emit('like', props.comment.id, 1)
  }
  
  localStorage.setItem('likedComments', JSON.stringify(likedComments))
}

function toggleReply() {
  showReplyForm.value = !showReplyForm.value
  replyContent.value = ''
}

function cancelReply() {
  showReplyForm.value = false
  replyContent.value = ''
}

function submitReply() {
  if (!replyContent.value.trim()) return

  emit('reply', props.comment.id, replyContent.value)
  replyContent.value = ''
  showReplyForm.value = false
}

function showImage(src) {
  // 创建图片预览弹窗
  const modal = document.createElement('div')
  modal.className = 'image-modal'
  modal.innerHTML = `
    <div class="image-modal-content">
      <img src="${src}" alt="图片预览" />
      <button class="image-modal-close">×</button>
    </div>
  `
  document.body.appendChild(modal)

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.className === 'image-modal-close') {
      document.body.removeChild(modal)
    }
  })
}
</script>

<style lang="scss" scoped>
.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 12px;
  margin-bottom: 1rem;

  .comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--hover-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-emoji {
      font-size: 1.5rem;
    }
  }

  .comment-content {
    flex: 1;
    min-width: 0;

    .comment-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;

      .author {
        font-weight: 600;
        color: var(--text-color);
      }

      .timestamp {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }
    }

    .comment-text {
      color: var(--text-color);
      line-height: 1.6;
      margin-bottom: 0.75rem;
      word-wrap: break-word;
    }

    .comment-images {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;

      img {
        max-width: 150px;
        max-height: 150px;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }

    .comment-actions {
      display: flex;
      gap: 1rem;

      .btn-action {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 0.875rem;
        padding: 0.25rem 0.5rem;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          color: var(--primary-color);
          transform: scale(1.05);
        }

        &.liked {
          color: var(--primary-color);
          font-weight: 600;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &.btn-delete:hover {
          color: #e53e3e;
        }
      }
    }

    .reply-form {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--hover-bg);
      border-radius: 8px;

      textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background: var(--bg-color);
        color: var(--text-color);
        font-size: 0.875rem;
        font-family: inherit;
        resize: vertical;

        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }

      .reply-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 0.75rem;

        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;

          &.btn-cancel {
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
              transform: translateY(-1px);
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          }
        }
      }
    }

    .replies {
      margin-top: 1rem;
      padding-left: 1rem;
      border-left: 2px solid var(--border-color);

      .reply-item {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;

        &:last-child {
          margin-bottom: 0;
        }

        .reply-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--hover-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .avatar-emoji {
            font-size: 1rem;
          }
        }

        .reply-content {
          flex: 1;

          .reply-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.25rem;

            .author {
              font-weight: 600;
              font-size: 0.875rem;
              color: var(--text-color);
            }

            .timestamp {
              font-size: 0.75rem;
              color: var(--text-secondary);
            }
          }

          .reply-text {
            color: var(--text-color);
            font-size: 0.875rem;
            line-height: 1.6;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .comment-item {
    padding: 1rem;

    .comment-content .comment-images img {
      max-width: 100px;
      max-height: 100px;
    }
  }
}
</style>

<style>
/* 全局样式：图片预览弹窗 */
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
  z-index: 9999;
  cursor: pointer;
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.image-modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.image-modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
