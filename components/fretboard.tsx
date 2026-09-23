'use client'

import { useEffect, useMemo, useRef } from 'react'
import { DisplayMode, noteVisibility } from '@/lib/practice-settings'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  noteToFixedSolfege,
  noteToInterval,
  getNoteFromFret,
  getNoteIndex,
  getPitchFromFret,
  getScaleNotes,
  isScaleFlat,
  ScaleType,
  NotationType,
} from '@/lib/music-utils'
import {
  CAGEDShape,
  CAGEDSelection,
  isInCAGEDShape,
  supportsCAGED,
} from '@/lib/caged-utils'
import { GuitarTone, useGuitarSampler } from '@/lib/guitar-sampler'
import { samePosition, type QuizPosition } from '@/lib/note-quiz'

export type { GuitarTone }

interface FretboardProps {
  quiz?: {
    answers: QuizPosition[]
    answerNote?: string
    marker?: QuizPosition
    reference?: QuizPosition
    guess: QuizPosition | null
    revealed: boolean
    onGuess: (position: QuizPosition) => void
  }
  displayMode?: DisplayMode
  highlightedNote?: number | null
  chordTones?: string[]
  playbackPosition?: QuizPosition | null
  interactive?: boolean
  rootNote: string
  scaleType: ScaleType
  notationType: NotationType
  startFret?: number
  frets?: number
  cagedEnabled?: boolean
  selectedCAGEDShape?: CAGEDSelection
  guitarTone?: GuitarTone
}

const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E'] // 고음현부터 저음현 순

