'use client'

import { useMemo, useState } from 'react'
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
import { RootNoteSelector } from '@/components/root-note-selector'
import { ScaleSelector } from '@/components/scale-selector'
import { SCALE_LABELS, type ScaleType } from '@/lib/music-utils'
import {
  SCALE_EXERCISES,
  buildExercise,
  getThreeNpsGrid,
} from '@/lib/scale-exercises'
import { useExercisePlayer, type SpeedUp } from '@/hooks/use-exercise-player'
import { useBpmControl } from '@/hooks/use-bpm-control'
import { cn } from '@/lib/utils'

const COUNTS = { 2: ['&'], 3: ['&', 'a'], 4: ['e', '&', 'a'] } as const
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']

export default function ScaleExercisesPage() {
  const [rootNote, setRootNote] = useState('C')
  const [scaleType, setScaleType] = useState<ScaleType>('major')
  const [exerciseId, setExerciseId] = useState<string>(SCALE_EXERCISES[0].id)
  const [speedUp, setSpeedUp] = useState<SpeedUp | null>(null)
  const exercise =
    SCALE_EXERCISES.find(e => e.id === exerciseId) ?? SCALE_EXERCISES[0]
  const grid = useMemo(
    () => getThreeNpsGrid(rootNote, scaleType),
    [rootNote, scaleType]
  )
  const notes = useMemo(() => buildExercise(grid, exercise), [grid, exercise])
  const { bpm, setBpm } = useBpmControl({
    initialBpm: 60,
    min: 40,
    max: 200,
    storageKey: 'guitarkit:exercise-bpm',
  })
  const player = useExercisePlayer(notes, exercise.perBeat, bpm, speedUp)
  const frame = player.frame
  const current = frame?.index != null ? notes[frame.index] : null
  const bar = 4 * exercise.perBeat
  const bars = Array.from({ length: notes.length / bar }, (_, i) =>
    notes.slice(i * bar, (i + 1) * bar)
  )
  const frets = grid.map(p => p.fret)
  const bpmOptions = (values: number[]) =>
    Array.from(new Set(values)).sort((a, b) => a - b)

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="스케일 시퀀스 · 홈으로"
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent-blue via-accent-teal to-accent-green">
                <Music className="w-6 h-6 text-background" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-balance">
                  스케일 시퀀스
                </h1>
                <p className="text-muted-foreground text-sm">
                  한 줄에 3음, 정해진 순서로 손에 익히기
                </p>
              </div>
            </Link>
            <ThemeToggle />
          </header>

          <section
            aria-label="연습 설정"
            className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-5"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium">근음</p>
              <RootNoteSelector
                rootNote={rootNote}
                onRootNoteChange={setRootNote}
                notationType="alphabetical"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">스케일</p>
              <ScaleSelector
                scaleType={scaleType}
                onScaleTypeChange={setScaleType}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">연습</p>
              <div className="flex flex-wrap gap-2" aria-label="연습 종류">
                {SCALE_EXERCISES.map(e => (
                  <Button
                    key={e.id}
                    variant={exercise.id === e.id ? 'default' : 'outline'}
                    aria-pressed={exercise.id === e.id}
                    className={cn(
                      'min-h-11',
                      exercise.id === e.id &&
                        'bg-accent-teal text-background hover:bg-accent-teal/90'
                    )}
                    onClick={() => setExerciseId(e.id)}
                  >
                    {e.label}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {exercise.description}
              </p>
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label htmlFor="exercise-bpm" className="text-sm font-medium">
                  시작 BPM
                </label>
                <Select
                  value={String(bpm)}
                  onValueChange={v => setBpm(Number(v))}
                >
                  <SelectTrigger id="exercise-bpm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bpmOptions([
                      ...Array.from({ length: 33 }, (_, i) => 40 + i * 5),
                      bpm,
                    ]).map(value => (
                      <SelectItem key={value} value={String(value)}>
                        {value} BPM
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="speed-every" className="text-sm font-medium">
                  템포 자동 증가
                </label>
                <Select
                  value={String(speedUp?.every ?? 0)}
                  onValueChange={v =>
                    setSpeedUp(
                      v === '0'
                        ? null
                        : {
                            step: 5,
                            max: Math.min(200, bpm + 40),
                            ...speedUp,
                            every: Number(v),
                          }
                    )
                  }
                >
                  <SelectTrigger id="speed-every" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">끔</SelectItem>
                    {[1, 2, 4].map(value => (
                      <SelectItem key={value} value={String(value)}>
                        {value}회 반복마다
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="speed-step" className="text-sm font-medium">
                  증가량
                </label>
                <Select
                  value={String(speedUp?.step ?? 5)}
                  disabled={!speedUp}
                  onValueChange={v =>
                    speedUp && setSpeedUp({ ...speedUp, step: Number(v) })
                  }
                >
                  <SelectTrigger id="speed-step" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 5, 10].map(value => (
                      <SelectItem key={value} value={String(value)}>
                        +{value} BPM
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="speed-max" className="text-sm font-medium">
                  목표 BPM
                </label>
                <Select
                  value={String(speedUp?.max ?? Math.min(200, bpm + 40))}
                  disabled={!speedUp}
                  onValueChange={v =>
                    speedUp && setSpeedUp({ ...speedUp, max: Number(v) })
                  }
                >
                  <SelectTrigger id="speed-max" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bpmOptions([
                      ...Array.from(
                        { length: Math.floor((200 - bpm) / 10) + 1 },
                        (_, i) => bpm + i * 10
                      ),
                      speedUp?.max ?? bpm,
                    ]).map(value => (
                      <SelectItem key={value} value={String(value)}>
                        {value} BPM
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              설정을 바꾸면 정지하고, 다시 시작할 때 1마디를 셉니다.
            </p>
          </section>

          <section
            aria-label="TAB 따라 치기"
            className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p
                  role="status"
                  aria-live="polite"
                  className="text-xl md:text-2xl font-semibold"
                >
                  {!player.playing
                    ? '준비됐나요?'
                    : frame && frame.loop > 0
                      ? `${frame.loop}번째 반복 · ${frame.bpm} BPM`
                      : '1마디 준비'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {rootNote} {SCALE_LABELS[scaleType]} · {exercise.label} ·{' '}
                  {bars.length}마디 반복
                </p>
              </div>
              <Button
                className={cn(
                  'min-h-11 min-w-28',
                  player.playing
                    ? 'bg-accent-orange text-background'
                    : 'bg-accent-teal text-background'
                )}
                disabled={
                  (!player.loaded && !player.playing) || notes.length === 0
                }
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

            {notes.length === 0 ? (
              <p className="text-sm">
                한 줄에 3음 연습은 7음 스케일에서만 할 수 있어요. 펜타토닉이
                아닌 스케일을 골라주세요.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {bars.map((barNotes, barIndex) => (
                  <div
                    key={barIndex}
                    tabIndex={0}
                    role="region"
                    aria-label={`${barIndex + 1}마디 TAB`}
                    className="overflow-x-auto rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <table className="table-fixed text-sm text-center font-mono">
                      <caption className="sr-only">
                        {barIndex + 1}마디. 숫자는 프렛 번호입니다.
                      </caption>
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="w-10 py-1 font-sans text-xs text-muted-foreground"
                          >
                            {barIndex + 1}
                          </th>
                          {barNotes.map((_, i) => (
                            <th
                              key={i}
                              scope="col"
                              className={cn(
                                'w-7 py-1 text-xs text-muted-foreground',
                                i % exercise.perBeat === 0 &&
                                  'border-l border-border'
                              )}
                            >
                              {i % exercise.perBeat === 0
                                ? i / exercise.perBeat + 1
                                : COUNTS[exercise.perBeat][
                                    (i % exercise.perBeat) - 1
                                  ]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {STRING_NAMES.map((name, stringIndex) => (
                          <tr key={stringIndex}>
                            <th
                              scope="row"
                              className="py-0.5 text-xs text-muted-foreground"
                            >
                              {name}
                            </th>
                            {barNotes.map((note, i) => {
                              const index = barIndex * bar + i
                              const active = frame?.index === index
                              return (
                                <td
                                  key={i}
                                  className={cn(
                                    'py-0.5 border-t border-border',
                                    i % exercise.perBeat === 0 && 'border-l',
                                    active && 'bg-accent-teal/15'
                                  )}
                                >
                                  {note?.stringIndex === stringIndex ? (
                                    <span
                                      className={cn(
                                        'inline-flex min-w-6 h-6 items-center justify-center rounded-md font-bold',
                                        active
                                          ? 'bg-accent-teal text-background'
                                          : 'text-foreground'
                                      )}
                                    >
                                      {note.fret}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      ·
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              숫자 = 누를 프렛 · 세로 줄 = 박. 위쪽이 가장 가는 1번 줄입니다.
              {exercise.perBeat === 3 &&
                ' 한 박에 3음을 고르게 1 & a로 세세요.'}
            </p>
          </section>

          {grid.length > 0 && (
            <section
              aria-label="지판 가이드"
              className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold">지판에서 위치 확인</h2>
              <p className="text-sm text-muted-foreground">
                {current
                  ? `${current.stringIndex + 1}번 줄 ${current.fret}프렛`
                  : '정지 상태에서는 지판을 눌러 음을 하나씩 들을 수 있습니다.'}
              </p>
              <Fretboard
                rootNote={rootNote}
                scaleType={scaleType}
                notationType="alphabetical"
                displayMode="scale"
                startFret={Math.max(0, Math.min(...frets) - 1)}
                frets={Math.max(...frets) + 1}
                playbackPosition={current}
                interactive={!player.playing}
              />
            </section>
          )}
          <p className="text-sm text-muted-foreground">
            기타는 표준 튜닝(E A D G B E)을 사용하세요. 다른 탭으로 이동하면
            연습이 정지됩니다.
          </p>
        </div>
      </main>
    </MotionConfig>
  )
}
