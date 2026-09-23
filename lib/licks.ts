import { getPitchFromFret } from './music-utils'

// Original one-bar exercises, not transcriptions of recorded songs.
// 4/4, straight eighths: eight ticks per bar; stringIndex 0 is the high E.
export type LickNote = {
  tick: number
  duration: number
  stringIndex: number
  fret: number
}
export type Lick = {
  id: string
  title: string
  description: string
  tip: string
  notes: LickNote[]
}
export const LICKS: Lick[] = [
  {
    id: 'first-answer',
    title: '첫 대답',
    description: '3개 줄 · 6음 · 올라갔다 근음으로 마무리',
    tip: '검지는 5프렛, 약지는 7프렛에 두세요. 마지막 A는 앞의 짧은 음보다 두 배 길게 유지합니다.',
    notes: [
      { tick: 0, duration: 1, stringIndex: 2, fret: 5 },
      { tick: 1, duration: 1, stringIndex: 2, fret: 7 },
      { tick: 2, duration: 2, stringIndex: 1, fret: 5 },
      { tick: 4, duration: 1, stringIndex: 2, fret: 7 },
      { tick: 5, duration: 1, stringIndex: 2, fret: 5 },
      { tick: 6, duration: 2, stringIndex: 3, fret: 7 },
    ],
  },
  {
    id: 'high-to-home',
    title: '높은 음에서 내려오기',
    description: '2개 줄 · 7음 · 짧은 하행과 되돌아오기',
    tip: '1번 줄은 가장 가는 줄입니다. 5프렛은 검지, 8프렛은 새끼손가락으로 짚어보세요.',
    notes: [
      { tick: 0, duration: 1, stringIndex: 0, fret: 8 },
      { tick: 1, duration: 1, stringIndex: 0, fret: 5 },
      { tick: 2, duration: 1, stringIndex: 1, fret: 8 },
      { tick: 3, duration: 1, stringIndex: 1, fret: 5 },
      { tick: 4, duration: 1, stringIndex: 1, fret: 8 },
      { tick: 5, duration: 1, stringIndex: 0, fret: 8 },
      { tick: 6, duration: 2, stringIndex: 0, fret: 5 },
    ],
  },
  {
    id: 'leave-space',
    title: '쉬었다 대답하기',
    description: '3개 줄 · 5음 · 쉼표가 있는 프레이즈',
    tip: '첫 박에는 연주하지 않습니다. 쉬는 동안에도 1, 2, 3, 4를 세고 두 번째 박에 들어오세요.',
    notes: [
      { tick: 2, duration: 1, stringIndex: 2, fret: 5 },
      { tick: 3, duration: 1, stringIndex: 2, fret: 7 },
      { tick: 4, duration: 1, stringIndex: 1, fret: 5 },
      { tick: 5, duration: 1, stringIndex: 2, fret: 5 },
      { tick: 6, duration: 2, stringIndex: 3, fret: 7 },
    ],
  },
]

export function getLickFrame(lick: Lick, step: number) {
  const countIn = step < 8
  const tick = step % 8
  const phase = countIn
    ? 'count-in'
    : Math.floor((step - 8) / 8) % 2 === 0
      ? 'listen'
      : 'respond'
  const note = countIn
    ? null
    : (lick.notes.find(n => n.tick <= tick && tick < n.tick + n.duration) ??
      null)
  return {
    phase,
    tick,
    beat: Math.floor(tick / 2) + 1,
    round: countIn ? 0 : Math.floor((step - 8) / 16) + 1,
    note,
    // The response bar has visual guidance but NEVER schedules the lead guitar.
    lead:
      phase === 'listen'
        ? (lick.notes.find(n => n.tick === tick) ?? null)
        : null,
  } as const
}
export type LickFrame = ReturnType<typeof getLickFrame>
export const lickPitch = (note: LickNote) =>
  getPitchFromFret(note.stringIndex, note.fret)
