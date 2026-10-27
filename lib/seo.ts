import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from './site'

export type ToolPage = {
  path: string
  name: string
  title: string
  description: string
  // 첫 화면 직답 문단. FAQ와 함께 JSON-LD에도 같은 문장을 쓴다.
  answer: string
  faq: [question: string, answer: string][]
}

export const TOOL_PAGES: ToolPage[] = [
  {
    path: '/guitar-scale',
    name: '기타 스케일 연습',
    title: '기타 스케일 연습 — 지판 시각화·CAGED·백킹 트랙 | GuitarKit',
    description:
      '근음과 스케일을 고르면 6현 지판에 구성음이 표시됩니다. 메이저·마이너·펜타토닉·모드 등 10종, CAGED 운지, 음 찾기 퀴즈, 백킹 트랙을 무료로 연습하세요.',
    answer:
      'GuitarKit 스케일 연습은 근음과 스케일을 고르면 기타 6현 지판에 구성음을 표시하고, 음을 눌러 소리로 확인하는 무료 웹 도구입니다.',
    faq: [
      [
        '어떤 스케일을 지원하나요?',
        '메이저, 내추럴 마이너, 메이저 펜타토닉, 마이너 펜타토닉, 도리안, 믹솔리디안, 리디안, 프리지안, 하모닉 마이너, 멜로딕 마이너(상행형) 10종을 지원합니다.',
      ],
      [
        'CAGED 운지는 어떤 스케일에서 볼 수 있나요?',
        '메이저, 메이저 펜타토닉, 마이너 펜타토닉 스케일에서 C·A·G·E·D 코드 모양별 운지를 볼 수 있습니다.',
      ],
      [
        '음 이름 대신 계이름이나 도수로 볼 수 있나요?',
        '알파벳(C D E), 고정도 계이름(도 레 미), 근음 기준 도수(1 2 3) 표기를 전환할 수 있습니다.',
      ],
    ],
  },
  {
    path: '/scale-exercises',
    name: '스케일 시퀀스',
    title: '기타 스케일 시퀀스 연습 — 3연음·4음 시퀀스·3도 | GuitarKit',
    description:
      '한 줄에 3음(3NPS) 운지로 3연음 런, 4음 시퀀스, 3도 음정을 TAB과 지판으로 따라 칩니다. 7개 포지션과 템포 자동 증가로 속도를 단계적으로 올려보세요.',
    answer:
      '스케일 시퀀스는 한 줄에 3음(3NPS) 운지로 3연음 런, 4음 시퀀스, 3도 음정을 클릭에 맞춰 반복하며 TAB과 지판으로 따라 치는 무료 연습 도구입니다.',
    faq: [
      [
        '3NPS 운지란 무엇인가요?',
        '한 줄에 스케일 음을 3개씩 배치하는 운지입니다. 6개 줄에 18음을 놓아 2옥타브가 넘는 범위를 한 포지션에서 이어서 칠 수 있습니다.',
      ],
      [
        '템포 자동 증가는 어떻게 동작하나요?',
        '1회, 2회 또는 4회 반복마다 2, 5 또는 10 BPM씩 올리고 정한 목표 BPM에서 멈춥니다.',
      ],
      [
        '펜타토닉 스케일로도 연습할 수 있나요?',
        '펜타토닉은 5음 스케일이라 한 줄 3음 운지가 성립하지 않아 지원하지 않습니다. 메이저, 마이너, 모드 등 7음 스케일 8종을 지원합니다.',
      ],
    ],
  },
  {
    path: '/lick-practice',
    name: '릭 연습',
    title: '기타 릭 연습 — 듣고 따라 치는 펜타토닉 릭 48개 | GuitarKit',
    description:
      '기타 릭 한 마디를 듣고 다음 마디에 따라 칩니다. 마이너 펜타토닉 릭 48개, 벤딩·슬라이드 TAB, 드럼 반주, 40~140 BPM 속도 조절, A·C·D·E·G 키 이조를 지원합니다.',
    answer:
      '릭 연습은 기타 릭 한 마디를 듣고 바로 다음 한 마디에 따라 치는 콜 앤 리스폰스 방식의 무료 연습 도구입니다.',
    faq: [
      [
        '릭은 몇 개가 있나요?',
        '직접 만든 마이너 펜타토닉 릭 48개(기본 21, 벤딩 13, 슬라이드 9, 혼합 5)를 제공합니다. 특정 곡을 채보한 것이 아닙니다.',
      ],
      [
        '다른 키로 연습할 수 있나요?',
        'A·C·D·E·G 키를 고르면 소리, TAB, 지판, 반주가 함께 이조됩니다.',
      ],
      [
        '내 연주를 채점하나요?',
        '마이크 녹음이나 채점은 하지 않습니다. 내 차례에는 기타 멜로디 없이 저음 반주와 드럼·클릭만 나옵니다.',
      ],
    ],
  },
  {
    path: '/chords',
    name: '코드사전',
    title: '기타 코드표 — 코드 운지 다이어그램과 구성음 | GuitarKit',
    description:
      '기타 코드의 구성음과 운지 다이어그램을 보고 소리로 들어보세요. 메이저, 마이너, 7, maj7, m7, sus2, sus4, dim7, aug, add9 10가지 코드 종류를 지원합니다.',
    answer:
      'GuitarKit 코드사전은 근음과 코드 종류를 고르면 기타 코드 구성음과 운지 다이어그램을 보여주고 소리로 들려주는 무료 기타 코드표입니다.',
    faq: [
      [
        '어떤 코드 종류를 볼 수 있나요?',
        '메이저, 마이너, 7, maj7, m7, sus2, sus4, dim7, aug, add9 10가지 코드 종류를 지원합니다.',
      ],
      [
        '코드 소리를 들어볼 수 있나요?',
        '네, 선택한 코드를 기타 샘플 소리로 재생합니다.',
      ],
    ],
  },
  {
    path: '/metronome',
    name: '메트로놈',
    title: '온라인 메트로놈 — BPM·박자·탭 템포 | GuitarKit',
    description:
      '브라우저에서 바로 쓰는 무료 온라인 메트로놈. 40~240 BPM, 2~7박자, 4비트·8비트·셋잇단·16비트 세분화, 탭 템포, 클릭 소리 6종을 지원합니다.',
    answer:
      'GuitarKit 메트로놈은 설치 없이 브라우저에서 40~240 BPM 범위로 박자를 맞춰 주는 무료 온라인 메트로놈입니다.',
    faq: [
      [
        'BPM과 박자는 어디까지 설정할 수 있나요?',
        'BPM은 40~240, 한 마디 박자 수는 2~7박을 고를 수 있고 4비트·8비트·셋잇단·16비트로 박을 나눌 수 있습니다.',
      ],
      [
        '탭 템포는 어떻게 쓰나요?',
        '탭 버튼을 원하는 박자에 맞춰 두 번 이상 누르면 누른 간격의 평균으로 BPM을 정합니다.',
      ],
      [
        '클릭 소리를 바꿀 수 있나요?',
        '삑, 사인, 클릭, 우드블록, 메탈, 디지털 6가지 소리 중에서 고를 수 있습니다.',
      ],
    ],
  },
  {
    path: '/tuner',
    name: '튜너',
    title: '온라인 기타 튜너 — 마이크로 줄별 튜닝 | GuitarKit',
    description:
      '마이크로 기타 소리를 듣고 목표음보다 높은지 낮은지 알려주는 무료 온라인 튜너. 1~6번 줄을 골라 튜닝하고 스탠다드, 드롭 D, 오픈 G 등 튜닝 8종을 지원합니다.',
    answer:
      'GuitarKit 튜너는 마이크로 기타 소리의 음높이를 실시간으로 감지해, 고른 줄의 목표음보다 높은지 낮은지 알려주는 무료 온라인 기타 튜너입니다.',
    faq: [
      [
        '어떤 튜닝을 지원하나요?',
        '스탠다드, 하프 다운, 1음 다운, 드롭 D, 드롭 C, 오픈 G, 오픈 D, DADGAD 8가지를 지원합니다.',
      ],
      [
        '줄 이름(EADGBE)을 몰라도 쓸 수 있나요?',
        '네, 헤드스톡 그림에서 1~6번 줄 번호를 고르면 그 줄의 목표음에 맞춰 튜닝합니다.',
      ],
      [
        '마이크 소리가 서버로 전송되나요?',
        '아니요. 소리는 브라우저 안에서만 분석하며 서버로 보내지 않습니다.',
      ],
    ],
  },
  {
    path: '/jam-track',
    name: '잼 트랙',
    title: '기타 잼 트랙 — 스케일별 백킹 트랙 즉흥 연주 | GuitarKit',
    description:
      '근음과 스케일을 고르면 Rock·Blues·Jazz 스타일의 코드 진행과 드럼으로 백킹 트랙을 재생합니다. 60~200 BPM 백킹 트랙 위에서 기타 즉흥 연주를 연습하세요.',
    answer:
      '잼 트랙은 근음과 스케일에 맞는 코드 진행과 드럼을 재생해 주어, 그 위에서 기타 즉흥 연주를 연습할 수 있는 무료 백킹 트랙 도구입니다.',
    faq: [
      [
        '어떤 스타일의 백킹 트랙이 있나요?',
        'Rock, Blues, Jazz 3가지 스타일을 지원합니다.',
      ],
      [
        '코드 진행은 어떻게 정해지나요?',
        '선택한 근음과 스케일의 다이어토닉 코드로 스타일별 진행을 만듭니다.',
      ],
    ],
  },
]

