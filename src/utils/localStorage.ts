import { Memo } from '@/types/memo'

const STORAGE_KEY = 'memo-app-memos'
const SUMMARY_STORAGE_KEY = 'memo-app-summaries'

export const localStorageUtils = {
  // 모든 메모 가져오기
  getMemos: (): Memo[] => {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading memos from localStorage:', error)
      return []
    }
  },

  // 모든 메모 저장하기
  saveMemos: (memos: Memo[]): void => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memos))
    } catch (error) {
      console.error('Error saving memos to localStorage:', error)
    }
  },

  // 메모 추가
  addMemo: (memo: Memo): void => {
    const memos = localStorageUtils.getMemos()
    memos.unshift(memo) // 새 메모를 맨 앞에 추가
    localStorageUtils.saveMemos(memos)
  },

  // 메모 업데이트
  updateMemo: (updatedMemo: Memo): void => {
    const memos = localStorageUtils.getMemos()
    const index = memos.findIndex(memo => memo.id === updatedMemo.id)

    if (index !== -1) {
      memos[index] = updatedMemo
      localStorageUtils.saveMemos(memos)
    }
  },

  // 메모 삭제
  deleteMemo: (id: string): void => {
    const memos = localStorageUtils.getMemos()
    const filteredMemos = memos.filter(memo => memo.id !== id)
    localStorageUtils.saveMemos(filteredMemos)
  },

  // 메모 검색
  searchMemos: (query: string): Memo[] => {
    const memos = localStorageUtils.getMemos()
    const lowercaseQuery = query.toLowerCase()

    return memos.filter(
      memo =>
        memo.title.toLowerCase().includes(lowercaseQuery) ||
        memo.content.toLowerCase().includes(lowercaseQuery) ||
        memo.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  },

  // 카테고리별 메모 필터링
  getMemosByCategory: (category: string): Memo[] => {
    const memos = localStorageUtils.getMemos()
    return category === 'all'
      ? memos
      : memos.filter(memo => memo.category === category)
  },

  // 특정 메모 가져오기
  getMemoById: (id: string): Memo | null => {
    const memos = localStorageUtils.getMemos()
    return memos.find(memo => memo.id === id) || null
  },

  // 스토리지 클리어
  clearMemos: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  },

  // 메모 요약 저장
  saveSummary: (memoId: string, summary: string): void => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(SUMMARY_STORAGE_KEY)
      const summaries: Record<string, string> = stored
        ? JSON.parse(stored)
        : {}
      summaries[memoId] = summary
      localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summaries))
    } catch (error) {
      console.error('Error saving summary to localStorage:', error)
    }
  },

  // 메모 요약 조회
  getSummary: (memoId: string): string | null => {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(SUMMARY_STORAGE_KEY)
      if (!stored) return null
      const summaries: Record<string, string> = JSON.parse(stored)
      return summaries[memoId] || null
    } catch (error) {
      console.error('Error loading summary from localStorage:', error)
      return null
    }
  },

  // 메모 요약 삭제
  deleteSummary: (memoId: string): void => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(SUMMARY_STORAGE_KEY)
      if (!stored) return
      const summaries: Record<string, string> = JSON.parse(stored)
      delete summaries[memoId]
      localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summaries))
    } catch (error) {
      console.error('Error deleting summary from localStorage:', error)
    }
  },
}
