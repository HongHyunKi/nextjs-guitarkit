import {
  getScaleNotes,
  getNoteIndex,
  ScaleType,
  SCALE_CHARACTER,
} from '@/lib/music-utils'

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'dominant7'
export type BackingStyle = 'rock' | 'blues' | 'jazz'

export interface Chord {
  root: string
  quality: ChordQuality
  numeral: string
  notes: string[]
  midiNotes: number[]
}

export interface DiatonicChords {
  chords: Chord[]
  scaleType: ScaleType
  rootNote: string
}

// Pentatonic scales skip degrees, so triads can't be derived by stacking
// scale-degree thirds the way 7-note (diatonic) scales can — kept as a
// curated approximation.
const MAJOR_PENT_QUALITIES: ChordQuality[] = [
  'major',
  'minor',
  'minor',
  'major',
  'minor',
]
const MINOR_PENT_QUALITIES: ChordQuality[] = [
  'minor',
  'major',
  'minor',
  'minor',
  'major',
]

const MAJOR_PENT_NUMERALS = ['I', 'IIm', 'IIIm', 'V', 'VIm']
const MINOR_PENT_NUMERALS = ['Im', 'IIIb', 'IVm', 'Vm', 'VIIb']

const PENTATONIC_TYPES = new Set<ScaleType>([
  'major-pentatonic',
  'minor-pentatonic',
])

// Reference degree intervals (major scale) used only to label accidentals —
// e.g. natural minor's b3 is expressed as "IIIb" relative to this baseline.
const MAJOR_REFERENCE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  major: '',
  minor: 'm',
  diminished: 'dim',
  augmented: 'aug',
  dominant7: '7',
}

function tripleQuality(
  thirdInterval: number,
  fifthInterval: number
): ChordQuality {
  if (thirdInterval === 4 && fifthInterval === 7) return 'major'
  if (thirdInterval === 3 && fifthInterval === 7) return 'minor'
  if (thirdInterval === 3 && fifthInterval === 6) return 'diminished'
  if (thirdInterval === 4 && fifthInterval === 8) return 'augmented'
  return thirdInterval >= 4 ? 'major' : 'minor'
}

// Derives diatonic triads for any 7-note scale by stacking scale-degree
// thirds (root, +2 degrees, +4 degrees) — works uniformly for major, minor,
// the modes, and harmonic/melodic minor without a hardcoded table per scale.
function buildDiatonicTriads(
  scaleNotes: string[]
): { quality: ChordQuality; numeral: string }[] {
  const n = scaleNotes.length
  const tonicIdx = getNoteIndex(scaleNotes[0])

  return scaleNotes.map((note, i) => {
    const rootIdx = getNoteIndex(note)
    const thirdIdx = getNoteIndex(scaleNotes[(i + 2) % n])
    const fifthIdx = getNoteIndex(scaleNotes[(i + 4) % n])
    const thirdInterval = (thirdIdx - rootIdx + 12) % 12
    const fifthInterval = (fifthIdx - rootIdx + 12) % 12
    const quality = tripleQuality(thirdInterval, fifthInterval)

    const degreeInterval = (rootIdx - tonicIdx + 12) % 12
    const diff = degreeInterval - MAJOR_REFERENCE_INTERVALS[i]
    const accidental = diff === -1 ? 'b' : diff === 1 ? '#' : ''
    const numeral = `${ROMAN_NUMERALS[i]}${accidental}${QUALITY_SUFFIX[quality]}`

    return { quality, numeral }
  })
}

export function noteToMidi(note: string, octave: number): number {
  return (octave + 1) * 12 + getNoteIndex(note)
}

function buildMidiNotes(notes: string[]): number[] {
  const result: number[] = []
  let prevMidi = -1
  for (const note of notes) {
    let midi = noteToMidi(note, 3)
    while (midi <= prevMidi) midi += 12
    result.push(midi)
    prevMidi = midi
  }
  return result
}

export function getDiatonicChords(
  rootNote: string,
  scaleType: ScaleType
): DiatonicChords {
  const scaleNotes = getScaleNotes(rootNote, scaleType)

  let diatonics: { quality: ChordQuality; numeral: string }[]
  if (scaleType === 'major-pentatonic') {
    diatonics = MAJOR_PENT_QUALITIES.map((quality, i) => ({
      quality,
      numeral: MAJOR_PENT_NUMERALS[i],
    }))
  } else if (scaleType === 'minor-pentatonic') {
    diatonics = MINOR_PENT_QUALITIES.map((quality, i) => ({
      quality,
      numeral: MINOR_PENT_NUMERALS[i],
    }))
  } else {
    diatonics = buildDiatonicTriads(scaleNotes)
  }

  const chords: Chord[] = scaleNotes.map((note, i) => {
    const { quality, numeral } = diatonics[i]
    const notes =
      scaleNotes.length === 7
        ? [note, scaleNotes[(i + 2) % 7], scaleNotes[(i + 4) % 7]]
        : [0, 2, 4].map(
            degree =>
              getScaleNotes(note, quality === 'minor' ? 'minor' : 'major')[
                degree
              ]
          )
    return {
      root: note,
      quality,
      numeral,
      notes,
      midiNotes: buildMidiNotes(notes),
    }
  })

  return { chords, scaleType, rootNote }
}

export function getChordLabel(chord: Chord): string {
  const suffix: Record<ChordQuality, string> = {
    major: 'maj',
    minor: 'm',
    diminished: 'dim',
    augmented: 'aug',
    dominant7: '7',
  }
  return `${chord.root}${suffix[chord.quality]}`
}

export function getStyleProgression(
  style: BackingStyle,
  scaleType: ScaleType
): number[] {
  const isPent = PENTATONIC_TYPES.has(scaleType)
  const isMinor = SCALE_CHARACTER[scaleType] === 'minor'

  if (isPent) {
    return isMinor
      ? [0, 2, 3, 4] // Im - IIIb - IVm - Vm
      : [0, 3, 4, 3] // I - V - VIm - V
  }

  if (isMinor) {
    switch (style) {
      case 'rock':
        return [0, 5, 6, 4] // Im - VIb - VIIb - Vm
      case 'blues':
        return [0, 3, 0, 4] // Im - IVm - Im - Vm
      case 'jazz':
        return [1, 4, 0, 5] // IIdim - Vm - Im - VIb
    }
  } else {
    switch (style) {
      case 'rock':
        return [0, 4, 5, 3] // I - V - VIm - IV
      case 'blues':
        return [0, 3, 0, 4] // I - IV - I - V
      case 'jazz':
        return [1, 4, 0, 5] // IIm - V - I - VIm
    }
  }
}
