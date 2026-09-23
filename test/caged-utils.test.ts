import {
  CHROMATIC_NOTES,
  getNoteIndex,
  getScaleNotes,
  STANDARD_TUNING_MIDI,
  ScaleType,
} from '@/lib/music-utils'
import {
  CAGED_SHAPES,
  CAGEDShape,
  getShapeRootPosition,
  isInCAGEDShape,
  supportsCAGED,
} from '@/lib/caged-utils'

// Transcribed absolute frets, low E → high E, from the five diagrams per source.
// https://appliedguitartheory.com/lessons/major-scale/ (G major positions 1–5 = E,D,C,A,G)
const G_MAJOR: Record<CAGEDShape, number[][]> = {
  E: [
    [2, 3, 5],
    [2, 3, 5],
    [2, 4, 5],
    [2, 4, 5],
    [3, 5],
    [2, 3, 5],
  ],
  D: [
    [5, 7, 8],
    [5, 7],
    [4, 5, 7],
    [4, 5, 7],
    [5, 7, 8],
    [5, 7, 8],
  ],
  C: [
    [7, 8, 10],
    [7, 9, 10],
    [7, 9, 10],
    [7, 9],
    [7, 8, 10],
    [7, 8, 10],
  ],
  A: [
    [8, 10, 12],
    [9, 10, 12],
    [9, 10, 12],
    [9, 11, 12],
    [10, 12, 13],
    [10, 12],
  ],
  G: [
    [12, 14, 15],
    [12, 14, 15],
    [12, 14],
    [11, 12, 14],
    [12, 13, 15],
    [12, 14, 15],
  ],
}
// https://appliedguitartheory.com/scale/a-minor-pentatonic-scale/
const A_MINOR_PENT: Record<CAGEDShape, number[][]> = {
  E: [
    [5, 8],
    [5, 7],
    [5, 7],
    [5, 7],
    [5, 8],
    [5, 8],
  ],
  D: [
    [8, 10],
    [7, 10],
    [7, 10],
    [7, 9],
    [8, 10],
    [8, 10],
  ],
  C: [
    [10, 12],
    [10, 12],
    [10, 12],
    [9, 12],
    [10, 13],
    [10, 12],
  ],
  A: [
    [12, 15],
    [12, 15],
    [12, 14],
    [12, 14],
    [13, 15],
    [12, 15],
  ],
  G: [
    [3, 5],
    [3, 5],
    [2, 5],
    [2, 5],
    [3, 5],
    [3, 5],
  ],
}

describe('reference CAGED fingerings, all roots and 0–24 frets', () => {
  for (const scaleType of [
    'major',
    'major-pentatonic',
    'minor-pentatonic',
  ] as ScaleType[]) {
    const minor = scaleType === 'minor-pentatonic'
    const reference = minor ? A_MINOR_PENT : G_MAJOR
    const referenceRoot = minor ? 9 : 7
    for (const root of CHROMATIC_NOTES) {
      it(`${root} ${scaleType}: all five shapes match the transposed diagrams`, () => {
        const shift = getNoteIndex(root) - referenceRoot
        for (const shape of CAGED_SHAPES) {
          for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
            for (let fret = 0; fret <= 24; fret++) {
              const pitch =
                (STANDARD_TUNING_MIDI[stringIndex] + fret - shift + 12) % 12
              const pentDegree = [7, 9, 11, 2, 4].includes(pitch) // G major pentatonic, independently specified
              const expected =
                reference[shape][5 - stringIndex].some(
                  f => (fret - shift - f) % 12 === 0
                ) &&
                (scaleType !== 'major-pentatonic' || pentDegree)
              expect(
                isInCAGEDShape(stringIndex, fret, root, scaleType, shape)
              ).toBe(expected)
            }
          }
        }
      })
    }
  }
})

it('includes C major E-shape notes below the barre and excludes another string at the same fret', () => {
  expect(isInCAGEDShape(4, 7, 'C', 'major', 'E')).toBe(true)
  expect(isInCAGEDShape(3, 7, 'C', 'major', 'E')).toBe(true)
  expect(isInCAGEDShape(2, 7, 'C', 'major', 'E')).toBe(true)
  expect(isInCAGEDShape(1, 7, 'C', 'major', 'E')).toBe(false)
})

it('landmarks are root notes; five patterns cover every scale note', () => {
  for (const root of CHROMATIC_NOTES) {
    for (const shape of CAGED_SHAPES) {
      const position = getShapeRootPosition(root, shape)
      expect(
        (STANDARD_TUNING_MIDI[position.string - 1] + position.fret) % 12
      ).toBe(getNoteIndex(root))
    }
    for (const scale of [
      'major',
      'major-pentatonic',
      'minor-pentatonic',
    ] as ScaleType[]) {
      const pitches = getScaleNotes(root, scale).map(getNoteIndex)
      for (let s = 0; s < 6; s++)
        for (let f = 0; f <= 24; f++) {
          expect(
            CAGED_SHAPES.some(shape => isInCAGEDShape(s, f, root, scale, shape))
          ).toBe(pitches.includes((STANDARD_TUNING_MIDI[s] + f) % 12))
        }
    }
  }
})

it('does not claim patterns for unsupported scales or invalid positions', () => {
  for (const scale of [
    'minor',
    'dorian',
    'mixolydian',
    'lydian',
    'phrygian',
    'harmonic-minor',
    'melodic-minor',
  ] as ScaleType[]) {
    expect(supportsCAGED(scale)).toBe(false)
    expect(isInCAGEDShape(0, 0, 'C', scale, 'C')).toBe(false)
  }
  expect(isInCAGEDShape(-1, 0, 'C', 'major', 'C')).toBe(false)
  expect(isInCAGEDShape(0, -1, 'C', 'major', 'C')).toBe(false)
  expect(isInCAGEDShape(0, 0, 'invalid', 'major', 'C')).toBe(false)
})
