import { LICKS, getLickFrame, lickPitch } from '../lib/licks'

test('original licks are playable, monophonic 4/4 bars in A minor pentatonic', () => {
  const tuning = [64, 59, 55, 50, 45, 40]
  expect(new Set(LICKS.map(l => l.id)).size).toBe(LICKS.length)
  for (const lick of LICKS) {
    let end = 0
    for (const note of lick.notes) {
      expect(Number.isInteger(note.tick)).toBe(true)
      expect(note.tick).toBeGreaterThanOrEqual(end)
      expect(note.duration).toBeGreaterThan(0)
      expect(Number.isInteger(note.duration)).toBe(true)
      expect(note.stringIndex).toBeGreaterThanOrEqual(0)
      expect(note.stringIndex).toBeLessThan(6)
      expect(note.fret).toBeGreaterThanOrEqual(5)
      expect(note.fret).toBeLessThanOrEqual(8)
      // Independent pitch classes: A, C, D, E, G.
      expect([9, 0, 2, 4, 7]).toContain(
        (tuning[note.stringIndex] + note.fret) % 12
      )
      end = note.tick + note.duration
      expect(end).toBeLessThanOrEqual(8)
    }
    expect(end).toBe(8)
  }
  expect(LICKS[0].notes.map(lickPitch)).toEqual([
    'C4',
    'D4',
    'E4',
    'D4',
    'C4',
    'A3',
  ])
  expect(LICKS[1].notes.map(lickPitch)).toEqual([
    'C5',
    'A4',
    'G4',
    'E4',
    'G4',
    'C5',
    'A4',
  ])
})

test('four-beat count-in happens once; every listen bar is followed by a silent-lead response bar', () => {
  for (const lick of LICKS) {
    for (let step = 0; step < 8; step++) {
      expect(getLickFrame(lick, step)).toMatchObject({
        phase: 'count-in',
        round: 0,
        lead: null,
        note: null,
        beat: Math.floor(step / 2) + 1,
      })
    }
    for (let round = 0; round < 20; round++) {
      const heard: string[] = []
      for (let tick = 0; tick < 8; tick++) {
        const listen = getLickFrame(lick, 8 + round * 16 + tick)
        const respond = getLickFrame(lick, 16 + round * 16 + tick)
        expect(listen).toMatchObject({
          phase: 'listen',
          round: round + 1,
          tick,
        })
        expect(respond).toMatchObject({
          phase: 'respond',
          round: round + 1,
          tick,
          lead: null,
        })
        expect(respond.note).toEqual(listen.note)
        if (listen.lead) heard.push(lickPitch(listen.lead))
      }
      expect(heard).toEqual(lick.notes.map(lickPitch))
    }
  }
})

test('rests remain silent; held notes stay highlighted without being retriggered', () => {
  const rest = LICKS[2]
  expect(getLickFrame(rest, 8)).toMatchObject({ note: null, lead: null })
  expect(getLickFrame(rest, 9)).toMatchObject({ note: null, lead: null })
  expect(getLickFrame(rest, 10).lead).toEqual(rest.notes[0])
  const lick = LICKS[0]
  expect(getLickFrame(lick, 10).lead).toEqual(lick.notes[2])
  expect(getLickFrame(lick, 11)).toMatchObject({
    note: lick.notes[2],
    lead: null,
  })
  expect(getLickFrame(lick, 24)).toMatchObject({
    phase: 'listen',
    tick: 0,
    round: 2,
  })
})
