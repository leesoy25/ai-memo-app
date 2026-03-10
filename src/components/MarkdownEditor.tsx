'use client'

import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
      에디터 로딩 중...
    </div>
  ),
})

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 300,
}: MarkdownEditorProps) {
  return (
    <div data-color-mode="light" data-testid="markdown-editor">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={height}
        preview="live"
        visibleDragbar={false}
      />
    </div>
  )
}
