'use client'

import { useEffect, useRef } from 'react'
import * as Tone from 'tone'

export type GuitarTone = 'electric' | 'acoustic'

// 기타 녹음 출처와 CC-BY 3.0 표기는 README를 참고한다.
export const GUITAR_SAMPLE_URLS: Record<GuitarTone, Record<string, string>> = {
  electric: {
    E2: 'E2.mp3',
    'F#2': 'Fs2.mp3',
    A2: 'A2.mp3',
    C3: 'C3.mp3',
    'D#3': 'Ds3.mp3',
    'F#3': 'Fs3.mp3',
    A3: 'A3.mp3',
    C4: 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F#4': 'Fs4.mp3',
    A4: 'A4.mp3',
    C5: 'C5.mp3',
    'D#5': 'Ds5.mp3',
    'F#5': 'Fs5.mp3',
    A5: 'A5.mp3',
    C6: 'C6.mp3',
  },
  acoustic: {
    E2: 'E2.mp3',
    G2: 'G2.mp3',
    A2: 'A2.mp3',
    C3: 'C3.mp3',
    D3: 'D3.mp3',
    E3: 'E3.mp3',
    G3: 'G3.mp3',
    A3: 'A3.mp3',
    C4: 'C4.mp3',
    D4: 'D4.mp3',
    E4: 'E4.mp3',
    G4: 'G4.mp3',
    A4: 'A4.mp3',
    C5: 'C5.mp3',
    D5: 'D5.mp3',
  },
}

// 로딩 후 단음·스트럼을 재생한다.
export function useGuitarSampler(guitarTone: GuitarTone) {
  const samplerRef = useRef<Tone.Sampler | null>(null)

  useEffect(() => {
    const sampler = new Tone.Sampler({
      urls: GUITAR_SAMPLE_URLS[guitarTone],
      baseUrl: `/samples/guitar-${guitarTone}/`,
      release: 1,
    }).toDestination()
    samplerRef.current = sampler

    return () => {
      samplerRef.current = null
      sampler.dispose()
    }
  }, [guitarTone])

  const play = async (
    pitches: string | string[],
    duration: string = '2n',
    strumMs: number = 0
  ) => {
    await Tone.start()
    const sampler = samplerRef.current
    if (!sampler || !sampler.loaded) return
    const arr = Array.isArray(pitches) ? pitches : [pitches]
    const now = Tone.now()
    arr.forEach((pitch, i) => {
      sampler.triggerAttackRelease(pitch, duration, now + (i * strumMs) / 1000)
    })
  }

  return { play }
}