export function Fretboard({
  rootNote,
  scaleType,
  notationType,
  startFret = 0,
  frets = 24,
  cagedEnabled = false,
  selectedCAGEDShape = 'all',
  guitarTone = 'electric',
  displayMode = 'scale',
  highlightedNote = null,
  quiz,
  chordTones,
  playbackPosition,
  interactive = true,
}: FretboardProps) {
  const { play } = useGuitarSampler(guitarTone)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const dragged = useRef(false)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = 0
  }, [startFret, frets])

  const scaleNotes = useMemo(
    () => getScaleNotes(rootNote, scaleType),
    [rootNote, scaleType]
  )

  const allFrets = useMemo(
    () =>
      Array.from({ length: frets - startFret + 1 }, (_, i) => i + startFret),
    [frets, startFret]
  )

  const playNote = (stringIndex: number, fret: number) => {
    const pitch = getPitchFromFret(
      stringIndex,
      fret,
      isScaleFlat(rootNote, scaleType)
    )
    play(pitch, '2n')
  }

  const getDisplayNote = (note: string) => {
    if (notationType === 'syllabic') {
      return noteToFixedSolfege(note)
    } else if (notationType === 'intervals') {
      return noteToInterval(note, chordTones?.[0] ?? rootNote)
    }
    return note
  }

  // 해당 프렛이 선택된 shape의 활성 범위에 속하는지
  const isActiveNote = (stringIndex: number, fret: number): boolean => {
    if (
      displayMode === 'all' ||
      !cagedEnabled ||
      !supportsCAGED(scaleType) ||
      selectedCAGEDShape === 'all'
    )
      return true
    return isInCAGEDShape(
      stringIndex,
      fret,
      rootNote,
      scaleType,
      selectedCAGEDShape as CAGEDShape
    )
  }

  // 활성 노트의 색상
  const getNoteColorClass = (isRoot: boolean): string => {
    if (isRoot)
      return 'bg-accent-orange text-background shadow-lg shadow-accent-orange/40'
    return 'bg-accent-teal text-background shadow-md shadow-accent-teal/30'
  }

  // 프렛별 세로선 스타일 (12=옥타브, 나머지=일반, 0=너트는 별도 처리)
  const getFretBorderClass = (fret: number) => {
    if (fret === 0) return ''
    if (fret === 12) return 'border-r-2 border-accent-orange/70'
    return 'border-r-2 border-border'
  }

  // 프렛이 높아질수록 좁아지되 터치 영역과 강조 테두리를 확보한다.
  const getFretWidth = (fret: number): number => {
    if (fret === 0) return 52
    return Math.max(52, Math.round(72 * Math.pow(0.965, fret - 1)))
  }

  // 0프렛(너트)은 항상 고정폭. 나머지는 .fret-col(globals.css)이 브레이크포인트별로
  // 처리 — 모바일은 고정폭+스크롤, xl 이상은 비율대로 컨테이너를 꽉 채움
  const getFretColumnStyle = (fret: number): React.CSSProperties => {
    if (fret === 0) return { width: 52, flexShrink: 0 }
    const w = getFretWidth(fret)
    return { '--fret-w': `${w}px`, '--fret-grow': w } as React.CSSProperties
  }

  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground mb-3">
        표시 범위 {startFret}–{frets}프렛 · 지판이 잘리면 좌우로 스크롤하세요.
      </p>
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="기타 지판, 좌우로 스크롤"
        className="w-full overflow-x-auto pt-1 pb-4 custom-scrollbar focus-visible:outline-2 focus-visible:outline-ring"
        onPointerDown={e => {
          pointerStart.current = { x: e.clientX, y: e.clientY }
          dragged.current = false
        }}
        onPointerMove={e => {
          if (
            pointerStart.current &&
            Math.hypot(
              e.clientX - pointerStart.current.x,
              e.clientY - pointerStart.current.y
            ) > 8
          )
            dragged.current = true
        }}
        onPointerCancel={() => {
          dragged.current = true
          pointerStart.current = null
        }}
        onPointerUp={() => {
          pointerStart.current = null
        }}
      >
        <div
          className="w-full flex flex-col"
          style={{
            minWidth:
              64 + allFrets.reduce((sum, fret) => sum + getFretWidth(fret), 0),
          }}
        >
          {/* 2. 지판 본체 */}
          <div className="flex flex-col">
            {STRINGS.map((openString, stringIndex) => (
              <div
                key={`string-${stringIndex}`}
                className="flex items-stretch h-12"
              >
                <div className="sticky left-0 z-20 w-16 shrink-0 flex items-center justify-center gap-1 bg-card border-r border-border text-xs">
                  <span>{stringIndex + 1}줄</span>
                  <span className="font-mono font-semibold">{openString}</span>
                </div>
                {allFrets.map(fret => {
                  const useFlat = isScaleFlat(rootNote, scaleType)
                  const chromaticNote = getNoteFromFret(
                    openString,
                    fret,
                    useFlat
                  )
                  const scaleNote = scaleNotes.find(
                    n => getNoteIndex(n) === getNoteIndex(chromaticNote)
                  )
                  const chordNote = chordTones?.find(
                    n => getNoteIndex(n) === getNoteIndex(chromaticNote)
                  )
                  const note = chordNote ?? scaleNote ?? chromaticNote
                  const inScale = scaleNote !== undefined
                  const isRoot = getNoteIndex(note) === getNoteIndex(rootNote)
                  const active = isActiveNote(stringIndex, fret)
                  const { visible, highlighted } = noteVisibility(
                    displayMode,
                    inScale,
                    note,
                    highlightedNote
                  )
                  const isOpenString = fret === 0
                  const playingHere =
                    playbackPosition &&
                    samePosition(playbackPosition, { stringIndex, fret })
                  const quizAnswer =
                    quiz?.revealed &&
                    quiz.answers.some(p =>
                      samePosition(p, { stringIndex, fret })
                    )
                  const quizMarker =
                    quiz?.marker &&
                    samePosition(quiz.marker, { stringIndex, fret })
                  const quizReference =
                    quiz?.reference &&
                    samePosition(quiz.reference, { stringIndex, fret })
                  const quizGuess =
                    quiz?.guess?.stringIndex === stringIndex &&
                    quiz.guess.fret === fret
                  const hideName = quiz && !quiz.revealed
                  const displayNote = quizAnswer
                    ? (quiz?.answerNote ?? note)
                    : note

                  return (
                    <div
                      key={`fret-${stringIndex}-${fret}`}
                      className={cn(
                        'relative flex items-center justify-center',
                        fret !== 0 && 'fret-col',
                        getFretBorderClass(fret)
                      )}
                      style={getFretColumnStyle(fret)}
                    >
                      {/* 현(String) 가로선 (0프렛 왼쪽은 표시 안 함) */}
                      {!isOpenString && (
                        <div
                          className="absolute top-1/2 left-0 right-0 bg-muted-foreground/50 pointer-events-none"
                          style={{ height: `${1.5 + stringIndex * 0.3}px` }}
                        />
                      )}

                      {/* 0프렛 너트 세로선 (오른쪽 끝 = 1프렛 경계) */}
                      {isOpenString && (
                        <div className="absolute inset-y-0 right-0 w-[6px] bg-foreground/90 pointer-events-none" />
                      )}

                      {/* 활성 노트 (0프렛 포함, 동일 UI) */}
                      {(quiz || chordNote || visible || playingHere) && (
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={!interactive}
                          aria-label={
                            quiz
                              ? `${stringIndex + 1}번 줄 ${fret}프렛${hideName ? '' : ` ${displayNote}`}${quizAnswer ? ', 정답 위치' : ''}${quizGuess ? ', 선택한 위치' : ''}${quizMarker ? ', 문제 위치' : ''}${quizReference ? ', 기준점 R' : ''}`
                              : `${stringIndex + 1}번 줄 ${fret}프렛 ${note}${playingHere ? ', 현재 릭 위치' : ''}${chordNote ? ', 재생 중 코드톤' : ''}${!active && inScale ? ', 다른 포지션' : ''}${highlighted ? ', 찾는 음' : ''}`
                          }
                          onClick={e => {
                            if (e.detail === 0 || !dragged.current) {
                              quiz?.onGuess({ stringIndex, fret })
                              playNote(stringIndex, fret)
                            }
                          }}
                          className={cn(
                            'relative z-10 w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                            quizReference
                              ? 'bg-accent-orange text-background'
                              : quizAnswer
                                ? 'bg-accent-teal text-background'
                                : chordNote
                                  ? getNoteColorClass(
                                      getNoteIndex(chordNote) ===
                                        getNoteIndex(chordTones![0])
                                    )
                                  : chordTones
                                    ? 'bg-muted text-foreground border border-border'
                                    : !quiz && displayMode !== 'all' && inScale
                                      ? getNoteColorClass(isRoot)
                                      : 'bg-muted text-foreground border border-border',
                            !quiz &&
                              !chordNote &&
                              !active &&
                              inScale &&
                              !highlighted &&
                              'opacity-40',
                            (quiz
                              ? quizGuess || quizAnswer || quizMarker
                              : highlighted || playingHere) &&
                              'ring-2 ring-foreground ring-offset-2 ring-offset-card'
                          )}
                        >
                          <span className="drop-shadow-sm">
                            {hideName
                              ? quizReference
                                ? 'R'
                                : quizMarker
                                  ? '●'
                                  : '?'
                              : getDisplayNote(displayNote)}
                          </span>
                        </motion.button>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* 3. 하단 프렛 번호 */}
          <div className="flex mt-3">
            <div className="sticky left-0 z-20 w-16 shrink-0 bg-card" />
            {allFrets.map(fret => (
              <div
                key={`num-${fret}`}
                className={cn(
                  'flex items-center justify-center',
                  fret !== 0 && 'fret-col'
                )}
                style={getFretColumnStyle(fret)}
              >
                <span
                  className={cn(
                    'text-xs font-mono font-medium',
                    fret === 12 ? 'text-accent-orange' : 'text-muted-foreground'
                  )}
                >
                  {fret}
                </span>
              </div>
            ))}
          </div>

          {/* 4. 하단 마커 영역 */}
          <div className="flex mt-2">
            <div className="sticky left-0 z-20 w-16 shrink-0 bg-card" />
            {allFrets.map(fret => (
              <div
                key={`marker-${fret}`}
                className={cn(
                  'flex items-center justify-center gap-1 h-5',
                  fret !== 0 && 'fret-col'
                )}
                style={getFretColumnStyle(fret)}
              >
                {[12, 24].includes(fret) ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  </>
                ) : [3, 5, 7, 9, 15, 17, 19, 21].includes(fret) ? (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
