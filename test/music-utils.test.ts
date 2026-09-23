import {
  getNoteIndex,
  noteToFixedSolfege,
  getNoteFromFret,
  getPitchFromFret,
  getScaleNotes,
  isScaleFlat,
  CHROMATIC_NOTES,
  STANDARD_TUNING_MIDI,
  type ScaleType,
} from '@/lib/music-utils'

// ─── getNoteIndex ────────────────────────────────────────────────────────────

it('spells altered scales by degree, including mixed and double accidentals', () => {
  expect(getScaleNotes('D', 'harmonic-minor')).toEqual([
    'D',
    'E',
    'F',
    'G',
    'A',
    'Bb',
    'C#',
  ])
  expect(getScaleNotes('G', 'harmonic-minor')).toEqual([
    'G',
    'A',
    'Bb',
    'C',
    'D',
    'Eb',
    'F#',
  ])
  expect(getScaleNotes('D', 'melodic-minor')).toEqual([
    'D',
    'E',
    'F',
    'G',
    'A',
    'B',
    'C#',
  ])
  expect(getScaleNotes('C#', 'major')).toEqual([
    'C#',
    'D#',
    'E#',
    'F#',
    'G#',
    'A#',
    'B#',
  ])
  expect(getScaleNotes('D#', 'major')).toEqual([
    'D#',
    'E#',
    'F##',
    'G#',
    'A#',
    'B#',
    'C##',
  ])
  expect(getNoteIndex('E#')).toBe(5)
  expect(getNoteIndex('B#')).toBe(0)
  expect(getNoteIndex('Cb')).toBe(11)
  expect(getNoteIndex('Fb')).toBe(4)
  expect(getNoteIndex('F##')).toBe(7)
  expect(getNoteIndex('Bbb')).toBe(9)
  expect(getNoteIndex('H')).toBe(-1)
  expect(getScaleNotes('invalid', 'major')).toEqual([])
  expect(noteToFixedSolfege('E#')).toBe('미#')
  expect(noteToFixedSolfege('Bbb')).toBe('시♭♭')
  // B# on the B string, first fret is C4, never B#4/C5 in the audio path.
  expect(getPitchFromFret(1, 1)).toBe('C4')
})

describe('getNoteIndex', () => {
  it('returns 0–11 for sharp notes', () => {
    const expected: [string, number][] = [
      ['C', 0],
      ['C#', 1],
      ['D', 2],
      ['D#', 3],
      ['E', 4],
      ['F', 5],
      ['F#', 6],
      ['G', 7],
      ['G#', 8],
      ['A', 9],
      ['A#', 10],
      ['B', 11],
    ]
    expected.forEach(([note, idx]) => {
      expect(getNoteIndex(note)).toBe(idx)
    })
  })

  it('resolves flat enharmonics to same index as sharps', () => {
    const pairs: [string, string][] = [
      ['Db', 'C#'],
      ['Eb', 'D#'],
      ['Gb', 'F#'],
      ['Ab', 'G#'],
      ['Bb', 'A#'],
    ]
    pairs.forEach(([flat, sharp]) => {
      expect(getNoteIndex(flat)).toBe(getNoteIndex(sharp))
    })
  })
})

// ─── getNoteFromFret ─────────────────────────────────────────────────────────

describe('getNoteFromFret', () => {
  // Standard tuning open strings: E4 B3 G3 D3 A2 E2
  it('6th string (E) fret 5 → A', () => {
    expect(getNoteFromFret('E', 5)).toBe('A')
  })

  it('6th string (E) fret 8 → C', () => {
    expect(getNoteFromFret('E', 8)).toBe('C')
  })

  it('5th string (A) fret 3 → C', () => {
    expect(getNoteFromFret('A', 3)).toBe('C')
  })

  it('fret 0 returns open string note', () => {
    expect(getNoteFromFret('E', 0)).toBe('E')
    expect(getNoteFromFret('B', 0)).toBe('B')
    expect(getNoteFromFret('G', 0)).toBe('G')
  })

  it('wraps around octave correctly (fret 12 = same as fret 0)', () => {
    expect(getNoteFromFret('E', 12)).toBe('E')
    expect(getNoteFromFret('A', 12)).toBe('A')
  })

  it('useFlat=true returns flat notation', () => {
    // E + 1 fret = F, no flat needed
    expect(getNoteFromFret('E', 1, true)).toBe('F')
    // E + 2 frets = F#/Gb
    expect(getNoteFromFret('E', 2, true)).toBe('Gb')
    expect(getNoteFromFret('E', 2, false)).toBe('F#')
  })
})

