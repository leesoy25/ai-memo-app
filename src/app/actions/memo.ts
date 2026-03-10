'use server'

import { supabase } from '@/utils/supabase'
import { Memo, MemoFormData } from '@/types/memo'

/**
 * DB 행을 Memo 인터페이스로 변환
 */
function toMemo(row: {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * 모든 메모 조회 (최신순)
 */
export async function getMemos(): Promise<Memo[]> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('메모 조회 실패:', error.message)
    return []
  }

  return (data ?? []).map(toMemo)
}

/**
 * 특정 메모 조회
 */
export async function getMemoById(id: string): Promise<Memo | null> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('메모 조회 실패:', error.message)
    return null
  }

  return toMemo(data)
}

/**
 * 메모 생성
 */
export async function createMemo(formData: MemoFormData): Promise<Memo | null> {
  const { data, error } = await supabase
    .from('memos')
    .insert({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
    })
    .select()
    .single()

  if (error) {
    console.error('메모 생성 실패:', error.message)
    return null
  }

  return toMemo(data)
}

/**
 * 메모 수정
 */
export async function updateMemo(
  id: string,
  formData: MemoFormData
): Promise<Memo | null> {
  const { data, error } = await supabase
    .from('memos')
    .update({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('메모 수정 실패:', error.message)
    return null
  }

  return toMemo(data)
}

/**
 * 메모 삭제
 */
export async function deleteMemo(id: string): Promise<boolean> {
  const { error } = await supabase.from('memos').delete().eq('id', id)

  if (error) {
    console.error('메모 삭제 실패:', error.message)
    return false
  }

  return true
}

/**
 * 모든 메모 삭제
 */
export async function clearAllMemos(): Promise<boolean> {
  const { error } = await supabase.from('memos').delete().neq('id', '')

  if (error) {
    console.error('전체 메모 삭제 실패:', error.message)
    return false
  }

  return true
}

/**
 * 메모 요약 조회
 */
export async function getSummary(memoId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('memo_summaries')
    .select('summary')
    .eq('memo_id', memoId)
    .single()

  if (error) {
    // 요약이 없는 경우 null 반환 (에러가 아님)
    return null
  }

  return data?.summary ?? null
}

/**
 * 메모 요약 저장 (upsert)
 */
export async function saveSummary(
  memoId: string,
  summary: string
): Promise<boolean> {
  const { error } = await supabase
    .from('memo_summaries')
    .upsert(
      { memo_id: memoId, summary },
      { onConflict: 'memo_id' }
    )

  if (error) {
    console.error('요약 저장 실패:', error.message)
    return false
  }

  return true
}

/**
 * 메모 요약 삭제
 */
export async function deleteSummary(memoId: string): Promise<boolean> {
  const { error } = await supabase
    .from('memo_summaries')
    .delete()
    .eq('memo_id', memoId)

  if (error) {
    console.error('요약 삭제 실패:', error.message)
    return false
  }

  return true
}
