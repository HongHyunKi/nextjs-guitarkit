import {
  getNoteIndex,
  getScaleNotes,
  STANDARD_TUNING_MIDI,
  type ScaleType,
} from './music-utils'

export type ExercisePosition = { stringIndex: number; fret: number }

// position(0~6)번째 스케일 음을 6번 줄에서 시작해 한 줄에 3음씩 18음.
// 개방현 시작은 운지가 어색해 12프렛으로 올린다. 7음 스케일이 아니면 빈 배열이다.
export function getThreeNpsGrid(
  rootNote: string,
  scaleType: ScaleType,
  position = 0
): ExercisePosition[] {
  const pitches = getScaleNotes(rootNote, scaleType).map(getNoteIndex)
  if (pitches.length !== 7) return []
  const low = STANDARD_TUNING_MIDI[5]
  const start = low + ((pitches[position] - (low % 12) + 11) % 12) + 1
  return Array.from({ length: 18 }, (_, i) => {
    const stringIndex = 5 - Math.floor(i / 3)
    const degree = position + i
    const midi =
      start +
      12 * Math.floor(degree / 7) +
      ((pitches[degree % 7] - pitches[0] + 12) % 12) -
      ((pitches[position] - pitches[0] + 12) % 12)
    return { stringIndex, fret: midi - STANDARD_TUNING_MIDI[stringIndex] }
  })
}

const range = (from: number, to: number) =>
  Array.from({ length: Math.abs(to - from) + 1 }, (_, i) =>
    from <= to ? from + i : from - i
  )

// order는 그리드 인덱스 순서, perBeat는 한 박에 들어가는 음 수다.
export const SCALE_EXERCISES = [
  {
    id: 'triplet-run',
    label: '3연음 런',
    description: '한 줄에 3음씩 두 옥타브를 올라갔다 내려옵니다.',
    perBeat: 3,
    order: [...range(0, 17), ...range(17, 0)],
  },
  {
    id: 'four-note',
    label: '4음 시퀀스',
    description: '1-2-3-4, 2-3-4-5처럼 4음 묶음을 한 칸씩 밀며 16분음표로.',
    perBeat: 4,
    order: [
      ...range(0, 14).flatMap(i => range(i, i + 3)),
      ...range(17, 3).flatMap(i => range(i, i - 3)),
    ],
  },
  {
    id: 'thirds',
    label: '3도 음정',
    description: '1-3, 2-4, 3-5처럼 스케일 안에서 한 음씩 건너뛰며 8분음표로.',
    perBeat: 2,
    order: [
      ...range(0, 15).flatMap(i => [i, i + 2]),
      ...range(17, 2).flatMap(i => [i, i - 2]),
    ],
  },
] as const
export type ScaleExercise = (typeof SCALE_EXERCISES)[number]

// 루프가 마디 경계에서 돌도록 남는 칸은 쉼(null)으로 채운다.
export function buildExercise(
  grid: ExercisePosition[],
  exercise: ScaleExercise
): (ExercisePosition | null)[] {
  if (grid.length === 0) return []
  const bar = 4 * exercise.perBeat
  const notes = exercise.order.map(i => grid[i])
  const rests = (bar - (notes.length % bar)) % bar
  return [...notes, ...Array<null>(rests).fill(null)]
}
