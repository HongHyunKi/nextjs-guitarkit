import {
  autoCorrelate,
  frequencyToNote,
  noteToFrequency,
  centsFromTarget,
} from '@/lib/pitch-utils'

describe('frequencyToNote', () => {
  it('identifies A4 = 440Hz exactly with 0 cents', () => {
    const result = frequencyToNote(440)
    expect(result.note).toBe('A')
    expect(result.octave).toBe(4)
    expect(result.cents).toBe(0)
    expect(result.midi).toBe(69)
  })

  it('identifies standard guitar open strings', () => {
    // E2, A2, D3, G3, B3, E4
    expect(frequencyToNote(82.41).note).toBe('E')
    expect(frequencyToNote(82.41).octave).toBe(2)
    expect(frequencyToNote(110).note).toBe('A')
    expect(frequencyToNote(110).octave).toBe(2)
    expect(frequencyToNote(146.83).note).toBe('D')
    expect(frequencyToNote(146.83).octave).toBe(3)
    expect(frequencyToNote(196).note).toBe('G')
    expect(frequencyToNote(196).octave).toBe(3)
    expect(frequencyToNote(246.94).note).toBe('B')
    expect(frequencyToNote(246.94).octave).toBe(3)
    expect(frequencyToNote(329.63).note).toBe('E')
    expect(frequencyToNote(329.63).octave).toBe(4)
  })

  it('reports positive cents for sharp (above pitch) and negative for flat (below pitch)', () => {
    const sharp = frequencyToNote(445) // A4보다 조금 높음
    expect(sharp.note).toBe('A')
    expect(sharp.cents).toBeGreaterThan(0)

    const flat = frequencyToNote(435) // A4보다 조금 낮음
    expect(flat.note).toBe('A')
    expect(flat.cents).toBeLessThan(0)
  })

  it('rolls over to the next octave correctly', () => {
    const result = frequencyToNote(523.25) // C5
    expect(result.note).toBe('C')
    expect(result.octave).toBe(5)
  })
})

describe('noteToFrequency', () => {
  it('converts MIDI 69 (A4) to 440Hz', () => {
    expect(noteToFrequency(69)).toBeCloseTo(440, 5)
  })

  it('converts standard guitar open-string MIDI values correctly', () => {
    expect(noteToFrequency(40)).toBeCloseTo(82.41, 1) // E2
    expect(noteToFrequency(45)).toBeCloseTo(110, 1) // A2
    expect(noteToFrequency(50)).toBeCloseTo(146.83, 1) // D3
    expect(noteToFrequency(55)).toBeCloseTo(196, 1) // G3
    expect(noteToFrequency(59)).toBeCloseTo(246.94, 1) // B3
    expect(noteToFrequency(64)).toBeCloseTo(329.63, 1) // E4
  })
})

describe('centsFromTarget', () => {
  it('returns 0 when frequency exactly matches target', () => {
    expect(centsFromTarget(440, 440)).toBe(0)
  })

  it('is independent of frequencyToNote — reports large deviation for an unrelated pitch', () => {
    // A2를 쳐도 선택한 E4 기준의 낮은 음으로 판정한다.
    const cents = centsFromTarget(110, 329.63)
    expect(cents).toBeLessThan(-1000)
  })

  it('reports negative cents when flat and positive when sharp relative to target', () => {
    expect(centsFromTarget(435, 440)).toBeLessThan(0)
    expect(centsFromTarget(445, 440)).toBeGreaterThan(0)
  })

  it('round-trips with noteToFrequency at 0 cents for the exact target note', () => {
    const target = noteToFrequency(45) // A2
    expect(centsFromTarget(target, target)).toBe(0)
  })
})

function generateSineWave(
  frequency: number,
  sampleRate: number,
  size: number
): Float32Array {
  const buffer = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    buffer[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate)
  }
  return buffer
}

describe('autoCorrelate', () => {
  const sampleRate = 44100
  const size = 2048

  it('detects the fundamental frequency of a pure sine wave within 1%', () => {
    const testFrequencies = [82.41, 110, 146.83, 196, 246.94, 329.63, 440]
    testFrequencies.forEach(freq => {
      const buffer = generateSineWave(freq, sampleRate, size)
      const detected = autoCorrelate(buffer, sampleRate)
      expect(detected).toBeGreaterThan(0)
      expect(Math.abs(detected - freq) / freq).toBeLessThan(0.01)
    })
  })

  it('returns -1 for silence', () => {
    const buffer = new Float32Array(size) // 무음 파형
    expect(autoCorrelate(buffer, sampleRate)).toBe(-1)
  })

  it('returns -1 for low-amplitude noise below the RMS threshold', () => {
    const buffer = new Float32Array(size).map(
      () => (Math.random() - 0.5) * 0.001
    )
    expect(autoCorrelate(buffer, sampleRate)).toBe(-1)
  })
})
