import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { PhoneFrame } from '../../components/PhoneFrame'
import { colors } from '../../theme/tokens'

export function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      // TODO(STEP 9): 저장된 토큰 기반 자동 로그인 분기 추가.
      navigate('/login')
    }, 1100)

    return () => window.clearTimeout(timer)
  }, [navigate])

  return (
    <PhoneFrame height={930}>
      <main className="relative flex min-h-[930px] flex-col bg-bg">
        <section className="flex flex-1 flex-col items-center justify-center">
          <img
            src="/assets/images/figma/logo.png"
            alt=""
            className="h-[118px] w-[118px] object-contain"
          />
          <h1
            className="mt-6 text-[28px] font-black text-text"
            style={{ letterSpacing: -0.7 }}
          >
            거지 우정 수호대
          </h1>
          <p className="mt-2.5 text-sm font-bold text-sub">
            Save My Friendship
          </p>
          <div
            className="mt-[42px] h-7 w-7 animate-spin rounded-full border-[3px] border-muted border-t-accent"
            aria-label="로딩 중"
          />
        </section>
        <p
          className="absolute bottom-[42px] left-0 right-0 text-center text-[13px] font-bold"
          style={{ color: colors.lightSub }}
        >
          익명 예산 조율을 준비하고 있어요
        </p>
      </main>
    </PhoneFrame>
  )
}
