<template>
  <section class="welcome-page">
    <div class="welcome-card">
      <div class="welcome-icon">🎮</div>
      <h2>IPLAY纳新题</h2>
      
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">{{ totalProblems }}</div>
          <div class="stat-label">题目总数</div>
        </div>
      </div>
      
      <div class="instruction">
        <span class="instruction-icon">👈</span>
        <span>从左侧选择一道题目查看</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  totalProblems: {
    type: Number,
    default: 0
  }
})
</script>

<style lang="scss" scoped>
.welcome-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;

  .welcome-card {
    max-width: 600px;
    width: 100%;
    background: var(--card-bg);
    border-radius: 16px;
    padding: 3rem;
    text-align: center;
    box-shadow: var(--shadow-lg);
    animation: fadeInUp 0.6s ease;

    .welcome-icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      animation: bounce 2s ease infinite;
    }

    h2 {
      font-size: 2rem;
      margin: 0 0 1rem;
      color: var(--text-color);
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .welcome-description {
      color: var(--text-secondary);
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .stats {
      display: flex;
      justify-content: center;
      margin: 2rem 0;

      .stat-item {
        .stat-number {
          font-size: 3rem;
          font-weight: bold;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }
    }

    .instruction {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--hover-bg);
      border-radius: 8px;
      margin: 2rem 0;
      font-size: 1rem;
      color: var(--text-color);

      .instruction-icon {
        font-size: 1.5rem;
        animation: bounce-horizontal 2s ease infinite;
      }
    }

    .features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 2rem;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: var(--hover-bg);
        border-radius: 8px;
        font-size: 0.875rem;
        color: var(--text-color);
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }

        .feature-icon {
          font-size: 1.25rem;
        }
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes bounce-horizontal {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-5px);
  }
}

@media (max-width: 768px) {
  .welcome-page {
    .welcome-card {
      padding: 2rem 1.5rem;

      h2 {
        font-size: 1.5rem;
      }

      .stats .stat-item .stat-number {
        font-size: 2.5rem;
      }

      .features {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
