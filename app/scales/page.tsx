import Link from 'next/link'
import { Music } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ToolAnswer } from '@/components/page-faq'
import { SCALE_LABELS, getScaleNotes, type ScaleType } from '@/lib/music-utils'
import { SCALE_NAMES_KO, SCALE_PAGES } from '@/lib/scale-pages'
import { breadcrumbLd, pageMetadata } from '@/lib/seo'

const ANSWER =
  '기타 스케일 사전은 근음 17개와 스케일 10종, 총 170개 스케일의 구성음·공식·기타 지판 위치를 한 페이지씩 정리한 무료 자료입니다.'

export const metadata = pageMetadata(
  '/scales',
  '기타 스케일 사전 — 170개 스케일 구성음과 지판 위치 | GuitarKit',
  '메이저, 마이너, 펜타토닉, 도리안 등 10종 스케일을 C부터 B까지 근음 17개로 정리했습니다. 스케일마다 구성음, 공식, 계이름, 기타 6현 0~12프렛 위치를 확인하세요.'
)

export default function ScalesIndexPage() {
  const scales = Object.keys(SCALE_LABELS) as ScaleType[]
  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            ...breadcrumbLd([['기타 스케일 사전', '/scales']]),
          }),
        }}
      />
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-accent-blue via-accent-teal to-accent-green">
              <Music className="w-6 h-6 text-background" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-balance">
                기타 스케일 사전
              </h1>
              <p className="text-muted-foreground text-sm">
                170개 스케일의 구성음과 지판 위치
              </p>
            </div>
          </Link>
          <ThemeToggle />
        </header>
        <ToolAnswer text={ANSWER} />
        {scales.map(scale => (
          <section
            key={scale}
            aria-labelledby={`${scale}-heading`}
            className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-3"
          >
            <h2 id={`${scale}-heading`} className="text-lg font-semibold">
              {SCALE_NAMES_KO[scale]} 스케일{' '}
              <span className="text-sm font-normal text-muted-foreground">
                {SCALE_LABELS[scale]} · C는{' '}
                {getScaleNotes('C', scale).join(' ')}
              </span>
            </h2>
            <ul className="flex flex-wrap gap-2">
              {SCALE_PAGES.filter(p => p.scale === scale).map(p => (
                <li key={p.slug}>
                  <Link
                    href={`/scales/${p.slug}`}
                    className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-border px-3 text-sm font-medium hover:border-accent-teal"
                  >
                    {p.root}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
