'use client'

import dynamic from 'next/dynamic'

const MDPreview = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  {
    ssr: false,
    loading: () => (
      <div className="text-gray-400 text-sm">마크다운 로딩 중...</div>
    ),
  }
)

interface MarkdownPreviewProps {
  source: string
}

export default function MarkdownPreview({ source }: MarkdownPreviewProps) {
  return (
    <div data-color-mode="light" data-testid="markdown-preview">
      <MDPreview source={source} />
    </div>
  )
}
