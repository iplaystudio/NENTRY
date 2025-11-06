import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { PROBLEMS, PATHS } from '../config/constants'
import { storage } from '../utils/helpers'

export const useProblemStore = defineStore('problem', () => {
  const problems = ref(PROBLEMS)
  const currentProblemId = ref(null)
  const problemContents = ref(new Map())
  const solutionContents = ref(new Map())
  const loading = ref(false)
  const error = ref(null)

  const currentProblem = computed(() => {
    if (!currentProblemId.value) return null
    return problems.value.find(p => p.id === currentProblemId.value)
  })

  const currentProblemContent = computed(() => {
    if (!currentProblemId.value) return ''
    return problemContents.value.get(currentProblemId.value) || ''
  })

  const currentSolutionContent = computed(() => {
    if (!currentProblemId.value) return ''
    return solutionContents.value.get(currentProblemId.value) || ''
  })

  async function selectProblem(problemId) {
    currentProblemId.value = problemId
    
    if (problemContents.value.has(problemId) && solutionContents.value.has(problemId)) {
      return
    }

    await Promise.all([
      loadProblemContent(problemId),
      loadSolutionContent(problemId)
    ])
  }

  async function loadProblemContent(problemId) {
    const problem = problems.value.find(p => p.id === problemId)
    if (!problem) return

    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}Problem/${problem.file}.md`)
      if (!response.ok) {
        console.error('加载失败:', response.status, response.statusText)
        throw new Error(`加载题目失败: ${response.status}`)
      }
      
      const content = await response.text()
      console.log(`📄 加载题目 ${problemId}:`, content.substring(0, 100))
      problemContents.value.set(problemId, content)
    } catch (err) {
      console.error('加载题目失败:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadSolutionContent(problemId) {
    const problem = problems.value.find(p => p.id === problemId)
    if (!problem) return

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}Solution/${problem.file}.c`)
      if (!response.ok) {
        console.error('加载题解失败:', response.status, response.statusText)
        throw new Error(`加载题解失败: ${response.status}`)
      }
      
      const content = await response.text()
      solutionContents.value.set(problemId, content)
    } catch (err) {
      console.error('加载题解失败:', err)
    }
  }

  function clearCache() {
    problemContents.value.clear()
    solutionContents.value.clear()
    problems.value.forEach(p => {
      storage.remove(`problem_${p.id}`)
      storage.remove(`solution_${p.id}`)
    })
  }

  return {
    problems,
    currentProblemId,
    loading,
    error,
    currentProblem,
    currentProblemContent,
    currentSolutionContent,
    selectProblem,
    clearCache
  }
})
