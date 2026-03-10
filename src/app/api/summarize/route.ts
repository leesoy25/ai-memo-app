import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { content } = body as { content: string }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '요약할 메모 내용이 비어있습니다.' },
        { status: 400 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `다음 메모 내용을 한국어로 간결하게 3~5문장 이내로 요약해주세요. 핵심 내용만 포함하세요.

메모 내용:
${content}

요약:`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 512,
      },
    })

    const summary = response.text

    if (!summary) {
      return NextResponse.json(
        { error: '요약 결과를 생성하지 못했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('메모 요약 API 오류:', error)
    return NextResponse.json(
      { error: '메모 요약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
