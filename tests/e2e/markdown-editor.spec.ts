import { test, expect } from '@playwright/test'

test.describe('마크다운 에디터 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('새 메모 작성 시 마크다운 에디터가 로드된다', async ({ page }) => {
    // 새 메모 버튼 클릭
    await page.getByRole('button', { name: '새 메모' }).click()

    // 모달이 열리고 에디터가 로드될 때까지 대기
    await expect(page.getByText('새 메모 작성')).toBeVisible()
    await expect(page.getByTestId('markdown-editor')).toBeVisible()

    // 에디터 툴바 버튼들이 존재하는지 확인
    await expect(
      page.getByRole('button', { name: /Add bold text/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Add italic text/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Insert title/i })
    ).toBeVisible()

    // 마크다운 지원 라벨 표시 확인
    await expect(page.getByText('내용 * (마크다운 지원)')).toBeVisible()
  })

  test('마크다운 에디터에서 실시간 프리뷰가 동작한다', async ({ page }) => {
    // 새 메모 버튼 클릭
    await page.getByRole('button', { name: '새 메모' }).click()
    await expect(page.getByTestId('markdown-editor')).toBeVisible()

    // 에디터의 CodeMirror textarea에 마크다운 입력
    const editorTextarea = page
      .getByTestId('markdown-editor')
      .locator('.w-md-editor-text-input')
    await editorTextarea.click()
    await editorTextarea.fill('# 제목 테스트\n\n**굵은 글씨**')

    // 프리뷰 영역에서 렌더링 확인
    const previewArea = page
      .getByTestId('markdown-editor')
      .locator('.wmde-markdown')
    await expect(previewArea.locator('h1')).toContainText('제목 테스트')
    await expect(previewArea.locator('strong')).toContainText('굵은 글씨')
  })

  test('마크다운 헤딩 스타일이 정상 적용된다', async ({ page }) => {
    // 새 메모 버튼 클릭
    await page.getByRole('button', { name: '새 메모' }).click()
    await expect(page.getByTestId('markdown-editor')).toBeVisible()

    // 에디터에 다양한 헤딩 입력
    const editorTextarea = page
      .getByTestId('markdown-editor')
      .locator('.w-md-editor-text-input')
    await editorTextarea.click()
    await editorTextarea.fill(
      '# 헤딩 1\n\n## 헤딩 2\n\n### 헤딩 3\n\n일반 텍스트'
    )

    // 프리뷰 영역에서 헤딩 렌더링 확인
    const previewArea = page
      .getByTestId('markdown-editor')
      .locator('.wmde-markdown')

    const h1 = previewArea.locator('h1')
    const h2 = previewArea.locator('h2')
    const h3 = previewArea.locator('h3')

    await expect(h1).toContainText('헤딩 1')
    await expect(h2).toContainText('헤딩 2')
    await expect(h3).toContainText('헤딩 3')

    // 헤딩 폰트 크기가 구분되는지 확인
    const h1FontSize = await h1.evaluate(
      (el) => window.getComputedStyle(el).fontSize
    )
    const h2FontSize = await h2.evaluate(
      (el) => window.getComputedStyle(el).fontSize
    )
    const h3FontSize = await h3.evaluate(
      (el) => window.getComputedStyle(el).fontSize
    )

    // h1 > h2 > h3 크기 순서 검증
    expect(parseFloat(h1FontSize)).toBeGreaterThan(parseFloat(h2FontSize))
    expect(parseFloat(h2FontSize)).toBeGreaterThan(parseFloat(h3FontSize))
  })

  test('마크다운 리스트, 인용문, 코드 프리뷰가 동작한다', async ({ page }) => {
    await page.getByRole('button', { name: '새 메모' }).click()
    await expect(page.getByTestId('markdown-editor')).toBeVisible()

    const editorTextarea = page
      .getByTestId('markdown-editor')
      .locator('.w-md-editor-text-input')
    await editorTextarea.click()
    await editorTextarea.fill(
      '- 항목 1\n- 항목 2\n- 항목 3\n\n> 인용문입니다\n\n`인라인 코드`'
    )

    const previewArea = page
      .getByTestId('markdown-editor')
      .locator('.wmde-markdown')

    // 순서 없는 리스트 확인
    await expect(previewArea.locator('ul')).toBeVisible()
    await expect(previewArea.locator('li').first()).toContainText('항목 1')

    // 인용문 확인
    await expect(previewArea.locator('blockquote')).toContainText(
      '인용문입니다'
    )

    // 인라인 코드 확인
    await expect(previewArea.locator('code')).toContainText('인라인 코드')
  })

  test('마크다운 메모를 저장하고 상세 보기에서 렌더링된다', async ({
    page,
  }) => {
    // 새 메모 작성
    await page.getByRole('button', { name: '새 메모' }).click()
    await expect(page.getByTestId('markdown-editor')).toBeVisible()

    // 제목 입력
    await page.getByRole('textbox', { name: '제목' }).fill('마크다운 테스트 메모')

    // 마크다운 내용 입력
    const editorTextarea = page
      .getByTestId('markdown-editor')
      .locator('.w-md-editor-text-input')
    await editorTextarea.click()
    await editorTextarea.fill(
      '# 프로젝트 개요\n\n## 목표\n\n- 마크다운 지원\n- 실시간 프리뷰\n\n**중요한 내용**입니다.'
    )

    // 저장
    await page.getByRole('button', { name: '저장하기' }).click()

    // 모달이 닫힌 후, 메모 목록에서 새로 생성된 메모 확인
    await expect(page.getByText('마크다운 테스트 메모')).toBeVisible()

    // 메모 카드 클릭하여 상세 보기
    await page.getByText('마크다운 테스트 메모').click()

    // 상세 모달에서 마크다운 프리뷰 확인
    await expect(page.getByTestId('memo-detail-modal')).toBeVisible()
    const detailPreview = page
      .getByTestId('memo-detail-modal')
      .getByTestId('markdown-preview')
    await expect(detailPreview).toBeVisible()

    // 마크다운이 렌더링되었는지 확인
    await expect(
      detailPreview.locator('.wmde-markdown h1')
    ).toContainText('프로젝트 개요')
    await expect(
      detailPreview.locator('.wmde-markdown h2')
    ).toContainText('목표')
    await expect(
      detailPreview.locator('.wmde-markdown ul')
    ).toBeVisible()
    await expect(
      detailPreview.locator('.wmde-markdown strong')
    ).toContainText('중요한 내용')
  })

  test('기존 메모 편집 시 마크다운 에디터에 기존 내용이 표시된다', async ({
    page,
  }) => {
    // 기존 메모의 편집 버튼 클릭
    const firstEditBtn = page.getByRole('button', { name: '편집' }).first()
    await firstEditBtn.click()

    // 편집 모달이 열리고 에디터에 기존 내용이 있는지 확인
    await expect(page.getByText('메모 편집')).toBeVisible()
    await expect(page.getByTestId('markdown-editor')).toBeVisible()

    // 에디터에 기존 텍스트가 있는지 확인
    const editorTextarea = page
      .getByTestId('markdown-editor')
      .locator('.w-md-editor-text-input')
    const currentValue = await editorTextarea.inputValue()
    expect(currentValue.length).toBeGreaterThan(0)
  })

  test('목록 카드에서 마크다운 기호가 제거되어 표시된다', async ({ page }) => {
    // 새 메모 작성 (마크다운 포함)
    await page.getByRole('button', { name: '새 메모' }).click()
    await expect(page.getByTestId('markdown-editor')).toBeVisible()

    await page
      .getByRole('textbox', { name: '제목' })
      .fill('기호제거 테스트')

    const editorTextarea = page
      .getByTestId('markdown-editor')
      .locator('.w-md-editor-text-input')
    await editorTextarea.click()
    await editorTextarea.fill('# 헤딩은 제거\n\n**굵은글씨도** 일반텍스트로')

    await page.getByRole('button', { name: '저장하기' }).click()

    // 목록 카드에서 마크다운 기호가 없는 텍스트 확인
    const memoCard = page
      .getByTestId('memo-card')
      .filter({ hasText: '기호제거 테스트' })
    await expect(memoCard).toBeVisible()

    // 카드 미리보기에서 # 기호가 없어야 함
    const cardContent = await memoCard
      .locator('p.line-clamp-3')
      .textContent()
    expect(cardContent).not.toContain('# ')
    expect(cardContent).not.toContain('**')
  })

  test('에디터 모드 전환 버튼이 동작한다', async ({ page }) => {
    await page.getByRole('button', { name: '새 메모' }).click()
    await expect(page.getByTestId('markdown-editor')).toBeVisible()

    // Edit 모드 버튼 클릭
    await page
      .getByRole('button', { name: /Edit code/i })
      .click()

    // Preview 모드 버튼 클릭
    await page
      .getByRole('button', { name: /Preview code/i })
      .click()

    // Live 모드 버튼 클릭 (기본)
    await page
      .getByRole('button', { name: /Live code/i })
      .click()
  })
})
