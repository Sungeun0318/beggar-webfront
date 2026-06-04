import type { LucideIcon } from 'lucide-react'

import { colors, radii } from '../theme/tokens'
import { softBox } from './ui/softBox'

type SummaryRowProps = {
  Icon: LucideIcon
  label: string
  trailing?: string
  bg: string
}

export function SummaryRow({ Icon, label, trailing, bg }: SummaryRowProps) {
  return (
    <div
      className="flex h-[65px] items-center px-4"
      style={softBox({ radius: radii.card })}
    >
      <div
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
        style={{ backgroundColor: bg }}
      >
        <Icon
          aria-hidden="true"
          size={17}
          color={trailing == null ? '#5B6DFF' : colors.accent}
        />
      </div>
      <div className="w-2.5" />
      <span className="text-[15px] font-semibold" style={{ letterSpacing: -0.23 }}>
        {label}
      </span>
      <div className="flex-1" />
      {trailing && (
        <span className="rounded-chip bg-muted px-3 py-[7px] text-[13px] font-semibold text-sub">
          {trailing}
        </span>
      )}
    </div>
  )
}
