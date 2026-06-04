import { type ReactNode } from 'react'

type PhoneFrameProps = {
  children: ReactNode
  /** 더 이상 스케일링하지 않으므로 무시됨(기존 호출부 호환용). */
  height?: number
}

// 웹 일반 페이지처럼 동작: 폰 폭(max 430)으로 가운데 정렬하고,
// 스크롤은 브라우저(문서) 전체 하나만 쓴다. 내부 별도 스크롤·고정 프레임 없음.
export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-canvas">
      <div className="relative mx-auto min-h-[100dvh] w-full max-w-[430px] bg-bg">
        {children}
      </div>
    </div>
  )
}