// ─── getScaleNotes ───────────────────────────────────────────────────────────

const ALL_ROOTS = [
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

const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  'major-pentatonic': [0, 2, 4, 7, 9],
  'minor-pentatonic': [0, 3, 5, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],
  'melodic-minor': [0, 2, 3, 5, 7, 9, 11],
}

const SCALE_NOTE_COUNT: Record<ScaleType, number> = {
  major: 7,
  minor: 7,
  'major-pentatonic': 5,
  'minor-pentatonic': 5,
  dorian: 7,
  mixolydian: 7,
  lydian: 7,
  phrygian: 7,
  'harmonic-minor': 7,
  'melodic-minor': 7,
}

const ALL_SCALE_TYPES: ScaleType[] = [
  'major',
  'minor',
  'major-pentatonic',
  'minor-pentatonic',
  'dorian',
  'mixolydian',
  'lydian',
  'phrygian',
  'harmonic-minor',
  'melodic-minor',
]

describe('getScaleNotes', () => {
  describe('note count', () => {
    const scaleTypes: ScaleType[] = ALL_SCALE_TYPES
    scaleTypes.forEach(scaleType => {
      it(`${scaleType} always returns ${SCALE_NOTE_COUNT[scaleType]} notes`, () => {
        ALL_ROOTS.forEach(root => {
          const notes = getScaleNotes(root, scaleType)
          expect(notes).toHaveLength(SCALE_NOTE_COUNT[scaleType])
        })
      })
    })
  })

  describe('root note is first element', () => {
    const scaleTypes: ScaleType[] = ALL_SCALE_TYPES
    scaleTypes.forEach(scaleType => {
      it(`${scaleType}: first note matches root`, () => {
        ALL_ROOTS.forEach(root => {
          const notes = getScaleNotes(root, scaleType)
          expect(notes[0]).toBe(root)
        })
      })
    })
  })

  describe('diatonic letter spelling', () => {
    const scaleTypes: ScaleType[] = ALL_SCALE_TYPES
    scaleTypes.forEach(scaleType => {
      it(`${scaleType}: each degree uses its correct letter`, () => {
        ALL_ROOTS.forEach(root => {
          const notes = getScaleNotes(root, scaleType)
          const letters = 'CDEFGAB'
          const degrees =
            scaleType === 'major-pentatonic'
              ? [0, 1, 2, 4, 5]
              : scaleType === 'minor-pentatonic'
                ? [0, 2, 3, 4, 6]
                : [0, 1, 2, 3, 4, 5, 6]
          expect(notes.map(n => n[0])).toEqual(
            degrees.map(d => letters[(letters.indexOf(root[0]) + d) % 7])
          )
        })
      })
    })
  })

  describe('chromatic index correctness — all 12 roots × 4 scales', () => {
    const scaleTypes: ScaleType[] = ALL_SCALE_TYPES
    scaleTypes.forEach(scaleType => {
      it(`${scaleType}: all notes at correct chromatic index`, () => {
        ALL_ROOTS.forEach(root => {
          const rootIdx = getNoteIndex(root)
          const notes = getScaleNotes(root, scaleType)
          const intervals = SCALE_INTERVALS[scaleType]
          intervals.forEach((interval, i) => {
            const expectedIdx = (rootIdx + interval) % 12
            const actualIdx = getNoteIndex(notes[i])
            expect(actualIdx).toBe(expectedIdx)
          })
        })
      })
    })
  })

  describe('reference values from CLAUDE.md', () => {
    it('C major-pentatonic: C D E G A', () => {
      expect(getScaleNotes('C', 'major-pentatonic')).toEqual([
        'C',
        'D',
        'E',
        'G',
        'A',
      ])
    })

    it('C# major-pentatonic: C# D# E# G# A#', () => {
      expect(getScaleNotes('C#', 'major-pentatonic')).toEqual([
        'C#',
        'D#',
        'E#',
        'G#',
        'A#',
      ])
    })

    it('Db major-pentatonic: Db Eb F Ab Bb', () => {
      expect(getScaleNotes('Db', 'major-pentatonic')).toEqual([
        'Db',
        'Eb',
        'F',
        'Ab',
        'Bb',
      ])
    })

    it('D# minor-pentatonic: D# F# G# A# C# (known bug regression)', () => {
      expect(getScaleNotes('D#', 'minor-pentatonic')).toEqual([
        'D#',
        'F#',
        'G#',
        'A#',
        'C#',
      ])
    })

    it('C major: C D E F G A B', () => {
      expect(getScaleNotes('C', 'major')).toEqual([
        'C',
        'D',
        'E',
        'F',
        'G',
        'A',
        'B',
      ])
    })

    it('A minor: A B C D E F G', () => {
      expect(getScaleNotes('A', 'minor')).toEqual([
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
      ])
    })

    it('G major: G A B C D E F#', () => {
      expect(getScaleNotes('G', 'major')).toEqual([
        'G',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F#',
      ])
    })

    it('F major: F G A Bb C D E', () => {
      expect(getScaleNotes('F', 'major')).toEqual([
        'F',
        'G',
        'A',
        'Bb',
        'C',
        'D',
        'E',
      ])
    })

    it('Bb major: Bb C D Eb F G A', () => {
      expect(getScaleNotes('Bb', 'major')).toEqual([
        'Bb',
        'C',
        'D',
        'Eb',
        'F',
        'G',
        'A',
      ])
    })
  })

  describe('reference values for modes/harmonic/melodic minor', () => {
    it('D dorian: D E F G A B C', () => {
      expect(getScaleNotes('D', 'dorian')).toEqual([
        'D',
        'E',
        'F',
        'G',
        'A',
        'B',
        'C',
      ])
    })

    it('G mixolydian: G A B C D E F', () => {
      expect(getScaleNotes('G', 'mixolydian')).toEqual([
        'G',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
      ])
    })

    it('F lydian: F G A B C D E', () => {
      expect(getScaleNotes('F', 'lydian')).toEqual([
        'F',
        'G',
        'A',
        'B',
        'C',
        'D',
        'E',
      ])
    })

    it('E phrygian: E F G A B C D', () => {
      expect(getScaleNotes('E', 'phrygian')).toEqual([
        'E',
        'F',
        'G',
        'A',
        'B',
        'C',
        'D',
      ])
    })

    it('A harmonic minor: A B C D E F G#', () => {
      expect(getScaleNotes('A', 'harmonic-minor')).toEqual([
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G#',
      ])
    })

    it('A melodic minor (ascending): A B C D E F# G#', () => {
      expect(getScaleNotes('A', 'melodic-minor')).toEqual([
        'A',
        'B',
        'C',
        'D',
        'E',
        'F#',
        'G#',
      ])
    })
  })

  describe('enharmonic pair equivalence', () => {
    const pairs: [string, string][] = [
      ['C#', 'Db'],
      ['D#', 'Eb'],
      ['F#', 'Gb'],
      ['G#', 'Ab'],
      ['A#', 'Bb'],
    ]
    const scaleTypes: ScaleType[] = ALL_SCALE_TYPES

    pairs.forEach(([sharp, flat]) => {
      scaleTypes.forEach(scaleType => {
        it(`${sharp} and ${flat} ${scaleType} are enharmonically equivalent`, () => {
          const sharpNotes = getScaleNotes(sharp, scaleType)
          const flatNotes = getScaleNotes(flat, scaleType)
          // Same chromatic content, different spelling
          expect(sharpNotes.map(getNoteIndex)).toEqual(
            flatNotes.map(getNoteIndex)
          )
        })
      })
    })
  })
})

