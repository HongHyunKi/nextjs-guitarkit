'use client'

import Link from 'next/link'
import { motion, MotionConfig } from 'framer-motion'
import {
  AudioLines,
  BookOpen,
  Disc3,
  Gauge,
  Music,
  Timer,
  type LucideIcon,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

type Feature = {
  id: string
  icon: LucideIcon
  title: string
  description: string
  href: string | null // null이면 준비중
  accent: string // 아이콘 칩 틴트 (완성된 클래스 문자열 — DESIGN.md 참조)
}

const FEATURES: Feature[] = [
  {
    id: 'scale',
    icon: AudioLines,
    title: '스케일 연습',
    description:
      '6현 지판 위에 스케일을 시각화하고, CAGED 시스템과 실시간 사운드로 연습합니다.',
    href: '/guitar-scale',
    accent: 'bg-accent-teal/15 text-accent-teal border-accent-teal/30',
  },
  {
    id: 'lick-practice',
    icon: Music,
    title: '릭 연습',
    description:
      '한 마디 듣고, 다음 한 마디에 따라 쳐보세요. TAB과 지판 가이드로 짧은 연주 구절을 익힙니다.',
    href: '/lick-practice',
    accent: 'bg-accent-teal/15 text-accent-teal border-accent-teal/30',
  },
  {
    id: 'chords',
    icon: BookOpen,
    title: '코드사전',
    description:
      '코드 구성음과 운지법을 다이어그램으로 확인하고 소리로 들어봅니다.',
    href: '/chords',
    accent: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
  },
  {
    id: 'metronome',
    icon: Timer,
    title: '메트로놈',
    description: 'BPM과 박자를 설정해 리듬 연습을 합니다.',
    href: '/metronome',
    accent: 'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
  },
  {
    id: 'tuner',
    icon: Gauge,
    title: '튜너',
    description: '마이크로 실시간 피치를 감지해 정확하게 튜닝합니다.',
    href: '/tuner',
    accent: 'bg-accent-green/15 text-accent-green border-accent-green/30',
  },
  {
    id: 'jam-track',
    icon: Disc3,
    title: '잼 트랙',
    description:
      '루트와 스케일을 고르고 스타일별 백킹 트랙에 맞춰 즉흥 연주합니다.',
    href: '/jam-track',
    accent: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
  },
]

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen bg-background text-foreground p-4 md:p-8">
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <ThemeToggle />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] space-y-12 py-16">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent-blue via-accent-teal to-accent-green">
              <Music className="w-8 h-8 text-background" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-balance">
              GuitarKit
            </h1>
            <p className="text-base text-muted-foreground max-w-md text-balance">
              기타 연습에 필요한 건 여기 다 있을걸요
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              >
                <FeatureCard feature={feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </MotionConfig>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const isReady = feature.href !== null
  const Icon = feature.icon

  const inner = (
    <div
      className={`h-full bg-card border border-border rounded-xl p-6 transition-all ${
        isReady
          ? 'hover:border-accent-teal/50 hover:-translate-y-0.5 group-focus-visible:border-accent-teal'
          : 'opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg border ${feature.accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        {isReady ? (
          <span className="text-xs rounded-full px-2.5 py-0.5 bg-accent-teal/15 text-accent-teal border border-accent-teal/30">
            바로 시작
          </span>
        ) : (
          <span className="text-xs rounded-full px-2.5 py-0.5 bg-muted text-muted-foreground">
            준비중
          </span>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-2">{feature.title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {feature.description}
      </p>
    </div>
  )

  if (isReady && feature.href) {
    return (
      <Link
        href={feature.href}
        className="group block h-full outline-none rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={`${feature.title} 시작하기`}
      >
        {inner}
      </Link>
    )
  }

  return (
    <div aria-label={`${feature.title} — 준비중`} className="h-full">
      {inner}
    </div>
  )
}
