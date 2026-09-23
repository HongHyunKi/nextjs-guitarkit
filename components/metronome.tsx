'use client'

import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useBpmControl } from '@/hooks/use-bpm-control'

type Subdivision = 'quarter' | 'eighth' | 'triplet' | 'sixteenth'

const SUBDIVISION_CONFIG: Record<
  Subdivision,
  { label: string; interval: string; ticksPerBeat: number }
> = {
  quarter: { label: '4비트', interval: '4n', ticksPerBeat: 1 },
  eighth: { label: '8비트', interval: '8n', ticksPerBeat: 2 },
  triplet: { label: '셋잇단', interval: '8t', ticksPerBeat: 3 },
  sixteenth: { label: '16비트', interval: '16n', ticksPerBeat: 4 },
}

const BEATS_PER_BAR_OPTIONS = [2, 3, 4, 5, 6, 7]

type ClickSound = 'beep' | 'sine' | 'click' | 'wood' | 'metal' | 'digital'
type TickKind = 'accent' | 'beat' | 'sub'

const SOUND_LABELS: Record<ClickSound, string> = {
  beep: '삑',
  sine: '사인',
  click: '클릭',
  wood: '우드블록',
  metal: '메탈',
  digital: '디지털',
}

// 소리별 체감 음량 차이를 보정하는 기준 오프셋(dB) — NoiseSynth/MetalSynth는
// 같은 gain이어도 Synth류보다 훨씬 크게 들려서 개별 보정이 필요하다.
const SOUND_BASE_DB: Record<ClickSound, number> = {
  beep: -4,
  sine: -2,
  click: -10,
  wood: -6,
  metal: -12,
  digital: -8,
}

const MIN_BPM = 40
const MAX_BPM = 240
const TAP_TIMEOUT_MS = 2000
const TAP_HISTORY = 5

interface MetronomeProps {
  // 다른 컴포넌트(백킹트랙 플레이어 등) 안에 이미 카드 테두리가 있을 때
  // 카드를 이중으로 겹치지 않도록 바깥 wrapper를 생략한다.
  bare?: boolean
  // bare일 때는 재생 상태를 부모(백킹트랙 플레이어의 공용 Play 버튼)가 제어한다 —
  // 자체 Start/Stop 버튼은 숨기고 이 값만 따른다.
  isPlaying?: boolean
}

