import type { CSSProperties } from 'react'

import { colors, radii } from '../../theme/tokens'

type SoftBoxOptions = {
  color?: string
  radius?: number
  shadow?: boolean
}

export function softBox({
  color = '#FFFFFF',
  radius = radii.compact,
  shadow = false,
}: SoftBoxOptions = {}): CSSProperties {
  return {
    backgroundColor: color,
    borderRadius: radius,
    border: `0.7px solid ${color === '#FFFFFF' ? colors.border : '#F0E6D5'}`,
    boxShadow: [
      shadow ? '0 8px 30px rgba(0, 0, 0, 0.078)' : undefined,
      '0 2px 4px rgba(0, 0, 0, 0.02)',
    ]
      .filter(Boolean)
      .join(', '),
  }
}
