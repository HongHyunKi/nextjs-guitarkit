import {
  getChordNotes,
  getNoteIndex,
  CHORD_INTERVALS,
  CHORD_LABELS,
  type ChordType,
} from '@/lib/music-utils'
import { getChordVoicings } from '@/lib/chord-voicings'
import { getDiatonicChords } from '@/lib/chord-utils'
import { SCALE_LABELS, type ScaleType } from '@/lib/music-utils'

test('backing chord spellings and sounding pitches agree across all roots and scales', () => {
  for (const root of ALL_ROOTS)
    for (const scale of Object.keys(SCALE_LABELS) as ScaleType[]) {
      for (const chord of getDiatonicChords(root, scale).chords) {
        expect(chord.notes[0]).toBe(chord.root)
        const formula = {
          major: [0, 4, 7],
          minor: [0, 3, 7],
          diminished: [0, 3, 6],
          augmented: [0, 4, 8],
          dominant7: [0, 4, 7, 10],
        }[chord.quality]
        expect(
          chord.notes.map(
            n => (getNoteIndex(n) - getNoteIndex(chord.root) + 12) % 12
          )
        ).toEqual(formula)
        expect(chord.midiNotes.map(n => n % 12)).toEqual(
          chord.notes.map(getNoteIndex)
        )
        expect(chord.midiNotes.map(n => n - chord.midiNotes[0])).toEqual(
          formula
        )
      }
    }
  expect(getDiatonicChords('C#', 'major').chords[0].notes).toEqual([
    'C#',
    'E#',
    'G#',
  ])
  expect(getDiatonicChords('D', 'harmonic-minor').chords[4].notes).toEqual([
    'A',
    'C#',
    'E',
  ])
})

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

const ALL_TYPES = Object.keys(CHORD_LABELS) as ChordType[]

// ─── getChordNotes ───────────────────────────────────────────────────────────

describe('getChordNotes', () => {
  it('returns the correct number of notes for every type', () => {
    ALL_ROOTS.forEach(root => {
      ALL_TYPES.forEach(type => {
        expect(getChordNotes(root, type)).toHaveLength(
          CHORD_INTERVALS[type].length
        )
      })
    })
  })

  it('first note matches the input root spelling', () => {
    ALL_ROOTS.forEach(root => {
      ALL_TYPES.forEach(type => {
        expect(getChordNotes(root, type)[0]).toBe(root)
      })
    })
  })

  it('no chord mixes sharps and flats', () => {
    ALL_ROOTS.forEach(root => {
      ALL_TYPES.forEach(type => {
        const notes = getChordNotes(root, type)
        const hasSharp = notes.some(n => n.includes('#'))
        const hasFlat = notes.some(n => n.includes('b'))
        expect(hasSharp && hasFlat).toBe(false)
      })
    })
  })

  it('all notes sit at the correct chromatic index (formula cross-check)', () => {
    ALL_ROOTS.forEach(root => {
      const rootIdx = getNoteIndex(root)
      ALL_TYPES.forEach(type => {
        const notes = getChordNotes(root, type)
        CHORD_INTERVALS[type].forEach((interval, i) => {
          expect(getNoteIndex(notes[i])).toBe((rootIdx + interval) % 12)
        })
      })
    })
  })

  describe('reference chords', () => {
    it('C major: C E G', () => {
      expect(getChordNotes('C', 'major')).toEqual(['C', 'E', 'G'])
    })
    it('A minor: A C E', () => {
      expect(getChordNotes('A', 'minor')).toEqual(['A', 'C', 'E'])
    })
    it('G7: G B D F', () => {
      expect(getChordNotes('G', '7')).toEqual(['G', 'B', 'D', 'F'])
    })
    it('Fmaj7: F A C E', () => {
      expect(getChordNotes('F', 'maj7')).toEqual(['F', 'A', 'C', 'E'])
    })
    it('Dm7: D F A C', () => {
      expect(getChordNotes('D', 'm7')).toEqual(['D', 'F', 'A', 'C'])
    })
    it('Csus4: C F G', () => {
      expect(getChordNotes('C', 'sus4')).toEqual(['C', 'F', 'G'])
    })
    it('Asus2: A B E', () => {
      expect(getChordNotes('A', 'sus2')).toEqual(['A', 'B', 'E'])
    })
    it('Cdim7: C Eb Gb A', () => {
      expect(getChordNotes('C', 'dim7')).toEqual(['C', 'Eb', 'Gb', 'A'])
    })
    it('Caug: C E G#', () => {
      expect(getChordNotes('C', 'aug')).toEqual(['C', 'E', 'G#'])
    })
    it('Cadd9: C E G D', () => {
      expect(getChordNotes('C', 'add9')).toEqual(['C', 'E', 'G', 'D'])
    })
    it('Bb major: Bb D F (flat spelling)', () => {
      expect(getChordNotes('Bb', 'major')).toEqual(['Bb', 'D', 'F'])
    })
    it('F#m7: F# A C# E (sharp spelling)', () => {
      expect(getChordNotes('F#', 'm7')).toEqual(['F#', 'A', 'C#', 'E'])
    })
  })
})

