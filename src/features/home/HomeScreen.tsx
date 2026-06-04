import { PlusCircle, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderBrand } from '../../components/AppHeader'
import { BottomNav } from '../../components/BottomNav'
import { PhoneFrame } from '../../components/PhoneFrame'
import { RoomHomeCard } from '../../components/RoomHomeCard'
import { budgetResult, receipts, room } from '../../mocks'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

export function HomeScreen() {
  const navigate = useNavigate()
  const spent = receipts[0].amount + receipts[1].amount

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderBrand title="거지방" showNotification />
        <section className="px-pageH pt-2" style={{ paddingBottom: spacing.bottomSafe }}>
          <p className="text-sm font-semibold text-sub">
            친구들과 만든 거지방에서 예산과 지출을 확인해요.
          </p>
          <div className="h-[18px]" />
          <div
            className="flex h-[54px] items-center px-5"
            style={softBox({ radius: radii.compact })}
          >
            <Search aria-hidden="true" size={22} color={colors.placeholder} />
            <span className="ml-2.5 text-[15px] font-bold text-placeholder">
              방 이름, 위치로 검색
            </span>
          </div>
          <div className="h-[18px]" />
          <RoomHomeCard
            title={room.name}
            location={room.location}
            budget={budgetResult.totalBudget}
            spent={spent}
            memberCount={room.memberCount}
            status="진행 중"
            onTap={() => navigate(`/room/${room.no}`)}
          />
          <div className="h-3.5" />
          <RoomHomeCard
            title="전시 보러 가요"
            location="삼청동 블루보틀 근처"
            budget={100000}
            spent={14000}
            memberCount={5}
            status="예산 확정"
            onTap={() => navigate(`/room/${room.no}`)}
          />
          <div className="h-3.5" />
          <button
            type="button"
            onClick={() => navigate('/room/create')}
            className="flex h-[92px] w-full items-center justify-center text-accent"
            style={softBox({ color: colors.accentBg, radius: radii.card })}
          >
            <PlusCircle aria-hidden="true" size={24} />
            <span className="ml-2 text-base font-extrabold">
              새 친구방 만들기
            </span>
          </button>
        </section>
        <BottomNav />
      </main>
    </PhoneFrame>
  )
}