// ─── isScaleFlat ─────────────────────────────────────────────────────────────

describe('isScaleFlat', () => {
  it('flat root → true', () => {
    expect(isScaleFlat('Bb', 'major')).toBe(true)
    expect(isScaleFlat('Eb', 'major')).toBe(true)
    expect(isScaleFlat('Ab', 'minor')).toBe(true)
  })

  it('sharp root → false', () => {
    expect(isScaleFlat('C#', 'major')).toBe(false)
    expect(isScaleFlat('F#', 'major')).toBe(false)
    expect(isScaleFlat('G#', 'minor-pentatonic')).toBe(false)
  })

  it('natural major: F → true, G → false', () => {
    expect(isScaleFlat('F', 'major')).toBe(true)
    expect(isScaleFlat('G', 'major')).toBe(false)
  })

  it('natural minor: D → true, E → false', () => {
    expect(isScaleFlat('D', 'minor')).toBe(true)
    expect(isScaleFlat('E', 'minor')).toBe(false)
  })

  it('natural minor: C → true (flat convention)', () => {
    expect(isScaleFlat('C', 'minor')).toBe(true)
  })

  it('natural major: C → false (no flats/sharps)', () => {
    expect(isScaleFlat('C', 'major')).toBe(false)
  })
})

// ─── getPitchFromFret ────────────────────────────────────────────────────────

