import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '릭 연습 | GuitarKit',
  description:
    '한 마디 듣고 한 마디 따라 치는 기타 릭 연습. TAB, 지판 가이드와 속도 조절로 짧은 프레이즈를 익힙니다.',
  alternates: { canonical: '/lick-practice' },
  openGraph: {
    title: '릭 연습 | GuitarKit',
    description: '한 마디 듣고 한 마디 따라 치는 기타 릭 연습.',
  },
  twitter: {
    title: '릭 연습 | GuitarKit',
    description: '한 마디 듣고 한 마디 따라 치는 기타 릭 연습.',
  },
}
export default function LickPracticeLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
