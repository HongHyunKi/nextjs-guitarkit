import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Music } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Fretboard } from '@/components/fretboard'
import { PageFaq, ToolAnswer } from '@/components/page-faq'
import { SCALE_LABELS, noteToFixedSolfege } from '@/lib/music-utils'
import {
  SCALE_NAMES_KO,
  SCALE_PAGES,
  findScalePage,
  getScaleFacts,
  rootPositionText,
  scaleTitle,
  type ScalePage,
} from '@/lib/scale-pages'
import {
  breadcrumbLd,
  faqLd,
  pageMetadata,
  PUBLISHER_ID,
  WEBSITE_ID,
} from '@/lib/seo'
import { SITE_URL } from '@/lib/site'

export const dynamicParams = false
export const generateStaticParams = () =>
  SCALE_PAGES.map(({ slug }) => ({ slug }))

type Props = { params: Promise<{ slug: string }> }

const STRING_LABELS = [
  '1번 줄 (E)',
  '2번 줄 (B)',
  '3번 줄 (G)',
  '4번 줄 (D)',
  '5번 줄 (A)',
  '6번 줄 (E)',
]

function describe(page: ScalePage) {
  const facts = getScaleFacts(page)
  const name = scaleTitle(page)
  const notes = facts.notes.join(' ')
  const answer = `${name}(${page.root} ${SCALE_LABELS[page.scale]})의 구성음은 ${notes} ${facts.notes.length}개이며, 공식은 ${facts.formula.join(' ')}입니다.`
  const rootPositions = rootPositionText(facts)
  const faq: [string, string][] = [
    [
      `${name}의 구성음은 무엇인가요?`,
      `${notes} ${facts.notes.length}개입니다.`,
    ],
    [
      `${name}에는 샵이나 플랫이 몇 개 있나요?`,
      facts.altered.length === 0
        ? '샵(#)이나 플랫(b)이 붙는 음이 없습니다.'
        : `${facts.altered.length}개 음에 변화표가 붙습니다: ${facts.altered.join(', ')}.`,
    ],
    [
      `기타 지판에서 근음 ${page.root}는 어디에 있나요?`,
      `표준 튜닝 0~12프렛 기준으로 ${rootPositions}에 있습니다.`,
    ],
  ]
  if (facts.sameNotes.length > 0)
    faq.push([
      `${name}과 같은 구성음을 쓰는 스케일은 무엇인가요?`,
      `${facts.sameNotes.map(scaleTitle).join(', ')}이 같은 음을 씁니다. 시작음(근음)만 다릅니다.`,
    ])
  return { facts, name, answer, faq }
}

export async function generateMetadata({ params }: Props) {
  const page = findScalePage((await params).slug)
  if (!page) return {}
  const { facts, name } = describe(page)
  return pageMetadata(
    `/scales/${page.slug}`,
    `${name} 구성음과 기타 지판 위치 | GuitarKit`,
    `${name}(${page.root} ${SCALE_LABELS[page.scale]}) 구성음은 ${facts.notes.join(' ')}, 공식은 ${facts.formula.join(' ')}입니다. 기타 6현 0~12프렛 위치와 같은 구성음을 쓰는 스케일을 정리했습니다.`
  )
}

