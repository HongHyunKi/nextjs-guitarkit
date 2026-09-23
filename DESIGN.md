# GuitarKit — DESIGN.md

> UI 스타일링의 단일 기준 문서. className을 추가·수정하기 전에 반드시 읽을 것.
> 여기 없는 새로운 시각 패턴이 필요하면, 먼저 이 문서에 규칙을 추가한 뒤 코드에 적용한다.

---

## 1. 디자인 원칙

- **클린 모던 대시보드** — 다크/라이트 테마 지원(기본 다크), 플랫 카드, 토큰 기반 색상. 모든 페이지가 하나의 제품으로 보여야 한다.
- **가독성 우선** — 장식보다 판독성. 작은 저대비 텍스트로 멋을 내지 않는다.
- **토큰만 사용** — 색상은 `globals.css`에 정의된 CSS 변수 유틸리티로만. 컴포넌트에 hex/rgba/oklch 리터럴, `zinc-*`/`rose-*` 같은 Tailwind 팔레트 직접 사용 금지.
- **테마 중립** — 컴포넌트는 어느 테마인지 가정하지 않는다. 토큰만 쓰면 자동으로 두 테마에서 동작한다. `dark:` variant는 원칙적으로 불필요(예외: shadcn ui/ 내부). 테마 전환은 `next-themes` + `components/theme-toggle.tsx`.

## 2. 색상 시스템

### 토큰 (globals.css 정의)

라이트 팔레트는 `:root`, 다크 팔레트는 `.dark`에 정의. accent 계열은 라이트에서 더 어둡게(oklch 0.5~0.62) 조정되어 흰 배경 위 대비를 확보한다 — 컴포넌트는 동일한 토큰명만 쓰면 된다.

| 토큰 | 용도 |
| --- | --- |
| `background` / `foreground` | 페이지 배경 / 기본 텍스트 |
| `card` / `border` | 카드 서피스 / 모든 테두리 |
| `muted` / `muted-foreground` | 컨트롤 트랙 / 보조 텍스트 |
| `accent-orange` `accent-teal` `accent-blue` `accent-green` | 아래 의미 표 참조 |
| `destructive` | 에러 전용 |

### 색상 의미 (semantic 규칙 — 임의 사용 금지)

| 토큰 | 의미 | 사용처 |
| --- | --- | --- |
| `accent-orange` | **루트 노트 / 재생 중 강조** | 프렛보드 루트 도트, 루트 선택 pill, 루트 구성음 칩, 다운비트 펄스, 재생 중 버튼 |
| `accent-teal` | **스케일 / 선택 / 기본 인터랙션** | 스케일 도트·칩, 스케일/CAGED 선택 pill, 슬라이더, Play 버튼, 스크롤바 |
| `accent-blue` · `accent-green` | **브랜드 전용** | 그라디언트 아이콘 칩(`from-accent-blue via-accent-teal to-accent-green`), 랜딩 기능별 틴트 |

틴트 배지/칩 레시피: `bg-accent-X/15 text-accent-X border-accent-X/30`

## 3. 타이포그래피

| 레벨 | 클래스 |
| --- | --- |
| 페이지 타이틀 | `text-2xl md:text-3xl font-bold` (랜딩 히어로는 `text-3xl md:text-4xl`) |
| 카드 제목 | `text-lg font-semibold` |
| 섹션 헤더 | `text-xs font-semibold uppercase tracking-wider text-muted-foreground` |
| 본문 | `text-sm` (최소) |
| 라벨·캡션·배지 | `text-xs` (최소) |

- **사이즈 플로어**: `text-[9px]` `text-[10px]` `text-[11px]` 금지.
  - 유일한 예외: 프렛보드 노트 도트 내부 `text-[11px]` — 고정 크기 데이터 글리프, 반드시 `font-bold` + 솔리드 accent 배경 위에서만.
- **font-mono**: 숫자·음이름 전용 (BPM 입력, 프렛 번호). 제목·본문·한국어 텍스트에 금지.
- `tracking-[0.2em]` 이상의 자간 벌린 uppercase 장식 금지 (`tracking-wider`까지만).

## 4. 대비 규칙

- 의미 있는 텍스트의 최저 대비 = `text-muted-foreground` (불투명 — 다크 oklch 0.65 / 라이트 oklch 0.45).
- `/50` `/60` 등 투명도 수식어는 **장식·비활성 요소 전용** — 읽어야 하는 텍스트에 금지.
- 비활성(준비중/disabled) 상태는 개별 텍스트를 어둡게 하지 말고 컨테이너에 `opacity-60`.

## 5. 서피스 & 뎁스

- 카드: `bg-card border border-border rounded-xl p-6`
- 컨트롤(버튼·인풋): `rounded-md` 또는 `rounded-lg`. `border` (1px)만 — `border-2` 금지.
- 글로우: `shadow-md`/`shadow-lg` + `shadow-accent-X/{30-50}` 조합만.
  - 금지: 인라인 `boxShadow`, `shadow-[...]` arbitrary 값, `textShadow`, 스캔라인/그레인 오버레이.
- 호버 리프트: `transition-all hover:-translate-y-0.5 hover:border-accent-teal/50`

## 6. 스페이싱 & 레이아웃

- 페이지 컨테이너: `max-w-7xl mx-auto p-4 md:p-8`, 섹션 리듬 `space-y-8`
- 카드 내부: `space-y-4`~`space-y-6`, 그리드 간격 `gap-2` / `gap-4` / `gap-6`

