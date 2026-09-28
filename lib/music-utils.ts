// 표기 방식
export type NotationType = 'alphabetical' | 'syllabic' | 'intervals'

// 루트 기준 이동도법
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

// 고정도법: C는 항상 도
const FIXED_SOLFEGE_MAP: Record<string, string> = {
  C: '도',
  D: '레',
  E: '미',
  F: '파',
  G: '솔',
  A: '라',
  B: '시',
}

// 루트 기준 음정 표기
const INTERVAL_MAP: Record<number, string> = {
  0: '1',
  1: '♭2',
  2: '2',
  3: '♭3',
  4: '3',
  5: '4',
  6: '#4', // 리디안 4도와 비구성음의 증4도 표기
  7: '5',
  8: '♭6',
  9: '6',
  10: '♭7',
  11: '7',
}

// 지원 음계
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

// 기본 음계만 노출하고 나머지는 더보기에 표시한다.
export const MAIN_SCALE_TYPES: ScaleType[] = [
  'major',
  'minor',
  'major-pentatonic',
  'minor-pentatonic',
]

// 음계 이름
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

// 비구성음의 샤프·플랫 표기에 쓰는 음계 성격
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

// 반음 순서의 기준 음이름
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

// 루트 선택용 이명동음 목록
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

// 반음 순서의 샤프 표기
const NOTES_SHARP = CHROMATIC_NOTES

// 반음 순서의 플랫 표기
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

// 장음계: 1 2 3 4 5 6 7
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11]

// 자연단음계: 1 2 b3 4 5 b6 b7
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10]

// 메이저 펜타토닉: 1 2 3 5 6
const MAJOR_PENTATONIC_INTERVALS = [0, 2, 4, 7, 9]

// 마이너 펜타토닉: 1 b3 4 5 b7
const MINOR_PENTATONIC_INTERVALS = [0, 3, 5, 7, 10]

// 도리안: 1 2 b3 4 5 6 b7
const DORIAN_INTERVALS = [0, 2, 3, 5, 7, 9, 10]

// 믹소리디안: 1 2 3 4 5 6 b7
const MIXOLYDIAN_INTERVALS = [0, 2, 4, 5, 7, 9, 10]

// 리디안: 1 2 3 #4 5 6 7
const LYDIAN_INTERVALS = [0, 2, 4, 6, 7, 9, 11]

// 프리지안: 1 b2 b3 4 5 b6 b7
const PHRYGIAN_INTERVALS = [0, 1, 3, 5, 7, 8, 10]

// 화성단음계: 1 2 b3 4 5 b6 7
const HARMONIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 11]

// 가락단음계 상행형: 1 2 b3 4 5 6 7
const MELODIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 9, 11]

export function getNoteIndex(note: string): number {
  if (!/^[A-G](#{1,2}|b{1,2})?$/.test(note)) return -1
  const natural = NATURAL_PITCHES[NOTE_LETTERS.indexOf(note[0])]
  const alteration = (note.length - 1) * (note[1] === 'b' ? -1 : 1)
  return (natural + alteration + 12) % 12
}

// 장음계 계열의 플랫 우선 루트
const MAJOR_FLAT_ROOTS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'])

// 단음계 계열의 플랫 우선 루트
const MINOR_FLAT_ROOTS = new Set(['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab'])

function shouldUseFlat(rootNote: string, isMinor: boolean): boolean {
  if (rootNote.includes('b')) return true // 플랫 루트는 플랫 우선
  if (rootNote.includes('#')) return false // 샤프 루트는 샤프 우선
  return isMinor
    ? MINOR_FLAT_ROOTS.has(rootNote)
    : MAJOR_FLAT_ROOTS.has(rootNote)
}

// 비구성음에만 적용하며 구성음은 getScaleNotes 표기를 따른다.
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

// 표준 튜닝 MIDI: 1번 줄(고음)부터 6번 줄(저음) 순서
export const STANDARD_TUNING_MIDI = [64, 59, 55, 50, 45, 40]

// 1번 줄부터의 인덱스와 프렛으로 옥타브 포함 음이름을 구한다.
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

// 루트부터의 반음 간격
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

// 단화음 계열은 단음계의 플랫 표기를 따른다.
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
