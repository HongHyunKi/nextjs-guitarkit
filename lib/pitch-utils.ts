import { CHROMATIC_NOTES } from './music-utils'

// 자기상관으로 기본 주파수를 추정하며 감지 실패 시 -1을 반환한다.
export function autoCorrelate(
  buffer: Float32Array,
  sampleRate: number
): number {
  const SIZE = buffer.length

  // RMS로 무음 판별 — 너무 조용하면 피치 추정을 시도하지 않는다.
  let rms = 0
  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.01) return -1

  // 40Hz까지 탐색해 저음역을 확보하고 연산량을 제한한다.
  const minFreq = 40
  const maxLagBound = Math.min(SIZE - 1, Math.floor(sampleRate / minFreq))

  const c = new Array<number>(maxLagBound + 1).fill(0)
  for (let lag = 0; lag <= maxLagBound; lag++) {
    let sum = 0
    for (let i = 0; i < SIZE - lag; i++) {
      sum += buffer[i] * buffer[i + lag]
    }
    c[lag] = sum
  }

  // lag=0은 항상 최댓값이므로, 첫 하강 이후 첫 상승 지점부터 최댓값을 찾는다.
  let d = 0
  while (d < maxLagBound && c[d] > c[d + 1]) d++

  let maxVal = -1
  let maxLag = -1
  for (let lag = d; lag <= maxLagBound; lag++) {
    if (c[lag] > maxVal) {
      maxVal = c[lag]
      maxLag = lag
    }
  }
  if (maxLag <= 0) return -1

  // 포물선 보간으로 정수 lag 사이의 실제 피크 위치를 추정해 정밀도를 높인다.
  const x1 = c[maxLag - 1] ?? c[maxLag]
  const x2 = c[maxLag]
  const x3 = c[maxLag + 1] ?? c[maxLag]
  const denom = x1 - 2 * x2 + x3
  const shift = denom !== 0 ? (0.5 * (x1 - x3)) / denom : 0
  const refinedLag = maxLag + shift

  if (refinedLag <= 0) return -1
  return sampleRate / refinedLag
}

export type PitchDetection = {
  frequency: number
  note: string
  octave: number
  cents: number
  midi: number
}

// A4 = MIDI 69 = 440Hz 기준으로 가장 가까운 반음과 cents 편차를 계산한다.
export function frequencyToNote(frequency: number): PitchDetection {
  const midiFloat = 69 + 12 * Math.log2(frequency / 440)
  const midi = Math.round(midiFloat)
  const cents = Math.round((midiFloat - midi) * 100)
  const noteIndex = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1

  return {
    frequency,
    note: CHROMATIC_NOTES[noteIndex],
    octave,
    cents,
    midi,
  }
}

// MIDI 노트 번호 → 주파수(Hz). 특정 현(목표 피치)을 고정해두고 튜닝할 때 사용.
export function noteToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

// 가장 가까운 음이 아닌 선택한 줄의 목표음과 센트 차이를 구한다.
export function centsFromTarget(
  frequency: number,
  targetFrequency: number
): number {
  return Math.round(1200 * Math.log2(frequency / targetFrequency))
}
