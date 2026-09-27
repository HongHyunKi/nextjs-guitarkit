import {
  DRUM_PATTERNS,
  getLickDrumSteps,
  type LickDrums,
} from '../lib/drum-patterns'
import {
  LICKS,
  LICK_KEYS,
  transposeLick,
  getLickFrame,
  type LickKey,
} from '../lib/licks'

test('lick drum events reuse rock patterns and stay in their eighth-note scheduling window', () => {
  for (const pattern of ['4beat', '8beat', '16beat'] as const) {
    const events = Array.from({ length: 8 }, (_, tick) =>
      getLickDrumSteps(pattern, tick, false).map(event => ({
        ...event,
        at: tick + event.offset,
      }))
    ).flat()
    expect(events.map(e => e.step)).toEqual(DRUM_PATTERNS.rock[pattern])
    expect(events.filter(e => e.step.kick).map(e => e.at)).toEqual([0, 4])
    expect(events.filter(e => e.step.snare).map(e => e.at)).toEqual([2, 6])
    expect(events.filter(e => e.step.hihat)).toHaveLength(
      pattern === '4beat' ? 4 : pattern === '8beat' ? 8 : 16
    )
    expect(events.every(e => e.offset >= 0 && e.offset < 1)).toBe(true)
    for (const bpm of [40, 140])
      expect((events[events.length - 1].at * 30) / bpm).toBeLessThan(240 / bpm)
  }
})

test('count-in and off are drum-silent; listen and response use identical drums', () => {
  for (const pattern of ['off', '4beat', '8beat', '16beat'] as LickDrums[]) {
    for (let tick = 0; tick < 8; tick++) {
      expect(getLickDrumSteps(pattern, tick, true)).toEqual([])
      expect(getLickDrumSteps('off', tick, false)).toEqual([])
      const listen = getLickFrame(LICKS[0], 8 + tick)
      const response = getLickFrame(LICKS[0], 16 + tick)
      expect(
        getLickDrumSteps(pattern, listen.tick, listen.phase === 'count-in')
      ).toEqual(
        getLickDrumSteps(pattern, response.tick, response.phase === 'count-in')
      )
      expect(response.lead).toBeNull()
    }
  }
})

test('every key transposes all licks and targets without changing rhythm or originals', () => {
  const snapshot = JSON.stringify(LICKS)
  const tuning = [64, 59, 55, 50, 45, 40]
  const roots = { A: 9, C: 0, D: 2, E: 4, G: 7 }
  for (const key of Object.keys(LICK_KEYS) as LickKey[])
    for (const lick of LICKS) {
      const moved = transposeLick(lick, key)
      moved.notes.forEach((note, index) => {
        const original = lick.notes[index]
        expect(note.fret - original.fret).toBe(LICK_KEYS[key])
        expect(note.tick).toBe(original.tick)
        expect(note.duration).toBe(original.duration)
        expect(note.fret).toBeGreaterThanOrEqual(0)
        expect(note.fret).toBeLessThanOrEqual(24)
        for (const fret of [note.fret, note.targetFret ?? note.fret]) {
          expect([0, 3, 5, 7, 10]).toContain(
            (tuning[note.stringIndex] + fret - roots[key] + 12) % 12
          )
        }
        if (note.targetFret !== undefined)
          expect(Math.min(note.fret, note.targetFret)).toBeGreaterThan(0)
        if (note.targetFret !== undefined)
          expect(note.targetFret - note.fret).toBe(
            original.targetFret! - original.fret
          )
      })
    }
  expect(JSON.stringify(LICKS)).toBe(snapshot)
})
