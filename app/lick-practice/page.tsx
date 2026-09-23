'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MotionConfig } from 'framer-motion'
import { Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme-toggle'
import { Fretboard } from '@/components/fretboard'
import {
  LICKS,
  LICK_GROUPS,
  lickGroup,
  lickTab,
  lickPosition,
  filterLicks,
} from '@/lib/licks'
import { useLickPlayer } from '@/hooks/use-lick-player'
import { useBpmControl } from '@/hooks/use-bpm-control'
import { cn } from '@/lib/utils'

const COUNTS = ['1', '&', '2', '&', '3', '&', '4', '&']

export default function LickPracticePage() {
  const [lickId, setLickId] = useState(LICKS[0].id)
  const [group, setGroup] = useState<string>('전체')
  const [recommendedOnly, setRecommendedOnly] = useState(true)
  const filtered = filterLicks(group, recommendedOnly)
  const lick = LICKS.find(l => l.id === lickId) ?? LICKS[0]
  const { bpm, setBpm } = useBpmControl({
    initialBpm: 70,
    min: 40,
    max: 140,
    storageKey: 'guitarkit:lick-bpm',
  })
  const player = useLickPlayer(lick, bpm)
  function changeFilter(nextGroup: string, nextRecommended: boolean) {
    const choices = filterLicks(nextGroup, nextRecommended)
    player.stop()
    setGroup(nextGroup)
    setRecommendedOnly(nextRecommended)
    if (!choices.some(l => l.id === lickId)) setLickId(choices[0].id)
  }
  const phase = player.frame?.phase
  const responding = phase === 'respond'
  const currentNote = player.frame?.note
  const position =
    currentNote && player.frame
      ? lickPosition(
          currentNote,
          (player.frame.tick + player.frame.fraction - currentNote.tick) /
            (currentNote.duration * 0.95)
        )
      : null
  const endFret = Math.max(
    8,
    ...lick.notes.flatMap(n => [n.fret, n.targetFret ?? n.fret])
  )
  const phaseLabel = !player.playing
    ? '준비됐나요?'
    : phase === 'listen'
      ? '먼저 들어보세요'
      : responding
        ? '이제 직접 쳐보세요'
        : '4박 준비'

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="릭 연습 · 홈으로"
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent-blue via-accent-teal to-accent-green">
                <Music className="w-6 h-6 text-background" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-balance">
                  릭 연습
                </h1>
                <p className="text-muted-foreground text-sm">
                  한 마디 듣고, 다음 한 마디에 따라 치기
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <p className="text-sm text-muted-foreground break-keep">
            릭은 짧은 연주 구절입니다. 한 마디를 듣고, 다음 한 마디에 그대로
            따라 쳐보세요.
          </p>

          <section
            aria-label="릭 연습 설정"
            className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={recommendedOnly ? 'default' : 'outline'}
                aria-pressed={recommendedOnly}
                className={cn(
                  'min-h-11',
                  recommendedOnly &&
                    'bg-accent-teal text-background hover:bg-accent-teal/90'
                )}
                onClick={() => changeFilter(group, !recommendedOnly)}
              >
                추천만
              </Button>
              <p className="text-sm text-muted-foreground" role="status">
                {recommendedOnly
                  ? '처음에는 추천 8개부터. 끄면 전체 릭을 볼 수 있어요.'
                  : `전체 ${LICKS.length}개 중 골라보세요.`}{' '}
                현재 {filtered.length}개
              </p>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="주법 필터">
              {LICK_GROUPS.map(value => (
                <Button
                  key={value}
                  variant={group === value ? 'default' : 'outline'}
                  className={cn(
                    'min-h-11',
                    group === value &&
                      'bg-accent-teal text-background hover:bg-accent-teal/90'
                  )}
                  aria-pressed={group === value}
                  onClick={() => changeFilter(value, recommendedOnly)}
                >
                  {value} {filterLicks(value, recommendedOnly).length}
                </Button>
              ))}
            </div>
            <div className="grid sm:grid-cols-[1fr_auto] gap-4">
              <div className="space-y-2">
                <label htmlFor="lick-choice" className="text-sm font-medium">
                  연습할 릭
                </label>
                <Select
                  value={lick.id}
                  onValueChange={v => {
                    player.stop()
                    setLickId(v)
                  }}
                >
                  <SelectTrigger id="lick-choice" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filtered.map(l => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.title}
                        {l.recommendation ? ' · 추천' : ''}
                        {l.style ? ` · ${l.style}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="lick-bpm" className="text-sm font-medium">
                  속도 · BPM
                </label>
                <Select
                  value={String(bpm)}
                  onValueChange={v => {
                    player.stop()
                    setBpm(Number(v))
                  }}
                >
                  <SelectTrigger id="lick-bpm" className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      new Set([
                        ...Array.from({ length: 21 }, (_, i) => 40 + i * 5),
                        bpm,
                      ])
                    )
                      .sort((a, b) => a - b)
                      .map(value => (
                        <SelectItem key={value} value={String(value)}>
                          {value} BPM
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm">
              A 마이너 펜타토닉 · 4/4박자 · 5–{endFret}프렛 · {lickGroup(lick)}
              {' · '}
              {lick.style ?? '기초 연습'}
            </p>
            {lick.recommendation && (
              <p className="text-sm">
                <span className="inline-block text-xs rounded-full px-2.5 py-0.5 bg-accent-teal/15 text-accent-teal border border-accent-teal/30 mr-2">
                  추천
                </span>
                {lick.recommendation}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {lick.description}. 릭이나 속도를 바꾸면 정지하고, 다시 시작할 때
              4박을 셉니다.
            </p>
          </section>

          <section
            aria-label="듣고 따라 치기"
            className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p
                  role="status"
                  aria-live="polite"
                  className="text-xl md:text-2xl font-semibold"
                >
                  {phaseLabel}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {player.frame && player.frame.round > 0
                    ? `${player.frame.round}번째 반복 · `
                    : ''}
                  듣기 1마디 → 내 차례 1마디
                </p>
              </div>
              <Button
                className={cn(
                  'min-h-11 min-w-28',
                  player.playing
                    ? 'bg-accent-orange text-background'
                    : 'bg-accent-teal text-background'
                )}
                disabled={!player.loaded && !player.playing}
                onClick={() =>
                  player.playing ? player.stop() : void player.start()
                }
              >
                {player.playing
                  ? '연습 정지'
                  : player.loaded
                    ? '연습 시작'
                    : '소리 준비 중…'}
              </Button>
            </div>
            {player.error && (
              <div role="alert" className="text-sm space-y-2">
                <p>{player.error}</p>
                <Button
                  variant="outline"
                  className="min-h-11"
                  onClick={player.retry}
                >
                  소리 다시 불러오기
                </Button>
              </div>
            )}
            <div className="grid grid-cols-4 gap-2" aria-label="4박 진행">
              {[1, 2, 3, 4].map(beat => (
                <div
                  key={beat}
                  aria-current={
                    player.frame?.beat === beat ? 'step' : undefined
                  }
                  className={cn(
                    'rounded-lg border border-border py-3 text-center font-mono font-semibold',
                    player.frame?.beat === beat
                      ? responding
                        ? 'bg-accent-teal text-background'
                        : 'bg-accent-orange text-background'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {beat}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              내 차례에는 기타 멜로디 없이 A·E 저음 반주와 클릭만 나옵니다.
              마이크를 사용하거나 연주를 채점하지 않습니다.
            </p>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">
                {lick.title} · 한 마디 TAB
              </h2>
              <div
                tabIndex={0}
                role="region"
                aria-label="릭 TAB, 좁은 화면에서는 좌우로 스크롤"
                className="overflow-x-auto rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-ring"
              >
                <table
                  className={cn(
                    'w-full table-fixed text-sm text-center font-mono',
                    lickGroup(lick) === '기본' ? 'min-w-80' : 'min-w-[40rem]'
                  )}
                >
                  <caption className="sr-only">
                    {lick.title}. 각 칸은 8분음표, 숫자는 프렛 번호입니다.
                  </caption>
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="w-12 py-2 font-sans text-xs text-muted-foreground"
                      >
                        줄
                      </th>
                      {COUNTS.map((count, tick) => (
                        <th
                          key={tick}
                          scope="col"
                          className="py-2 text-muted-foreground"
                        >
                          {count}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['e', 'B', 'G', 'D', 'A', 'E'].map((name, stringIndex) => (
                      <tr key={stringIndex}>
                        <th
                          scope="row"
                          className="py-2 text-xs text-muted-foreground"
                        >
                          {stringIndex + 1} {name}
                        </th>
                        {COUNTS.map((_, tick) => {
                          const note = lick.notes.find(
                            n =>
                              n.tick === tick && n.stringIndex === stringIndex
                          )
                          const held = lick.notes.some(
                            n =>
                              n.tick < tick &&
                              tick < n.tick + n.duration &&
                              n.stringIndex === stringIndex
                          )
                          const active =
                            phase !== 'count-in' && player.frame?.tick === tick
                          return (
                            <td
                              key={tick}
                              className={cn(
                                'relative py-2 border-t border-border',
                                active &&
                                  (responding
                                    ? 'bg-accent-teal/15'
                                    : 'bg-accent-orange/15')
                              )}
                            >
                              <span
                                className={cn(
                                  'inline-flex min-w-7 px-1 h-7 items-center justify-center rounded-md',
                                  note
                                    ? active
                                      ? responding
                                        ? 'bg-accent-teal text-background font-bold'
                                        : 'bg-accent-orange text-background font-bold'
                                      : 'bg-muted text-foreground font-bold'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {note ? lickTab(note) : held ? '─' : '·'}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground">
                숫자 = 누를 프렛 · ─ = 앞 음 유지 · 숫자·유지선이 모두 없는 세로
                칸 = 쉼. 1 & 2 & 3 & 4 &로 세세요. 위쪽이 가장 가는 1번
                줄입니다.
              </p>
              <p className="text-sm">{lick.tip}</p>
              <p className="text-sm text-muted-foreground">
                7b9 = 7프렛에서 한 음 벤딩 · r7 = 다시 원래 높이로 내리기 · 5/7
                = 5→7프렛 슬라이드 · 7\5 = 7→5프렛 슬라이드. 벤딩의 목표 숫자는
                음높이이며 손가락을 옮길 프렛이 아닙니다. 소리는 샘플의 음높이를
                바꾼 근사 표현입니다.
              </p>
            </div>
          </section>

          <section
            aria-label="릭 지판 가이드"
            className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold">지판에서 위치 확인</h2>
            <p className="text-sm text-muted-foreground min-h-20 sm:min-h-10 lg:min-h-5">
              {currentNote && position
                ? `${position.stringIndex + 1}번 줄 ${position.fret}프렛 · ${lickTab(currentNote)}${currentNote.technique === 'bend' || currentNote.technique === 'release' ? ' · ↑ 줄을 밀어 음높이 올리기 (프렛 유지)' : currentNote.technique === 'slide' ? ' · → 누른 채 이동' : ''}${responding ? ' · 직접 연주할 위치' : ''}`
                : player.playing
                  ? phase === 'count-in'
                    ? '박자를 세며 준비하세요.'
                    : '쉬는 구간입니다.'
                  : '정지 상태에서는 지판을 눌러 음을 하나씩 들을 수 있습니다.'}
            </p>
            <Fretboard
              rootNote="A"
              scaleType="minor-pentatonic"
              notationType="alphabetical"
              displayMode="scale"
              startFret={5}
              frets={endFret}
              playbackPosition={position}
              interactive={!player.playing}
            />
          </section>
          <p className="text-sm text-muted-foreground">
            록에서 쓰는 반복·하행·벤딩·여백을 익히도록 직접 만든 연습용
            릭입니다. 스타일 태그는 분위기 안내이며, 특정 밴드나 곡의 실제
            연주를 채보한 것이 아닙니다. 기타는 표준 튜닝(E A D G B E)을
            사용하세요. 다른 탭으로 이동하면 연습이 정지됩니다.
          </p>
        </div>
      </main>
    </MotionConfig>
  )
}
