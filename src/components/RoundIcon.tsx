import type { LucideIcon } from 'lucide-react'

type RoundIconProps = {
  Icon: LucideIcon
}

export function RoundIcon({ Icon }: RoundIconProps) {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-full bg-muted">
      <Icon aria-hidden="true" size={22} className="text-sub" />
    </div>
  )
}
