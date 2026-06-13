# beggar-webfront

거지 우정 수호대 React 웹뷰 프론트엔드다.

## 현재 상태

- React + TypeScript + Vite + Tailwind 기반.
- 백엔드 실연동 모드가 기본이며 `src/lib/api/mockMode.ts`에서 도메인별 mock 여부를 제어한다.
- 카카오 로그인, 카카오톡 초대 공유, STOMP/SockJS WebSocket, 토큰 자동 갱신이 들어가 있다.
- 배포 브랜치: `feat/connect-deployed-backend`.
- 배포 URL은 CloudFront 기준으로 사용 중이다.

## 실행

```bash
npm install
cp .env.example .env
npm run dev
```

기본 개발 주소:

```text
http://localhost:5173
```

## 환경 변수

```text
VITE_API_BASE_URL=백엔드 API origin
VITE_KAKAO_JS_KEY=카카오 JavaScript 키
```

Vite 환경 변수는 빌드 시점에 번들에 들어간다. 배포 환경에서 값을 바꾸면 반드시 재빌드/재배포해야 한다.

## 주요 구조

```text
src/
├── App.tsx                    라우팅
├── components/                공용 UI 컴포넌트
├── features/
│   ├── auth/                  로그인, 회원가입, 마이페이지
│   ├── home/                  홈, 랭킹
│   ├── room/                  방 생성, 초대, 입장, 내부, 설정, 평가
│   ├── budget/                예산 입력, 예산 결과
│   ├── recommendation/        착한가격업소 추천
│   ├── receipts/              영수증 등록/목록/분할
│   ├── community/             게시글, 댓글, 채팅
│   └── splash/                스플래시
├── lib/
│   ├── api/                   REST API client
│   ├── kakao.ts               Kakao SDK 로그인/공유
│   ├── websocket.ts           STOMP/SockJS client
│   └── format.ts              포맷 유틸
├── theme/tokens.ts            디자인 토큰
└── types/index.ts             공용 타입
```

## 라우트

| Path | 화면 |
|---|---|
| `/`, `/login` | 스플래시/카카오 로그인 |
| `/signup` | 회원가입 |
| `/home` | 홈 |
| `/room/create` | 방 생성 |
| `/room/invite/:roomNo` | 초대 |
| `/join/:code`, `/room/join/:code` | 초대 코드 입장 |
| `/budget/input/:roomNo` | 예산 입력 |
| `/budget/result/:roomNo` | 예산 결과 |
| `/recommend` | 추천 |
| `/room/:no` | 방 내부 |
| `/room/:no/settings` | 방 설정 |
| `/room/:no/rating` | 방 평가 |
| `/receipts/register` | 영수증 등록 |
| `/receipts/split` | 분할 영수증 |
| `/receipts` | 영수증 목록 |
| `/community` | 커뮤니티 |
| `/community/chat` | 전체 채팅 |
| `/community/write` | 글쓰기 |
| `/community/post/:id` | 게시글 상세 |
| `/ranking` | 랭킹 |
| `/mypage` | 마이페이지 |

## API 처리

`src/lib/api/client.ts`가 공통 fetch client다.

- `VITE_API_BASE_URL`이 있으면 해당 origin으로 요청한다.
- `localStorage.accessToken`을 `Authorization: Bearer`로 자동 첨부한다.
- 401 응답은 `/auth/refresh`로 1회 갱신 후 원 요청을 재시도한다.
- 실패 시 `ApiError(status, message, data)`를 던진다.

## WebSocket

`src/lib/websocket.ts`가 STOMP client다.

- endpoint: `${VITE_API_BASE_URL}/ws-stomp`
- SockJS 사용.
- reconnect delay: 5초.
- heartbeat: 4초.
- 연결 실패/종료 로그를 콘솔에 남긴다.

사용 화면:

- 초대 화면: `/topic/rooms/{roomNo}`로 멤버 입장/예산 입력 시작 이벤트 수신.
- 예산 입력 화면: `/topic/rooms/{roomNo}`로 제출/확정 이벤트 수신.
- 커뮤니티 채팅: `/sub/chats` 구독.

## 예산 입력 화면 주의점

예산 금액은 익명이어야 한다.

- 멤버 목록에는 `budgetSubmitted`만 표시한다.
- WebSocket 이벤트도 `userNo`, `submittedCount`, `memberCount`만 사용한다.
- 제출 후 WebSocket이 늦거나 끊겨도 2초 폴링으로 상태를 재조회한다.
- 방 상태가 `BUDGET_DONE`, `ACTIVE`, `ENDED`면 입력 화면에서 결과 화면 이동을 시도한다.

## 카카오

`src/lib/kakao.ts`에서 SDK를 동적으로 로드한다.

- 로그인: `Kakao.Auth.authorize`.
- 공유: `Kakao.Share.sendDefault` Feed 타입.
- 초대 링크는 화면에 표시된 URL을 그대로 사용한다.

Kakao Developers 설정:

- JavaScript 키 사용.
- 제품 링크 관리에 배포 origin 등록.
- 예: `https://dgh1r60fiahrz.cloudfront.net`.

## 빌드

```bash
npm run build
```

## 참고 문서

- 전체 기능 명세: `../docs/APP_FEATURES.md`
- 백엔드: `../backend/README.md`
