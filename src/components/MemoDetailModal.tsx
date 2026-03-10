'use client'

import { useState, useEffect, useCallback } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import MarkdownPreview from '@/components/MarkdownPreview'
import {
  getSummary as fetchSummary,
  saveSummary as serverSaveSummary,
} from '@/app/actions/memo'

interface MemoDetailModalProps {
  memo: Memo | null
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoDetailModal({
  memo,
  onClose,
  onEdit,
  onDelete,
}: MemoDetailModalProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (memo) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [memo, handleKeyDown])

  useEffect(() => {
    setSummaryError(null)
    setIsSummarizing(false)

    if (memo?.id) {
      const loadSummary = async () => {
        const savedSummary = await fetchSummary(memo.id)
        setSummary(savedSummary)
      }
      loadSummary()
    } else {
      setSummary(null)
    }
  }, [memo?.id])

  const handleSummarize = useCallback(async () => {
    if (!memo || isSummarizing) return

    setIsSummarizing(true)
    setSummaryError(null)
    setSummary(null)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: memo.content }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSummaryError(data.error || '요약 중 오류가 발생했습니다.')
        return
      }

      setSummary(data.summary)
      await serverSaveSummary(memo.id, data.summary)
    } catch {
      setSummaryError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSummarizing(false)
    }
  }, [memo, isSummarizing])

  if (!memo) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
      onClose()
    }
  }

  const handleEdit = () => {
    onEdit(memo)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      data-testid="memo-detail-backdrop"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        data-testid="memo-detail-modal"
      >
        {/* 헤더 */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {memo.title}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
              >
                {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                  memo.category}
              </span>
              <span className="text-xs text-gray-500">
                작성: {formatDate(memo.createdAt)}
              </span>
              {memo.createdAt !== memo.updatedAt && (
                <span className="text-xs text-gray-500">
                  수정: {formatDate(memo.updatedAt)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
            data-testid="memo-detail-close-btn"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 본문 (마크다운 렌더링) */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none text-gray-700">
            <MarkdownPreview source={memo.content} />
          </div>

          {/* 태그 */}
          {memo.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex gap-2 flex-wrap">
                {memo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI 요약 섹션 */}
        <div className="px-6 pb-4">
          {!summary && !isSummarizing && !summaryError && (
            <button
              onClick={handleSummarize}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 rounded-lg transition-all font-medium text-sm shadow-sm"
              data-testid="memo-summary-btn"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              AI 요약
            </button>
          )}

          {isSummarizing && (
            <div
              className="flex items-center justify-center gap-3 py-4 text-purple-600"
              data-testid="memo-summary-loading"
            >
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm font-medium">요약 중...</span>
            </div>
          )}

          {summaryError && (
            <div
              className="rounded-lg bg-red-50 border border-red-200 p-4"
              data-testid="memo-summary-error"
            >
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-red-700">{summaryError}</p>
                  <button
                    onClick={handleSummarize}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium underline"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}

          {summary && (
            <div
              className="rounded-lg bg-purple-50 border border-purple-200 p-4"
              data-testid="memo-summary-result"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <h4 className="text-sm font-semibold text-purple-800">
                    AI 요약
                  </h4>
                </div>
                <button
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-md transition-colors disabled:opacity-50"
                  data-testid="memo-resummarize-btn"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  다시 요약
                </button>
              </div>
              <p className="text-sm text-purple-900 leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            </div>
          )}
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={handleEdit}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium text-sm"
            data-testid="memo-detail-edit-btn"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            편집
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
            data-testid="memo-detail-delete-btn"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
