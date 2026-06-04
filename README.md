# webfront — 거지 우정 수호대 (React 웹뷰)

기존 Flutter 프론트(`../frontend`)를 **React + TypeScript + Vite + Tailwind**로 재작성한 웹뷰용 프론트엔드.
네이티브 앱이 아니라 웹뷰로 폰 사이즈에 띄운다 (폰 고정 + PC 중앙정렬).

> 전환 기획 + 단계별 작업 프롬프트: [`../docs/REACT_MIGRATION_PLAN.md`](../docs/REACT_MIGRATION_PLAN.md)
> 원본 Flutter 화면/위젯: `../frontend/lib`

## 기술 스택
- Vite + React 19 + TypeScript
- react-router-dom v7
- Tailwind CSS v3 (디자인 토큰은 STEP 1에서 `tailwind.config.ts`에 이식)
- 폰트: Pretendard (index.html CDN)
- import alias: `@/` → `src/`

## 실행
```bash
npm install
cp .env.example .env   # 최초 1회, 값 채우기
npm run dev            # http://localhost:5173
```

## 환경변수
`.env` 는 git에 올라가지 않는다. `.env.example` 을 복사해 채운다.
- `VITE_API_BASE_URL` — Spring 백엔드 URL (기본 `http://127.0.0.1:8080`)
- `VITE_KAKAO_JS_KEY` — 카카오 JS 키 (백엔드 `/auth/kakao` 활성화 후)

## 진행 상태
- [x] STEP 0 — 스캐폴딩 (이 커밋)
- [ ] STEP 1 — 디자인 토큰 + PhoneFrame + 라우팅 셸 + 하단탭
- [ ] STEP 2 — 공용 컴포넌트 16개
- [ ] STEP 3 — 타입 + API 클라이언트 + mock
- [ ] STEP 4~8 — 화면 이식
- [ ] STEP 9 — 백엔드 실연동
