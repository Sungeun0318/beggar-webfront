import type { LucideIcon } from 'lucide-react'

import { colors, radii } from '../theme/tokens'
import { softBox } from './ui/softBox'

type ChoiceBoxProps = {
  Icon: LucideIcon
  label: string
}

export function ChoiceBox({ Icon, label }: ChoiceBoxProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={softBox({ radius: radii.compact })}
    >
      <Icon aria-hidden="true" size={22} color={colors.brown} />
      <div className="w-2.5" />
      <span className="text-[15px] font-semibold text-sub">{label}</span>
    </div>
  )
}
