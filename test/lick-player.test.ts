import { useLickPlayer } from '@/hooks/use-lick-player'
import { LICKS } from '@/lib/licks'
import * as Tone from 'tone'

const mockEffects: (() => void | (() => void))[] = []
const mockVoices: { triggerAttackRelease: jest.Mock }[] = []
const mockGains: { gain: { setValueAtTime: jest.Mock } }[] = []
let mockTick: (time: number) => void
let mockStateCalls = 0
jest.mock('react', () => ({
  useState: (value: unknown) => [
    mockStateCalls++ === 0 ? true : value,
    jest.fn(),
  ],
  useRef: (current: unknown) => ({ current }),
  useCallback: (fn: unknown) => fn,
  useEffect: (fn: () => void) => mockEffects.push(fn),
}))
jest.mock('tone', () => {
  class Voice {
    triggerAttackRelease = jest.fn()
    triggerRelease = jest.fn()
    dispose = jest.fn()
    connect() {
      return this
    }
    constructor() {
      mockVoices.push(this)
    }
  }
  const param = () => ({
    setValueAtTime: jest.fn(),
    cancelScheduledValues: jest.fn(),
    rampTo: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  })
  const transport = {
    bpm: { value: 0 },
    stop: jest.fn(),
    cancel: jest.fn(),
    start: jest.fn(),
  }
  return {
    Gain: class {
      gain = param()
      constructor() {
        mockGains.push(this)
      }
      connect() {
        return this
      }
      toDestination() {
        return this
      }
      dispose() {}
    },
    Synth: Voice,
    MembraneSynth: Voice,
    NoiseSynth: Voice,
    MetalSynth: Voice,
    ToneAudioBuffers: class {
      loaded = true
      get() {
        return { get: () => ({}) }
      }
      dispose() {}
    },
    Loop: class {
      constructor(fn: (time: number) => void) {
        mockTick = fn
      }
      start() {
        return this
      }
      dispose() {}
    },
    Frequency: () => ({
      toMidi: () => 60,
      transpose: () => ({ toFrequency: () => 110 }),
    }),
    getContext: () => ({
      createBufferSource: () => ({
        playbackRate: param(),
        connect() {},
        start() {},
        stop() {},
        disconnect() {},
      }),
      createGain: () => ({ gain: param(), disconnect() {} }),
    }),
    connect: jest.fn(),
    getTransport: () => transport,
    immediate: () => 0,
    now: () => 0,
    start: jest.fn().mockResolvedValue(undefined),
  }
})

test('starts with count-in, audible demo, then muted lead; every drum uses the scheduled time', async () => {
  jest.useFakeTimers()
  Object.assign(globalThis, {
    document: { addEventListener() {}, removeEventListener() {} },
  })
  const player = useLickPlayer(LICKS[0], 120, '16beat', 50, false, 'A')
  const cleanups = mockEffects.map(effect => effect())
  try {
    await player.start()
    expect(Tone.getTransport().start).toHaveBeenCalled()
    expect(mockGains[2].gain.setValueAtTime).toHaveBeenLastCalledWith(0.5, 0.1)
    const [kick, snare, hihat, bass, click] = mockVoices
    const lead = mockGains[1].gain.setValueAtTime
    for (let step = 0; step < 24; step++) {
      const time = 1 + step * 0.25
      mockTick(time)
      expect(lead).toHaveBeenLastCalledWith(
        step >= 8 && step < 16 ? 0.8 : 0,
        time
      )
      if (step < 8) {
        expect(kick.triggerAttackRelease).not.toHaveBeenCalled()
        expect(hihat.triggerAttackRelease).not.toHaveBeenCalled()
      } else {
        expect(hihat.triggerAttackRelease).toHaveBeenLastCalledWith(
          200,
          '32n',
          time + 0.125
        )
      }
    }
    expect(click.triggerAttackRelease).toHaveBeenCalledTimes(4)
    expect(bass.triggerAttackRelease).toHaveBeenCalledTimes(8)
    expect(
      kick.triggerAttackRelease.mock.calls.map((call: unknown[]) => call[2])
    ).toEqual([3, 4, 5, 6])
    expect(
      snare.triggerAttackRelease.mock.calls.map((call: unknown[]) => call[1])
    ).toEqual([3.5, 4.5, 5.5, 6.5])
    expect(Tone.connect).toHaveBeenCalledTimes(LICKS[0].notes.length)
    hihat.triggerAttackRelease.mockImplementationOnce(() => {
      throw new Error('Audio scheduling failed')
    })
    expect(() => mockTick(7)).not.toThrow()
    expect(mockGains[0].gain.setValueAtTime).toHaveBeenLastCalledWith(0, 0)
  } finally {
    cleanups.forEach(cleanup => cleanup?.())
    jest.useRealTimers()
  }
})
