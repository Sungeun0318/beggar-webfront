import { PlusCircle, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderBrand } from '../../components/AppHeader'
import { BottomNav } from '../../components/BottomNav'
import { PhoneFrame } from '../../components/PhoneFrame'
import { RoomHomeCard } from '../../components/RoomHomeCard'
import { deleteRoom, searchRooms } from '../../lib/api/rooms'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { Room } from '../../types'

export function HomeScreen() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // 검색 로직 (Debounce 적용 및 초기 로드 통합)
  useEffect(() => {
    const performSearch = async () => {
      setIsSearching(true)
      try {
        const data = await searchRooms(searchTerm)
        setRooms(data)
      } catch (error) {
        console.error('방 목록 로드 실패:', error)
      } finally {
        setIsSearching(false)
        setIsLoading(false)
      }
    }

    // 초기 로드거나 검색어가 비어있으면 즉시 실행, 아니면 데바운스 적용
    if (searchTerm === '' && isLoading) {
      performSearch()
      return
    }

    const delayDebounceFn = setTimeout(performSearch, searchTerm === '' ? 0 : 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, isLoading])

  const handleDeleteRoom = async (roomNo: number) => {
    if (!window.confirm('목록에서 삭제하시겠습니까?\n(내 예산 기록은 유지됩니다)')) {
      return
    }

    try {
      await deleteRoom(roomNo)
      setRooms((prev) => prev.filter((r) => r.no !== roomNo))
    } catch (error) {
      console.error('Failed to delete room:', error)
      alert('방 삭제에 실패했습니다. 다시 시도해 주세요.')
    }
  }

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderBrand title="거지방" showNotification />
        <section className="px-pageH pt-2" style={{ paddingBottom: spacing.bottomSafe }}>
          <p className="text-sm font-semibold text-sub">
            친구들과 만든 거지방에서 예산과 지출을 확인해요.
          </p>
          <div className="h-[18px]" />
          
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex h-[54px] items-center px-5"
            style={softBox({ radius: radii.compact })}
          >
            <Search aria-hidden="true" size={22} color={colors.placeholder} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="방 이름으로 검색"
              className="ml-2.5 flex-1 bg-transparent text-[15px] font-bold text-text outline-none placeholder:text-placeholder"
            />
          </form>
          
          <div className="h-[18px]" />

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

          <div className="h-3.5" />

          {isLoading || isSearching ? (
            <div className="flex justify-center py-10 text-sub font-semibold">
              {isSearching ? '검색 중...' : '방 목록을 불러오는 중...'}
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
                  onDelete={() => handleDeleteRoom(room.no)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[158px] flex-col items-center justify-center rounded-card border-2 border-dashed border-muted text-sub">
              <p className="font-bold">
                {searchTerm ? '검색 결과가 없습니다.' : '참여 중인 방이 없어요.'}
              </p>
              {!searchTerm && <p className="mt-1 text-sm">새로운 방을 만들어보세요!</p>}
            </div>
          )}
        </section>
        <BottomNav />
      </main>
    </PhoneFrame>
  )
}
