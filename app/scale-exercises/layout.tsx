import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '스케일 시퀀스 | GuitarKit',
  description:
    '3연음 런, 4음 시퀀스, 3도 음정을 TAB과 지판 가이드로 연습하고 템포 자동 증가로 속도를 올립니다.',
  alternates: { canonical: '/scale-exercises' },
  openGraph: {
    title: '스케일 시퀀스 | GuitarKit',
    description: '3연음 런, 4음 시퀀스, 3도 음정 스케일 연습.',
  },
  twitter: {
    title: '스케일 시퀀스 | GuitarKit',
    description: '3연음 런, 4음 시퀀스, 3도 음정 스케일 연습.',
  },
}
export default function ScaleExercisesLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