describe('getPitchFromFret', () => {
  it('open strings match standard tuning (E4 B3 G3 D3 A2 E2)', () => {
    expect(getPitchFromFret(0, 0)).toBe('E4')
    expect(getPitchFromFret(1, 0)).toBe('B3')
    expect(getPitchFromFret(2, 0)).toBe('G3')
    expect(getPitchFromFret(3, 0)).toBe('D3')
    expect(getPitchFromFret(4, 0)).toBe('A2')
    expect(getPitchFromFret(5, 0)).toBe('E2')
  })

  it('same fret on different strings yields different octaves', () => {
    // 3rd fret: low E string = G2, high E string = G4
    expect(getPitchFromFret(5, 3)).toBe('G2')
    expect(getPitchFromFret(0, 3)).toBe('G4')
  })

  it('12th fret is one octave above the open string', () => {
    expect(getPitchFromFret(5, 12)).toBe('E3')
    expect(getPitchFromFret(0, 12)).toBe('E5')
    expect(getPitchFromFret(4, 12)).toBe('A3')
  })

  it('octave increments at C, not at the root', () => {
    // A2 string: fret 2 = B2, fret 3 = C3 (octave boundary)
    expect(getPitchFromFret(4, 2)).toBe('B2')
    expect(getPitchFromFret(4, 3)).toBe('C3')
  })

  it('flat spelling when useFlat is true', () => {
    // low E string fret 2 = F#2 / Gb2
    expect(getPitchFromFret(5, 2, false)).toBe('F#2')
    expect(getPitchFromFret(5, 2, true)).toBe('Gb2')
    // A string fret 1 = A#2 / Bb2
    expect(getPitchFromFret(4, 1, false)).toBe('A#2')
    expect(getPitchFromFret(4, 1, true)).toBe('Bb2')
  })

  it('pitch class agrees with getNoteFromFret for every string and fret', () => {
    const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E']
    for (let s = 0; s < 6; s++) {
      for (let fret = 0; fret <= 24; fret++) {
        const pitch = getPitchFromFret(s, fret)
        const noteName = pitch.replace(/-?\d+$/, '')
        expect(noteName).toBe(getNoteFromFret(STRINGS[s], fret))
      }
    }
  })

  it('MIDI numbers of open strings are correct', () => {
    expect(STANDARD_TUNING_MIDI).toEqual([64, 59, 55, 50, 45, 40])
  })
})
