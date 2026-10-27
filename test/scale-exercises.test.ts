import {
  SCALE_EXERCISES,
  buildExercise,
  getThreeNpsGrid,
} from '../lib/scale-exercises'
import type { ScaleType } from '../lib/music-utils'

const tuning = [64, 59, 55, 50, 45, 40]
const ROOTS = [
  'C',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F',
  'C#',
  'D#',
  'F#',
  'G#',
  'A#',
  'Db',
  'Eb',
  'Gb',
  'Ab',
  'Bb',
]
// 독립 기준: 루트에서의 반음 간격
const SEVEN_NOTE: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],
  'melodic-minor': [0, 2, 3, 5, 7, 9, 11],
}
const NATURAL: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}
const pc = (root: string) =>
  (NATURAL[root[0]] + (root[1] === '#' ? 1 : root[1] === 'b' ? -1 : 0) + 12) %
  12

test('C major triplet run matches the reference tab', () => {
  const notes = buildExercise(getThreeNpsGrid('C', 'major'), SCALE_EXERCISES[0])
  const up = notes.slice(0, 18).map(n => `${6 - n!.stringIndex}:${n!.fret}`)
  expect(up).toEqual([
    '1:8',
    '1:10',
    '1:12',
    '2:8',
    '2:10',
    '2:12',
    '3:9',
    '3:10',
    '3:12',
    '4:9',
    '4:10',
    '4:12',
    '5:10',
    '5:12',
    '5:13',
    '6:10',
    '6:12',
    '6:13',
  ])
  expect(notes.slice(18)).toEqual(notes.slice(0, 18).reverse())
  expect(notes).toHaveLength(36)
})

test('3NPS grid is ascending, 3 per string and in scale for all roots', () => {
  for (const root of ROOTS)
    for (const [scale, intervals] of Object.entries(SEVEN_NOTE)) {
      const grid = getThreeNpsGrid(root, scale as ScaleType)
      expect(grid).toHaveLength(18)
      const midi = grid.map(p => tuning[p.stringIndex] + p.fret)
      grid.forEach((p, i) => {
        expect(p.stringIndex).toBe(5 - Math.floor(i / 3))
        expect(p.fret).toBeGreaterThanOrEqual(0)
        expect(p.fret).toBeLessThanOrEqual(22)
        expect(midi[i] % 12).toBe((pc(root) + intervals[i % 7]) % 12)
        if (i > 0) expect(midi[i]).toBeGreaterThan(midi[i - 1])
      })
      expect(midi[7] - midi[0]).toBe(12)
    }
})

test('pentatonics have no 3NPS grid', () => {
  expect(getThreeNpsGrid('A', 'minor-pentatonic')).toEqual([])
  expect(buildExercise([], SCALE_EXERCISES[0])).toEqual([])
})

test('exercises fill whole bars and descend as the mirror of ascent', () => {
  const grid = getThreeNpsGrid('A', 'minor')
  const bars = { 'triplet-run': 3, 'four-note': 8, thirds: 8 }
  for (const exercise of SCALE_EXERCISES) {
    const notes = buildExercise(grid, exercise)
    expect(notes.length).toBe(bars[exercise.id] * 4 * exercise.perBeat)
    const played = exercise.order
    expect(played.slice(played.length / 2)).toEqual(
      played.slice(0, played.length / 2).map(i => 17 - i)
    )
  }
  expect(SCALE_EXERCISES[1].order.slice(0, 8)).toEqual([0, 1, 2, 3, 1, 2, 3, 4])
  expect(SCALE_EXERCISES[2].order.slice(0, 4)).toEqual([0, 2, 1, 3])
})
