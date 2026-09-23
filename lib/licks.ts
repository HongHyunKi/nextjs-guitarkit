import { getPitchFromFret } from './music-utils'

// Original one-bar exercises, not transcriptions of recorded songs.
// 4/4, straight eighths: eight ticks per bar; stringIndex 0 is the high E.
export type LickNote = {
  tick: number
  duration: number
  stringIndex: number
  fret: number
  technique?: 'bend' | 'release' | 'slide'
  targetFret?: number
}
export type Lick = {
  id: string
  title: string
  description: string
  tip: string
  notes: LickNote[]
  style?: string
  recommendation?: string
}
export const LICKS: Lick[] = [
  {
    id: 'first-answer',
    recommendation: '벤딩 없이 짧은 상승과 근음 마무리를 익힐 수 있어요.',
    title: '첫 대답',
    description: '3개 줄 · 6음 · 올라갔다 근음으로 마무리',
    tip: '검지는 5프렛, 약지는 7프렛에 두세요. 마지막 A는 앞의 짧은 음보다 두 배 길게 유지합니다.',
    notes: [
      { tick: 0, duration: 1, stringIndex: 2, fret: 5 },
      { tick: 1, duration: 1, stringIndex: 2, fret: 7 },
      { tick: 2, duration: 2, stringIndex: 1, fret: 5 },
      { tick: 4, duration: 1, stringIndex: 2, fret: 7 },
      { tick: 5, duration: 1, stringIndex: 2, fret: 5 },
      { tick: 6, duration: 2, stringIndex: 3, fret: 7 },
    ],
  },
  {
    id: 'high-to-home',
    title: '높은 음에서 내려오기',
    description: '2개 줄 · 7음 · 짧은 하행과 되돌아오기',
    tip: '1번 줄은 가장 가는 줄입니다. 5프렛은 검지, 8프렛은 새끼손가락으로 짚어보세요.',
    notes: [
      { tick: 0, duration: 1, stringIndex: 0, fret: 8 },
      { tick: 1, duration: 1, stringIndex: 0, fret: 5 },
      { tick: 2, duration: 1, stringIndex: 1, fret: 8 },
      { tick: 3, duration: 1, stringIndex: 1, fret: 5 },
      { tick: 4, duration: 1, stringIndex: 1, fret: 8 },
      { tick: 5, duration: 1, stringIndex: 0, fret: 8 },
      { tick: 6, duration: 2, stringIndex: 0, fret: 5 },
    ],
  },
  {
    id: 'leave-space',
    title: '쉬었다 대답하기',
    description: '3개 줄 · 5음 · 쉼표가 있는 프레이즈',
    tip: '첫 박에는 연주하지 않습니다. 쉬는 동안에도 1, 2, 3, 4를 세고 두 번째 박에 들어오세요.',
    notes: [
      { tick: 2, duration: 1, stringIndex: 2, fret: 5 },
      { tick: 3, duration: 1, stringIndex: 2, fret: 7 },
      { tick: 4, duration: 1, stringIndex: 1, fret: 5 },
      { tick: 5, duration: 1, stringIndex: 2, fret: 5 },
      { tick: 6, duration: 2, stringIndex: 3, fret: 7 },
    ],
  },
]

export const LICK_GROUPS = ['전체', '기본', '벤딩', '슬라이드', '혼합'] as const
export function lickGroup(lick: Pick<Lick, 'notes'>) {
  const bend = lick.notes.some(
    n => n.technique === 'bend' || n.technique === 'release'
  )
  const slide = lick.notes.some(n => n.technique === 'slide')
  return bend && slide ? '혼합' : bend ? '벤딩' : slide ? '슬라이드' : '기본'
}

