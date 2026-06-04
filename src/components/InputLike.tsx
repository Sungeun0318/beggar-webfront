import type { LucideIcon } from 'lucide-react'

import { colors, radii } from '../theme/tokens'
import { softBox } from './ui/softBox'

type InputLikeProps = {
  label: string
  Icon: LucideIcon
  selected?: boolean
}

export function InputLike({ label, Icon, selected = false }: InputLikeProps) {
  const color = selected ? colors.text : colors.placeholder

  return (
    <div
      className="flex h-14 items-center px-5"
      style={softBox({ radius: radii.compact })}
    >
      <span
        className="text-base font-semibold"
        style={{ color, letterSpacing: -0.31 }}
      >
        {label}
      </span>
      <div className="flex-1" />
      <Icon aria-hidden="true" size={24} color={color} />
    </div>
  )
}
