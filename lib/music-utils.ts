// Notation type
export type NotationType = 'alphabetical' | 'syllabic' | 'intervals'

// Note to solfege mapping (movable do - relative to root)
const SOLFEGE_MAP: Record<number, string> = {
  0: '도',
  1: '도#',
  2: '레',
  3: '레#',
  4: '미',
  5: '파',
  6: '파#',
  7: '솔',
  8: '솔#',
  9: '라',
  10: '라#',
  11: '시',
}

// Fixed solfege mapping (absolute - C is always Do)
const FIXED_SOLFEGE_MAP: Record<string, string> = {
  C: '도',
  D: '레',
  E: '미',
  F: '파',
  G: '솔',
  A: '라',
  B: '시',
}

// Interval notation mapping (scale degrees)
const INTERVAL_MAP: Record<number, string> = {
  0: '1',
  1: '♭2',
  2: '2',
  3: '♭3',
  4: '3',
  5: '4',
  6: '#4', // Lydian scale degree; also the chromatic fallback for a tritone
  7: '5',
  8: '♭6',
  9: '6',
  10: '♭7',
  11: '7',
}

// Scale type definition
export type ScaleType =
  | 'major'
  | 'minor'
  | 'major-pentatonic'
  | 'minor-pentatonic'
  | 'dorian'
  | 'mixolydian'
  | 'lydian'
  | 'phrygian'
  | 'harmonic-minor'
  | 'melodic-minor'

// Scale types surfaced as primary buttons in the UI; the rest live behind "더보기".
export const MAIN_SCALE_TYPES: ScaleType[] = [
  'major',
  'minor',
  'major-pentatonic',
  'minor-pentatonic',
]

// Scale type labels
export const SCALE_LABELS: Record<ScaleType, string> = {
  major: 'Major Scale',
  minor: 'Natural Minor',
  'major-pentatonic': 'Major Pentatonic',
  'minor-pentatonic': 'Minor Pentatonic',
  dorian: 'Dorian',
  mixolydian: 'Mixolydian',
  lydian: 'Lydian',
  phrygian: 'Phrygian',
  'harmonic-minor': 'Harmonic Minor',
  'melodic-minor': 'Melodic Minor (상행)',
}

export const SCALE_DESCRIPTIONS: Record<ScaleType, string> = {
  major: '메이저(장음계) · 1 2 3 4 5 6 7',
  minor: '자연 마이너(자연단음계) · 1 2 ♭3 4 5 ♭6 ♭7',
  'major-pentatonic': '메이저 펜타토닉 · 장음계에서 4도와 7도를 뺀 다섯 음',
  'minor-pentatonic': '마이너 펜타토닉 · 1 ♭3 4 5 ♭7의 다섯 음',
  dorian: '도리안 · 자연 마이너의 6도를 반음 올린 음계',
  mixolydian: '믹솔리디안 · 메이저의 7도를 반음 내린 음계',
  lydian: '리디안 · 메이저의 4도를 반음 올린 음계',
  phrygian: '프리지안 · 자연 마이너의 2도를 반음 내린 음계',
  'harmonic-minor':
    '화성 마이너(화성단음계) · 자연 마이너의 7도를 반음 올린 음계',
  'melodic-minor':
    '가락 마이너(가락단음계) 상행형 · 자연 마이너의 6·7도를 반음 올립니다. 고전 이론의 하행형은 자연 마이너이며, 재즈에서는 이 상행형을 양방향으로 씁니다.',
}

// Major- vs minor-character scale, used to pick sharp/flat spelling (shouldUseFlat).
export const SCALE_CHARACTER: Record<ScaleType, 'major' | 'minor'> = {
  major: 'major',
  minor: 'minor',
  'major-pentatonic': 'major',
  'minor-pentatonic': 'minor',
  dorian: 'minor',
  mixolydian: 'major',
  lydian: 'major',
  phrygian: 'minor',
  'harmonic-minor': 'minor',
  'melodic-minor': 'minor',
}

// All notes in chromatic order (sharp notation) — canonical reference
export const CHROMATIC_NOTES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]

// Chromatic notes with enharmonic flat equivalents for root note selection
export const CHROMATIC_NOTES_WITH_ENHARMONICS = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
]

const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const NATURAL_PITCHES = [0, 2, 4, 5, 7, 9, 11]

// All notes in chromatic order (sharp notation)
const NOTES_SHARP = CHROMATIC_NOTES