export default async function ScalePageView({ params }: Props) {
  const page = findScalePage((await params).slug)
  if (!page) notFound()
  const { facts, name, answer, faq } = describe(page)
  const path = `/scales/${page.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name,
        url: `${SITE_URL}${path}`,
        description: answer,
        inLanguage: 'ko-KR',
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': PUBLISHER_ID },
      },
      breadcrumbLd([
        ['기타 스케일 사전', '/scales'],
        [name, path],
      ]),
      faqLd(faq),
    ],
  }
  const sameRoot = SCALE_PAGES.filter(
    p => p.root === page.root && p.slug !== page.slug
  )

  return (
    <>
      <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex items-center justify-between gap-4">
            <Link
              href="/scales"
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent-blue via-accent-teal to-accent-green">
                <Music className="w-6 h-6 text-background" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-balance">
                  {name}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {page.root} {SCALE_LABELS[page.scale]} · 기타 스케일 사전
                </p>
              </div>
            </Link>
            <ThemeToggle />
          </header>
          <ToolAnswer text={answer} />

          <section
            aria-labelledby="notes-heading"
            className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4"
          >
            <h2 id="notes-heading" className="text-lg font-semibold">
              구성음
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="text-muted-foreground">
                    <th scope="row" className="py-2 text-left font-medium">
                      도수
                    </th>
                    {facts.formula.map((f, i) => (
                      <th key={i} scope="col" className="py-2 font-medium">
                        {f}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <th scope="row" className="py-2 text-left font-medium">
                      음 이름
                    </th>
                    {facts.notes.map((n, i) => (
                      <td
                        key={n}
                        className={
                          i === 0
                            ? 'py-2 font-bold text-accent-orange'
                            : 'py-2 font-bold'
                        }
                      >
                        {n}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <th scope="row" className="py-2 text-left font-medium">
                      계이름
                    </th>
                    {facts.notes.map(n => (
                      <td key={n} className="py-2">
                        {noteToFixedSolfege(n)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <th scope="row" className="py-2 text-left font-medium">
                      근음에서 반음
                    </th>
                    {facts.semitones.map((s, i) => (
                      <td key={i} className="py-2 text-muted-foreground">
                        {s}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section
            aria-labelledby="frets-heading"
            className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4"
          >
            <h2 id="frets-heading" className="text-lg font-semibold">
              기타 지판 위치 (표준 튜닝, 0~12프렛)
            </h2>
            <Fretboard
              rootNote={page.root}
              scaleType={page.scale}
              notationType="alphabetical"
              displayMode="scale"
              startFret={0}
              frets={12}
            />
            <table className="w-full text-sm">
              <caption className="sr-only">
                줄별 {name} 구성음 프렛 번호
              </caption>
              <tbody>
                {facts.strings.map((s, i) => (
                  <tr key={i} className="border-t border-border">
                    <th
                      scope="row"
                      className="py-2 pr-4 text-left font-medium whitespace-nowrap"
                    >
                      {STRING_LABELS[i]}
                    </th>
                    <td className="py-2 font-mono">
                      {s.frets.map(f => (
                        <span
                          key={f}
                          className={
                            s.rootFrets.includes(f)
                              ? 'mr-2 font-bold text-accent-orange'
                              : 'mr-2'
                          }
                        >
                          {f}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground">
              숫자는 프렛 번호, 주황색은 근음 {page.root}입니다. 지판의 음을
              누르면 소리를 들을 수 있습니다.
            </p>
          </section>

          <section
            aria-labelledby="links-heading"
            className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4"
          >
            <h2 id="links-heading" className="text-lg font-semibold">
              이어서 연습하기
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/guitar-scale"
                className="min-h-11 inline-flex items-center rounded-lg border border-accent-teal bg-accent-teal px-4 text-sm font-medium text-background"
              >
                지판에서 스케일 연습
              </Link>
              {facts.notes.length === 7 && (
                <Link
                  href="/scale-exercises"
                  className="min-h-11 inline-flex items-center rounded-lg border border-border px-4 text-sm font-medium"
                >
                  3연음·4음 시퀀스 연습
                </Link>
              )}
            </div>
            {facts.sameNotes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  같은 구성음을 쓰는 스케일
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {facts.sameNotes.map(p => (
                    <li key={p.slug}>
                      <Link
                        href={`/scales/${p.slug}`}
                        className="min-h-11 inline-flex items-center rounded-lg border border-border px-3 text-sm hover:border-accent-teal"
                      >
                        {scaleTitle(p)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {page.root} 근음의 다른 스케일
              </h3>
              <ul className="flex flex-wrap gap-2">
                {sameRoot.map(p => (
                  <li key={p.slug}>
                    <Link
                      href={`/scales/${p.slug}`}
                      className="min-h-11 inline-flex items-center rounded-lg border border-border px-3 text-sm hover:border-accent-teal"
                    >
                      {SCALE_NAMES_KO[p.scale]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
      <PageFaq faq={faq} jsonLd={jsonLd} />
    </>
  )
}
