import {
  ChordType,
  STANDARD_TUNING_MIDI,
  getNoteIndex,
  getPitchFromFret,
  isChordFlat,
} from '@/lib/music-utils'

// 6번 줄부터의 상대 프렛이며 -1은 뮤트다. 루트에 맞춰 이동한다.
export type ChordForm = 'E' | 'A' | 'D'

interface FormShape {
  form: ChordForm
  rootString: number // 저음→고음 인덱스 (0 = 6번줄)
  offsets: number[] // 길이 6, 루트 프렛 기준 상대값
}

const FORM_SHAPES: Record<ChordType, FormShape[]> = {
  major: [
    { form: 'E', rootString: 0, offsets: [0, 2, 2, 1, 0, 0] },
    { form: 'A', rootString: 1, offsets: [-1, 0, 2, 2, 2, 0] },
    { form: 'D', rootString: 2, offsets: [-1, -1, 0, 2, 3, 2] },
  ],
  minor: [
    { form: 'E', rootString: 0, offsets: [0, 2, 2, 0, 0, 0] },
    { form: 'A', rootString: 1, offsets: [-1, 0, 2, 2, 1, 0] },
    { form: 'D', rootString: 2, offsets: [-1, -1, 0, 2, 3, 1] },
  ],
  '7': [
    { form: 'E', rootString: 0, offsets: [0, 2, 0, 1, 0, 0] },
    { form: 'A', rootString: 1, offsets: [-1, 0, 2, 0, 2, 0] },
    { form: 'D', rootString: 2, offsets: [-1, -1, 0, 2, 1, 2] },
  ],
  maj7: [
    { form: 'E', rootString: 0, offsets: [0, 2, 1, 1, 0, 0] },
    { form: 'A', rootString: 1, offsets: [-1, 0, 2, 1, 2, 0] },
  ],
  m7: [
    { form: 'E', rootString: 0, offsets: [0, 2, 0, 0, 0, 0] },
    { form: 'A', rootString: 1, offsets: [-1, 0, 2, 0, 1, 0] },
    { form: 'D', rootString: 2, offsets: [-1, -1, 0, 2, 1, 1] },
  ],
  sus2: [{ form: 'A', rootString: 1, offsets: [-1, 0, 2, 2, 0, 0] }],
  sus4: [
    { form: 'E', rootString: 0, offsets: [0, 2, 2, 2, 0, 0] },
    { form: 'A', rootString: 1, offsets: [-1, 0, 2, 2, 3, 0] },
  ],
  dim7: [
    { form: 'A', rootString: 1, offsets: [-1, 0, 1, 2, 1, 2] },
    { form: 'D', rootString: 2, offsets: [-1, -1, 0, 1, 0, 1] },
  ],
  aug: [
    { form: 'E', rootString: 0, offsets: [0, 3, 2, 1, 1, 0] },
    { form: 'A', rootString: 1, offsets: [-1, 0, 3, 2, 2, 1] },
  ],
  add9: [{ form: 'A', rootString: 1, offsets: [-1, 0, 2, 4, 2, 0] }],
}

export interface ChordVoicing {
  form: ChordForm
  rootFret: number // 폼의 루트가 놓인 프렛 (0 = 오픈 포지션)
  frets: number[] // 현별 프렛 (저음→고음, -1 = 뮤트)
  pitches: string[] // 재생용 피치 (저음→고음, 뮤트 제외)
}

// 저음→고음 인덱스(i)를 getPitchFromFret의 stringIndex(고음→저음)로 변환
const toStringIndex = (lowToHighIndex: number) => 5 - lowToHighIndex

export function getChordVoicings(
  rootNote: string,
  chordType: ChordType
): ChordVoicing[] {
  const rootIndex = getNoteIndex(rootNote)
  const useFlat = isChordFlat(rootNote, chordType)

  const voicings = FORM_SHAPES[chordType].map(shape => {
    // 루트 현에서 루트 음이 나오는 가장 낮은 프렛 (0~11)
    const openMidi = STANDARD_TUNING_MIDI[toStringIndex(shape.rootString)]
    const rootFret = (rootIndex - (openMidi % 12) + 12) % 12

    const frets = shape.offsets.map(offset =>
      offset < 0 ? -1 : offset + rootFret
    )
    const pitches = frets
      .map((fret, i) =>
        fret < 0 ? null : getPitchFromFret(toStringIndex(i), fret, useFlat)
      )
      .filter((p): p is string => p !== null)

    return { form: shape.form, rootFret, frets, pitches }
  })

  // 낮은 포지션 우선 정렬
  return voicings.sort((a, b) => a.rootFret - b.rootFret)
}
