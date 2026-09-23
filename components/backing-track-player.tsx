'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as Tone from 'tone'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBpmControl } from '@/hooks/use-bpm-control'
import { Metronome } from '@/components/metronome'
import { ScaleType } from '@/lib/music-utils'
import {
  getDiatonicChords,
  getStyleProgression,
  getChordLabel,
  BackingStyle,
  Chord,
} from '@/lib/chord-utils'

interface BackingTrackPlayerProps {
  rootNote: string
  scaleType: ScaleType
}

type DrumStep = { kick: boolean; snare: boolean; hihat: boolean }
type Subdivision = '4beat' | '8beat' | '16beat'

const SUBDIVISION_NOTE: Record<Subdivision, string> = {
  '4beat': '4n',
  '8beat': '8n',
  '16beat': '16n',
}

const SUBDIVISION_LABELS: Record<Subdivision, string> = {
  '4beat': '4비트',
  '8beat': '8비트',
  '16beat': '16비트',
}

// 4비트: 4스텝(4분음표), 8비트: 8스텝(8분음표), 16비트: 16스텝(16분음표)
const DRUM_PATTERNS: Record<BackingStyle, Record<Subdivision, DrumStep[]>> = {
  rock: {
    '4beat': [
      { kick: true, snare: false, hihat: true }, // beat 1
      { kick: false, snare: true, hihat: true }, // beat 2
      { kick: true, snare: false, hihat: true }, // beat 3
      { kick: false, snare: true, hihat: true }, // beat 4
    ],
    '8beat': [
      { kick: true, snare: false, hihat: true }, // 1 down
      { kick: false, snare: false, hihat: true }, // 1 up
      { kick: false, snare: true, hihat: true }, // 2 down
      { kick: false, snare: false, hihat: true }, // 2 up
      { kick: true, snare: false, hihat: true }, // 3 down
      { kick: false, snare: false, hihat: true }, // 3 up
      { kick: false, snare: true, hihat: true }, // 4 down
      { kick: false, snare: false, hihat: true }, // 4 up
    ],
    '16beat': [
      { kick: true, snare: false, hihat: true }, // beat 1
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // beat 2
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: true, snare: false, hihat: true }, // beat 3
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // beat 4
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
    ],
  },
  blues: {
    '4beat': [
      { kick: true, snare: false, hihat: true },
      { kick: false, snare: true, hihat: false },
      { kick: true, snare: false, hihat: true },
      { kick: false, snare: true, hihat: false },
    ],
    '8beat': [
      { kick: true, snare: false, hihat: true }, // 1 down (swing 적용)
      { kick: false, snare: false, hihat: true }, // 1 up
      { kick: false, snare: true, hihat: false }, // 2 down
      { kick: false, snare: false, hihat: true }, // 2 up (shuffle)
      { kick: true, snare: false, hihat: true }, // 3 down
      { kick: false, snare: false, hihat: true }, // 3 up
      { kick: false, snare: true, hihat: false }, // 4 down
      { kick: false, snare: false, hihat: true }, // 4 up (shuffle)
    ],
    '16beat': [
      { kick: true, snare: false, hihat: true }, // beat 1
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // shuffle accent
      { kick: false, snare: true, hihat: true }, // beat 2
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // shuffle accent
      { kick: false, snare: false, hihat: true },
      { kick: true, snare: false, hihat: true }, // beat 3
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // shuffle accent
      { kick: false, snare: true, hihat: true }, // beat 4
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // shuffle accent
      { kick: false, snare: false, hihat: true },
    ],
  },
  jazz: {
    '4beat': [
      { kick: true, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true },
      { kick: false, snare: false, hihat: true },
    ],
    '8beat': [
      { kick: true, snare: false, hihat: true }, // 1
      { kick: false, snare: false, hihat: true }, // 1+ (swing)
      { kick: false, snare: true, hihat: false }, // 2
      { kick: false, snare: false, hihat: true }, // 2+ (swing)
      { kick: false, snare: false, hihat: true }, // 3
      { kick: false, snare: false, hihat: true }, // 3+ (swing)
      { kick: false, snare: true, hihat: false }, // 4
      { kick: false, snare: false, hihat: true }, // 4+ (swing)
    ],
    '16beat': [
      { kick: true, snare: false, hihat: true }, // beat 1
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // triplet accent
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // beat 2
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // beat 3
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true }, // triplet accent
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: true, hihat: true }, // beat 4
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
      { kick: false, snare: false, hihat: true },
    ],
  },
}

const STYLE_LABELS: Record<BackingStyle, string> = {
  rock: 'Rock',
  blues: 'Blues',
  jazz: 'Jazz',
}