## 7. 모션

- 항상 `MotionConfig reducedMotion="user"`로 감싼다.
- 등장: opacity + y ≤ 24px, duration ≤ 0.6s, 스태거 딜레이 0.1~0.15s.
- 세그먼티드 컨트롤: `bg-muted rounded-lg` 트랙 + framer-motion `layoutId` 썸 — `components/notation-toggle.tsx`가 표준 구현.
- 노트 도트: `initial={{scale:0}} animate={{scale:1}}` + `whileHover={{scale:1.15}}`.

## 8. 컴포넌트 레시피

- **릭 추천**: 설정 상단의 44px 이상 `추천만` 토글을 기본 활성화한다. 기존 teal 선택 토큰과 본문 서체를 쓰고, 선택 항목에 `추천` 텍스트·스타일 태그·선정 이유를 제공한다. 주법 필터와 교집합으로 동작하며 전체 보기로 쉽게 돌아갈 수 있게 한다. 별도 카드나 새 색상은 추가하지 않는다.

- **릭 주법**: 기존 선택 버튼으로 기본/벤딩/슬라이드/혼합을 필터링한다. 주법 TAB은 셀 너비를 확보해 표 내부에서만 스크롤한다. 벤딩은 지판 위치를 유지하고 ↑ 안내, 슬라이드는 같은 줄에서 위치 이동과 → 안내를 함께 제공한다.

- **릭 연습**: 왼쪽 정렬 제목·컨트롤 아래에 준비/듣기/내 차례와 4박 진행 표시, 1마디 TAB, 지판 순으로 배치한다. 듣기 현재 위치는 orange, 내 차례는 teal이며 텍스트로도 구별한다. TAB은 8분음표 8칸을 같은 너비로 표시하고 모바일에서는 표 안에서만 가로 스크롤한다. 숫자는 mono, 안내는 기존 본문 서체를 유지한다.

- **프렛 범위**: 지판 바로 위에 시작/끝 프렛 Select를 2열로 배치한다. 이전/다음 스크롤 버튼 대신 정확한 범위를 선택하며, 넘치는 지판은 직접 좌우 스크롤한다. 퀴즈에서는 출제 범위를 고정하고 스크롤 안내만 표시한다.

- **연습 세션**: 범위 설정은 기존 Select, 답 선택은 44px 이상의 Button을 사용한다. 진행률·결과는 왼쪽 정렬 텍스트와 구분선으로 표시한다. 역방향 문제의 지정 위치는 foreground 링과 `●`, 음정 기준점은 orange와 `R`로 표시한다. 반주 코드톤은 루트 orange / 나머지 teal, 음 이름과 역할을 함께 제공한다.

- **음 찾기 퀴즈**: 기존 지판을 재사용한다. 문제·해설은 왼쪽 정렬하고, 답을 확인하기 전에는 모든 위치를 중립색 `?`로 표시한다. 선택 위치는 foreground 링, 확인된 정답은 teal. 오답은 색상만으로 전달하지 않고 누른 음과 재시도 안내를 문장으로 제공한다.

- **셀렉트**: shadcn/Radix `Select`를 사용한다. 트리거·항목 최소 높이 44px, `bg-card border-border rounded-lg`, 선택/포커스는 teal. 메뉴는 Portal로 표시하고 화면 높이 안에서 스크롤한다.

- 지판: 음 버튼 터치 영역은 최소 44×44px, 프렛 열은 최소 52px. 전체 음은 중립색, 스케일은 teal, 루트는 orange, 찾는 음은 foreground 링으로 구분한다. 줄 라벨은 가로 스크롤 안에서 왼쪽에 고정하고 번호·마커도 동일한 열 너비를 사용한다.

- **선택 pill**: shadcn `Button`, 선택 시 `bg-accent-orange`(루트) 또는 `bg-accent-teal`(스케일/CAGED) + `text-background` — 2절의 의미 표를 따른다.
- **노트 칩**: `px-2 py-1 text-sm font-medium rounded border` + 틴트 레시피 (루트=orange, 나머지=teal).
- **상태 배지**: `text-xs rounded-full px-2.5 py-0.5` — 활성은 teal 틴트, 준비중은 `bg-muted text-muted-foreground`.

## 9. Do / Don't 체크리스트

커밋 전 grep으로 확인 (`components/ui/`, `globals.css` 제외하고 0건이어야 함):

```bash
grep -rn "zinc-\|rose-\|rgba(\|#[0-9a-fA-F]\{3,6\}\|text-\[9px\]\|text-\[10px\]\|border-2\|shadow-\[\|textShadow\|tracking-\[0\.2" app components --include="*.tsx"
```

| Do | Don't |
| --- | --- |
| 토큰 유틸리티 (`bg-accent-teal`) | hex/rgba/oklch 리터럴, `zinc-*` `rose-*` |
| `text-xs` 이상 | `text-[9~11px]` (프렛보드 도트 예외 제외) |
| `border` + `rounded-xl/lg/md` | `border-2`, 각진 카드 |
| `shadow-lg shadow-accent-X/50` | `shadow-[...]`, 인라인 boxShadow/textShadow |
| `text-muted-foreground` 플로어 | 읽는 텍스트에 `/50` 투명도 |
| 새 토큰은 globals.css에 먼저 | 컴포넌트에 즉석 색상 |