// All notes in chromatic order (flat notation)
export const NOTES_FLAT = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]

// Major scale intervals (W-W-H-W-W-W-H) - 1, 2, 3, 4, 5, 6, 7
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11]

// Natural Minor scale intervals (W-H-W-W-H-W-W) - 1, 2, b3, 4, 5, b6, b7
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10]

// Major Pentatonic scale intervals - 1, 2, 3, 5, 6
const MAJOR_PENTATONIC_INTERVALS = [0, 2, 4, 7, 9]

// Minor Pentatonic scale intervals - 1, b3, 4, 5, b7
const MINOR_PENTATONIC_INTERVALS = [0, 3, 5, 7, 10]

// Dorian intervals - 1, 2, b3, 4, 5, 6, b7
const DORIAN_INTERVALS = [0, 2, 3, 5, 7, 9, 10]

// Mixolydian intervals - 1, 2, 3, 4, 5, 6, b7
const MIXOLYDIAN_INTERVALS = [0, 2, 4, 5, 7, 9, 10]

// Lydian intervals - 1, 2, 3, #4, 5, 6, 7
const LYDIAN_INTERVALS = [0, 2, 4, 6, 7, 9, 11]

// Phrygian intervals - 1, b2, b3, 4, 5, b6, b7
const PHRYGIAN_INTERVALS = [0, 1, 3, 5, 7, 8, 10]

// Harmonic Minor intervals - 1, 2, b3, 4, 5, b6, 7
const HARMONIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 11]

// Melodic Minor intervals (ascending form) - 1, 2, b3, 4, 5, 6, 7
const MELODIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 9, 11]

