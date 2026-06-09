import { PlusCircle, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderBrand } from '../../components/AppHeader'
import { BottomNav } from '../../components/BottomNav'
import { PhoneFrame } from '../../components/PhoneFrame'
import { RoomHomeCard } from '../../components/RoomHomeCard'
import { findMyRooms } from '../../lib/api/rooms'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { Room } from '../../types'

export function HomeScreen() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await findMyRooms()
        setRooms(data)
      } catch (error) {
        console.error('Failed to load rooms:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadRooms()
  }, [])

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

          {isLoading ? (
            <div className="flex justify-center py-10 text-sub font-semibold">
              방 목록을 불러오는 중...
            </div>
          ) : rooms.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {rooms.map((room) => (
                <RoomHomeCard
                  key={room.no}
                  title={room.name}
                  location={room.location}
                  budget={room.budget || 0}
                  spent={room.spent || 0}
                  memberCount={room.memberCount}
                  status={room.status || '진행 중'}
                  onTap={() => navigate(`/room/${room.no}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[158px] flex-col items-center justify-center rounded-card border-2 border-dashed border-muted text-sub">
              <p className="font-bold">참여 중인 방이 없어요.</p>
              <p className="mt-1 text-sm">새로운 방을 만들어보세요!</p>
            </div>
          )}

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
