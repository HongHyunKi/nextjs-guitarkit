'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  autoCorrelate,
  frequencyToNote,
  noteToFrequency,
  centsFromTarget,
  type PitchDetection,
} from '@/lib/pitch-utils'
import {
  STANDARD_TUNING_MIDI,
  CHROMATIC_NOTES,
  NOTES_FLAT,
} from '@/lib/music-utils'

type MicState = 'idle' | 'requesting' | 'listening' | 'denied' | 'error'
type Status = 'no-selection' | 'awaiting-input' | 'in-tune' | 'flat' | 'sharp'

const IN_TUNE_CENTS = 5
// 저음 E의 주기를 충분히 담도록 4096샘플을 사용한다.
const FFT_SIZE = 4096

type TuningId =
  | 'standard'
  | 'half-step-down'
  | 'whole-step-down'
  | 'drop-d'
  | 'drop-c'
  | 'dadgad'
  | 'open-g'
  | 'open-d'

// MIDI는 6번 줄부터 1번 줄 순서이며 하프 다운은 플랫으로 표기한다.
type Tuning = {
  id: TuningId
  label: string
  group: '기본' | '다운 튜닝' | '드롭 튜닝' | '오픈 튜닝'
  midi: number[]
  useFlat?: boolean
}

const TUNINGS: Tuning[] = [
  {
    id: 'standard',
    label: '스탠다드',
    group: '기본',
    midi: [...STANDARD_TUNING_MIDI].reverse(),
  },
  {
    id: 'half-step-down',
    label: '하프 다운 (반음 ↓)',
    group: '다운 튜닝',
    midi: [39, 44, 49, 54, 58, 63],
    useFlat: true,
  },
  {
    id: 'whole-step-down',
    label: '1음 다운 (온음 ↓)',
    group: '다운 튜닝',
    midi: [38, 43, 48, 53, 57, 62],
  },
  {
    id: 'drop-d',
    label: '드롭 D',
    group: '드롭 튜닝',
    midi: [38, 45, 50, 55, 59, 64],
  },
  {
    id: 'drop-c',
    label: '드롭 C',
    group: '드롭 튜닝',
    midi: [36, 43, 48, 53, 57, 62],
  },
  {
    id: 'open-g',
    label: '오픈 G',
    group: '오픈 튜닝',
    midi: [38, 43, 50, 55, 59, 62],
  },
  {
    id: 'open-d',
    label: '오픈 D',
    group: '오픈 튜닝',
    midi: [38, 45, 50, 54, 57, 62],
  },
  {
    id: 'dadgad',
    label: 'DADGAD',
    group: '오픈 튜닝',
    midi: [38, 45, 50, 55, 57, 62],
  },
]

const TUNING_GROUPS = ['기본', '다운 튜닝', '드롭 튜닝', '오픈 튜닝'] as const

// 프리셋 음이름은 MIDI에서 구한다.
function tuningNotesLabel(tuning: Tuning) {
  return buildStrings(tuning)
    .map(s => s.noteName)
    .join(' ')
}

// 저음부터 고음 순서로 음이름과 줄 번호를 만든다.
function buildStrings(tuning: (typeof TUNINGS)[number]) {
  const noteNames = tuning.useFlat ? NOTES_FLAT : CHROMATIC_NOTES
  return tuning.midi.map((midi, i) => {
    const noteIndex = ((midi % 12) + 12) % 12
    const octave = Math.floor(midi / 12) - 1
    return {
      midi,
      noteName: noteNames[noteIndex],
      note: `${noteNames[noteIndex]}${octave}`,
      stringNumber: 6 - i,
    }
  })
}

