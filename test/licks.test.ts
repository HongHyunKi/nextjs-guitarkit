import {
  LICKS,
  getLickFrame,
  lickPitch,
  lickPitchCurve,
  lickPosition,
  lickTab,
  lickGroup,
  filterLicks,
  LICK_GROUPS,
} from '../lib/licks'

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
      expect(note.fret).toBeLessThanOrEqual(10)
      // Independent pitch classes: A, C, D, E, G.
      expect([9, 0, 2, 4, 7]).toContain(
        (tuning[note.stringIndex] + note.fret) % 12
      )
      if (note.technique) {
        expect(note.duration).toBeGreaterThanOrEqual(2)
        expect(note.targetFret).toBeDefined()
        expect([9, 0, 2, 4, 7]).toContain(
          (tuning[note.stringIndex] + note.targetFret!) % 12
        )
        if (note.technique !== 'slide')
          expect(note.targetFret! - note.fret).toBe(2)
      }
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

test('48 distinct phrases cover basic, bend, slide and mixed techniques', () => {
  expect(LICKS).toHaveLength(48)
  expect(new Set(LICKS.map(l => JSON.stringify(l.notes))).size).toBe(48)
  expect(new Set(LICKS.map(lickGroup)).size).toBe(4)
  for (const style of ['브릿팝', '블루스 록', '하드 록', '멜로딕 록']) {
    expect(LICKS.filter(l => l.style === style)).toHaveLength(6)
  }
})

test('recommended shortlist has eight licks and works with every technique filter', () => {
  expect(filterLicks('전체', true)).toHaveLength(8)
  expect(filterLicks('전체', false)).toEqual(LICKS)
  expect(filterLicks('전체', true)[0]).toBe(LICKS[0])
  for (const group of LICK_GROUPS)
    for (const recommended of [true, false]) {
      const choices = filterLicks(group, recommended)
      expect(choices.length).toBeGreaterThan(0)
      expect(
        choices.every(l => group === '전체' || lickGroup(l) === group)
      ).toBe(true)
      if (recommended)
        expect(choices.every(l => Boolean(l.recommendation))).toBe(true)
    }
})

test('pitch curves and fret guidance distinguish bends, releases and slides', () => {
  for (const lick of LICKS)
    for (const note of lick.notes) {
      const curve = lickPitchCurve(note)
      expect(curve[0]).toEqual([0, 0])
      expect(curve[curve.length - 1]).toEqual([
        1,
        note.technique === 'release'
          ? 0
          : (note.targetFret ?? note.fret) - note.fret,
      ])
      expect(lickPosition(note, 1).fret).toBe(
        note.technique === 'slide' ? note.targetFret : note.fret
      )
      expect(lickPosition(note, 0).fret).toBe(note.fret)
      expect(
        curve.every(([time], i) => i === 0 || time > curve[i - 1][0])
      ).toBe(true)
    }
  expect(lickTab(LICKS.find(l => l.id === 'bend-release')!.notes[0])).toBe(
    '7b9r7'
  )
  expect(lickTab(LICKS.find(l => l.id === 'slide-down')!.notes[0])).toBe('7\\5')
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