// ─── getChordVoicings ────────────────────────────────────────────────────────

const pitchClass = (pitch: string) => getNoteIndex(pitch.replace(/-?\d+$/, ''))

describe('getChordVoicings', () => {
  it('every voicing sounds exactly the chord tones (all roots × all types)', () => {
    ALL_ROOTS.forEach(root => {
      const rootIdx = getNoteIndex(root)
      ALL_TYPES.forEach(type => {
        const chordClasses = new Set(
          CHORD_INTERVALS[type].map(iv => (rootIdx + iv) % 12)
        )
        getChordVoicings(root, type).forEach(voicing => {
          const soundedClasses = new Set(voicing.pitches.map(pitchClass))
          // 모든 소리가 코드 구성음이어야 하고, 구성음이 빠짐없이 포함되어야 한다
          expect(soundedClasses).toEqual(chordClasses)
        })
      })
    })
  })

  it('fret numbers stay within a playable range (0–15)', () => {
    ALL_ROOTS.forEach(root => {
      ALL_TYPES.forEach(type => {
        getChordVoicings(root, type).forEach(voicing => {
          voicing.frets.forEach(fret => {
            expect(fret).toBeGreaterThanOrEqual(-1)
            expect(fret).toBeLessThanOrEqual(15)
          })
        })
      })
    })
  })

  it('pitches length equals number of non-muted strings', () => {
    ALL_ROOTS.forEach(root => {
      ALL_TYPES.forEach(type => {
        getChordVoicings(root, type).forEach(voicing => {
          expect(voicing.pitches).toHaveLength(
            voicing.frets.filter(f => f >= 0).length
          )
        })
      })
    })
  })

  describe('open-position reference shapes', () => {
    it('E major E-form is the open E chord (022100)', () => {
      const v = getChordVoicings('E', 'major').find(v => v.form === 'E')!
      expect(v.rootFret).toBe(0)
      expect(v.frets).toEqual([0, 2, 2, 1, 0, 0])
    })
    it('A major A-form is the open A chord (x02220)', () => {
      const v = getChordVoicings('A', 'major').find(v => v.form === 'A')!
      expect(v.rootFret).toBe(0)
      expect(v.frets).toEqual([-1, 0, 2, 2, 2, 0])
    })
    it('D major D-form is the open D chord (xx0232)', () => {
      const v = getChordVoicings('D', 'major').find(v => v.form === 'D')!
      expect(v.rootFret).toBe(0)
      expect(v.frets).toEqual([-1, -1, 0, 2, 3, 2])
    })
    it('G major E-form is the 3rd-fret barre (355433)', () => {
      const v = getChordVoicings('G', 'major').find(v => v.form === 'E')!
      expect(v.rootFret).toBe(3)
      expect(v.frets).toEqual([3, 5, 5, 4, 3, 3])
    })
    it('voicings are sorted by position (low first)', () => {
      const voicings = getChordVoicings('C', 'major')
      const positions = voicings.map(v => v.rootFret)
      expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    })
  })
})