export function Tuner() {
  const [micState, setMicState] = useState<MicState>('idle')
  const [pitch, setPitch] = useState<PitchDetection | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [tuningId, setTuningId] = useState<TuningId>('standard')

  const tuning = TUNINGS.find(t => t.id === tuningId) ?? TUNINGS[0]
  const strings = buildStrings(tuning)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const bufferRef = useRef(new Float32Array(FFT_SIZE))
  // 최근 주파수의 중앙값으로 판정 깜빡임을 줄인다.
  const recentFreqsRef = useRef<number[]>([])
  const requestRef = useRef(0)

  const stopListening = useCallback(() => {
    requestRef.current++
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    void audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    analyserRef.current = null
    recentFreqsRef.current = []
    setPitch(null)
  }, [])

  useEffect(() => stopListening, [stopListening])

  const startListening = async () => {
    stopListening()
    const request = requestRef.current
    setMicState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      // 페이지를 떠난 뒤 허용된 마이크도 즉시 종료한다.
      if (request !== requestRef.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      streamRef.current = stream

      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx
      await audioCtx.resume()
      if (request !== requestRef.current) return
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = FFT_SIZE
      bufferRef.current = new Float32Array(analyser.fftSize)
      source.connect(analyser)
      analyserRef.current = analyser

      setMicState('listening')

      const tick = () => {
        const currentAnalyser = analyserRef.current
        if (!currentAnalyser || !audioCtxRef.current) return
        currentAnalyser.getFloatTimeDomainData(bufferRef.current)
        const freq = autoCorrelate(
          bufferRef.current,
          audioCtxRef.current.sampleRate
        )

        if (freq > 0) {
          const recent = recentFreqsRef.current
          recent.push(freq)
          if (recent.length > 5) recent.shift()
          const sorted = [...recent].sort((a, b) => a - b)
          const median = sorted[Math.floor(sorted.length / 2)]
          setPitch(frequencyToNote(median))
        } else {
          recentFreqsRef.current = []
          setPitch(null)
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch (error) {
      if (request !== requestRef.current) return
      stopListening()
      setMicState(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'denied'
          : 'error'
      )
    }
  }

  const handleToggle = () => {
    if (micState === 'listening') {
      stopListening()
      setMicState('idle')
    } else {
      return startListening()
    }
  }

  const handleSelectString = (i: number) => {
    setSelectedIndex(prev => (prev === i ? null : i))
  }

  const selectedString = selectedIndex !== null ? strings[selectedIndex] : null
  const targetFrequency = selectedString
    ? noteToFrequency(selectedString.midi)
    : null
  const centsToTarget =
    pitch !== null && targetFrequency !== null
      ? centsFromTarget(pitch.frequency, targetFrequency)
      : null

  const status: Status =
    selectedIndex === null
      ? 'no-selection'
      : micState !== 'listening' || pitch === null || centsToTarget === null
        ? 'awaiting-input'
        : Math.abs(centsToTarget) <= IN_TUNE_CENTS
          ? 'in-tune'
          : centsToTarget < 0
            ? 'flat'
            : 'sharp'

  const STATUS_COPY: Record<
    Status,
    { heading: string; sub: string; color: string }
  > = {
    'no-selection': {
      heading: '줄을 선택하세요',
      sub: '아래 헤드스톡에서 튜닝할 줄을 탭하세요',
      color: 'text-muted-foreground',
    },
    'awaiting-input': {
      heading: selectedString
        ? `${selectedString.noteName} (${selectedString.stringNumber}번 줄)`
        : '',
      sub:
        micState === 'listening'
          ? '줄을 연주해보세요'
          : 'Start를 눌러 마이크를 켜주세요',
      color: 'text-foreground',
    },
    'in-tune': {
      heading: '정확해요!',
      sub: `${selectedString?.noteName} (${selectedString?.stringNumber}번 줄)이 잘 맞았어요`,
      color: 'text-accent-teal',
    },
    flat: {
      heading: '낮아요',
      sub: '줄을 조여 음을 올리세요',
      color: 'text-accent-orange',
    },
    sharp: {
      heading: '높아요',
      sub: '줄을 풀어 음을 내리세요',
      color: 'text-accent-orange',
    },
  }

  const copy = STATUS_COPY[status]
  const needleValue = Math.max(-50, Math.min(50, centsToTarget ?? 0))
  const needleColor =
    status === 'in-tune'
      ? 'bg-accent-teal'
      : status === 'flat' || status === 'sharp'
        ? 'bg-accent-orange'
        : 'bg-muted-foreground/30'

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-8">
      {/* 튜닝 프리셋 */}
      <div className="flex flex-col items-center gap-1.5">
        <label
          htmlFor="tuning-select"
          className="text-xs text-muted-foreground"
        >
          튜닝
        </label>
        <select
          id="tuning-select"
          value={tuningId}
          onChange={e => setTuningId(e.target.value as TuningId)}
          className="bg-muted text-foreground text-sm font-semibold text-center rounded-lg px-4 py-2.5 border-0 outline-none focus:ring-1 focus:ring-accent-teal cursor-pointer"
        >
          {TUNING_GROUPS.map(group => (
            <optgroup key={group} label={group}>
              {TUNINGS.filter(t => t.group === group).map(t => (
                <option key={t.id} value={t.id}>
                  {t.label} · {tuningNotesLabel(t)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="flex flex-col items-center gap-3 py-4 min-h-[9.5rem] justify-center">
        <h2
          className={cn(
            'text-3xl md:text-4xl font-bold text-balance text-center transition-colors',
            copy.color
          )}
        >
          {copy.heading}
        </h2>
        <p className="text-sm text-muted-foreground text-center">{copy.sub}</p>

        {pitch !== null &&
          selectedString !== null &&
          centsToTarget !== null && (
            <p className="text-xs font-mono tabular-nums text-muted-foreground">
              {pitch.note}
              {pitch.octave} · {pitch.frequency.toFixed(1)} Hz ·{' '}
              {centsToTarget > 0 ? '+' : ''}
              {centsToTarget} cents
            </p>
          )}

        {/* 선택한 줄 기준 -50~50센트 편차 */}
        <div className="w-full max-w-xs">
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
            <motion.div
              animate={{ left: `${50 + needleValue / 2}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'absolute top-0 bottom-0 w-3 -ml-1.5 rounded-full transition-colors',
                needleColor
              )}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>-50</span>
            <span>0</span>
            <span>+50</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleToggle}
          disabled={micState === 'requesting'}
          className={cn(
            'w-32 py-3 rounded-lg text-base font-semibold transition-all inline-flex items-center justify-center gap-2',
            micState === 'listening'
              ? 'bg-accent-orange text-background hover:opacity-90'
              : 'bg-accent-teal text-background hover:opacity-90 disabled:opacity-60'
          )}
        >
          {micState === 'listening' ? (
            <>
              <MicOff className="w-4 h-4" /> Stop
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" /> Start
            </>
          )}
        </button>

        {(micState === 'denied' || micState === 'error') && (
          <p className="text-xs text-destructive text-center max-w-xs">
            {micState === 'denied'
              ? '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 접근을 허용한 뒤 다시 시도해주세요.'
              : '마이크를 시작하지 못했습니다. 장치 연결과 다른 앱의 사용 여부를 확인해주세요.'}
          </p>
        )}
        {micState === 'requesting' && (
          <p className="text-xs text-muted-foreground">마이크 권한 요청 중…</p>
        )}
      </div>

      {/* 페그를 눌러 튜닝할 줄을 선택한다. */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground text-center">
          튜닝할 줄을 선택하세요
        </p>
        <GuitarHeadstock
          strings={strings}
          selectedIndex={selectedIndex}
          status={status}
          onSelect={handleSelectString}
        />
      </div>
    </div>
  )
}

// 왼쪽 위부터 4·5·6번, 오른쪽 위부터 3·2·1번 줄을 배치한다.
const PEG_LAYOUT = [
  { peg: [46, 184], post: [120, 184], nutX: 136 }, // 6번 (좌측 아래)
  { peg: [46, 118], post: [120, 118], nutX: 146 }, // 5번 (좌측 중간)
  { peg: [46, 52], post: [120, 52], nutX: 156 }, // 4번 (좌측 위)
  { peg: [274, 52], post: [200, 52], nutX: 166 }, // 3번 (우측 위)
  { peg: [274, 118], post: [200, 118], nutX: 176 }, // 2번 (우측 중간)
  { peg: [274, 184], post: [200, 184], nutX: 186 }, // 1번 (우측 아래)
] as const
const NUT_Y = 212
const BOTTOM_Y = 240
// 저음(굵은 현)→고음(가는 현) 순서로 두께를 줄인다.
const STRING_WIDTH = [4, 3.5, 3, 2.5, 2, 1.5]

function GuitarHeadstock({
  strings,
  selectedIndex,
  status,
  onSelect,
}: {
  strings: {
    midi: number
    noteName: string
    note: string
    stringNumber: number
  }[]
  selectedIndex: number | null
  status: Status
  onSelect: (i: number) => void
}) {
  return (
    <svg
      viewBox="0 0 320 250"
      className="w-full max-w-xs mx-auto"
      role="group"
      aria-label="기타 헤드스톡 — 튜닝할 줄 선택"
    >
      {/* 헤드스톡 윤곽 */}
      <path
        d={`M132,${BOTTOM_Y} L132,${NUT_Y} L94,196 L94,36 Q94,18 112,18 L208,18 Q226,18 226,36 L226,196 L188,${NUT_Y} L188,${BOTTOM_Y} Z`}
        className="fill-muted stroke-border"
        strokeWidth={1.5}
      />

      {/* 페그와 줄감개 축 연결 */}
      {PEG_LAYOUT.map((p, i) => (
        <line
          key={i}
          x1={p.peg[0]}
          y1={p.peg[1]}
          x2={p.post[0]}
          y2={p.post[1]}
          strokeWidth={6}
          strokeLinecap="round"
          className="stroke-border"
        />
      ))}

      <rect
        x={132}
        y={NUT_Y - 3}
        width={56}
        height={5}
        rx={2}
        className="fill-border"
      />

      {strings.map((s, i) => {
        const selected = selectedIndex === i
        const stringClass = selected
          ? status === 'in-tune'
            ? 'stroke-accent-teal'
            : status === 'flat' || status === 'sharp'
              ? 'stroke-accent-orange'
              : 'stroke-accent-teal/50'
          : 'stroke-muted-foreground/40'
        const { post, nutX } = PEG_LAYOUT[i]
        return (
          <g key={s.note + i}>
            <polyline
              points={`${nutX},${BOTTOM_Y} ${nutX},${NUT_Y} ${post[0]},${post[1]}`}
              fill="none"
              className={cn('transition-colors', stringClass)}
              strokeWidth={STRING_WIDTH[i]}
              strokeLinecap="round"
            />
            <circle
              cx={post[0]}
              cy={post[1]}
              r={4.5}
              className={cn('transition-colors fill-card', stringClass)}
              strokeWidth={2}
            />
          </g>
        )
      })}

      {strings.map((s, i) => {
        const selected = selectedIndex === i
        const inTune = selected && status === 'in-tune'
        const offPitch = selected && (status === 'flat' || status === 'sharp')
        const pegClass = inTune
          ? 'fill-accent-teal stroke-accent-teal'
          : offPitch
            ? 'fill-accent-orange/15 stroke-accent-orange'
            : selected
              ? 'fill-card stroke-accent-teal'
              : 'fill-card stroke-border'
        const textClass = inTune
          ? 'fill-background'
          : offPitch
            ? 'fill-accent-orange'
            : selected
              ? 'fill-accent-teal'
              : 'fill-muted-foreground'

        const [pegX, pegY] = PEG_LAYOUT[i].peg
        return (
          <g
            key={s.note + i}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={`${s.noteName} — ${s.stringNumber}번 줄 (${s.note}) 선택`}
            className="cursor-pointer outline-none"
            onClick={() => onSelect(i)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(i)
              }
            }}
          >
            <circle
              cx={pegX}
              cy={pegY}
              r={19}
              className={cn('transition-colors', pegClass)}
              strokeWidth={selected ? 2.5 : 1.5}
            />
            <text
              x={pegX}
              y={pegY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={17}
              fontWeight={700}
              className={cn('transition-colors pointer-events-none', textClass)}
            >
              {s.noteName}
            </text>
            <text
              x={pegX}
              y={pegY + 32}
              textAnchor="middle"
              fontSize={11}
              className="fill-muted-foreground pointer-events-none"
            >
              {s.stringNumber}번
            </text>
          </g>
        )
      })}
    </svg>
  )
}
