'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MotionConfig } from 'framer-motion'
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
import { LICKS, lickPitch } from '@/lib/licks'
import { useLickPlayer } from '@/hooks/use-lick-player'
import { useBpmControl } from '@/hooks/use-bpm-control'
import { cn } from '@/lib/utils'

const COUNTS = ['1', '&', '2', '&', '3', '&', '4', '&']

export default function LickPracticePage() {
  const [lickId, setLickId] = useState(LICKS[0].id)
  const lick = LICKS.find(l => l.id === lickId) ?? LICKS[0]
  const { bpm, setBpm } = useBpmControl({
    initialBpm: 70,
    min: 40,
    max: 140,
    storageKey: 'guitarkit:lick-bpm',
  })
  const player = useLickPlayer(lick, bpm)
  const phase = player.frame?.phase
  const responding = phase === 'respond'
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
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                GuitarKit 홈
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold mt-2">릭 연습</h1>
            </div>
            <ThemeToggle />
          </header>
          <p className="text-sm text-muted-foreground break-keep">
            릭은 짧은 연주 구절입니다. 한 마디를 듣고, 다음 한 마디에 그대로
            따라 쳐보세요.
          </p>

          <section
            aria-label="릭 연습 설정"
            className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4"
          >
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
                    {LICKS.map(l => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.title}
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
              A 마이너 펜타토닉 · 4/4박자 · 5–8프렛 · 벤딩 없는 입문 릭
            </p>
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
                <table className="w-full min-w-80 table-fixed text-sm text-center font-mono">
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
                                  'inline-flex w-7 h-7 items-center justify-center rounded-md',
                                  note
                                    ? active
                                      ? responding
                                        ? 'bg-accent-teal text-background font-bold'
                                        : 'bg-accent-orange text-background font-bold'
                                      : 'bg-muted text-foreground font-bold'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {note?.fret ?? (held ? '─' : '·')}
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
            </div>
          </section>

          <section
            aria-label="릭 지판 가이드"
            className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold">지판에서 위치 확인</h2>
            <p className="text-sm text-muted-foreground min-h-6">
              {player.frame?.note
                ? `${player.frame.note.stringIndex + 1}번 줄 ${player.frame.note.fret}프렛 · ${lickPitch(player.frame.note)}${responding ? ' · 직접 연주할 위치' : ''}`
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
              frets={8}
              playbackPosition={player.frame?.note}
              interactive={!player.playing}
            />
          </section>
          <p className="text-sm text-muted-foreground">
            직접 만든 연습용 릭입니다. 기타는 표준 튜닝(E A D G B E)을
            사용하세요. 다른 탭으로 이동하면 연습이 정지됩니다.
          </p>
        </div>
      </main>
    </MotionConfig>
  )
}