export function getToolPage(path: string) {
  const page = TOOL_PAGES.find(p => p.path === path)
  if (!page) throw new Error(`SEO 정보가 없는 경로: ${path}`)
  return page
}

export function pageMetadata(
  path: string,
  title: string,
  description: string
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
      siteName: SITE_NAME,
      url: path,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export const toolMetadata = (path: string) => {
  const page = getToolPage(path)
  return pageMetadata(path, page.title, page.description)
}

export const PUBLISHER_ID = `${SITE_URL}/#publisher`
export const WEBSITE_ID = `${SITE_URL}/#website`

export function breadcrumbLd(items: [name: string, path: string][]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [['홈', '/'] as const, ...items].map(
      ([name, path], i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name,
        item: `${SITE_URL}${path === '/' ? '' : path}`,
      })
    ),
  }
}

export const faqLd = (faq: ToolPage['faq']) => ({
  '@type': 'FAQPage',
  mainEntity: faq.map(([name, text]) => ({
    '@type': 'Question',
    name,
    acceptedAnswer: { '@type': 'Answer', text },
  })),
})

export function toolJsonLd(path: string) {
  const page = getToolPage(path)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: `${page.name} | ${SITE_NAME}`,
        url: `${SITE_URL}${path}`,
        description: page.answer,
        applicationCategory: 'MusicApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
        inLanguage: 'ko-KR',
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': PUBLISHER_ID },
      },
      breadcrumbLd([[page.name, path]]),
      faqLd(page.faq),
    ],
  }
}
