import { z } from 'zod'
import {
  SCALE_LABELS,
  CHROMATIC_NOTES,
  NOTES_FLAT,
  getNoteIndex,
} from './music-utils'

export type DisplayMode = 'all' | 'scale' | 'overlay'

const schema = z
  .object({
    rootNote: z
      .string()
      .refine(n => [...CHROMATIC_NOTES, ...NOTES_FLAT].includes(n))
      .default('C'),
    scaleType: z
      .enum(
        Object.keys(SCALE_LABELS) as [
          keyof typeof SCALE_LABELS,
          ...(keyof typeof SCALE_LABELS)[],
        ]
      )
      .default('major'),
    notationType: z
      .enum(['alphabetical', 'syllabic', 'intervals'])
      .default('alphabetical'),
    displayMode: z.enum(['all', 'scale', 'overlay']).default('overlay'),
    highlightedNote: z.number().int().min(0).max(11).nullable().default(null),
    startFret: z.number().int().min(0).max(21).default(0),
    frets: z.number().int().min(3).max(24).default(15),
    cagedEnabled: z.boolean().default(false),
    selectedCAGEDShape: z.enum(['all', 'C', 'A', 'G', 'E', 'D']).default('all'),
    guitarTone: z.enum(['electric', 'acoustic']).default('electric'),
  })
  .refine(s => s.frets - s.startFret >= 3)

export type PracticeSettings = z.infer<typeof schema>
export const DEFAULT_SETTINGS = schema.parse({})
export const PRACTICE_STORAGE_KEY = 'guitarkit:practice:v1'

export function parsePracticeSettings(raw: string | null): PracticeSettings {
  try {
    const result = schema.safeParse(JSON.parse(raw ?? '{}'))
    return result.success ? result.data : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function noteVisibility(
  mode: DisplayMode,
  inScale: boolean,
  note: string,
  target: number | null
) {
  return {
    visible: target !== null || mode !== 'scale' || inScale,
    highlighted: target !== null && getNoteIndex(note) === target,
  }
}

export function parseSavedBpm(
  raw: string | null,
  fallback: number,
  min: number,
  max: number
) {
  const value = Number(raw)
  return raw !== null && Number.isInteger(value) && value >= min && value <= max
    ? value
    : fallback
}
