import type { LucideIcon } from 'lucide-react'

import { colors, radii } from '../theme/tokens'
import { softBox } from './ui/softBox'

type ActionBoxProps = {
  Icon: LucideIcon
  title: string
  body: string
  onTap: () => void
}

export function ActionBox({ Icon, title, body, onTap }: ActionBoxProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex h-[104px] w-full flex-col items-start p-4 text-left"
      style={softBox({ radius: radii.card })}
    >
      <Icon aria-hidden="true" size={24} color={colors.accent} />
      <div className="flex-1" />
      <span className="text-[15px] font-extrabold">{title}</span>
      <span className="mt-[3px] text-xs font-semibold text-sub">{body}</span>
    </button>
  )
}
