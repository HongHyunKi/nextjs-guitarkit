import type { BackingStyle } from './chord-utils'

export type DrumStep = { kick: boolean; snare: boolean; hihat: boolean }
export type Subdivision = '4beat' | '8beat' | '16beat'
export type LickDrums = 'off' | Subdivision
export const LICK_DRUM_LABELS: Record<LickDrums, string> = {
  off: '드럼 없음',
  '4beat': '록 4비트',
  '8beat': '록 8비트 · 추천',
  '16beat': '록 16비트',
}

// 8분음표 틱 안에 예약하며 16비트 하이햇은 중간에도 친다.
export function getLickDrumSteps(
  pattern: LickDrums,
  tick: number,
  countIn: boolean
) {
  if (pattern === 'off' || countIn) return []
  const steps = DRUM_PATTERNS.rock[pattern]
  const spacing = 8 / steps.length
  return steps.flatMap((step, index) => {
    const at = index * spacing
    return at >= tick && at < tick + 1 ? [{ step, offset: at - tick }] : []
  })
}

export const SUBDIVISION_NOTE: Record<Subdivision, string> = {
  '4beat': '4n',
  '8beat': '8n',
  '16beat': '16n',
}

export const SUBDIVISION_LABELS: Record<Subdivision, string> = {
  '4beat': '4비트',
  '8beat': '8비트',
  '16beat': '16비트',
}

// 4비트: 4스텝(4분음표), 8비트: 8스텝(8분음표), 16비트: 16스텝(16분음표)
export const DRUM_PATTERNS: Record<
  BackingStyle,
  Record<Subdivision, DrumStep[]>
> = {
  rock: {
    '4beat': [
      { kick: true, snare: false, hihat: true }, // 1박
      { kick: false, snare: true, hihat: true }, // 2박
      { kick: true, snare: false, hihat: true }, // 3박
      { kick: false, snare: true, hihat: true }, // 4박
    ],
    '8beat': [
      { kick: true, snare: false, hihat: true }, // 1박
      { kick: false, snare: false, hihat: true }, // 1박 뒤
      { kick: false, snare: true, hihat: true }, // 2박
      { kick: false, snare: false, hihat: true }, // 2박 뒤
      { kick: true, snare: false, hihat: true }, // 3박
      { kick: false, snare: false, hihat: true }, // 3박 뒤
      { kick: false, snare: true, hihat: true }, // 4박
      { kick: false, snare: false, hihat: true }, // 4박 뒤
    ],
    '16beat': [
      { kick: true, snare: false, hihat: true }, // 1박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // 2박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: true, snare: false, hihat: true }, // 3박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // 4박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
    ],
  },
  blues: {
    '4beat': [
      { kick: true, snare: false, hihat: true },
      { kick: false, snare: true, hihat: false },
      { kick: true, snare: false, hihat: true },
      { kick: false, snare: true, hihat: false },
    ],
    '8beat': [
      { kick: true, snare: false, hihat: true }, // 1박
      { kick: false, snare: false, hihat: true }, // 1박 뒤
      { kick: false, snare: true, hihat: false }, // 2박
      { kick: false, snare: false, hihat: true }, // 2박 뒤
      { kick: true, snare: false, hihat: true }, // 3박
      { kick: false, snare: false, hihat: true }, // 3박 뒤
      { kick: false, snare: true, hihat: false }, // 4박
      { kick: false, snare: false, hihat: true }, // 4박 뒤
    ],
    '16beat': [
      { kick: true, snare: false, hihat: true }, // 1박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // 리듬 강조
      { kick: false, snare: true, hihat: true }, // 2박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // 리듬 강조
      { kick: false, snare: false, hihat: true },
      { kick: true, snare: false, hihat: true }, // 3박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // 리듬 강조
      { kick: false, snare: true, hihat: true }, // 4박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // 리듬 강조
      { kick: false, snare: false, hihat: true },
    ],
  },
  jazz: {
    '4beat': [
      { kick: true, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true },
      { kick: false, snare: false, hihat: true },
    ],
    '8beat': [
      { kick: true, snare: false, hihat: true }, // 1
      { kick: false, snare: false, hihat: true }, // 1박 뒤 (스윙)
      { kick: false, snare: true, hihat: false }, // 2
      { kick: false, snare: false, hihat: true }, // 2박 뒤 (스윙)
      { kick: false, snare: false, hihat: true }, // 3
      { kick: false, snare: false, hihat: true }, // 3박 뒤 (스윙)
      { kick: false, snare: true, hihat: false }, // 4
      { kick: false, snare: false, hihat: true }, // 4박 뒤 (스윙)
    ],
    '16beat': [
      { kick: true, snare: false, hihat: true }, // 1박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // 리듬 강조
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // 2박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // 3박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // 리듬 강조
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // 4박
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
    ],
  },
}
