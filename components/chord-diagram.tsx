'use client'

import { motion } from 'framer-motion'
import { getNoteIndex, getPitchFromFret } from '@/lib/music-utils'
import { ChordVoicing } from '@/lib/chord-voicings'

interface ChordDiagramProps {
  voicing: ChordVoicing
  rootNote: string
  onPlay: (voicing: ChordVoicing) => void
}

// SVG 좌표 상수
const STRING_GAP = 20
const FRET_GAP = 24
const NUM_STRINGS = 6
const LEFT = 24
const TOP = 28
const NUM_ROWS = 5

export function ChordDiagram({ voicing, rootNote, onPlay }: ChordDiagramProps) {
  const rootIndex = getNoteIndex(rootNote)
  const positiveFrets = voicing.frets.filter(f => f > 0)
  const maxFret = positiveFrets.length ? Math.max(...positiveFrets) : 0
  const minFret = positiveFrets.length ? Math.min(...positiveFrets) : 1
  // 4프렛 내에 들어오면 너트부터, 아니면 최저 프렛부터 창을 잡는다
  const windowStart = maxFret <= NUM_ROWS ? 1 : minFret
  const showNut = windowStart === 1

  const width = LEFT + STRING_GAP * (NUM_STRINGS - 1) + 16
  const height = TOP + FRET_GAP * NUM_ROWS + 12

  const stringX = (i: number) => LEFT + i * STRING_GAP
  const fretY = (fret: number) => TOP + (fret - windowStart + 0.5) * FRET_GAP

  // 저음→고음 인덱스 i의 음이 루트인지 (도트 색상용)
  const isRootDot = (i: number, fret: number) => {
    const pitch = getPitchFromFret(5 - i, fret)
    return getNoteIndex(pitch.replace(/-?\d+$/, '')) === rootIndex
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onPlay(voicing)}
      className="group flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:border-accent-teal/50 focus-visible:border-accent-teal outline-none"
      aria-label={`${voicing.form}폼 코드 재생 (${voicing.rootFret === 0 ? '오픈 포지션' : `${voicing.rootFret}프렛`})`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        {/* 프렛 가로선 */}
        {Array.from({ length: NUM_ROWS + 1 }, (_, r) => (
          <line
            key={`fret-${r}`}
            x1={stringX(0)}
            x2={stringX(NUM_STRINGS - 1)}
            y1={TOP + r * FRET_GAP}
            y2={TOP + r * FRET_GAP}
            stroke="var(--border)"
            strokeWidth={showNut && r === 0 ? 4 : 1}
          />
        ))}

        {/* 현 세로선 */}
        {Array.from({ length: NUM_STRINGS }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={stringX(i)}
            x2={stringX(i)}
            y1={TOP}
            y2={TOP + NUM_ROWS * FRET_GAP}
            stroke="var(--muted-foreground)"
            strokeWidth={1}
          />
        ))}

        {/* 시작 프렛 라벨 */}
        {!showNut && (
          <text
            x={LEFT - 18}
            y={TOP + 0.5 * FRET_GAP + 4}
            fontSize={11}
            fill="var(--muted-foreground)"
            fontFamily="var(--font-mono)"
          >
            {windowStart}
          </text>
        )}

        {/* 상단 O/X + 도트 */}
        {voicing.frets.map((fret, i) => {
          if (fret === -1) {
            return (
              <text
                key={`mark-${i}`}
                x={stringX(i)}
                y={TOP - 8}
                fontSize={11}
                textAnchor="middle"
                fill="var(--muted-foreground)"
              >
                ✕
              </text>
            )
          }
          if (fret === 0) {
            return (
              <circle
                key={`mark-${i}`}
                cx={stringX(i)}
                cy={TOP - 11}
                r={4}
                fill="none"
                stroke={
                  isRootDot(i, 0)
                    ? 'var(--accent-orange)'
                    : 'var(--accent-teal)'
                }
                strokeWidth={1.5}
              />
            )
          }
          return (
            <circle
              key={`dot-${i}`}
              cx={stringX(i)}
              cy={fretY(fret)}
              r={7}
              fill={
                isRootDot(i, fret)
                  ? 'var(--accent-orange)'
                  : 'var(--accent-teal)'
              }
            />
          )
        })}
      </svg>

      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        {voicing.form}폼 ·{' '}
        {voicing.rootFret === 0 ? '오픈' : `${voicing.rootFret}프렛`}
      </span>
    </motion.button>
  )
}
