import { Home, MessageSquare, Trophy, User, type LucideIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const tabs: Array<{
  label: string
  path: string
  Icon: LucideIcon
}> = [
  { label: '홈', path: '/home', Icon: Home },
  { label: '커뮤니티', path: '/community', Icon: MessageSquare },
  { label: '랭킹', path: '/ranking', Icon: Trophy },
  { label: '마이', path: '/mypage', Icon: User },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto h-[92px] w-full max-w-[430px] border-t border-border bg-white/95">
      <div className="flex h-full items-start justify-around">
        {tabs.map(({ label, path, Icon }) => {
          const isActive = location.pathname === path
          const colorClass = isActive ? 'text-text' : 'text-lightSub'

          return (
            <button
              key={path}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              onClick={() => navigate(path)}
              className={`flex w-[58px] flex-col items-center pt-3 ${colorClass}`}
            >
              <Icon aria-hidden="true" size={26} strokeWidth={2} />
              <span className="mt-1 text-[10px] font-semibold leading-none">
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
