import { X } from 'lucide-react'
import { radii } from '../theme/tokens'
import { money } from '../lib/format'
import { softBox } from './ui/softBox'

type RoomHomeCardProps = {
  title: string
  location: string
  budget: number
  spent: number
  memberCount: number
  status: string
  onTap: () => void
  onDelete?: () => void
}

export function RoomHomeCard({
  title,
  location,
  budget,
  spent,
  memberCount,
  status,
  onTap,
  onDelete,
}: RoomHomeCardProps) {
  const ratio = budget > 0 ? Math.min(Math.max(spent / budget, 0), 1) : 0
  const isEnded = status === 'ENDED'

  return (
    <button
      type="button"
      onClick={onTap}
      className="relative flex h-[158px] w-full flex-col p-[18px] text-left"
      style={softBox({ radius: radii.card, shadow: true })}
    >
      <div className="flex items-center">
        <h3
          className="min-w-0 truncate text-lg font-extrabold"
          style={{ letterSpacing: -0.4 }}
        >
          {title}
        </h3>
        <div className="flex-1" />
        {isEnded && onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sub hover:bg-muted/80"
          >
            <X size={14} />
          </button>
        )}
        <span className="rounded-chip bg-accentBg px-2.5 py-[5px] text-[11px] font-extrabold text-accent">
          {status}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-semibold text-sub">
        {location} · {memberCount}명
      </p>
      <div className="flex-1" />
      <div className="flex items-center">
        <span className="text-[15px] font-extrabold text-text">
          {money(spent)}원 사용
        </span>
        <div className="flex-1" />
        <span className="text-xs font-bold text-lightSub">
          총 {money(budget)}원
        </span>
      </div>
      <div className="h-2.5" />
      <div className="h-2 overflow-hidden rounded-chip bg-muted">
        <div className="h-full bg-accent" style={{ width: `${ratio * 100}%` }} />
      </div>
    </button>
  )
}
