'use client'

import { useEffect, useRef, useState } from 'react'
import { parseSavedBpm } from '@/lib/practice-settings'

interface UseBpmControlOptions {
  storageKey?: string
  initialBpm?: number
  min?: number
  max?: number
  tapTimeoutMs?: number
  tapHistory?: number
}

export function useBpmControl({
  storageKey,
  initialBpm = 100,
  min = 40,
  max = 240,
  tapTimeoutMs = 2000,
  tapHistory = 5,
}: UseBpmControlOptions = {}) {
  const [bpm, setBpmState] = useState(initialBpm)
  const [bpmInput, setBpmInput] = useState(String(initialBpm))
  const tapTimestampsRef = useRef<number[]>([])
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    try {
      if (storageKey) {
        const saved = parseSavedBpm(
          localStorage.getItem(storageKey),
          initialBpm,
          min,
          max
        )
        setBpmState(saved)
        setBpmInput(String(saved))
      }
    } catch {
      /* Storage may be unavailable. */
    }
    setRestored(true)
  }, [storageKey, initialBpm, min, max])

  useEffect(() => {
    if (!restored || !storageKey) return
    try {
      localStorage.setItem(storageKey, String(bpm))
    } catch {
      /* Keep controls usable. */
    }
  }, [bpm, restored, storageKey])

  const clamp = (value: number) => Math.min(max, Math.max(min, value))

  const setBpm = (next: number) => {
    const clamped = clamp(next)
    setBpmState(clamped)
    setBpmInput(String(clamped))
    return clamped
  }

  const handleBpmChange = (delta: number) => {
    setBpm(bpm + delta)
  }

  const handleBpmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBpmInput(e.target.value)
  }

  const handleBpmBlur = () => {
    const val = parseInt(bpmInput, 10)
    if (isNaN(val)) {
      setBpmInput(String(bpm))
      return
    }
    setBpm(val)
  }

  const handleTapTempo = () => {
    const now = performance.now()
    const taps = tapTimestampsRef.current
    if (taps.length > 0 && now - taps[taps.length - 1] > tapTimeoutMs) {
      taps.length = 0
    }
    taps.push(now)
    if (taps.length > tapHistory) taps.shift()

    if (taps.length >= 2) {
      const intervals = taps.slice(1).map((t, i) => t - taps[i])
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length
      setBpm(Math.round(60000 / avgMs))
    }
  }

  return {
    bpm,
    bpmInput,
    min,
    max,
    setBpm,
    handleBpmChange,
    handleBpmInputChange,
    handleBpmBlur,
    handleTapTempo,
  }
}
