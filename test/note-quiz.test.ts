import {
  createQuestionPool,
  createSession,
  DEFAULT_QUIZ_SETTINGS,
  parseQuizHistory,
  QUIZ_MODES,
  samePosition,
} from '../lib/note-quiz'
import { getNoteIndex } from '../lib/music-utils'

const tuning = [64, 59, 55, 50, 45, 40]
test('beginner pool matches independent standard-tuning reference', () => {
  const expected = [
    ['E', 'F', 'F#', 'G', 'G#', 'A'],
    ['B', 'C', 'C#', 'D', 'D#', 'E'],
    ['G', 'G#', 'A', 'A#', 'B', 'C'],
    ['D', 'D#', 'E', 'F', 'F#', 'G'],
    ['A', 'A#', 'B', 'C', 'C#', 'D'],
    ['E', 'F', 'F#', 'G', 'G#', 'A'],
  ]
  const pool = createQuestionPool(DEFAULT_QUIZ_SETTINGS)
  expect(pool).toHaveLength(24)
  for (const q of pool) {
    expect(q.note).toMatch(/^[A-G]$/)
    expect(q.note).toBe(expected[q.stringIndex][q.fret])
    expect(q.answers).toEqual([
      expect.objectContaining({ stringIndex: q.stringIndex, fret: q.fret }),
    ])
  }
})

test('every scope and mode has only in-range eligible answers, including empty scopes', () => {
  for (const mode of Object.keys(QUIZ_MODES) as (keyof typeof QUIZ_MODES)[])
    for (const lastFret of [5, 12] as const)
      for (const stringIndex of [null, 0, 1, 2, 3, 4, 5])
        for (const accidentals of [false, true]) {
          const pool = createQuestionPool({
            mode,
            lastFret,
            stringIndex,
            accidentals,
          })
          for (const q of pool)
            for (const a of q.answers) {
              expect(a.fret).toBeGreaterThanOrEqual(0)
              expect(a.fret).toBeLessThanOrEqual(lastFret)
              if (stringIndex !== null) expect(a.stringIndex).toBe(stringIndex)
              if (!accidentals)
                expect([0, 2, 4, 5, 7, 9, 11]).toContain(
                  (tuning[a.stringIndex] + a.fret) % 12
                )
              expect((tuning[a.stringIndex] + a.fret) % 12).toBe(
                getNoteIndex(q.note)
              )
              if (q.reference)
                expect(
                  tuning[a.stringIndex] +
                    a.fret -
                    tuning[q.reference.stringIndex] -
                    q.reference.fret
                ).toBe(q.prompt.includes('완전5도') ? 7 : 12)
            }
          expect(createSession(pool)).toHaveLength(pool.length ? 10 : 0)
        }
})

test('0 and 12 are both valid for note finding, reverse remains one exact location', () => {
  for (const mode of ['note', 'reverse'] as const) {
    const q = createQuestionPool({
      ...DEFAULT_QUIZ_SETTINGS,
      mode,
      lastFret: 12,
    }).find(q => q.stringIndex === 0 && q.fret === 0)!
    expect(
      q.answers.some(p => samePosition(p, { stringIndex: 0, fret: 12 }))
    ).toBe(mode === 'note')
  }
})

test('triads use root, third, fifth with independent semitone formulas across 12 roots', () => {
  const pool = createQuestionPool({
    ...DEFAULT_QUIZ_SETTINGS,
    mode: 'triad',
    lastFret: 12,
    accidentals: true,
  })
  const roots = new Set<string>()
  for (const q of pool) {
    const root = q.prompt.split(' ')[0]
    roots.add(root)
    const degree = q.prompt.includes('근음')
      ? 0
      : q.prompt.includes('3음')
        ? 1
        : 2
    expect((getNoteIndex(q.note) - getNoteIndex(root) + 12) % 12).toBe(
      (q.prompt.includes('메이저') ? [0, 4, 7] : [0, 3, 7])[degree]
    )
  }
  expect(roots.size).toBe(12)
})

test('sessions do not mutate pool, repeat only after exhausting a small pool, review stays in pool', () => {
  const pool = createQuestionPool(DEFAULT_QUIZ_SETTINGS)
  const original = [...pool]
  const session = createSession(pool)
  expect(new Set(session).size).toBe(10)
  expect(pool).toEqual(original)
  const small = pool.slice(0, 2)
  const repeated = createSession(small)
  repeated.forEach((q, i) => {
    expect(small).toContain(q)
    if (i) expect(q).not.toBe(repeated[i - 1])
  })
  expect(createSession([pool[0]], 1)).toEqual([pool[0]])
  expect(createSession([])).toEqual([])
  const octavePool = createQuestionPool({
    ...DEFAULT_QUIZ_SETTINGS,
    lastFret: 12,
  })
  expect(new Set(createSession(octavePool).map(q => q.prompt)).size).toBe(10)
})

test('stored records reject malformed or inconsistent input', () => {
  const record = {
    date: '2026-09-23T00:00:00.000Z',
    mode: 'note',
    total: 10,
    firstTry: 8,
    scope: '전체 줄 · 0–5프렛',
    review: false,
  }
  expect(parseQuizHistory(JSON.stringify([record]))).toEqual([record])
  for (const raw of [
    null,
    '{',
    '{}',
    JSON.stringify([{ ...record, firstTry: 11 }]),
    JSON.stringify([{ ...record, total: 1 }]),
    JSON.stringify([{ ...record, mode: 'bad' }]),
    JSON.stringify(Array(11).fill(record)),
  ])
    expect(parseQuizHistory(raw)).toEqual([])
})
