import { isValidElement, type ReactNode } from 'react'
import { Tuner } from '@/components/tuner'

const mockEffects: (() => void | (() => void))[] = []
const mockState = jest.fn()
const originalMediaDevices = Object.getOwnPropertyDescriptor(
  navigator,
  'mediaDevices'
)
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (value: unknown) => [value, mockState],
  useRef: (current: unknown) => ({ current }),
  useCallback: (fn: unknown) => fn,
  useEffect: (fn: () => void) => mockEffects.push(fn),
}))
jest.mock('framer-motion', () => ({ motion: { div: 'div' } }))

function startButton(node: ReactNode): (() => Promise<void>) | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = startButton(child)
      if (found) return found
    }
  }
  if (
    !isValidElement<{ children?: ReactNode; onClick?: () => Promise<void> }>(
      node
    )
  )
    return
  return node.type === 'button'
    ? node.props.onClick
    : startButton(node.props.children)
}

afterEach(() => {
  mockEffects.length = 0
  mockState.mockClear()
  jest.restoreAllMocks()
  if (originalMediaDevices)
    Object.defineProperty(navigator, 'mediaDevices', originalMediaDevices)
  else Reflect.deleteProperty(navigator, 'mediaDevices')
})

test('권한 응답 전에 나가면 뒤늦게 열린 마이크를 종료한다', async () => {
  let resolve!: (stream: MediaStream) => void
  const stop = jest.fn()
  const getUserMedia = jest.fn(
    () =>
      new Promise<MediaStream>(r => {
        resolve = r
      })
  )
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  })
  const start = startButton(Tuner())!
  const cleanup = mockEffects[0]()!
  const pending = start()
  cleanup()
  resolve({ getTracks: () => [{ stop }] } as unknown as MediaStream)
  await pending
  expect(stop).toHaveBeenCalledTimes(1)
  expect(mockState).not.toHaveBeenCalledWith('listening')
})

test('오디오 초기화 실패 시 마이크를 종료하고 장치 오류로 안내한다', async () => {
  const stop = jest.fn()
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: jest
        .fn()
        .mockResolvedValue({ getTracks: () => [{ stop }] }),
    },
  })
  const original = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext')
  Object.defineProperty(globalThis, 'AudioContext', {
    configurable: true,
    value: class {
      constructor() {
        throw new Error('장치 사용 불가')
      }
    },
  })
  try {
    await startButton(Tuner())!()
    expect(stop).toHaveBeenCalledTimes(1)
    expect(mockState).toHaveBeenCalledWith('error')
  } finally {
    if (original) Object.defineProperty(globalThis, 'AudioContext', original)
    else Reflect.deleteProperty(globalThis, 'AudioContext')
  }
})