export function Metronome({
  bare = false,
  isPlaying: controlledIsPlaying,
}: MetronomeProps = {}) {
  const [uncontrolledIsPlaying, setUncontrolledIsPlaying] = useState(false)
  const isPlaying = bare ? (controlledIsPlaying ?? false) : uncontrolledIsPlaying
  const {
    bpm,
    bpmInput,
    setBpm,
    handleBpmChange,
    handleBpmInputChange,
    handleBpmBlur,
    handleTapTempo,
  } = useBpmControl({
    storageKey: 'guitarkit:metronome-bpm',
    initialBpm: 100,
    min: MIN_BPM,
    max: MAX_BPM,
    tapTimeoutMs: TAP_TIMEOUT_MS,
    tapHistory: TAP_HISTORY,
  })
  const [beatsPerBar, setBeatsPerBar] = useState(4)
  const [subdivision, setSubdivision] = useState<Subdivision>('quarter')
  const [sound, setSound] = useState<ClickSound>('beep')
  const [volume, setVolume] = useState(80)
  const [currentTick, setCurrentTick] = useState<number | null>(null)

  const beepRef = useRef<Tone.Synth | null>(null)
  const sineRef = useRef<Tone.Synth | null>(null)
  const clickNoiseRef = useRef<Tone.NoiseSynth | null>(null)
  const clickFilterRef = useRef<Tone.Filter | null>(null)
  const woodRef = useRef<Tone.MembraneSynth | null>(null)
  const metalRef = useRef<Tone.MetalSynth | null>(null)
  const digitalRef = useRef<Tone.Synth | null>(null)
  const seqRef = useRef<Tone.Sequence<number> | null>(null)

  // Initialize every sound engine once — cheap synths, kept alive so
  // switching sound mid-session never needs to (re)build audio nodes.
  useEffect(() => {
    beepRef.current = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.09, sustain: 0, release: 0.05 },
    }).toDestination()

    sineRef.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 },
    }).toDestination()

    clickFilterRef.current = new Tone.Filter({
      type: 'highpass',
      frequency: 3500,
    }).toDestination()
    clickNoiseRef.current = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.01 },
    }).connect(clickFilterRef.current)

    woodRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.01,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.02 },
    }).toDestination()

    metalRef.current = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 },
      harmonicity: 3.1,
      modulationIndex: 16,
      resonance: 3000,
      octaves: 0.7,
    }).toDestination()

    digitalRef.current = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
    }).toDestination()

    const gain = Tone.gainToDb(volume / 100)
    beepRef.current.volume.value = gain + SOUND_BASE_DB.beep
    sineRef.current.volume.value = gain + SOUND_BASE_DB.sine
    clickNoiseRef.current.volume.value = gain + SOUND_BASE_DB.click
    woodRef.current.volume.value = gain + SOUND_BASE_DB.wood
    metalRef.current.volume.value = gain + SOUND_BASE_DB.metal
    digitalRef.current.volume.value = gain + SOUND_BASE_DB.digital

    return () => {
      beepRef.current?.dispose()
      sineRef.current?.dispose()
      clickNoiseRef.current?.dispose()
      clickFilterRef.current?.dispose()
      woodRef.current?.dispose()
      metalRef.current?.dispose()
      digitalRef.current?.dispose()
      seqRef.current?.dispose()
      Tone.getTransport().stop()
      Tone.getTransport().cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const gain = Tone.gainToDb(volume / 100)
    if (beepRef.current) beepRef.current.volume.value = gain + SOUND_BASE_DB.beep
    if (sineRef.current) sineRef.current.volume.value = gain + SOUND_BASE_DB.sine
    if (clickNoiseRef.current)
      clickNoiseRef.current.volume.value = gain + SOUND_BASE_DB.click
    if (woodRef.current) woodRef.current.volume.value = gain + SOUND_BASE_DB.wood
    if (metalRef.current) metalRef.current.volume.value = gain + SOUND_BASE_DB.metal
    if (digitalRef.current)
      digitalRef.current.volume.value = gain + SOUND_BASE_DB.digital
  }, [volume])

  const triggerClick = (kind: TickKind, time: number) => {
    switch (sound) {
      case 'beep':
        beepRef.current?.triggerAttackRelease(
          kind === 'accent' ? 'C6' : kind === 'beat' ? 'A5' : 'E5',
          '16n',
          time,
          kind === 'accent' ? 0.9 : kind === 'beat' ? 0.7 : 0.3
        )
        break
      case 'sine':
        sineRef.current?.triggerAttackRelease(
          kind === 'accent' ? 'A5' : kind === 'beat' ? 'E5' : 'C5',
          '8n',
          time,
          kind === 'accent' ? 0.9 : kind === 'beat' ? 0.65 : 0.3
        )
        break
      case 'click':
        clickNoiseRef.current?.triggerAttackRelease(
          '32n',
          time,
          kind === 'accent' ? 1 : kind === 'beat' ? 0.7 : 0.35
        )
        break
      case 'wood':
        woodRef.current?.triggerAttackRelease(
          kind === 'accent' ? 'C5' : kind === 'beat' ? 'G4' : 'C4',
          '16n',
          time,
          kind === 'accent' ? 0.9 : kind === 'beat' ? 0.7 : 0.3
        )
        break
      case 'metal':
        metalRef.current?.triggerAttackRelease(
          kind === 'accent' ? 'C6' : kind === 'beat' ? 'G5' : 'C5',
          '32n',
          time,
          kind === 'accent' ? 1 : kind === 'beat' ? 0.75 : 0.35
        )
        break
      case 'digital':
        digitalRef.current?.triggerAttackRelease(
          kind === 'accent' ? 'C7' : kind === 'beat' ? 'G6' : 'C6',
          '32n',
          time,
          kind === 'accent' ? 0.8 : kind === 'beat' ? 0.6 : 0.25
        )
        break
    }
  }

  const ticksPerBeat = SUBDIVISION_CONFIG[subdivision].ticksPerBeat
  const totalTicks = beatsPerBar * ticksPerBeat

  useEffect(() => {
    setCurrentTick(null)
    seqRef.current?.dispose()
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    Tone.getTransport().position = 0

    if (!isPlaying) return

    Tone.getTransport().bpm.value = bpm
    // 같은 페이지의 백킹트랙 플레이어가 앞서 스윙을 걸어둔 채로 Transport를
    // 넘겨줄 수 있어 재생 시작 시 항상 명시적으로 리셋한다.
    Tone.getTransport().swing = 0

    const steps = Array.from({ length: totalTicks }, (_, i) => i)

    seqRef.current = new Tone.Sequence<number>(
      (time, tickIdx) => {
        const isBeatStart = tickIdx % ticksPerBeat === 0
        const isDownbeat = tickIdx === 0

        triggerClick(
          isBeatStart ? (isDownbeat ? 'accent' : 'beat') : 'sub',
          time
        )

        const delay = Math.max(0, (time - Tone.now()) * 1000 - 20)
        setTimeout(() => setCurrentTick(tickIdx), delay)
      },
      steps,
      SUBDIVISION_CONFIG[subdivision].interval
    )
    seqRef.current.start(0)
    Tone.getTransport().start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, bpm, beatsPerBar, subdivision, sound, ticksPerBeat, totalTicks])

  const handleTogglePlay = async () => {
    await Tone.start()
    setUncontrolledIsPlaying(prev => !prev)
  }

  const currentBeat =
    currentTick === null ? null : Math.floor(currentTick / ticksPerBeat)
  const isBeatTick =
    currentTick === null ? false : currentTick % ticksPerBeat === 0

  return (
    <div
      className={cn(
        bare ? 'space-y-4' : 'space-y-8',
        !bare && 'bg-card border border-border rounded-xl p-6'
      )}
    >
      {/* Pulse + play button — 원, 도트, 버튼을 항상 세로로 쌓고 가운데 정렬한다.
          bare일 때는 부모(백킹트랙 플레이어)가 overflow-hidden 컨테이너로 감싸므로
          펄스 원이 커질 때(scale 1.15) 위쪽이 잘리지 않도록 세로 여백을 남긴다. */}
      <div
        className={cn(
          'flex flex-col items-center',
          bare ? 'gap-3 py-1.5' : 'gap-6 py-4'
        )}
      >
        <motion.div
          animate={
            isPlaying && isBeatTick ? { scale: [1, 1.15, 1] } : { scale: 1 }
          }
          transition={{ duration: (60 / bpm) * 0.5, ease: 'easeOut' }}
          className={cn(
            'rounded-full flex items-center justify-center font-bold tabular-nums transition-colors',
            bare ? 'w-14 h-14 text-lg' : 'w-28 h-28 text-3xl',
            isPlaying && isBeatTick
              ? currentBeat === 0
                ? 'bg-accent-orange text-background shadow-lg shadow-accent-orange/50'
                : 'bg-accent-teal text-background shadow-lg shadow-accent-teal/50'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {currentBeat === null ? bpm : currentBeat + 1}
        </motion.div>

        {/* 도트는 항상 같은 박스 크기를 유지하고 transform/opacity로만 애니메이션한다
            — width/height를 직접 바꾸면 매 비트마다 레이아웃이 재계산되어
            CLS(레이아웃 시프트)가 발생한다. */}
        <div className={cn('flex items-center', bare ? 'gap-1.5' : 'gap-3')}>
          {Array.from({ length: beatsPerBar }, (_, i) => {
            const active = isPlaying && currentBeat === i
            return (
              <motion.div
                key={i}
                animate={{ scale: active ? 1 : 0.7, opacity: active ? 1 : 0.35 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className={cn(
                  'rounded-full',
                  bare ? 'w-2.5 h-2.5' : 'w-4 h-4',
                  active
                    ? i === 0
                      ? 'bg-accent-orange shadow-md shadow-accent-orange/40'
                      : 'bg-accent-teal shadow-md shadow-accent-teal/40'
                    : 'bg-muted-foreground/30'
                )}
              />
            )
          })}
        </div>

        {/* bare일 때는 부모(백킹트랙 플레이어)의 공용 Play 버튼이 재생을 제어하므로
            여기서는 자체 버튼을 숨긴다 — 버튼 중복/위치 불일치를 막기 위함. */}
        {!bare && (
          <button
            onClick={handleTogglePlay}
            className={cn(
              'w-32 py-3 rounded-lg text-base font-semibold transition-all inline-flex items-center justify-center',
              isPlaying
                ? 'bg-accent-orange text-background hover:opacity-90'
                : 'bg-accent-teal text-background hover:opacity-90'
            )}
          >
            {isPlaying ? '■ Stop' : '▶ Start'}
          </button>
        )}
      </div>

      {/* BPM control */}
      <div
        className={cn(
          bare
            ? 'flex items-center gap-2'
            : 'flex flex-col items-center gap-3'
        )}
      >
        <p className={cn('text-xs text-muted-foreground', bare && 'shrink-0')}>
          BPM
        </p>
        <div className={cn('flex items-center', bare ? 'gap-1.5' : 'gap-3')}>
          <button
            onClick={() => handleBpmChange(-5)}
            className={cn(
              'rounded-md bg-muted hover:bg-muted/80 text-muted-foreground font-bold transition-colors',
              bare ? 'w-7 h-7 text-sm' : 'w-9 h-9'
            )}
          >
            −
          </button>
          <input
            type="number"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpmInput}
            onChange={handleBpmInputChange}
            onFocus={e => e.target.select()}
            onBlur={handleBpmBlur}
            className={cn(
              'text-center font-mono font-semibold tabular-nums bg-muted rounded-md border-0 outline-none focus:ring-1 focus:ring-accent-teal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              bare ? 'w-14 text-sm px-1 py-1' : 'w-20 text-xl px-1 py-1.5'
            )}
          />
          <button
            onClick={() => handleBpmChange(5)}
            className={cn(
              'rounded-md bg-muted hover:bg-muted/80 text-muted-foreground font-bold transition-colors',
              bare ? 'w-7 h-7 text-sm' : 'w-9 h-9'
            )}
          >
            +
          </button>
          <button
            onClick={handleTapTempo}
            className={cn(
              'rounded-md border border-border bg-card hover:border-accent-teal hover:text-accent-teal font-medium text-muted-foreground transition-colors',
              bare ? 'ml-1 px-2.5 h-7 text-xs' : 'ml-2 px-4 h-9 text-sm'
            )}
          >
            TAP
          </button>
        </div>
        {!bare && (
          <input
            type="range"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={e => setBpm(Number(e.target.value))}
            className="w-full max-w-xs accent-accent-teal"
          />
        )}
      </div>

      {/* Beats per bar + subdivision */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-4',
          bare ? 'justify-start' : 'justify-center gap-6'
        )}
      >
        <div
          className={cn(bare ? 'flex items-center gap-2' : 'space-y-1')}
        >
          <p
            className={cn(
              'text-xs text-muted-foreground',
              !bare && 'text-center'
            )}
          >
            박자
          </p>
          <div className="relative inline-flex p-1 bg-muted rounded-lg">
            {BEATS_PER_BAR_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => setBeatsPerBar(n)}
                className={cn(
                  'relative py-2 text-sm font-medium rounded-md transition-colors z-10',
                  bare ? 'w-7' : 'w-9',
                  beatsPerBar === n
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {beatsPerBar === n && (
                  <motion.div
                    layoutId="metronome-beats"
                    className="absolute inset-0 bg-background rounded-md shadow-sm z-[-1]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {n}
              </button>
            ))}
          </div>
        </div>

        <div
          className={cn(bare ? 'flex items-center gap-2' : 'space-y-1')}
        >
          <p
            className={cn(
              'text-xs text-muted-foreground',
              !bare && 'text-center'
            )}
          >
            세분화
          </p>
          <div className="relative inline-flex p-1 bg-muted rounded-lg">
            {(Object.keys(SUBDIVISION_CONFIG) as Subdivision[]).map(s => (
              <button
                key={s}
                onClick={() => setSubdivision(s)}
                className={cn(
                  'relative text-sm font-medium rounded-md transition-colors z-10',
                  bare ? 'px-2 py-2' : 'px-3 py-2',
                  subdivision === s
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {subdivision === s && (
                  <motion.div
                    layoutId="metronome-subdivision"
                    className="absolute inset-0 bg-background rounded-md shadow-sm z-[-1]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {SUBDIVISION_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sound picker */}
      <div className={cn(!bare && 'space-y-2')}>
        {!bare && (
          <p className="text-xs text-muted-foreground text-center">소리</p>
        )}
        <div
          className={cn(
            'flex flex-wrap items-center gap-2',
            bare ? 'justify-start' : 'justify-center'
          )}
        >
          {(Object.keys(SOUND_LABELS) as ClickSound[]).map(s => (
            <Button
              key={s}
              variant={sound === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSound(s)}
              className={cn(
                'transition-all',
                sound === s && 'bg-accent-teal text-background hover:bg-accent-teal/90'
              )}
            >
              {SOUND_LABELS[s]}
            </Button>
          ))}
        </div>
      </div>

      {/* Volume */}
      <div
        className={cn(
          'flex items-center gap-3',
          bare ? 'justify-start' : 'justify-center'
        )}
      >
        <span className="text-xs text-muted-foreground w-12">Volume</span>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className={cn(bare ? 'w-28' : 'w-40', 'accent-accent-teal')}
        />
        <span className="text-xs text-muted-foreground w-7 tabular-nums">
          {volume}
        </span>
      </div>
    </div>
  )
}
