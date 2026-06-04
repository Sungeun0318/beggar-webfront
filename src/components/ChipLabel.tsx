import type { LucideIcon } from 'lucide-react'

type ChipLabelProps = {
  Icon: LucideIcon
  label: string
}

export function ChipLabel({ Icon, label }: ChipLabelProps) {
  return (
    <span className="inline-flex items-center rounded-chip border border-muted bg-bg px-2.5 py-[5px]">
      <Icon aria-hidden="true" size={12} className="text-accent" />
      <span className="ml-[5px] text-[11px] font-semibold text-sub">
        {label}
      </span>
    </span>
  )
}
