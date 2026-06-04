import { BrowserRouter, Routes, Route } from 'react-router-dom'

// STEP 1에서 18개 라우트 + PhoneFrame + BottomNav 셸로 교체한다.
// 매핑표: docs/REACT_MIGRATION_PLAN.md 참고.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <div className="mx-auto flex min-h-screen max-w-[430px] flex-col items-center justify-center bg-white px-6 text-center">
              <p className="text-lg font-bold text-[#2C241B]">
                거지 우정 수호대 webfront
              </p>
              <p className="mt-2 text-sm text-[#6b6375]">
                STEP 0 스캐폴딩 완료 · STEP 1부터 화면 이식
              </p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
