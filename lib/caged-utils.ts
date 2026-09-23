import {
  getNoteIndex,
  getScaleNotes,
  ScaleType,
  STANDARD_TUNING_MIDI,
} from './music-utils'

export type CAGEDShape = 'C' | 'A' | 'G' | 'E' | 'D'
export type CAGEDSelection = CAGEDShape | 'all'
export const CAGED_SHAPES: CAGEDShape[] = ['C', 'A', 'G', 'E', 'D']
const SHAPE_BASE_NOTE: Record<CAGEDShape, number> = {
  C: 0,
  A: 9,
  G: 7,
  E: 4,
  D: 2,
}

export function getBarreFret(rootIndex: number, shape: CAGEDShape): number {
  return (rootIndex - SHAPE_BASE_NOTE[shape] + 12) % 12
}

// Low E (6th string) → high E (1st string), offsets from the chord's barre.
// One documented fingering convention, not the only valid CAGED fingering.
// References and absolute-fret fixtures: docs/caged-system-spec.md.
const MAJOR_PATTERNS: Record<CAGEDShape, number[][]> = {
  C: [
    [0, 1, 3],
    [0, 2, 3],
    [0, 2, 3],
    [0, 2],
    [0, 1, 3],
    [0, 1, 3],
  ],
  A: [
    [-2, 0, 2],
    [-1, 0, 2],
    [-1, 0, 2],
    [-1, 1, 2],
    [0, 2, 3],
    [0, 2],
  ],
  G: [
    [0, 2, 3],
    [0, 2, 3],
    [0, 2],
    [-1, 0, 2],
    [0, 1, 3],
    [0, 2, 3],
  ],
  E: [
    [-1, 0, 2],
    [-1, 0, 2],
    [-1, 1, 2],
    [-1, 1, 2],
    [0, 2],
    [-1, 0, 2],
  ],
  D: [
    [0, 2, 3],
    [0, 2],
    [-1, 0, 2],
    [-1, 0, 2],
    [0, 2, 3],
    [0, 2, 3],
  ],
}
const MINOR_PENTATONIC_PATTERNS: Record<CAGEDShape, number[][]> = {
  C: [
    [1, 3],
    [1, 3],
    [1, 3],
    [0, 3],
    [1, 4],
    [1, 3],
  ],
  A: [
    [0, 3],
    [0, 3],
    [0, 2],
    [0, 2],
    [1, 3],
    [0, 3],
  ],
  G: [
    [1, 3],
    [1, 3],
    [0, 3],
    [0, 3],
    [1, 3],
    [1, 3],
  ],
  E: [
    [0, 3],
    [0, 2],
    [0, 2],
    [0, 2],
    [0, 3],
    [0, 3],
  ],
  D: [
    [1, 3],
    [0, 3],
    [0, 3],
    [0, 2],
    [1, 3],
    [1, 3],
  ],
}

export function supportsCAGED(scaleType: ScaleType): boolean {
  return ['major', 'major-pentatonic', 'minor-pentatonic'].includes(scaleType)
}

export function isInCAGEDShape(
  stringIndex: number,
  fret: number,
  rootNote: string,
  scaleType: ScaleType,
  shape: CAGEDShape
): boolean {
  const rootIndex = getNoteIndex(rootNote)
  if (
    !supportsCAGED(scaleType) ||
    rootIndex < 0 ||
    !Number.isInteger(stringIndex) ||
    stringIndex < 0 ||
    stringIndex > 5 ||
    !Number.isInteger(fret) ||
    fret < 0
  )
    return false
  const patterns =
    scaleType === 'minor-pentatonic'
      ? MINOR_PENTATONIC_PATTERNS
      : MAJOR_PATTERNS
  const barre = getBarreFret(rootIndex, shape)
  const inPattern = patterns[shape][5 - stringIndex].some(
    offset => (fret - barre - offset) % 12 === 0
  )
  // Major pentatonic is the same shape with degrees 4 and 7 removed.
  return (
    inPattern &&
    getScaleNotes(rootNote, scaleType).some(
      note =>
        getNoteIndex(note) === (STANDARD_TUNING_MIDI[stringIndex] + fret) % 12
    )
  )
}

const ROOT_STRING: Record<CAGEDShape, number> = { C: 5, A: 5, G: 6, E: 6, D: 4 }
export function getShapeRootPosition(
  rootNote: string,
  shape: CAGEDShape
): { string: number; fret: number } {
  return {
    string: ROOT_STRING[shape],
    fret:
      getBarreFret(getNoteIndex(rootNote), shape) +
      (shape === 'C' || shape === 'G' ? 3 : 0),
  }
}
