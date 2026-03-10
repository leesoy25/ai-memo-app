import './globals.css'
import { Geist } from 'next/font/google'
import type { Metadata } from 'next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '404 - 페이지를 찾을 수 없습니다',
  description: '요청하신 페이지를 찾을 수 없습니다.',
}

export default function GlobalNotFound() {
  return (
    <html lang="ko" className={geistSans.variable}>
      <body className="antialiased">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              페이지를 찾을 수 없습니다
            </h2>
            <p className="text-gray-500 mb-6">
              요청하신 페이지가 존재하지 않거나 이동되었습니다.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
