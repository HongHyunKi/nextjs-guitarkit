import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, GITHUB_REPO } from '@/lib/site'
import { TOOL_PAGES } from '@/lib/seo'

export const dynamic = 'force-static'

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## 기타 스케일 사전
- [기타 스케일 사전](${SITE_URL}/scales): 근음 17개 × 스케일 10종, 170개 스케일의 구성음·공식·계이름·표준 튜닝 0~12프렛 위치
- 주소 형식: ${SITE_URL}/scales/{근음}-{스케일} (예: /scales/c-major, /scales/f-sharp-minor-pentatonic)

## 연습 도구
${TOOL_PAGES.map(p => `- [${p.name}](${SITE_URL}${p.path}): ${p.answer}`).join('\n')}

## 데이터 정책
- 스케일 구성음은 근음과 반음 간격 공식으로 계산하고, 7음 스케일은 각 음이름 글자를 한 번씩 쓰도록 표기합니다(E#, Cb, 겹샵 포함).
- 계산 로직과 테스트는 공개 저장소에 있습니다: ${GITHUB_REPO}
- 인용 시 표기: ${SITE_URL.replace('https://', '')}
`
  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
