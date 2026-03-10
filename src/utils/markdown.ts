/**
 * 마크다운 문법 기호를 제거하여 plaintext로 변환한다.
 * 목록 카드 미리보기 등에서 마크다운 기호 없이 깔끔하게 표시하기 위해 사용한다.
 */
export function stripMarkdown(markdown: string): string {
  return (
    markdown
      // 헤더 (#, ##, ### 등)
      .replace(/^#{1,6}\s+/gm, '')
      // 볼드/이탤릭 (**text**, *text*, __text__, _text_)
      .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2')
      // 취소선 (~~text~~)
      .replace(/~~(.*?)~~/g, '$1')
      // 인라인 코드 (`code`)
      .replace(/`([^`]+)`/g, '$1')
      // 코드 블록 (```...```)
      .replace(/```[\s\S]*?```/g, '')
      // 링크 ([text](url))
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // 이미지 (![alt](url))
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // 인용 (> text)
      .replace(/^\s*>\s+/gm, '')
      // 수평선 (---, ***, ___)
      .replace(/^[-*_]{3,}\s*$/gm, '')
      // 순서 없는 목록 기호 (-, *, +)
      .replace(/^\s*[-*+]\s+/gm, '')
      // 순서 있는 목록 기호 (1., 2., ...)
      .replace(/^\s*\d+\.\s+/gm, '')
      // 연속된 빈 줄 정리
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}
