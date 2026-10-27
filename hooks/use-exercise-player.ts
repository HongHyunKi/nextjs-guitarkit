'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { GUITAR_SAMPLE_URLS } from '@/lib/guitar-sampler'
import { getPitchFromFret } from '@/lib/music-utils'
import type { ExercisePosition } from '@/lib/scale-exercises'

export type SpeedUp = { every: number; step: number; max: number }
export type ExerciseFrame = {
  index: number | null // 준비 마디에는 null
  beat: number
  loop: number
  bpm: number
}

const STEP_NOTATION = { 2: '8n', 3: '8t', 4: '16n' } as const

export function useExercisePlayer(
  notes: (ExercisePosition | null)[],
  perBeat: 2 | 3 | 4,
  bpm: number,
  speedUp: SpeedUp | null
) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [frame, setFrame] = useState<ExerciseFrame | null>(null)
  const samplerRef = useRef<Tone.Sampler | null>(null)
  const clickRef = useRef<Tone.Synth | null>(null)
  const loopRef = useRef<Tone.Loop | null>(null)
  const generation = useRef(0)

  const stop = useCallback(() => {
    generation.current++
    loopRef.current?.dispose()
    loopRef.current = null
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    Tone.getDraw().cancel()
    samplerRef.current?.releaseAll()
    setPlaying(false)
    setFrame(null)
  }, [])

  useEffect(() => {
    let active = true
    setLoaded(false)
    setError('')
    const sampler = new Tone.Sampler({
      urls: GUITAR_SAMPLE_URLS.electric,
      baseUrl: '/samples/guitar-electric/',
      release: 0.3,
      onload: () => active && setLoaded(true),
      onerror: () =>
        active &&
        setError(
          '기타 소리를 불러오지 못했습니다. 연결을 확인하고 다시 시도해주세요.'
        ),
    }).toDestination()
    const click = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.01 },
      volume: -16,
    }).toDestination()
    samplerRef.current = sampler
    clickRef.current = click
    const hide = () => {
      if (document.hidden) stop()
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      active = false
      document.removeEventListener('visibilitychange', hide)
      stop()
      samplerRef.current = null
      clickRef.current = null
      sampler.dispose()
      click.dispose()
    }
  }, [attempt, stop])

  // 설정이 바뀌면 정지하고, 다시 시작할 때 준비 마디부터 센다.
  useEffect(() => {
    stop()
  }, [notes, perBeat, bpm, speedUp, stop])

  async function start() {
    if (!loaded || playing || notes.length === 0) return
    stop()
    const token = generation.current
    setError('')
    setPlaying(true)
    try {
      await Tone.start()
      if (token !== generation.current) return
      const transport = Tone.getTransport()
      transport.bpm.value = bpm
      transport.swing = 0
      transport.position = 0
      const bar = 4 * perBeat
      let current = bpm
      let step = 0
      loopRef.current = new Tone.Loop(time => {
        const s = step++
        const beat = Math.floor((s % bar) / perBeat) + 1
        if (s % perBeat === 0)
          clickRef.current?.triggerAttackRelease(
            beat === 1 ? 'C6' : 'G5',
            0.025,
            time
          )
        let next: ExerciseFrame = { index: null, beat, loop: 0, bpm: current }
        if (s >= bar) {
          const index = (s - bar) % notes.length
          const loop = Math.floor((s - bar) / notes.length) + 1
          // 반복이 끝날 때마다 every회째에 템포를 올린다.
          if (
            index === 0 &&
            loop > 1 &&
            speedUp &&
            (loop - 1) % speedUp.every === 0 &&
            current < speedUp.max
          ) {
            current = Math.min(speedUp.max, current + speedUp.step)
            transport.bpm.setValueAtTime(current, time)
          }
          next = { index, beat, loop, bpm: current }
          const note = notes[index]
          if (note)
            samplerRef.current?.triggerAttackRelease(
              getPitchFromFret(note.stringIndex, note.fret),
              (60 / current / perBeat) * 0.9,
              time
            )
        }
        Tone.getDraw().schedule(() => {
          if (token === generation.current) setFrame(next)
        }, time)
      }, STEP_NOTATION[perBeat]).start(0)
      transport.start(Tone.now() + 0.1)
    } catch {
      if (token !== generation.current) return
      stop()
      setError('오디오를 재생하지 못했습니다. 재생 버튼을 다시 눌러주세요.')
    }
  }

  return {
    loaded,
    playing,
    frame,
    error,
    start,
    stop,
    retry: () => {
      stop()
      setAttempt(n => n + 1)
    },
  }
}