// Each tuple is [tick, length in eighths, string index, fret, technique?, target].
type Phrase = [
  number,
  number,
  number,
  number,
  LickNote['technique']?,
  number?,
][]
const phrases: [
  string,
  string,
  Phrase,
  { style?: string; tip?: string; recommendation?: string }?,
][] = [
  [
    'low-answer',
    '낮은 줄의 대답',
    [
      [0, 2, 5, 5],
      [2, 1, 5, 8],
      [3, 1, 4, 5],
      [4, 2, 4, 7],
      [6, 2, 3, 7],
    ],
  ],
  [
    'ascending-four',
    '네 음 계단',
    [
      [0, 2, 2, 5],
      [2, 2, 2, 7],
      [4, 2, 1, 5],
      [6, 2, 1, 8],
    ],
  ],
  [
    'descending-four',
    '네 음 내려오기',
    [
      [0, 2, 0, 5],
      [2, 2, 1, 8],
      [4, 2, 1, 5],
      [6, 2, 2, 7],
    ],
  ],
  [
    'repeat-root',
    '근음에 머물기',
    [
      [0, 1, 0, 5],
      [1, 1, 0, 5],
      [2, 2, 0, 8],
      [4, 1, 0, 5],
      [5, 1, 1, 8],
      [6, 2, 0, 5],
    ],
  ],
  [
    'offbeat-answer',
    '엇박 대답',
    [
      [1, 1, 2, 5],
      [2, 2, 2, 7],
      [5, 1, 1, 5],
      [6, 2, 0, 5],
    ],
  ],
  [
    'string-skip',
    '줄을 건너 대답',
    [
      [0, 2, 3, 7],
      [2, 2, 1, 5],
      [4, 2, 2, 5],
      [6, 2, 0, 5],
    ],
  ],
  [
    'first-bend',
    '첫 한 음 벤딩',
    [
      [0, 4, 2, 7, 'bend', 9],
      [4, 2, 2, 5],
      [6, 2, 3, 7],
    ],
    {
      recommendation: '긴 음 하나로 한 음 벤딩의 목표 높이에 집중할 수 있어요.',
    },
  ],
  [
    'bend-release',
    '올렸다 돌아오기',
    [
      [0, 4, 2, 7, 'release', 9],
      [4, 2, 2, 5],
      [6, 2, 3, 7],
    ],
  ],
  [
    'high-bend',
    '높은 줄 벤딩',
    [
      [0, 2, 1, 5],
      [2, 4, 1, 8, 'bend', 10],
      [6, 2, 0, 5],
    ],
  ],
  [
    'high-release',
    '높은 줄 릴리스',
    [
      [0, 4, 1, 8, 'release', 10],
      [4, 2, 1, 5],
      [6, 2, 0, 5],
    ],
  ],
  [
    'late-bend',
    '쉬고 밀어 올리기',
    [
      [2, 4, 2, 7, 'bend', 9],
      [6, 2, 3, 7],
    ],
  ],
  [
    'two-bends',
    '두 번의 벤딩',
    [
      [0, 2, 2, 7, 'bend', 9],
      [2, 2, 2, 5],
      [4, 2, 1, 8, 'bend', 10],
      [6, 2, 0, 5],
    ],
  ],
  [
    'slide-up',
    '첫 상승 슬라이드',
    [
      [0, 2, 2, 5, 'slide', 7],
      [2, 2, 1, 5],
      [4, 2, 2, 7],
      [6, 2, 3, 7],
    ],
    { recommendation: '두 프렛만 이동하는 짧은 슬라이드로 시작해보세요.' },
  ],
  [
    'slide-down',
    '내려오는 슬라이드',
    [
      [0, 2, 2, 7, 'slide', 5],
      [2, 2, 3, 7],
      [4, 2, 3, 5],
      [6, 2, 3, 7],
    ],
  ],
  [
    'high-slide',
    '높은 줄로 이동',
    [
      [0, 2, 1, 8, 'slide', 10],
      [2, 2, 0, 8],
      [4, 2, 0, 5],
      [6, 2, 1, 10],
    ],
  ],
  [
    'low-slide',
    '낮은 줄 슬라이드',
    [
      [0, 2, 4, 5, 'slide', 7],
      [2, 2, 3, 5],
      [4, 2, 3, 7],
      [6, 2, 5, 5],
    ],
  ],
  [
    'slide-return',
    '슬라이드 왕복',
    [
      [0, 2, 2, 5, 'slide', 7],
      [2, 2, 2, 7, 'slide', 5],
      [4, 2, 3, 5],
      [6, 2, 3, 7],
    ],
  ],
  [
    'late-slide',
    '쉼표 뒤 슬라이드',
    [
      [2, 2, 1, 5, 'slide', 8],
      [4, 2, 0, 8],
      [6, 2, 0, 5],
    ],
  ],
  [
    'slide-and-bend',
    '이동하고 밀기',
    [
      [0, 2, 2, 5, 'slide', 7],
      [2, 4, 2, 7, 'bend', 9],
      [6, 2, 3, 7],
    ],
  ],
  [
    'release-and-slide',
    '내리고 미끄러지기',
    [
      [0, 4, 2, 7, 'release', 9],
      [4, 2, 2, 7, 'slide', 5],
      [6, 2, 3, 7],
    ],
  ],
  [
    'high-combination',
    '높은 줄의 마무리',
    [
      [0, 2, 1, 5, 'slide', 8],
      [2, 4, 1, 8, 'release', 10],
      [6, 2, 0, 5],
    ],
  ],
  [
    'britpop-singalong',
    '따라 부르는 짧은 멜로디',
    [
      [0, 2, 1, 5],
      [2, 1, 1, 8],
      [3, 1, 0, 5],
      [4, 2, 1, 8],
      [6, 2, 0, 5],
    ],
    {
      style: '브릿팝',
      tip: '먼저 멜로디를 흥얼거린 뒤 연주하세요. 첫 음과 마지막 음을 길게 둡니다.',
      recommendation: '5음으로 완결되는 멜로디라 외우기 쉽고, 벤딩이 없어요.',
    },
  ],
  [
    'britpop-echo',
    '같은 음으로 여는 후렴',
    [
      [0, 1, 1, 5],
      [1, 1, 1, 5],
      [2, 2, 1, 8],
      [4, 1, 1, 5],
      [5, 1, 2, 7],
      [6, 2, 2, 5],
    ],
    {
      style: '브릿팝',
      tip: '반복하는 두 음의 길이를 같게 맞추고, 뒷부분의 하행을 하나의 문장처럼 연결하세요.',
      recommendation:
        '같은 음의 반복과 짧은 대답으로 록 멜로디를 만드는 연습이에요.',
    },
  ],
  [
    'britpop-upbeat',
    '반 박 늦은 멜로디',
    [
      [1, 1, 2, 7],
      [2, 2, 1, 5],
      [4, 1, 1, 8],
      [5, 1, 0, 5],
      [6, 2, 1, 5],
    ],
    {
      style: '브릿팝',
      tip: '첫 박의 뒤쪽 &에 들어갑니다. 입으로 박자를 세면서 시작점을 맞추세요.',
    },
  ],
  [
    'britpop-lift',
    '슬라이드로 여는 멜로디',
    [
      [0, 2, 1, 5, 'slide', 8],
      [2, 1, 0, 5],
      [3, 1, 1, 8],
      [4, 2, 1, 5],
      [6, 2, 2, 7],
    ],
    {
      style: '브릿팝',
      tip: '5에서 8프렛으로 한 번에 이동한 뒤 높은 줄의 짧은 음 두 개를 또렷하게 연주하세요.',
    },
  ],
  [
    'britpop-arc',
    '올라갔다 내려오는 후렴',
    [
      [0, 1, 2, 5],
      [1, 1, 2, 7],
      [2, 2, 1, 5],
      [4, 1, 1, 8],
      [5, 1, 1, 5],
      [6, 2, 2, 5],
    ],
    {
      style: '브릿팝',
      tip: '높은 음에 도착한 뒤 서두르지 말고 내려오세요. 시작음과 끝음이 같습니다.',
    },
  ],
  [
    'britpop-ending',
    '길게 남기는 마지막 음',
    [
      [0, 1, 1, 8],
      [1, 1, 1, 5],
      [2, 2, 2, 7],
      [4, 4, 3, 7],
    ],
    {
      style: '브릿팝',
      tip: '마지막 A를 두 박 유지하세요. 음이 끝나기 전에 다음 마디로 넘어가지 않도록 셉니다.',
    },
  ],
  [
    'classic-bend-answer',
    '벤딩 뒤 두 음 대답',
    [
      [0, 2, 2, 7, 'bend', 9],
      [2, 1, 1, 5],
      [3, 1, 0, 5],
      [4, 2, 1, 8],
      [6, 2, 0, 5],
    ],
    {
      style: '블루스 록',
      tip: '3번 줄 벤딩 뒤 2번·1번 줄로 넘어갑니다. 벤딩을 풀 때 불필요한 소리가 나지 않게 줄을 멈추세요.',
      recommendation:
        '벤딩과 높은 두 줄의 대답을 연결하는 기본 록 어휘를 연습해요.',
    },
  ],
  [
    'classic-falling-box',
    '펜타토닉 박스 내려오기',
    [
      [0, 1, 0, 8],
      [1, 1, 0, 5],
      [2, 1, 1, 8],
      [3, 1, 1, 5],
      [4, 1, 2, 7],
      [5, 1, 2, 5],
      [6, 2, 3, 7],
    ],
    {
      style: '블루스 록',
      tip: '두 음씩 줄을 바꾸며 내려옵니다. 모든 짧은 음을 같은 길이로 연주하세요.',
    },
  ],
  [
    'classic-low-response',
    '낮은 음으로 답하기',
    [
      [0, 2, 2, 7, 'release', 9],
      [2, 1, 2, 5],
      [3, 1, 3, 7],
      [4, 2, 3, 5],
      [6, 2, 3, 7],
    ],
    {
      style: '블루스 록',
      tip: '벤딩을 원래 높이로 되돌린 뒤 낮은 줄로 대답하세요. 처음에는 느리게 연습합니다.',
    },
  ],
  [
    'classic-rest-bend',
    '쉼표 뒤 긴 벤딩',
    [
      [0, 1, 2, 5],
      [1, 1, 3, 7],
      [4, 4, 2, 7, 'bend', 9],
    ],
    {
      style: '블루스 록',
      tip: '두 번째 박은 쉽니다. 세 번째 박에 벤딩을 시작해 마디 끝까지 유지하세요.',
    },
  ],
  [
    'classic-sliding-answer',
    '미끄러지는 하행 대답',
    [
      [0, 2, 1, 8],
      [2, 2, 1, 5],
      [4, 2, 2, 7, 'slide', 5],
      [6, 2, 3, 7],
    ],
    {
      style: '블루스 록',
      tip: '높은 두 음은 따로 튕기고, 3번 줄의 하행만 한 번 튕겨 연결하세요.',
    },
  ],
  [
    'classic-turnback',
    '끝에서 되돌아오기',
    [
      [0, 1, 3, 7],
      [1, 1, 2, 5],
      [2, 2, 2, 7],
      [4, 1, 1, 5],
      [5, 1, 2, 7],
      [6, 2, 3, 7],
    ],
    {
      style: '블루스 록',
      tip: '낮은 A에서 출발해 높은 E를 찍고 돌아옵니다. 끝음을 분명하게 마무리하세요.',
    },
  ],
  [
    'hardrock-repeat',
    '두 음 반복 훅',
    [
      [0, 1, 0, 5],
      [1, 1, 1, 8],
      [2, 1, 0, 5],
      [3, 1, 1, 8],
      [4, 1, 0, 5],
      [5, 1, 1, 8],
      [6, 2, 0, 5],
    ],
    {
      style: '하드 록',
      tip: '두 줄을 번갈아 연주합니다. 빠르게 하기보다 두 줄의 음량을 고르게 맞추세요.',
    },
  ],
  [
    'hardrock-low-drive',
    '낮은 줄 반복 리프',
    [
      [0, 1, 5, 5],
      [1, 1, 5, 5],
      [2, 2, 5, 8],
      [4, 1, 4, 5],
      [5, 1, 4, 7],
      [6, 2, 5, 5],
    ],
    {
      style: '하드 록',
      tip: '6번 줄 반복음을 선명하게 구분하세요. 낮은 줄에서 다른 줄로 넘어갈 때 앞 음을 멈춥니다.',
    },
  ],
  [
    'hardrock-double-call',
    '두 번 부르는 벤딩',
    [
      [0, 2, 1, 8, 'bend', 10],
      [2, 1, 0, 5],
      [3, 1, 1, 5],
      [4, 2, 1, 8, 'bend', 10],
      [6, 2, 0, 5],
    ],
    {
      style: '하드 록',
      tip: '두 번의 벤딩이 같은 높이에 도착하도록 들어보세요. 1번 줄 5프렛 A가 목표 음입니다.',
    },
  ],
  [
    'arena-slide-bend',
    '슬라이드와 높은 벤딩',
    [
      [0, 2, 2, 5, 'slide', 7],
      [2, 1, 1, 5],
      [3, 1, 1, 8],
      [4, 2, 1, 8, 'bend', 10],
      [6, 2, 0, 5],
    ],
    {
      style: '하드 록',
      tip: '3번 줄 슬라이드와 2번 줄 벤딩을 구분하세요. 벤딩에서는 손가락이 다른 프렛으로 이동하지 않습니다.',
      recommendation:
        '슬라이드와 벤딩을 각각 익힌 뒤 연결하기 좋은 한 마디예요.',
    },
  ],
  [
    'hardrock-descending',
    '고음에서 달려 내려오기',
    [
      [0, 1, 0, 8],
      [1, 1, 1, 8],
      [2, 1, 0, 5],
      [3, 1, 1, 5],
      [4, 1, 2, 7],
      [5, 1, 2, 5],
      [6, 2, 3, 7],
    ],
    {
      style: '하드 록',
      tip: '처음 네 음은 줄을 번갈아 짚습니다. 줄 이동이 익숙해진 뒤 속도를 올리세요.',
    },
  ],
  [
    'hardrock-push',
    '짧게 밀고 길게 끝내기',
    [
      [0, 2, 2, 7, 'bend', 9],
      [2, 1, 2, 5],
      [3, 1, 3, 7],
      [4, 4, 1, 8, 'bend', 10],
    ],
    {
      style: '하드 록',
      tip: '앞의 벤딩은 한 박, 마지막 벤딩은 두 박입니다. 두 음의 유지 시간을 구별하세요.',
    },
  ],
  [
    'melodic-rest',
    '여백이 있는 세 음',
    [
      [0, 2, 0, 5],
      [4, 2, 1, 8],
      [6, 2, 1, 5],
    ],
    {
      style: '멜로딕 록',
      tip: '두 번째 박 전체를 비웁니다. 쉼표도 멜로디의 일부라고 생각하며 호흡을 맞추세요.',
      recommendation:
        '세 음과 한 박의 쉼으로 부담 없이 리듬과 여운에 집중할 수 있어요.',
    },
  ],
  [
    'melodic-long-bend',
    '긴 벤딩으로 노래하기',
    [
      [0, 4, 1, 8, 'bend', 10],
      [4, 1, 0, 5],
      [5, 1, 1, 8],
      [6, 2, 1, 5],
    ],
    {
      style: '멜로딕 록',
      tip: '처음 벤딩을 급하게 꺾지 말고 목표 높이까지 올린 뒤 유지하세요.',
    },
  ],
  [
    'melodic-release',
    '돌아오는 긴 음',
    [
      [0, 2, 1, 5],
      [2, 4, 1, 8, 'release', 10],
      [6, 2, 1, 5],
    ],
    {
      style: '멜로딕 록',
      tip: '가운데 음은 올렸다 원래 높이로 돌아옵니다. 마지막 E와 구별해서 들어보세요.',
    },
  ],
  [
    'melodic-slide-home',
    '높은 곳에서 돌아오기',
    [
      [0, 2, 1, 10, 'slide', 8],
      [2, 2, 1, 5],
      [4, 1, 2, 7],
      [5, 1, 2, 5],
      [6, 2, 3, 7],
    ],
    {
      style: '멜로딕 록',
      tip: '10프렛에서 출발하는 하행 슬라이드입니다. 다음 줄로 옮길 때 앞 음을 정리하세요.',
    },
  ],
  [
    'melodic-question',
    '짧은 질문 긴 대답',
    [
      [0, 1, 2, 5],
      [1, 1, 1, 5],
      [2, 2, 1, 8],
      [4, 4, 0, 5],
    ],
    {
      style: '멜로딕 록',
      tip: '앞 세 음을 질문처럼 묶고, 마지막 A를 두 박 동안 유지하며 답하세요.',
    },
  ],
  [
    'melodic-combination',
    '올리고 내려서 마무리',
    [
      [0, 2, 2, 7, 'release', 9],
      [2, 2, 2, 7, 'slide', 5],
      [4, 2, 3, 7],
      [6, 2, 1, 5],
    ],
    {
      style: '멜로딕 록',
      tip: '첫 음은 같은 프렛에서 벤딩·릴리스, 다음 음은 프렛을 옮기는 슬라이드입니다.',
    },
  ],
]
for (const [id, title, phrase, metadata] of phrases) {
  const notes = phrase.map(
    ([tick, duration, stringIndex, fret, technique, targetFret]) => ({
      tick,
      duration,
      stringIndex,
      fret,
      technique,
      targetFret,
    })
  )
  const group = lickGroup({ notes })
  LICKS.push({
    id,
    title,
    notes,
    description: `${group} · ${notes.length}음 · A 마이너 펜타토닉`,
    tip:
      group === '기본'
        ? '짧은 음과 긴 음의 길이를 구별하고, 마지막 음까지 박자를 세세요.'
        : group === '슬라이드'
          ? '처음 음만 튕기고 줄을 누른 채 목표 프렛으로 이동하세요.'
          : '벤딩은 프렛을 옮기지 않고 줄을 밀어 목표 음높이까지 올립니다. 무리하지 말고 천천히 연습하세요.',
    ...metadata,
  })
}

