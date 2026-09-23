import {
  getPitchFromFret,
  getNoteIndex,
  getScaleNotes,
  STANDARD_TUNING_MIDI,
  CHROMATIC_NOTES,
} from './music-utils'
import { z } from 'zod'

export type QuizPosition = { stringIndex: number; fret: number }
export type NoteQuestion = QuizPosition & { note: string }

export const QUIZ_MODES = {
  note: '음 → 위치',
  reverse: '위치 → 음',
  interval: '음정 찾기',
  triad: '3화음 구성음',
} as const
export type QuizMode = keyof typeof QUIZ_MODES
export type QuizSettings = {
  mode: QuizMode
  lastFret: 5 | 12
  stringIndex: number | null
  accidentals: boolean
}
export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  mode: 'note',
  lastFret: 5,
  stringIndex: null,
  accidentals: false,
}
export type PracticeQuestion = NoteQuestion & {
  prompt: string
  explanation: string
  answers: QuizPosition[]
  reference?: QuizPosition
}
export type QuizResult = {
  question: PracticeQuestion
  mistakes: number
  revealed: boolean
}
const pitch = (p: QuizPosition) => STANDARD_TUNING_MIDI[p.stringIndex] + p.fret
export const samePosition = (a: QuizPosition, b: QuizPosition) =>
  a.stringIndex === b.stringIndex && a.fret === b.fret
export const positionLabel = (p: QuizPosition) =>
  `${p.stringIndex + 1}번 줄 ${p.fret}프렛`

export function createQuestionPool(settings: QuizSettings): PracticeQuestion[] {
  const positions = STANDARD_TUNING_MIDI.flatMap((_, stringIndex) =>
    Array.from({ length: settings.lastFret + 1 }, (_, fret) => ({
      stringIndex,
      fret,
      note: getPitchFromFret(stringIndex, fret).replace(/\d+$/, ''),
    }))
  )
  const targets = positions.filter(
    p =>
      (settings.stringIndex === null ||
        p.stringIndex === settings.stringIndex) &&
      (settings.accidentals || /^[A-G]$/.test(p.note))
  )
  if (settings.mode === 'interval') {
    return positions.flatMap(reference =>
      [7, 12].flatMap(distance => {
        const answers = targets.filter(
          p => pitch(p) - pitch(reference) === distance
        )
        if (!answers.length) return []
        const name = distance === 7 ? '완전5도' : '옥타브'
        return [
          {
            ...answers[0],
            reference,
            answers,
            prompt: `${positionLabel(reference)}보다 ${name} 높은 음을 찾으세요`,
            explanation: `${name}는 ${distance}반음 차이입니다. ${answers.map(positionLabel).join(' / ')}에서 ${answers[0].note}를 낼 수 있습니다.`,
          },
        ]
      })
    )
  }
  if (settings.mode === 'triad') {
    return CHROMATIC_NOTES.filter(
      root => settings.accidentals || /^[A-G]$/.test(root)
    ).flatMap(root =>
      (['major', 'minor'] as const).flatMap(quality => {
        const scale = getScaleNotes(root, quality)
        const notes = [scale[0], scale[2], scale[4]]
        return notes.flatMap((note, degree) =>
          targets
            .filter(p => getNoteIndex(p.note) === getNoteIndex(note))
            .map(p => ({
              ...p,
              note,
              answers: targets.filter(
                t =>
                  t.stringIndex === p.stringIndex &&
                  getNoteIndex(t.note) === getNoteIndex(note)
              ),
              prompt: `${root} ${quality === 'major' ? '메이저' : '마이너'}의 ${['근음', '3음', '5음'][degree]}을 ${p.stringIndex + 1}번 줄에서 찾으세요`,
              explanation: `${root} ${quality === 'major' ? '메이저' : '마이너'} = ${notes.join(' · ')} (근음 · 3음 · 5음). 근음에서 ${quality === 'major' ? '4' : '3'}반음, 7반음 위의 음으로 구성합니다. 정답은 ${note}입니다.`,
            }))
        )
      })
    )
  }
  return targets.map(p => ({
    ...p,
    answers:
      settings.mode === 'reverse'
        ? [p]
        : targets.filter(
            t => t.stringIndex === p.stringIndex && t.note === p.note
          ),
    prompt:
      settings.mode === 'reverse'
        ? `${positionLabel(p)}에 표시된 음의 이름은?`
        : `${p.stringIndex + 1}번 줄에서 ${p.note}를 찾아보세요`,
    explanation: `${positionLabel(p)}은 ${p.note}입니다. 같은 줄에서 12프렛 이동하면 같은 이름의 음이 한 옥타브 높아집니다.`,
  }))
}

export function createSession(
  pool: PracticeQuestion[],
  length = 10
): PracticeQuestion[] {
  if (!pool.length) return []
  const unique = [...new Map(pool.map(q => [q.prompt, q])).values()]
  const session: PracticeQuestion[] = []
  let remaining: PracticeQuestion[] = []
  while (session.length < length) {
    if (!remaining.length) remaining = [...unique]
    const candidates = remaining.filter(
      q => q.prompt !== session.at(-1)?.prompt
    )
    const source = candidates.length ? candidates : remaining
    const next = source[Math.floor(Math.random() * source.length)]
    remaining.splice(remaining.indexOf(next), 1)
    session.push(next)
  }
  return session
}

export const QUIZ_HISTORY_KEY = 'guitarkit:quiz-history:v1'
const recordSchema = z
  .object({
    date: z.string().datetime(),
    mode: z.enum(['note', 'reverse', 'interval', 'triad']),
    total: z.number().int().min(1).max(10),
    firstTry: z.number().int().min(0).max(10),
    review: z.boolean(),
    scope: z.string().max(100),
  })
  .refine(r => r.firstTry <= r.total)
export type QuizRecord = z.infer<typeof recordSchema>
export function parseQuizHistory(raw: string | null): QuizRecord[] {
  try {
    const result = z
      .array(recordSchema)
      .max(10)
      .safeParse(JSON.parse(raw ?? '[]'))
    return result.success ? result.data : []
  } catch {
    return []
  }
}
