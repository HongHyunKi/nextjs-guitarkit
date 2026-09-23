import {
  DEFAULT_SETTINGS,
  parsePracticeSettings,
  noteVisibility,
  parseSavedBpm,
} from '../lib/practice-settings'

test('restores practice settings, including the original mode while finding a note', () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    rootNote: 'Bb',
    displayMode: 'scale',
    highlightedNote: 1,
    startFret: 12,
    frets: 24,
  }
  expect(parsePracticeSettings(JSON.stringify(settings))).toEqual(settings)
  for (const raw of [
    null,
    '{',
    'null',
    '{"rootNote":"H"}',
    '{"rootNote":"B#"}',
    '{"frets":25}',
    '{"startFret":14,"frets":15}',
    '{"highlightedNote":12}',
    '{"displayMode":"unknown"}',
  ]) {
    expect(parsePracticeSettings(raw)).toEqual(DEFAULT_SETTINGS)
  }
})

test('all and overlay expose non-scale notes; finding an enharmonic note overrides the scale filter', () => {
  expect(noteVisibility('scale', false, 'Db', null).visible).toBe(false)
  expect(noteVisibility('scale', true, 'C', null).visible).toBe(true)
  for (const mode of ['all', 'overlay'] as const)
    expect(noteVisibility(mode, false, 'Db', null).visible).toBe(true)
  for (const note of ['C#', 'Db'])
    expect(noteVisibility('scale', false, note, 1)).toEqual({
      visible: true,
      highlighted: true,
    })
  expect(noteVisibility('all', true, 'C', 1).highlighted).toBe(false)
})

test('BPM restore accepts only valid integers in the player range', () => {
  expect(parseSavedBpm('120', 90, 60, 200)).toBe(120)
  for (const value of [null, '', 'NaN', 'Infinity', '20', '201', '90.5'])
    expect(parseSavedBpm(value, 90, 60, 200)).toBe(90)
})
