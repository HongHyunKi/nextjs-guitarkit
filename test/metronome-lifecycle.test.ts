import { Metronome } from '@/components/metronome'

const mockEffects: (() => void | (() => void))[] = []
const mockTickState = jest.fn()
let mockTick: (time: number, tick: number) => void

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (value: unknown) => [
    value,
    value === null ? mockTickState : jest.fn(),
  ],
  useRef: (current: unknown) => ({ current }),
  useEffect: (fn: () => void) => mockEffects.push(fn),
}))
jest.mock('framer-motion', () => ({ motion: { div: 'div' } }))
jest.mock('@/hooks/use-bpm-control', () => ({
  useBpmControl: () => ({ bpm: 120, bpmInput: '120' }),
}))
jest.mock('tone', () => {
  class Voice {
    volume = { value: 0 }
    connect() {
      return this
    }
    toDestination() {
      return this
    }
    dispose() {}
    triggerAttackRelease() {}
  }
  const transport = { bpm: { value: 0 }, stop() {}, cancel() {}, start() {} }
  return {
    Synth: Voice,
    NoiseSynth: Voice,
    Filter: Voice,
    MembraneSynth: Voice,
    MetalSynth: Voice,
    gainToDb: () => 0,
    immediate: () => 0,
    getTransport: () => transport,
    Sequence: class {
      constructor(fn: typeof mockTick) {
        mockTick = fn
      }
      start() {}
      dispose() {}
    },
  }
})

test('박 표시를 실제 재생 시각에 맞추고 정지 시 예약을 취소한다', () => {
  jest.useFakeTimers()
  Metronome({ bare: true, isPlaying: true })
  const cleanups = mockEffects.map(effect => effect())
  try {
    mockTickState.mockClear()
    mockTick(1, 0)
    jest.advanceTimersByTime(999)
    expect(mockTickState).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1)
    expect(mockTickState).toHaveBeenLastCalledWith(0)
    mockTick(2, 1)
    cleanups.forEach(cleanup => cleanup?.())
    mockTickState.mockClear()
    jest.runAllTimers()
    expect(mockTickState).not.toHaveBeenCalled()
  } finally {
    jest.useRealTimers()
  }
})
