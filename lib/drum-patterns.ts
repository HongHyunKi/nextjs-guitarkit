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

// Schedule within an eighth-note lick tick; 16-beat hats also fall halfway through.
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
      { kick: true, snare: false, hihat: true }, // beat 1
      { kick: false, snare: true, hihat: true }, // beat 2
      { kick: true, snare: false, hihat: true }, // beat 3
      { kick: false, snare: true, hihat: true }, // beat 4
    ],
    '8beat': [
      { kick: true, snare: false, hihat: true }, // 1 down
      { kick: false, snare: false, hihat: true }, // 1 up
      { kick: false, snare: true, hihat: true }, // 2 down
      { kick: false, snare: false, hihat: true }, // 2 up
      { kick: true, snare: false, hihat: true }, // 3 down
      { kick: false, snare: false, hihat: true }, // 3 up
      { kick: false, snare: true, hihat: true }, // 4 down
      { kick: false, snare: false, hihat: true }, // 4 up
    ],
    '16beat': [
      { kick: true, snare: false, hihat: true }, // beat 1
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // beat 2
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: true, snare: false, hihat: true }, // beat 3
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // beat 4
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
      { kick: true, snare: false, hihat: true }, // 1 down (swing 적용)
      { kick: false, snare: false, hihat: true }, // 1 up
      { kick: false, snare: true, hihat: false }, // 2 down
      { kick: false, snare: false, hihat: true }, // 2 up (shuffle)
      { kick: true, snare: false, hihat: true }, // 3 down
      { kick: false, snare: false, hihat: true }, // 3 up
      { kick: false, snare: true, hihat: false }, // 4 down
      { kick: false, snare: false, hihat: true }, // 4 up (shuffle)
    ],
    '16beat': [
      { kick: true, snare: false, hihat: true }, // beat 1
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // shuffle accent
      { kick: false, snare: true, hihat: true }, // beat 2
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // shuffle accent
      { kick: false, snare: false, hihat: true },
      { kick: true, snare: false, hihat: true }, // beat 3
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // shuffle accent
      { kick: false, snare: true, hihat: true }, // beat 4
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // shuffle accent
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
      { kick: false, snare: false, hihat: true }, // 1+ (swing)
      { kick: false, snare: true, hihat: false }, // 2
      { kick: false, snare: false, hihat: true }, // 2+ (swing)
      { kick: false, snare: false, hihat: true }, // 3
      { kick: false, snare: false, hihat: true }, // 3+ (swing)
      { kick: false, snare: true, hihat: false }, // 4
      { kick: false, snare: false, hihat: true }, // 4+ (swing)
    ],
    '16beat': [
      { kick: true, snare: false, hihat: true }, // beat 1
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // triplet accent
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // beat 2
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // beat 3
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // triplet accent
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // beat 4
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
    ],
  },
}
