'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { GUITAR_SAMPLE_URLS } from '@/lib/guitar-sampler'
import { getLickFrame, lickPitch, type Lick, type LickFrame } from '@/lib/licks'

export function useLickPlayer(lick: Lick, bpm: number) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [frame, setFrame] = useState<LickFrame | null>(null)
  const samplerRef = useRef<Tone.Sampler | null>(null)
  const leadGainRef = useRef<Tone.Gain | null>(null)
  const outputRef = useRef<Tone.Gain | null>(null)
  const bassRef = useRef<Tone.Synth | null>(null)
  const clickRef = useRef<Tone.Synth | null>(null)
  const loopRef = useRef<Tone.Loop | null>(null)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())
  const generation = useRef(0)

  const stop = useCallback(() => {
    generation.current++
    loopRef.current?.dispose()
    loopRef.current = null
    timers.current.forEach(clearTimeout)
    timers.current.clear()
    const now = Tone.immediate()
    outputRef.current?.gain.cancelScheduledValues(now)
    outputRef.current?.gain.setValueAtTime(0, now)
    leadGainRef.current?.gain.cancelScheduledValues(now)
    leadGainRef.current?.gain.setValueAtTime(0, now)
    samplerRef.current?.releaseAll(now)
    bassRef.current?.triggerRelease(now)
    clickRef.current?.triggerRelease(now)
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    setPlaying(false)
    setFrame(null)
  }, [])

  useEffect(() => {
    let active = true
    setLoaded(false)
    setError('')
    const output = new Tone.Gain(0).toDestination()
    const leadGain = new Tone.Gain(0).connect(output)
    const sampler = new Tone.Sampler({
      urls: GUITAR_SAMPLE_URLS.electric,
      baseUrl: '/samples/guitar-electric/',
      release: 0.03,
      onload: () => {
        if (active) {
          setLoaded(true)
          setError('')
        }
      },
      onerror: () => {
        if (active)
          setError(
            '기타 소리를 불러오지 못했습니다. 연결을 확인하고 다시 시도해주세요.'
          )
      },
    }).connect(leadGain)
    const bass = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.03 },
      volume: -22,
    }).connect(output)
    const click = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.01 },
      volume: -18,
    }).connect(output)
    samplerRef.current = sampler
    leadGainRef.current = leadGain
    outputRef.current = output
    bassRef.current = bass
    clickRef.current = click
    const timeout = setTimeout(() => {
      if (active && !sampler.loaded)
        setError(
          '소리 로딩이 오래 걸립니다. 연결을 확인하고 다시 시도해주세요.'
        )
    }, 15000)
    const hide = () => {
      if (document.hidden) stop()
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      active = false
      clearTimeout(timeout)
      document.removeEventListener('visibilitychange', hide)
      stop()
      samplerRef.current = null
      leadGainRef.current = null
      outputRef.current = null
      bassRef.current = null
      clickRef.current = null
      sampler.dispose()
      leadGain.dispose()
      bass.dispose()
      click.dispose()
      output.dispose()
    }
  }, [attempt, stop])

  // Changing a lick or tempo starts a fresh count-in on the next Play.
  useEffect(() => {
    stop()
  }, [lick, bpm, stop])

  async function start() {
    if (!loaded || playing) return
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
      transport.timeSignature = 4
      transport.position = 0
      let step = 0
      loopRef.current = new Tone.Loop(time => {
        const next = getLickFrame(lick, step++)
        const eighthSeconds = 30 / bpm
        leadGainRef.current?.gain.setValueAtTime(
          next.phase === 'listen' ? 0.8 : 0,
          time
        )
        if (next.lead)
          samplerRef.current?.triggerAttackRelease(
            lickPitch(next.lead),
            next.lead.duration * eighthSeconds * 0.85,
            time,
            0.85
          )
        if (next.tick % 2 === 0) {
          clickRef.current?.triggerAttackRelease(
            next.beat === 1 ? 'C6' : 'G5',
            0.025,
            time
          )
          if (next.phase !== 'count-in')
            bassRef.current?.triggerAttackRelease(
              next.beat % 2 ? 'A2' : 'E3',
              eighthSeconds,
              time
            )
        }
        const id = setTimeout(
          () => {
            timers.current.delete(id)
            if (token === generation.current) setFrame(next)
          },
          Math.max(0, (time - Tone.immediate()) * 1000)
        )
        timers.current.add(id)
      }, '8n').start(0)
      const startTime = Tone.now() + 0.1
      outputRef.current?.gain.setValueAtTime(1, startTime)
      transport.start(startTime)
    } catch {
      if (token !== generation.current) return
      stop()
      setError('오디오를 시작하지 못했습니다. 재생 버튼을 다시 눌러주세요.')
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
