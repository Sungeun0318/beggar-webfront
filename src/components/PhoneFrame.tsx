import { type ReactNode, useEffect, useRef, useState } from 'react'

import { colors } from '../theme/tokens'

type PhoneFrameProps = {
  children: ReactNode
  height?: number
}

const DESIGN_WIDTH = 393
const DEFAULT_HEIGHT = 852
const MAX_SCALE = 1.06

function clampScale(width: number) {
  if (width <= 0) {
    return 1
  }

  return Math.min(width / DESIGN_WIDTH, MAX_SCALE)
}

export function PhoneFrame({ children, height = DEFAULT_HEIGHT }: PhoneFrameProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const shell = shellRef.current

    if (!shell) {
      return
    }

    const updateScale = () => {
      setScale(clampScale(shell.getBoundingClientRect().width))
    }

    updateScale()

    const observer = new ResizeObserver(updateScale)
    observer.observe(shell)

    return () => observer.disconnect()
  }, [])

  const scaledWidth = DESIGN_WIDTH * scale
  const scaledHeight = height * scale

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-canvas">
      <div
        ref={shellRef}
        className="mx-auto flex min-h-screen w-full max-w-[430px] justify-center bg-canvas"
      >
        <div
          className="relative overflow-hidden bg-bg"
          style={{
            width: scaledWidth,
            minHeight: scaledHeight,
          }}
        >
          <div
            className="origin-top"
            style={{
              width: DESIGN_WIDTH,
              minHeight: height,
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              backgroundColor: colors.bg,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