export function getNoteIndex(note: string): number {
  if (!/^[A-G](#{1,2}|b{1,2})?$/.test(note)) return -1
  const natural = NATURAL_PITCHES[NOTE_LETTERS.indexOf(note[0])]
  const alteration = (note.length - 1) * (note[1] === 'b' ? -1 : 1)
  return (natural + alteration + 12) % 12
}

// Roots that conventionally use flat notation in major context
const MAJOR_FLAT_ROOTS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'])

// Roots that conventionally use flat notation in minor context
const MINOR_FLAT_ROOTS = new Set(['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab'])

function shouldUseFlat(rootNote: string, isMinor: boolean): boolean {
  if (rootNote.includes('b')) return true // flat root → flat spelling
  if (rootNote.includes('#')) return false // sharp root → sharp spelling
  return isMinor
    ? MINOR_FLAT_ROOTS.has(rootNote)
    : MAJOR_FLAT_ROOTS.has(rootNote)
}

// Chromatic fallback only; scale members use getScaleNotes' degree spelling.
export function isScaleFlat(rootNote: string, scaleType: ScaleType): boolean {
  return shouldUseFlat(rootNote, SCALE_CHARACTER[scaleType] === 'minor')
}

export function noteToSolfege(note: string, rootNote: string): string {
  const noteIndex = getNoteIndex(note)
  const rootIndex = getNoteIndex(rootNote)
  const interval = (noteIndex - rootIndex + 12) % 12
  return SOLFEGE_MAP[interval] || note
}

export function noteToFixedSolfege(note: string): string {
  return getNoteIndex(note) < 0
    ? note
    : FIXED_SOLFEGE_MAP[note[0]] + note.slice(1).replaceAll('b', '♭')
}

export function noteToInterval(note: string, rootNote: string): string {
  const noteIndex = getNoteIndex(note)
  const rootIndex = getNoteIndex(rootNote)
  const interval = (noteIndex - rootIndex + 12) % 12
  return INTERVAL_MAP[interval] || note
}

export function getScaleNotes(
  rootNote: string,
  scaleType: ScaleType
): string[] {
  const rootIndex = getNoteIndex(rootNote)

  if (rootIndex < 0) return []
  let intervals: number[]

  switch (scaleType) {
    case 'major':
      intervals = MAJOR_INTERVALS
      break
    case 'minor':
      intervals = MINOR_INTERVALS
      break
    case 'major-pentatonic':
      intervals = MAJOR_PENTATONIC_INTERVALS
      break
    case 'minor-pentatonic':
      intervals = MINOR_PENTATONIC_INTERVALS
      break
    case 'dorian':
      intervals = DORIAN_INTERVALS
      break
    case 'mixolydian':
      intervals = MIXOLYDIAN_INTERVALS
      break
    case 'lydian':
      intervals = LYDIAN_INTERVALS
      break
    case 'phrygian':
      intervals = PHRYGIAN_INTERVALS
      break
    case 'harmonic-minor':
      intervals = HARMONIC_MINOR_INTERVALS
      break
    case 'melodic-minor':
      intervals = MELODIC_MINOR_INTERVALS
      break
    default:
      intervals = MAJOR_INTERVALS
  }

  const degrees =
    scaleType === 'major-pentatonic'
      ? [0, 1, 2, 4, 5]
      : scaleType === 'minor-pentatonic'
        ? [0, 2, 3, 4, 6]
        : [0, 1, 2, 3, 4, 5, 6]
  const rootLetter = NOTE_LETTERS.indexOf(rootNote[0])
  return intervals.map((interval, index) => {
    const letter = (rootLetter + degrees[index]) % 7
    const alteration =
      ((rootIndex + interval - NATURAL_PITCHES[letter] + 18) % 12) - 6
    return (
      NOTE_LETTERS[letter] +
      (alteration < 0 ? 'b' : '#').repeat(Math.abs(alteration))
    )
  })
}

export function getNoteFromFret(
  openString: string,
  fret: number,
  useFlat: boolean = false
): string {
  const startIndex = getNoteIndex(openString)
  const noteIndex = (startIndex + fret) % 12
  const notesArray = useFlat ? NOTES_FLAT : NOTES_SHARP
  return notesArray[noteIndex]
}

// 표준 튜닝 개방현 MIDI 번호 (fretboard STRINGS 순서: 고음현→저음현)
// E4=64, B3=59, G3=55, D3=50, A2=45, E2=40
export const STANDARD_TUNING_MIDI = [64, 59, 55, 50, 45, 40]

// stringIndex(0=1번줄 고음 E) + fret → 옥타브 포함 피치명 (예: 'G2', 'Eb4')
// Tone.js가 그대로 받는 scientific pitch notation을 반환한다.
export function getPitchFromFret(
  stringIndex: number,
  fret: number,
  useFlat: boolean = false
): string {
  const midi = STANDARD_TUNING_MIDI[stringIndex] + fret
  const octave = Math.floor(midi / 12) - 1
  const notesArray = useFlat ? NOTES_FLAT : NOTES_SHARP
  return `${notesArray[midi % 12]}${octave}`
}

// ─── Chords ──────────────────────────────────────────────────────────────────

export type ChordType =
  | 'major'
  | 'minor'
  | '7'
  | 'maj7'
  | 'm7'
  | 'sus2'
  | 'sus4'
  | 'dim7'
  | 'aug'
  | 'add9'

export const CHORD_LABELS: Record<ChordType, string> = {
  major: '',
  minor: 'm',
  '7': '7',
  maj7: 'maj7',
  m7: 'm7',
  sus2: 'sus2',
  sus4: 'sus4',
  dim7: 'dim7',
  aug: 'aug',
  add9: 'add9',
}

// Chord intervals in semitones from root
export const CHORD_INTERVALS: Record<ChordType, number[]> = {
  major: [0, 4, 7], // 1 3 5
  minor: [0, 3, 7], // 1 b3 5
  '7': [0, 4, 7, 10], // 1 3 5 b7
  maj7: [0, 4, 7, 11], // 1 3 5 7
  m7: [0, 3, 7, 10], // 1 b3 5 b7
  sus2: [0, 2, 7], // 1 2 5
  sus4: [0, 5, 7], // 1 4 5
  dim7: [0, 3, 6, 9], // 1 b3 b5 bb7
  aug: [0, 4, 8], // 1 3 #5
  add9: [0, 4, 7, 14], // 1 3 5 9
}

// Minor-character chords follow the minor-key flat convention (same as scales)
const MINOR_CHARACTER_CHORDS = new Set<ChordType>(['minor', 'm7', 'dim7'])

export function isChordFlat(rootNote: string, chordType: ChordType): boolean {
  return shouldUseFlat(rootNote, MINOR_CHARACTER_CHORDS.has(chordType))
}

export function getChordNotes(
  rootNote: string,
  chordType: ChordType
): string[] {
  const rootIndex = getNoteIndex(rootNote)
  const notesArray = isChordFlat(rootNote, chordType) ? NOTES_FLAT : NOTES_SHARP
  return CHORD_INTERVALS[chordType].map(
    interval => notesArray[(rootIndex + interval) % 12]
  )
}
