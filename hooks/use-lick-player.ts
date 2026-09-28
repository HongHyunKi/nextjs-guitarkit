'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { GUITAR_SAMPLE_URLS } from '@/lib/guitar-sampler'
import { createDrumKit } from '@/lib/drum-kit'
import { getLickDrumSteps, type LickDrums } from '@/lib/drum-patterns'
import {
  getLickFrame,
  lickPitch,
  lickPitchCurve,
  type Lick,
  type LickFrame,
  type LickKey,
} from '@/lib/licks'

export function useLickPlayer(
  lick: Lick,
  bpm: number,
  drumPattern: LickDrums,
  drumVolume: number,
  clickEnabled: boolean,
  root: LickKey
) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [frame, setFrame] = useState<(LickFrame & { fraction: number }) | null>(
    null
  )
  const samplerRef = useRef<Tone.ToneAudioBuffers | null>(null)
  const voices = useRef(new Set<AudioBufferSourceNode>())
  const leadGainRef = useRef<Tone.Gain | null>(null)
  const outputRef = useRef<Tone.Gain | null>(null)
  const bassRef = useRef<Tone.Synth | null>(null)
  const clickRef = useRef<Tone.Synth | null>(null)
  const drumsRef = useRef<ReturnType<typeof createDrumKit> | null>(null)
  const drumGainRef = useRef<Tone.Gain | null>(null)
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
    voices.current.forEach(source => {
      source.stop()
      source.disconnect()
    })
    voices.current.clear()
    bassRef.current?.triggerRelease(now)
    clickRef.current?.triggerRelease(now)
    drumsRef.current?.kick.triggerRelease(now)
    drumsRef.current?.snare.triggerRelease(now)
    drumsRef.current?.hihat.triggerRelease(now)
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
    const drumGain = new Tone.Gain(drumVolume / 100).connect(output)
    const drums = createDrumKit(drumGain)
    drumsRef.current = drums
    drumGainRef.current = drumGain
    const sampler = new Tone.ToneAudioBuffers({
      urls: GUITAR_SAMPLE_URLS.electric,
      baseUrl: '/samples/guitar-electric/',
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
    })
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
      drumsRef.current = null
      drumGainRef.current = null
      drums.kick.dispose()
      drums.snare.dispose()
      drums.hihat.dispose()
      drumGain.dispose()
      sampler.dispose()
      leadGain.dispose()
      bass.dispose()
      click.dispose()
      output.dispose()
    }
  }, [attempt, stop])

  useEffect(() => {
    drumGainRef.current?.gain.rampTo(drumVolume / 100, 0.05)
  }, [drumVolume, attempt])

  // 설정 변경 후 재생은 준비 마디부터 시작한다.
  useEffect(() => {
    stop()
  }, [lick, bpm, drumPattern, clickEnabled, root, stop])

  async function start() {
    if (!loaded || playing) return
    stop()
    const token = generation.current
    setError('')
    setPlaying(true)
    const fail = () => {
      if (token !== generation.current) return
      stop()
      setError('오디오를 재생하지 못했습니다. 재생 버튼을 다시 눌러주세요.')
    }
    try {
      await Tone.start()
      if (token !== generation.current) return
      const transport = Tone.getTransport()
      transport.bpm.value = bpm
      transport.swing = 0
      transport.timeSignature = 4
      transport.position = 0
      let step = 0
      const playStep = (time: number) => {
        const next = getLickFrame(lick, step++)
        const eighthSeconds = 30 / bpm
        leadGainRef.current?.gain.setValueAtTime(
          next.phase === 'listen' ? 0.8 : 0,
          time
        )
        if (next.lead && samplerRef.current && leadGainRef.current) {
          const note = next.lead
          const midi = Tone.Frequency(lickPitch(note)).toMidi()
          const sample = Object.keys(GUITAR_SAMPLE_URLS.electric).reduce(
            (best, key) =>
              Math.abs(Tone.Frequency(key).toMidi() - midi) <
              Math.abs(Tone.Frequency(best).toMidi() - midi)
                ? key
                : best
          )
          const source = Tone.getContext().createBufferSource()
          const envelope = Tone.getContext().createGain()
          source.buffer = samplerRef.current.get(sample).get() ?? null
          const duration = note.duration * eighthSeconds * 0.95
          const base = midi - Tone.Frequency(sample).toMidi()
          // ponytail: 주법은 재생 속도로 근사한다. 마찰음은 별도 녹음이 필요하다.
          for (const [fraction, semitones] of lickPitchCurve(note)) {
            const rate = Math.pow(2, (base + semitones) / 12)
            if (fraction === 0) source.playbackRate.setValueAtTime(rate, time)
            else
              source.playbackRate.exponentialRampToValueAtTime(
                rate,
                time + fraction * duration
              )
          }
          envelope.gain.setValueAtTime(0, time)
          envelope.gain.linearRampToValueAtTime(0.85, time + 0.005)
          envelope.gain.setValueAtTime(0.85, time + duration - 0.025)
          envelope.gain.linearRampToValueAtTime(0, time + duration)
          source.connect(envelope)
          Tone.connect(envelope, leadGainRef.current)
          voices.current.add(source)
          source.onended = () => {
            voices.current.delete(source)
            source.disconnect()
            envelope.disconnect()
          }
          source.start(time)
          source.stop(time + duration)
        }
        if (next.tick % 2 === 0) {
          if (next.phase === 'count-in' || clickEnabled)
            clickRef.current?.triggerAttackRelease(
              next.beat === 1 ? 'C6' : 'G5',
              0.025,
              time
            )
          if (next.phase !== 'count-in')
            bassRef.current?.triggerAttackRelease(
              Tone.Frequency(`${root}2`)
                .transpose(next.beat % 2 ? 0 : 7)
                .toFrequency(),
              eighthSeconds,
              time
            )
        }
        for (const { step: drum, offset } of getLickDrumSteps(
          drumPattern,
          next.tick,
          next.phase === 'count-in'
        )) {
          const drumTime = time + offset * eighthSeconds
          if (drum.kick)
            drumsRef.current?.kick.triggerAttackRelease('C1', '8n', drumTime)
          if (drum.snare)
            drumsRef.current?.snare.triggerAttackRelease('8n', drumTime)
          if (drum.hihat)
            drumsRef.current?.hihat.triggerAttackRelease(200, '32n', drumTime)
        }
        for (let subdivision = 0; subdivision < 4; subdivision++) {
          const fraction = subdivision / 4
          const id = setTimeout(
            () => {
              timers.current.delete(id)
              if (token === generation.current) setFrame({ ...next, fraction })
            },
            Math.max(
              0,
              (time + fraction * eighthSeconds - Tone.immediate()) * 1000
            )
          )
          timers.current.add(id)
        }
      }
      loopRef.current = new Tone.Loop(time => {
        try {
          playStep(time)
        } catch {
          fail()
        }
      }, '8n').start(0)
      const startTime = Tone.now() + 0.1
      drumGainRef.current?.gain.cancelScheduledValues(startTime)
      drumGainRef.current?.gain.setValueAtTime(drumVolume / 100, startTime)
      outputRef.current?.gain.setValueAtTime(1, startTime)
      transport.start(startTime)
    } catch {
      fail()
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
