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
  onChordChange?: (chord: Chord | null) => void
}

import {
  DRUM_PATTERNS,
  SUBDIVISION_NOTE,
  SUBDIVISION_LABELS,
  type DrumStep,
  type Subdivision,
} from '@/lib/drum-patterns'
import { createDrumKit } from '@/lib/drum-kit'

const STYLE_LABELS: Record<BackingStyle, string> = {
  rock: 'Rock',
  blues: 'Blues',
  jazz: 'Jazz',
}

type PlayerMode = 'backing' | 'metronome'

export function BackingTrackPlayer({
  rootNote,
  scaleType,
  onChordChange,
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
  } = useBpmControl({
    initialBpm: 90,
    min: 60,
    max: 200,
    storageKey: 'guitarkit:backing-bpm',
  })
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

  // 수동 진행이 없으면 스타일 기본값을 사용한다.
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
  const chordChangeRef = useRef(onChordChange)
  useEffect(() => {
    chordChangeRef.current = onChordChange
  }, [onChordChange])

  // 진입 시 악기를 한 번 생성한다.
  useEffect(() => {
    let active = true
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
      onload: () => {
        if (active) setSamplerLoaded(true)
      },
    }).toDestination()

    const drums = createDrumKit(Tone.getDestination())
    kickRef.current = drums.kick
    snareRef.current = drums.snare
    hihatRef.current = drums.hihat

    return () => {
      active = false
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

  // 재생 설정이 바뀌면 시퀀스를 다시 만든다.
  useEffect(() => {
    // 공용 Transport를 쓰는 메트로놈의 재생을 중단하지 않는다.
    chordChangeRef.current?.(null)
    if (mode !== 'backing') return

    setCurrentBeat(null)
    setQuarterBeat(null)
    drumStepRef.current = 0
    Tone.getTransport().stop() // 예약 취소 전에 재생을 멈춘다.
    Tone.getTransport().cancel()
    Tone.getTransport().position = 0 // 시작 위치로 되돌린다.

    if (!isPlaying) return
    if (!samplerLoaded) return

    Tone.getTransport().bpm.value = bpm

    // 재즈·블루스에는 스윙을 적용한다.
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
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const scheduleVisual = (callback: () => void, delay: number) => {
      const id = setTimeout(() => {
        timers.delete(id)
        callback()
      }, delay)
      timers.add(id)
    }

    chordSeqRef.current = new Tone.Sequence<Chord>(
      (time, chord) => {
        const step = beatStep % progression.length
        beatStep++

        const delay = Math.max(0, (time - Tone.immediate()) * 1000)
        scheduleVisual(() => {
          setCurrentBeat(step)
          chordChangeRef.current?.(chord)
        }, delay)

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
        const delay = Math.max(0, (time - Tone.immediate()) * 1000)
        scheduleVisual(() => setQuarterBeat(qBeat), delay)

        if (step.kick) kickRef.current?.triggerAttackRelease('C1', '8n', time)
        if (step.snare) snareRef.current?.triggerAttackRelease('8n', time)
        if (step.hihat) hihatRef.current?.triggerAttackRelease(200, '32n', time)
      },
      DRUM_PATTERNS[style][subdivision],
      SUBDIVISION_NOTE[subdivision]
    )

    drumSeqRef.current.start(0)
    Tone.getTransport().start()

    return () => {
      timers.forEach(clearTimeout)
      chordChangeRef.current?.(null)
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
    setProgressionOverride(null) // 스타일 변경 시 수동 진행을 해제한다.
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
  // 메트로놈은 피아노 로딩을 기다리지 않는다.
  const canPlay = mode === 'backing' ? samplerLoaded : true

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
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
                <div className="flex flex-wrap items-center gap-6">
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
                              transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                          {STYLE_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">비트</p>
                    <div className="relative inline-flex p-1 bg-muted rounded-lg">
                      {(Object.keys(SUBDIVISION_LABELS) as Subdivision[]).map(
                        s => (
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
                                transition={{
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 30,
                                }}
                              />
                            )}
                            {SUBDIVISION_LABELS[s]}
                          </button>
                        )
                      )}
                    </div>
                  </div>

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
                        transition={{
                          duration: (60 / bpm) * 0.7,
                          ease: 'easeOut',
                        }}
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

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Loop (4 bars)</p>
                  <div className="flex flex-wrap gap-3">
                    {progressionIndices.map((chordIdx, slotIndex) => {
                      const chord =
                        chords[Math.min(chordIdx, chords.length - 1)]
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

                <div className="space-y-2 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    Diatonic Chords
                  </p>
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
