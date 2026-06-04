import {
  Award,
  ChevronRight,
  FolderOpen,
  Mail,
  ReceiptText,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderBrand } from '../../components/AppHeader'
import { BottomNav } from '../../components/BottomNav'
import { PhoneFrame } from '../../components/PhoneFrame'
import { currentUser } from '../../mocks'
import { colors, radii, spacing } from '../../theme/tokens'

type MenuItemProps = {
  Icon: LucideIcon
  title: string
  subtitle?: string
  onTap?: () => void
}

function MenuItem({ Icon, title, subtitle, onTap }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex h-[76px] w-full items-center rounded-card border bg-white px-4 py-3 text-left"
      style={{ borderColor: colors.canvas, borderWidth: 0.65 }}
    >
      <div className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-compact bg-canvas">
        <Icon aria-hidden="true" size={24} color={colors.sub} />
      </div>
      <div className="w-4" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-text">{title}</p>
        {subtitle && (
          <p className="mt-0.5 truncate text-sm text-sub">{subtitle}</p>
        )}
      </div>
      {onTap && <ChevronRight aria-hidden="true" size={20} color={colors.lightSub} />}
    </button>
  )
}

export function MyPageScreen() {
  const navigate = useNavigate()

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderBrand title="마이페이지" showNotification={false} />
        <section className="px-pageH pt-2" style={{ paddingBottom: spacing.bottomSafe }}>
          <div
            className="flex h-[98px] items-center rounded-card border bg-accentBg p-3"
            style={{ borderColor: colors.canvas, borderWidth: 0.65 }}
          >
            <div
              className="grid h-[78px] w-[78px] shrink-0 place-items-center rounded-full border bg-white"
              style={{ borderColor: colors.canvas, borderWidth: 0.65 }}
            >
              <User aria-hidden="true" size={40} color={colors.accent} />
            </div>
            <div className="w-4" />
            <div className="min-w-0 flex-1">
              <p className="truncate">
                <span className="text-[22px] font-black text-text">
                  거지가 아닙니다
                </span>
                <span className="text-base font-medium text-sub"> 님</span>
              </p>
              <p
                className="mt-[5px] truncate text-sm font-medium text-sub"
                style={{ letterSpacing: -0.31 }}
              >
                {currentUser.email}
              </p>
            </div>
          </div>
          <div className="h-6" />
          <MenuItem
            Icon={Award}
            title="칭호 변경"
            subtitle="내 칭호를 선택해요"
          />
          <div className="h-3" />
          <MenuItem Icon={FolderOpen} title="프로필 사진 변경" />
          <div className="h-3" />
          <MenuItem
            Icon={Mail}
            title="이메일 확인"
            subtitle={currentUser.email}
          />
          <div className="h-3" />
          <MenuItem
            Icon={ReceiptText}
            title="지출 내역"
            subtitle="내가 등록한 지출을 확인해요"
            onTap={() => navigate('/receipts')}
          />
          <div className="h-6" />
          <section
            className="rounded-card bg-white p-4"
            style={{
              borderRadius: radii.card,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-sub">계정 생성일</span>
              <span className="text-xs font-medium text-lightSub">
                2026.05.05
              </span>
            </div>
            <div className="h-4" />
            <div className="h-px bg-muted" />
            <div className="h-2" />
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="h-9 w-full text-left text-base font-medium text-sub"
            >
              로그아웃
            </button>
            <div className="h-4" />
            <p className="text-left text-[13px] font-semibold text-sub/25">
              탈퇴하기
            </p>
          </section>
        </section>
        <BottomNav />
      </main>
    </PhoneFrame>
  )
}