export function filterLicks(group: string, recommendedOnly: boolean) {
  return LICKS.filter(
    lick =>
      (group === '전체' || lickGroup(lick) === group) &&
      (!recommendedOnly || Boolean(lick.recommendation))
  )
}

export function lickTab(note: LickNote) {
  if (note.technique === 'slide')
    return `${note.fret}${note.targetFret! > note.fret ? '/' : '\\'}${note.targetFret}`
  if (note.technique)
    return `${note.fret}b${note.targetFret}${note.technique === 'release' ? `r${note.fret}` : ''}`
  return String(note.fret)
}

// Normalized time and semitone offsets, shared by audio and position guidance.
export function lickPitchCurve(note: LickNote): [number, number][] {
  const delta = (note.targetFret ?? note.fret) - note.fret
  if (note.technique === 'slide')
    return [
      [0, 0],
      [0.15, 0],
      [0.65, delta],
      [1, delta],
    ]
  if (note.technique === 'bend')
    return [
      [0, 0],
      [0.15, 0],
      [0.55, delta],
      [1, delta],
    ]
  if (note.technique === 'release')
    return [
      [0, 0],
      [0.1, 0],
      [0.4, delta],
      [0.6, delta],
      [0.9, 0],
      [1, 0],
    ]
  return [
    [0, 0],
    [1, 0],
  ]
}
export function lickPosition(note: LickNote, progress: number) {
  if (note.technique !== 'slide') return note
  const curve = lickPitchCurve(note)
  const right = curve.findIndex(([t]) => t >= progress)
  const [t1, p1] = curve[Math.max(0, right - 1)]
  const [t2, p2] = curve[right < 0 ? curve.length - 1 : right]
  const offset =
    t1 === t2
      ? p2
      : p1 + (p2 - p1) * Math.min(1, Math.max(0, (progress - t1) / (t2 - t1)))
  return { stringIndex: note.stringIndex, fret: note.fret + Math.round(offset) }
}

export function getLickFrame(lick: Lick, step: number) {
  const countIn = step < 8
  const tick = step % 8
  const phase = countIn
    ? 'count-in'
    : Math.floor((step - 8) / 8) % 2 === 0
      ? 'listen'
      : 'respond'
  const note = countIn
    ? null
    : (lick.notes.find(n => n.tick <= tick && tick < n.tick + n.duration) ??
      null)
  return {
    phase,
    tick,
    beat: Math.floor(tick / 2) + 1,
    round: countIn ? 0 : Math.floor((step - 8) / 16) + 1,
    note,
    // The response bar has visual guidance but NEVER schedules the lead guitar.
    lead:
      phase === 'listen'
        ? (lick.notes.find(n => n.tick === tick) ?? null)
        : null,
  } as const
}
export type LickFrame = ReturnType<typeof getLickFrame>
export const lickPitch = (note: LickNote) =>
  getPitchFromFret(note.stringIndex, note.fret)
