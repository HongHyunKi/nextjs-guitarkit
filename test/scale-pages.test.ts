import {
  SCALE_PAGES,
  findScalePage,
  getScaleFacts,
  rootPositionText,
  scaleTitle,
} from '../lib/scale-pages'

const facts = (slug: string) => getScaleFacts(findScalePage(slug)!)

test('17 roots x 10 scales with unique slugs', () => {
  expect(SCALE_PAGES).toHaveLength(170)
  expect(new Set(SCALE_PAGES.map(p => p.slug)).size).toBe(170)
  expect(findScalePage('c-sharp-minor-pentatonic')).toMatchObject({
    root: 'C#',
    scale: 'minor-pentatonic',
  })
  expect(findScalePage('d-flat-major')!.root).toBe('Db')
  expect(scaleTitle(findScalePage('a-minor')!)).toBe('A 내추럴 마이너 스케일')
})

test('formulas follow the reference catalog', () => {
  expect(facts('c-major').formula).toEqual(['1', '2', '3', '4', '5', '6', '7'])
  expect(facts('a-minor-pentatonic').formula).toEqual([
    '1',
    '♭3',
    '4',
    '5',
    '♭7',
  ])
  expect(facts('f-lydian').formula[3]).toBe('#4')
  expect(facts('e-phrygian').formula[1]).toBe('♭2')
  expect(facts('d-harmonic-minor').altered).toEqual(['Bb', 'C#'])
  expect(facts('c-major').altered).toEqual([])
})

test('fret positions match standard tuning', () => {
  const { strings } = facts('c-major')
  // 6번 줄(저음 E): C는 8프렛, 5번 줄(A): C는 3프렛
  expect(strings[5].rootFrets).toEqual([8])
  expect(strings[4].rootFrets).toEqual([3])
  expect(strings[0].frets).toEqual([0, 1, 3, 5, 7, 8, 10, 12])
  expect(rootPositionText(facts('c-major'))).toBe(
    '6번 줄 8프렛, 5번 줄 3프렛, 4번 줄 10프렛, 3번 줄 5프렛, 2번 줄 1프렛, 1번 줄 8프렛'
  )
})

test('same-note scales are relative keys and modes', () => {
  const same = facts('c-major').sameNotes.map(p => p.slug)
  expect(same).toEqual(
    expect.arrayContaining([
      'a-minor',
      'd-dorian',
      'e-phrygian',
      'f-lydian',
      'g-mixolydian',
    ])
  )
  expect(same).toHaveLength(5)
  expect(facts('c-major-pentatonic').sameNotes.map(p => p.slug)).toEqual([
    'a-minor-pentatonic',
  ])
})
