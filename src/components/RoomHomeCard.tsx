import { X } from 'lucide-react'
import { colors, radii } from '../theme/tokens'
import { money } from '../lib/format'
import { softBox } from './ui/softBox'

type RoomHomeCardProps = {
  title: string
  location: string
  budget: number
  spent: number
  memberCount: number
  status: string
  isOwner?: boolean
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
  isOwner = false,
  onTap,
  onDelete,
}: RoomHomeCardProps) {
  const ratio = budget > 0 ? Math.min(Math.max(spent / budget, 0), 1) : 0
  const isDraft = status === 'DRAFT'
  const isInviting = status === 'INVITING'
  const isEnded = status === 'ENDED'
  const isActive = status === 'ACTIVE'
  
  // 방장(Owner): ACTIVE(진행 중)가 아니면 항상 삭제 가능
  // 일반 멤버(Member): ENDED(종료됨)일 때만 삭제 버튼 노출
  const canDelete = onDelete && (isOwner ? !isActive : isEnded)

  const getStatusLabel = () => {
    switch (status) {
      case 'DRAFT': return '설정 미완료'
      case 'INVITING': return '초대 중'
      case 'BUDGET_INPUT': return '예산 입력 중'
      case 'ACTIVE': return '진행 중'
      case 'ENDED': return '종료됨'
      default: return status || '알 수 없음'
    }
  }

  const getStatusColor = () => {
    if (isDraft || status === 'BUDGET_INPUT') return { bg: '#FFF0F0', text: '#FF4D4D' } // 붉은 계열 (주의/미완료)
    if (isInviting) return { bg: '#E6F7FF', text: '#1890FF' } // 파란 계열
    if (isEnded) return { bg: '#F5F5F5', text: '#8C8C8C' } // 회색 계열
    return { bg: colors.accentBg, text: colors.accent } // 기본 (ACTIVE 등)
  }

  const statusStyle = getStatusColor()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onTap()
        }
      }}
      className="relative flex h-[158px] w-full cursor-pointer flex-col p-[18px] text-left outline-none transition-opacity active:opacity-90"
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
        {canDelete && (
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
        <span 
          className="rounded-chip px-2.5 py-[5px] text-[11px] font-extrabold"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
        >
          {getStatusLabel()}
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
    </div>
  )
}
