# GuitarKit

기타 연습 도구 모음. 스케일, 코드사전, 메트로놈, 튜너를 한 웹앱에서 사용합니다.

![프리뷰](public/preview.png)

## 기능

### 스케일 연습 (`/guitar-scale`)

6현 프렛보드에 스케일을 시각화합니다. 5~24프렛까지 조절 가능하고, 메이저·자연 마이너·펜타토닉·도리안·믹소리디안·리디안·프리지안·화성 마이너·가락 마이너(상행형) 10종을 지원합니다. 메이저·메이저 펜타토닉·마이너 펜타토닉은 CAGED 코드 모양별 운지를 볼 수 있고, 나머지는 전체 포지션으로 표시합니다. 음을 눌러 소리를 들을 수 있습니다.

전체 음·스케일만·전체 음 위 스케일 강조를 전환할 수 있고, ‘음 찾기’로 특정 음의 모든 위치를 강조합니다. 도레미는 고정도법, 숫자는 선택한 루트 기준 인터벌입니다. 모바일에서는 줄 번호를 고정한 가로 지판을 스크롤하거나 이전·다음 구간 버튼으로 이동합니다. 음 버튼의 터치 영역은 최소 44×44px입니다.

지판 설정과 백킹 트랙·메트로놈 BPM은 현재 브라우저에 저장됩니다. 다시 열면 설정은 복원되지만 소리는 자동 재생되지 않습니다.

### 코드사전 (`/chords`)

코드 구성음과 운지법을 다이어그램으로 보여주고 소리로 들려줍니다.

### 메트로놈 (`/metronome`)

BPM, 박자, 세분화를 조절할 수 있고 탭 템포와 사운드 6종을 지원합니다.

### 튜너 (`/tuner`)

마이크로 실시간 피치를 잡아 목표음 대비 편차를 보여줍니다. 헤드스톡 GUI에서 줄 번호(1~6번)만 고르면 되기 때문에 EADGBE 표기를 몰라도 튜닝할 수 있습니다. 튜닝 프리셋 8종을 지원합니다.

### 표기법

알파벳(C, D, E...), 계이름(도, 레, 미...), 인터벌(1, 2, 3...) 세 가지 표기법을 전환할 수 있고, 루트 노트는 12음 전체를 선택할 수 있습니다.

## 기술 스택

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion, Tone.js

## 시작하기

```bash
pnpm install
pnpm dev
```

`http://localhost:3000`에서 확인합니다.

```bash
pnpm build   # 프로덕션 빌드
pnpm start   # 프로덕션 서버 실행
pnpm test    # 테스트 실행
```

## 문서

- [CLAUDE.md](CLAUDE.md) — 음악 이론 로직, 스케일 카탈로그, 테스트 요구사항
- [DESIGN.md](DESIGN.md) — 디자인 시스템
- [PLAN.md](PLAN.md) — 로드맵
- [docs/caged-system-spec.md](docs/caged-system-spec.md) — CAGED 시스템 아키텍처

## 크레딧

기타 사운드 샘플은 [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments)(guitar-electric, guitar-acoustic)를 사용했습니다. 라이선스는 [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/), © N. Brosowsky 및 원 샘플 제작자. `public/samples/`에 mp3 일부 포함.
