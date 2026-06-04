import { type ReactNode, useEffect, useRef, useState } from 'react'

import { colors } from '../theme/tokens'

type PhoneFrameProps = {
  children: ReactNode
  height?: number
}

const DESIGN_WIDTH = 393
const DEFAULT_HEIGHT = 852
const MAX_SCALE = 1.06

export function PhoneFrame({ children, height = DEFAULT_HEIGHT }: PhoneFrameProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const shell = shellRef.current

    if (!shell) {
      return
    }

    const updateScale = () => {
      const { width, height: shellHeight } = shell.getBoundingClientRect()

      if (width <= 0 || shellHeight <= 0) {
        return
      }

      // Flutter FigmaFrame 과 동일: 가로·세로 둘 다에 맞춰 clamp (maxScale 1.06).
      // 세로까지 맞추므로 콘텐츠가 뷰포트를 넘지 않아 페이지 전체 스크롤바가 생기지 않는다.
      const next = Math.min(width / DESIGN_WIDTH, shellHeight / height, MAX_SCALE)
      setScale(next > 0 ? next : 1)
    }

    updateScale()

    const observer = new ResizeObserver(updateScale)
    observer.observe(shell)

    return () => observer.disconnect()
  }, [height])

  return (
    // 뷰포트에 고정해 폰 프레임을 정중앙 배치. 바깥은 스크롤하지 않는다(내부 영역만 스크롤).
    <div
      ref={shellRef}
      className="fixed inset-0 flex items-center justify-center overflow-hidden bg-canvas"
    >
      <div
        className="relative overflow-hidden bg-bg"
        style={{ width: DESIGN_WIDTH * scale, height: height * scale }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: DESIGN_WIDTH,
            height,
            transform: `scale(${scale})`,
            backgroundColor: colors.bg,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
