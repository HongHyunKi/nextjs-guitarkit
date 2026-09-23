'use client'

import { useEffect, useRef, useState } from 'react'
import { Fretboard, GuitarTone } from '@/components/fretboard'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CHROMATIC_NOTES,
  getNoteIndex,
  getPitchFromFret,
  noteToFixedSolfege,
} from '@/lib/music-utils'
import {
  createQuestionPool,
  createSession,
  DEFAULT_QUIZ_SETTINGS,
  parseQuizHistory,
  positionLabel,
  QUIZ_HISTORY_KEY,
  QUIZ_MODES,
  samePosition,
  type PracticeQuestion,
  type QuizPosition,
  type QuizRecord,
  type QuizResult,
  type QuizSettings,
} from '@/lib/note-quiz'

export function NoteQuiz({
  onExit,
  guitarTone,
}: {
  onExit: () => void
  guitarTone: GuitarTone
}) {
  const [settings, setSettings] = useState(DEFAULT_QUIZ_SETTINGS)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [results, setResults] = useState<QuizResult[]>([])
  const [guess, setGuess] = useState<QuizPosition | null>(null)
  const [feedback, setFeedback] = useState('')
  const [mistakes, setMistakes] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [solved, setSolved] = useState(false)
  const [review, setReview] = useState(false)
  const [history, setHistory] = useState<QuizRecord[]>([])
  const [storageWarning, setStorageWarning] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const question = questions[results.length]
  const done = questions.length > 0 && !question
  const pool = createQuestionPool(settings)
  const scope = `${settings.stringIndex === null ? '전체 줄' : `${settings.stringIndex + 1}번 줄`} · 0–${settings.lastFret}프렛 · ${settings.accidentals ? '모든 음' : '자연음'}`
  const missed = results.filter(r => r.mistakes > 0 || r.revealed)

  useEffect(() => {
    try {
      setHistory(parseQuizHistory(localStorage.getItem(QUIZ_HISTORY_KEY)))
    } catch {
      setStorageWarning(
        '이 브라우저에서는 기록을 저장할 수 없습니다. 연습은 계속할 수 있습니다.'
      )
    }
  }, [])
  useEffect(() => {
    headingRef.current?.focus()
  }, [question, done])
  useEffect(() => {
    if (solved || revealed) nextRef.current?.focus({ preventScroll: true })
  }, [solved, revealed])

  function resetAnswer() {
    setGuess(null)
    setFeedback('')
    setMistakes(0)
    setRevealed(false)
    setSolved(false)
  }
  function start(source = pool, isReview = false) {
    setQuestions(
      createSession(source, isReview ? Math.min(10, source.length) : 10)
    )
    setResults([])
    setReview(isReview)
    resetAnswer()
  }
  function answer(correct: boolean, message: string) {
    if (solved || revealed) return
    if (correct) {
      setSolved(true)
      setFeedback('정답입니다!')
    } else {
      setMistakes(n => n + 1)
      setFeedback(`${message} 다시 시도해보세요.`)
    }
  }
  function next() {
    const updated = [...results, { question, mistakes, revealed }]
    setResults(updated)
    resetAnswer()
    if (updated.length !== questions.length) return
    const record: QuizRecord = {
      date: new Date().toISOString(),
      mode: settings.mode,
      total: updated.length,
      firstTry: updated.filter(r => !r.mistakes && !r.revealed).length,
      review,
      scope,
    }
    const records = [record, ...history].slice(0, 10)
    setHistory(records)
    try {
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(records))
    } catch {
      setStorageWarning(
        '저장 공간을 사용할 수 없어 이번 기록은 새로고침하면 사라집니다.'
      )
    }
  }
  function setting<K extends keyof QuizSettings>(
    key: K,
    value: QuizSettings[K]
  ) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  return (
    <section
      aria-label="지판 연습 퀴즈"
      className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          지판 연습{' '}
          {question &&
            `· ${results.length + 1} / ${questions.length}${review ? ' · 오답 복습' : ''}`}
        </p>
        <Button variant="outline" className="min-h-11" onClick={onExit}>
          퀴즈 종료
        </Button>
      </div>
      {!questions.length ? (
        <>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-semibold outline-none"
          >
            어떤 연습을 할까요?
          </h2>
          <p className="text-sm text-muted-foreground">
            처음이라면 음 → 위치, 0–5프렛, 자연음부터 시작하세요. 한 번에
            10문제이며 시간제한은 없습니다.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="quiz-mode" className="text-sm">
                연습 종류
              </label>
              <Select
                value={settings.mode}
                onValueChange={v => setting('mode', v as QuizSettings['mode'])}
              >
                <SelectTrigger id="quiz-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QUIZ_MODES).map(([v, label]) => (
                    <SelectItem key={v} value={v}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="quiz-string" className="text-sm">
                답을 찾을 줄
              </label>
              <Select
                value={String(settings.stringIndex ?? 'all')}
                onValueChange={v =>
                  setting('stringIndex', v === 'all' ? null : Number(v))
                }
              >
                <SelectTrigger id="quiz-string">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 줄</SelectItem>
                  {Array.from({ length: 6 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i + 1}번 줄
                      {i === 0
                        ? ' · 가장 가는 줄'
                        : i === 5
                          ? ' · 가장 굵은 줄'
                          : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="quiz-range" className="text-sm">
                프렛 범위
              </label>
              <Select
                value={String(settings.lastFret)}
                onValueChange={v => setting('lastFret', Number(v) as 5 | 12)}
              >
                <SelectTrigger id="quiz-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">0–5프렛</SelectItem>
                  <SelectItem value="12">0–12프렛</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="quiz-notes" className="text-sm">
                출제할 정답 음
              </label>
              <Select
                value={settings.accidentals ? 'all' : 'natural'}
                onValueChange={v => setting('accidentals', v === 'all')}
              >
                <SelectTrigger id="quiz-notes">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">
                    자연음 · C D E F G A B
                  </SelectItem>
                  <SelectItem value="all">모든 음 · ♯/♭ 포함</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {settings.mode === 'interval'
              ? '기준점 R에서 위로 완전5도(7반음) 또는 옥타브(12반음)를 찾습니다. 기준점은 다른 줄에도 나옵니다.'
              : settings.mode === 'triad'
                ? '메이저·마이너 코드의 근음·3음·5음을 하나씩 찾습니다. 코드 운지 전체를 누르는 연습은 아닙니다.'
                : '0프렛은 줄을 누르지 않은 개방현입니다. 1번 줄은 가장 가는 줄입니다.'}
          </p>
          <Button
            className="min-h-11"
            disabled={!pool.length}
            onClick={() => start()}
          >
            10문제 시작
          </Button>
          {!pool.length && (
            <p role="status" className="text-sm">
              이 범위에는 문제가 없습니다. 전체 줄 또는 0–12프렛으로 넓혀주세요.
            </p>
          )}
          <div className="border-t border-border pt-4 space-y-2">
            <h3 className="font-semibold">최근 연습</h3>
            {!history.length ? (
              <p className="text-sm text-muted-foreground">
                완료한 연습은 이 브라우저에 최대 10개 저장됩니다.
              </p>
            ) : (
              <ul className="space-y-3">
                {history.map((r, i) => (
                  <li key={`${r.date}-${i}`} className="text-sm">
                    {new Date(r.date).toLocaleString('ko-KR')} ·{' '}
                    {QUIZ_MODES[r.mode]}
                    {r.review ? ' · 복습' : ''}
                    <br />첫 시도 정답 {r.firstTry}/{r.total} · {r.scope}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : done ? (
        <>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-semibold outline-none"
          >
            {review ? '오답 복습' : '10문제 연습'} 완료
          </h2>
          <p className="text-lg">
            첫 시도 정답 {results.length - missed.length} / {results.length}
          </p>
          <p className="text-sm text-muted-foreground">
            다시 시도한 문제 {results.filter(r => r.mistakes > 0).length}개 ·
            정답을 본 문제 {results.filter(r => r.revealed).length}개. 정답을 본
            문제는 첫 시도 정답에 포함하지 않습니다.
          </p>
          {missed.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">다시 연습할 문제 · 최대 3개</h3>
              <ul className="space-y-2 text-sm">
                {[...missed]
                  .sort((a, b) => b.mistakes - a.mistakes)
                  .slice(0, 3)
                  .map((r, i) => (
                    <li key={i}>
                      {r.question.prompt} — 오답 {r.mistakes}회
                      {r.revealed ? ' · 정답 확인' : ''}
                    </li>
                  ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {missed.length > 0 && (
              <Button
                className="min-h-11"
                onClick={() =>
                  start(
                    missed.map(r => r.question),
                    true
                  )
                }
              >
                틀린 문제만 복습
              </Button>
            )}
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => start()}
            >
              새 10문제
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => {
                setQuestions([])
                setResults([])
              }}
            >
              연습 설정으로
            </Button>
          </div>
        </>
      ) : (
        <>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-xl md:text-2xl font-semibold break-keep outline-none"
          >
            {question.prompt}
          </h2>
          <p className="text-sm text-muted-foreground">
            {scope} ·{' '}
            {settings.mode === 'reverse'
              ? '● 위치를 보고 아래 음 이름을 선택하세요.'
              : '지판에서 정답 위치를 누르세요. 가능한 위치가 여러 개라면 하나만 찾으면 됩니다.'}
          </p>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="min-h-16 text-sm leading-relaxed break-keep"
          >
            {feedback || '음 이름은 정답을 확인한 뒤 나타납니다.'}
            {(solved || revealed) && (
              <p className="mt-2">{question.explanation}</p>
            )}
          </div>
          <Fretboard
            key={`${results.length}-${review}`}
            rootNote="C"
            scaleType="major"
            notationType="alphabetical"
            displayMode="all"
            startFret={0}
            frets={settings.lastFret}
            guitarTone={guitarTone}
            quiz={{
              answers: question.answers,
              answerNote: question.note,
              marker: settings.mode === 'reverse' ? question : undefined,
              reference: question.reference,
              guess,
              revealed: solved || revealed,
              onGuess: p => {
                if (solved || revealed || settings.mode === 'reverse') return
                setGuess(p)
                answer(
                  question.answers.some(a => samePosition(a, p)),
                  `${positionLabel(p)}은 ${getPitchFromFret(p.stringIndex, p.fret).replace(/\d+$/, '')}입니다.`
                )
              },
            }}
          />
          {settings.mode === 'reverse' && (
            <div
              aria-label="음 이름 선택"
              className="grid grid-cols-3 sm:grid-cols-6 gap-2"
            >
              {CHROMATIC_NOTES.filter(
                n => settings.accidentals || /^[A-G]$/.test(n)
              ).map(n => (
                <Button
                  key={n}
                  variant="outline"
                  className="min-h-11"
                  disabled={solved || revealed}
                  onClick={() =>
                    answer(
                      getNoteIndex(n) === getNoteIndex(question.note),
                      `${n}은 아닙니다.`
                    )
                  }
                >
                  {n.includes('#')
                    ? `${n} / ${CHROMATIC_NOTES[(getNoteIndex(n) + 1) % 12]}♭`
                    : `${n} · ${noteToFixedSolfege(n)}`}
                </Button>
              ))}
            </div>
          )}
          {solved || revealed ? (
            <Button ref={nextRef} className="min-h-11" onClick={next}>
              {results.length === questions.length - 1
                ? '결과 보기'
                : '다음 문제'}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => {
                setRevealed(true)
                setFeedback('정답을 확인해보세요.')
              }}
            >
              정답 보기
            </Button>
          )}
        </>
      )}
      {storageWarning && (
        <p role="status" className="text-sm text-muted-foreground">
          {storageWarning}
        </p>
      )}
    </section>
  )
}