type PlayerMode = 'backing' | 'metronome'

export function BackingTrackPlayer({
  rootNote,
  scaleType,
}: BackingTrackPlayerProps) {
  const [mode, setMode] = useState<PlayerMode>('backing')
  const [expanded, setExpanded] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const {
    bpm,
    bpmInput,
    handleBpmChange,
    handleBpmInputChange,
    handleBpmBlur,
    handleTapTempo,
  } = useBpmControl({ initialBpm: 90, min: 60, max: 200, storageKey: 'guitarkit:backing-bpm' })
  const [style, setStyle] = useState<BackingStyle>('rock')
  const [progressionOverride, setProgressionOverride] = useState<
    number[] | null
  >(null)
  const [currentBeat, setCurrentBeat] = useState<number | null>(null)
  const [quarterBeat, setQuarterBeat] = useState<number | null>(null)
  const [samplerLoaded, setSamplerLoaded] = useState(false)
  const [subdivision, setSubdivision] = useState<Subdivision>('8beat')
  const [chordVolume, setChordVolume] = useState(60)
  const [drumVolume, setDrumVolume] = useState(80)

  // Derived: 수동 오버라이드 없으면 스타일 프리셋 사용 (useMemo로 레퍼런스 안정화)
  const progressionIndices = useMemo(
    () => progressionOverride ?? getStyleProgression(style, scaleType),
    [progressionOverride, style, scaleType]
  )

  const samplerRef = useRef<Tone.Sampler | null>(null)
  const kickRef = useRef<Tone.MembraneSynth | null>(null)
  const snareRef = useRef<Tone.NoiseSynth | null>(null)
  const hihatRef = useRef<Tone.MetalSynth | null>(null)
  const chordSeqRef = useRef<Tone.Sequence<Chord> | null>(null)
  const drumSeqRef = useRef<Tone.Sequence<DrumStep> | null>(null)
  const drumStepRef = useRef(0)

  // Initialize audio instruments once on mount
  useEffect(() => {
    samplerRef.current = new Tone.Sampler({
      urls: {
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
      },
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => setSamplerLoaded(true),
    }).toDestination()

    kickRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    }).toDestination()
    kickRef.current.volume.value = -6

    snareRef.current = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
    }).toDestination()
    snareRef.current.volume.value = -10

    hihatRef.current = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination()
    hihatRef.current.volume.value = -18

    return () => {
      samplerRef.current?.dispose()
      kickRef.current?.dispose()
      snareRef.current?.dispose()
      hihatRef.current?.dispose()
      chordSeqRef.current?.dispose()
      drumSeqRef.current?.dispose()
      Tone.getTransport().stop()
      Tone.getTransport().cancel()
    }
  }, [])

  // Rebuild sequences whenever playback params change
  useEffect(() => {
    // 메트로놈 모드일 때는 이 effect가 Transport를 건드리면 안 된다 — 임베드된
    // <Metronome bare>가 같은 전역 Transport를 쓰는데, isPlaying이 바뀔 때마다
    // 여기서 stop/cancel을 호출하면 메트로놈이 막 시작한 시퀀스를 바로 멈춰버린다.
    if (mode !== 'backing') return

    setCurrentBeat(null)
    setQuarterBeat(null)
    drumStepRef.current = 0
    Tone.getTransport().stop() // Bug 2: cancel 전에 stop
    Tone.getTransport().cancel()
    Tone.getTransport().position = 0 // Bug 2: position 리셋

    if (!isPlaying) return
    if (!samplerLoaded) return

    Tone.getTransport().bpm.value = bpm

    // Apply swing for jazz/blues
    if (style === 'jazz') {
      Tone.getTransport().swing = 0.5
      Tone.getTransport().swingSubdivision = '8n'
    } else if (style === 'blues') {
      Tone.getTransport().swing = 0.2
      Tone.getTransport().swingSubdivision = '8n'
    } else {
      Tone.getTransport().swing = 0
    }

    const { chords } = getDiatonicChords(rootNote, scaleType)
    const progression = progressionIndices.map(
      i => chords[Math.min(i, chords.length - 1)]
    )

    let beatStep = 0

    chordSeqRef.current = new Tone.Sequence<Chord>(
      (time, chord) => {
        const step = beatStep % progression.length
        beatStep++

        const delay = Math.max(0, (time - Tone.now()) * 1000 - 20)
        setTimeout(() => setCurrentBeat(step), delay)

        if (samplerRef.current) {
          chord.midiNotes.forEach((midi, i) => {
            const noteName = Tone.Frequency(midi, 'midi').toNote()
            samplerRef.current!.triggerAttackRelease(
              noteName,
              '2n',
              time + i * 0.04
            )
          })
        }
      },
      progression,
      '1m'
    )
    chordSeqRef.current.start(0)

    const stepsPerMeasure = DRUM_PATTERNS[style][subdivision].length
    const stepsPerQuarter = stepsPerMeasure / 4

    drumSeqRef.current = new Tone.Sequence<DrumStep>(
      (time, step) => {
        const stepIdx = drumStepRef.current % stepsPerMeasure
        drumStepRef.current++

        const qBeat = Math.floor(stepIdx / stepsPerQuarter)
        const delay = Math.max(0, (time - Tone.now()) * 1000 - 20)
        setTimeout(() => setQuarterBeat(qBeat), delay)

        if (step.kick) kickRef.current?.triggerAttackRelease('C1', '8n', time)
        if (step.snare) snareRef.current?.triggerAttackRelease('8n', time)
        if (step.hihat) hihatRef.current?.triggerAttackRelease('32n', time)
      },
      DRUM_PATTERNS[style][subdivision],
      SUBDIVISION_NOTE[subdivision]
    )

    drumSeqRef.current.start(0)
    Tone.getTransport().start()

    return () => {
      chordSeqRef.current?.dispose()
      drumSeqRef.current?.dispose()
    }
  }, [
    isPlaying,
    mode,
    rootNote,
    scaleType,
    style,
    subdivision,
    bpm,
    progressionIndices,
    samplerLoaded,
  ])

  // 볼륨 변경 시 즉시 반영
  useEffect(() => {
    if (samplerRef.current) {
      samplerRef.current.volume.value = Tone.gainToDb(chordVolume / 100)
    }
  }, [chordVolume])

  useEffect(() => {
    const offset = Tone.gainToDb(drumVolume / 100)
    if (kickRef.current) kickRef.current.volume.value = -6 + offset
    if (snareRef.current) snareRef.current.volume.value = -10 + offset
    if (hihatRef.current) hihatRef.current.volume.value = -18 + offset
  }, [drumVolume])

  const handleTogglePlay = async () => {
    await Tone.start()
    setIsPlaying(prev => !prev)
  }

  const handleSetMode = (m: PlayerMode) => {
    setIsPlaying(false)
    setMode(m)
  }

  const handleSetStyle = (s: BackingStyle) => {
    setStyle(s)
    setProgressionOverride(null) // Bug 1: 같은 배치로 처리 → Effect 한 번만 트리거
  }

  const cycleSlotChord = (slotIndex: number, direction: 1 | -1) => {
    const { chords } = getDiatonicChords(rootNote, scaleType)
    setProgressionOverride(prev => {
      const base = prev ?? getStyleProgression(style, scaleType)
      const next = [...base]
      next[slotIndex] =
        (next[slotIndex] + direction + chords.length) % chords.length
      return next
    })
  }

  const { chords } = getDiatonicChords(rootNote, scaleType)
  // 배킹트랙 모드만 피아노 샘플 로딩을 기다린다 — 메트로놈은 로딩 대상이 없다.
  const canPlay = mode === 'backing' ? samplerLoaded : true

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative inline-flex p-1 bg-muted rounded-lg">
          {(['backing', 'metronome'] as PlayerMode[]).map(m => (
            <button
              key={m}
              onClick={() => handleSetMode(m)}
              className={cn(
                'relative min-h-11 whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-md transition-colors z-10',
                mode === m
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {mode === m && (
                <motion.div
                  layoutId="player-mode"
                  className="absolute inset-0 bg-background rounded-md shadow-sm z-[-1]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {m === 'backing' ? '배킹트랙' : '메트로놈'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            disabled={!canPlay}
            className={cn(
              'min-h-11 whitespace-nowrap px-5 py-2 rounded-lg text-sm font-semibold transition-all',
              isPlaying
                ? 'bg-accent-orange text-background hover:opacity-90'
                : canPlay
                  ? 'bg-accent-teal text-background hover:opacity-90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {!canPlay ? 'Loading...' : isPlaying ? '■ Stop' : '▶ Play'}
          </button>
          <button
            onClick={() => setExpanded(prev => !prev)}
            aria-label={expanded ? '세부 설정 접기' : '세부 설정 펼치기'}
            aria-expanded={expanded}
            className="w-11 h-11 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent-teal/10 hover:border-accent-teal transition-colors text-muted-foreground"
          >
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="player-details"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden space-y-5"
          >
      {mode === 'backing' && (
        <>
      {/* Style + BPM */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Style selector */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Style</p>
          <div className="relative inline-flex p-1 bg-muted rounded-lg">
            {(Object.keys(STYLE_LABELS) as BackingStyle[]).map(s => (
              <button
                key={s}
                onClick={() => handleSetStyle(s)}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-md transition-colors z-10',
                  style === s
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {style === s && (
                  <motion.div
                    layoutId="backing-style"
                    className="absolute inset-0 bg-background rounded-md shadow-sm z-[-1]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {STYLE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Subdivision selector */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">비트</p>
          <div className="relative inline-flex p-1 bg-muted rounded-lg">
            {(Object.keys(SUBDIVISION_LABELS) as Subdivision[]).map(s => (
              <button
                key={s}
                onClick={() => setSubdivision(s)}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-md transition-colors z-10',
                  subdivision === s
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {subdivision === s && (
                  <motion.div
                    layoutId="backing-subdivision"
                    className="absolute inset-0 bg-background rounded-md shadow-sm z-[-1]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {SUBDIVISION_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* BPM control */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">BPM</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBpmChange(-5)}
              className="w-8 h-8 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground font-bold transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min={60}
              max={200}
              value={bpmInput}
              onChange={handleBpmInputChange}
              onFocus={e => e.target.select()}
              onBlur={handleBpmBlur}
              className="w-14 text-center text-sm font-mono font-semibold tabular-nums bg-muted rounded-md px-1 py-1 border-0 outline-none focus:ring-1 focus:ring-accent-teal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => handleBpmChange(5)}
              className="w-8 h-8 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground font-bold transition-colors"
            >
              +
            </button>
            <button
              onClick={handleTapTempo}
              className="ml-1 px-3 h-8 rounded-md border border-border bg-card hover:border-accent-teal hover:text-accent-teal text-xs font-medium text-muted-foreground transition-colors"
            >
              TAP
            </button>
          </div>
        </div>

        {/* Volume controls */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Volume</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-11">
                Piano
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={chordVolume}
                onChange={e => setChordVolume(Number(e.target.value))}
                className="w-24 accent-accent-teal"
              />
              <span className="text-xs text-muted-foreground w-7 tabular-nums">
                {chordVolume}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-11">
                Drums
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={drumVolume}
                onChange={e => setDrumVolume(Number(e.target.value))}
                className="w-24 accent-accent-teal"
              />
              <span className="text-xs text-muted-foreground w-7 tabular-nums">
                {drumVolume}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Beat Indicator */}
      <div className="flex justify-center items-center gap-4 py-1">
        {[0, 1, 2, 3].map(i => {
          const isActive = isPlaying && quarterBeat === i
          const isDownbeat = i === 0
          return (
            <motion.div
              key={i}
              animate={
                isActive
                  ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }
                  : { scale: 1, opacity: 0.2 }
              }
              transition={{ duration: (60 / bpm) * 0.7, ease: 'easeOut' }}
              className={cn(
                'rounded-full',
                isActive
                  ? isDownbeat
                    ? 'w-5 h-5 bg-accent-orange shadow-lg shadow-accent-orange/50'
                    : 'w-5 h-5 bg-accent-teal shadow-lg shadow-accent-teal/50'
                  : 'w-4 h-4 bg-muted-foreground/30'
              )}
            />
          )
        })}
      </div>

          {/* Loop progression */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Loop (4 bars)</p>
            <div className="flex flex-wrap gap-3">
              {progressionIndices.map((chordIdx, slotIndex) => {
                const chord = chords[Math.min(chordIdx, chords.length - 1)]
                const isActive = isPlaying && currentBeat === slotIndex
                return (
                  <div
                    key={slotIndex}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 rounded-lg border transition-all',
                      isActive
                        ? 'bg-accent-orange/20 border-accent-orange text-accent-orange'
                        : 'bg-muted/30 border-border text-foreground'
                    )}
                  >
                    <button
                      onClick={() => cycleSlotChord(slotIndex, -1)}
                      className="text-muted-foreground hover:text-foreground transition-colors text-xs px-1"
                    >
                      ‹
                    </button>
                    <div className="text-center min-w-[48px]">
                      <div className="text-sm font-bold">
                        {getChordLabel(chord)}
                      </div>
                    </div>
                    <button
                      onClick={() => cycleSlotChord(slotIndex, 1)}
                      className="text-muted-foreground hover:text-foreground transition-colors text-xs px-1"
                    >
                      ›
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Diatonic chords reference */}
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">Diatonic Chords</p>
            <div className="flex flex-wrap gap-2">
              {chords.map((chord, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-md bg-muted/50 text-center"
                >
                  <div className="text-xs font-semibold text-foreground">
                    {getChordLabel(chord)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {mode === 'metronome' && <Metronome bare isPlaying={isPlaying} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
