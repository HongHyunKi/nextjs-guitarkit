import {
  CHROMATIC_NOTES_WITH_ENHARMONICS,
  SCALE_LABELS,
  STANDARD_TUNING_MIDI,
  getNoteIndex,
  getScaleNotes,
  noteToInterval,
  type ScaleType,
} from './music-utils'

export const SCALE_NAMES_KO: Record<ScaleType, string> = {
  major: '메이저',
  minor: '내추럴 마이너',
  'major-pentatonic': '메이저 펜타토닉',
  'minor-pentatonic': '마이너 펜타토닉',
  dorian: '도리안',
  mixolydian: '믹솔리디안',
  lydian: '리디안',
  phrygian: '프리지안',
  'harmonic-minor': '하모닉 마이너',
  'melodic-minor': '멜로딕 마이너',
}

const rootSlug = (root: string) =>
  root[0].toLowerCase() +
  (root[1] === '#' ? '-sharp' : root[1] === 'b' ? '-flat' : '')

export const SCALE_PAGES = CHROMATIC_NOTES_WITH_ENHARMONICS.flatMap(root =>
  (Object.keys(SCALE_LABELS) as ScaleType[]).map(scale => ({
    root,
    scale,
    slug: `${rootSlug(root)}-${scale}`,
  }))
)
export type ScalePage = (typeof SCALE_PAGES)[number]

export const findScalePage = (slug: string) =>
  SCALE_PAGES.find(p => p.slug === slug)

export const scaleTitle = ({ root, scale }: ScalePage) =>
  `${root} ${SCALE_NAMES_KO[scale]} 스케일`

export function getScaleFacts(page: ScalePage) {
  const notes = getScaleNotes(page.root, page.scale)
  const pitches = notes.map(getNoteIndex)
  const rootIndex = pitches[0]
  const spelled = [...notes].sort().join()
  return {
    notes,
    formula: notes.map(n => noteToInterval(n, page.root)),
    semitones: pitches.map(p => (p - rootIndex + 12) % 12),
    altered: notes.filter(n => n.length > 1),
    // 줄 인덱스 0은 1번 줄(고음 E)이다. 0~12프렛 기준.
    strings: STANDARD_TUNING_MIDI.map(open => {
      const frets = Array.from({ length: 13 }, (_, f) => f).filter(f =>
        pitches.includes((open + f) % 12)
      )
      return {
        frets,
        rootFrets: frets.filter(f => (open + f) % 12 === rootIndex),
      }
    }),
    // 표기까지 같은 구성음을 쓰는 다른 스케일(관계조·모드)
    sameNotes: SCALE_PAGES.filter(
      p =>
        p.slug !== page.slug &&
        [...getScaleNotes(p.root, p.scale)].sort().join() === spelled
    ),
  }
}

// 6번 줄(저음)부터 근음 프렛을 나열한다.
export const rootPositionText = (facts: ReturnType<typeof getScaleFacts>) =>
  facts.strings
    .map((s, i) => [i + 1, s.rootFrets] as const)
    .reverse()
    .filter(([, frets]) => frets.length > 0)
    .map(([n, frets]) => `${n}번 줄 ${frets.join('·')}프렛`)
    .join(', ')
