import {
  Check,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  Scissors,
  Settings,
  Trophy,
  WalletCards,
  Loader2,
  X,
  MapPin,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { RecommendationCard } from '../../components/RecommendationCard'
import { ReceiptCard } from '../../components/ReceiptCard'
import { PhoneFrame } from '../../components/PhoneFrame'
import { SummaryRow } from '../../components/SummaryRow'
import { getBudgetResult } from '../../lib/api/budget'
import { getRecommendation } from '../../lib/api/recommendation'
import { getRoom, closeRoom } from '../../lib/api/rooms'
import { getRoomReceipts, getSplitGroups } from '../../lib/api/receipts'
import { money } from '../../lib/format'
import { room as mockRoom, budgetResult as mockBudgetResult } from '../../mocks'
import { colors, radii } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { BudgetResult, RecommendedPlace, Room, Receipt, SplitGroup } from '../../types'

const fallbackTags = ['한식', '양식', '일식', '중식', '기타 요식업']

function tagColors(category: string) {
  if (category.includes('카페')) {
    return { bg: colors.tagBgCafe, fg: colors.tagFgCafe }
  }
  if (category.includes('놀거리')) {
    return { bg: colors.tagBgPlay, fg: colors.tagFgPlay }
  }
  return { bg: colors.tagBgFood, fg: colors.danger }
}

function placeAmount(place: RecommendedPlace) {
  return place.expectedPrice == null
    ? '금액 정보 없음'
    : `1인 ${money(place.expectedPrice)}원`
}

function RoomReceiptBar({ roomNo }: { roomNo: number }) {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto h-[92px] w-full max-w-[430px] border-t border-border bg-white/95">
      <div className="flex h-full items-start justify-around">
        <button
          type="button"
          onClick={() => navigate(`/receipts/register?roomNo=${roomNo}`)}
          className="flex w-[116px] flex-col items-center pt-3 text-text"
        >
          <ReceiptText aria-hidden="true" size={26} />
          <span className="mt-1 text-[11px] font-bold">통합 영수증</span>
        </button>
        <button
          type="button"
          onClick={() => navigate(`/receipts/split?roomNo=${roomNo}`)}
          className="flex w-[116px] flex-col items-center pt-3 text-text"
        >
          <Scissors aria-hidden="true" size={26} />
          <span className="mt-1 text-[11px] font-bold">분할 영수증</span>
        </button>
      </div>
    </div>
  )
}

export function ActiveRoomScreen() {
  const navigate = useNavigate()
  const { no } = useParams()
  const roomNo = Number(no) || mockRoom.no
  
  const [room, setRoom] = useState<Room | null>(null)
  const [budget, setBudget] = useState<BudgetResult | null>(null)
  const [receiptList, setReceiptList] = useState<Receipt[]>([])
  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>([])
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [showImage, setShowImage] = useState(false)
  const [currentImgIdx, setCurrentImgIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState('한식')
  const [initialRecommendedPlaces, setInitialRecommendedPlaces] = useState<RecommendedPlace[]>([])
  const [courseRecommendedPlaces, setCourseRecommendedPlaces] = useState<RecommendedPlace[]>([])
  const [initialRecommendationLoading, setInitialRecommendationLoading] = useState(false)
  const [courseRecommendationLoading, setCourseRecommendationLoading] = useState(false)
  const [initialRecommendationError, setInitialRecommendationError] = useState<string | null>(null)
  const [courseRecommendationError, setCourseRecommendationError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [roomData, budgetData, receiptData, splitGroupData] = await Promise.all([
          getRoom(roomNo),
          getBudgetResult(roomNo).catch(() => null), // 예산이 아직 없을 수 있음
          getRoomReceipts(roomNo).catch(() => []),
          getSplitGroups(roomNo).catch(() => []),
        ])
        setRoom(roomData)
        setBudget(budgetData)
        setReceiptList(receiptData)
        setSplitGroups(splitGroupData)
        setSelectedTag(roomData.tags[0] || fallbackTags[0])
      } catch (error) {
        console.error('Failed to fetch room data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [roomNo])

  useEffect(() => {
    if (!room || room.status === 'ENDED') {
      return
    }

    const firstTag = room.tags[0] || fallbackTags[0]
    setInitialRecommendationLoading(true)
    setInitialRecommendationError(null)
    getRecommendation(roomNo, {
      tag: firstTag,
      region: room.location,
    })
      .then((result) => {
        setInitialRecommendedPlaces(result.places.slice(0, 3))
      })
      .catch((error) => {
        console.error('Failed to fetch initial recommendations:', error)
        setInitialRecommendedPlaces([])
        setInitialRecommendationError('추천을 불러오지 못했어요.')
      })
      .finally(() => setInitialRecommendationLoading(false))
  }, [room, roomNo])

  useEffect(() => {
    if (!room || room.status === 'ENDED') {
      return
    }
    if (receiptList.length === 0 && splitGroups.length === 0) {
      setCourseRecommendedPlaces([])
      setCourseRecommendationLoading(false)
      setCourseRecommendationError(null)
      return
    }

    setCourseRecommendationLoading(true)
    setCourseRecommendationError(null)
    getRecommendation(roomNo, {
      tag: selectedTag,
      region: room.location,
      strictBudget: true,
    })
      .then((result) => {
        setCourseRecommendedPlaces(result.places.slice(0, 3))
      })
      .catch((error) => {
        console.error('Failed to fetch course recommendations:', error)
        setCourseRecommendedPlaces([])
        setCourseRecommendationError('추천을 불러오지 못했어요.')
      })
      .finally(() => setCourseRecommendationLoading(false))
  }, [room, roomNo, selectedTag, receiptList.length, splitGroups.length])

  if (loading) {
    return (
      <PhoneFrame>
        <main className="flex min-h-[852px] items-center justify-center bg-bg">
          <Loader2 className="animate-spin" size={48} color={colors.accent} />
        </main>
      </PhoneFrame>
    )
  }

  const displayRoom = room || mockRoom
  const displayBudget = budget || mockBudgetResult
  const total = displayBudget.totalBudget
  const spent = receiptList.reduce((sum, r) => sum + (r.amount || (r as any).totalAmount || 0), 0)
  const remaining = total - spent
  const openRecommendation = (tag = selectedTag) =>
    navigate(`/recommend?roomNo=${roomNo}&tag=${encodeURIComponent(tag)}`)
  const groupedReceiptIds = new Set(
    splitGroups.flatMap(group => group.items.map(item => item.receiptId)),
  )
  const ungroupedReceipts = receiptList.filter(receipt => {
    const receiptId = receipt.receiptId || receipt.id || receipt.no
    return !receiptId || !groupedReceiptIds.has(receiptId)
  })

  const userNo = Number(localStorage.getItem('userNo'))
  const isOwner = userNo === displayRoom.ownerNo

  const allTimelineItems = [
    ...splitGroups.map((g) => ({ ...g, timelineType: 'SPLIT_GROUP' as const })),
    ...ungroupedReceipts.map((r) => ({ ...r, timelineType: 'RECEIPT' as const })),
  ].sort((a, b) => {
    const dateA = new Date(a.createdAt || (a as any).date || 0).getTime()
    const dateB = new Date(b.createdAt || (b as any).date || 0).getTime()
    return dateB - dateA
  })
  const hasReceiptTimeline = allTimelineItems.length > 0
  const budgetSafeCoursePlaces = courseRecommendedPlaces.filter(
    (place) => place.expectedPrice == null || place.expectedPrice <= Math.max(remaining, 0),
  )

  const handleCloseRoom = async () => {
    if (!window.confirm('정말로 방을 종료하시겠습니까?\n종료 후에는 영수증 등록 및 추천 서비스를 이용할 수 없습니다.')) {
      return
    }

    try {
      await closeRoom(roomNo)
      alert('방이 성공적으로 종료되었습니다.')
      // 상태 업데이트를 위해 방 정보를 다시 불러옴
      const updatedRoom = await getRoom(roomNo)
      setRoom(updatedRoom)
    } catch (error: any) {
      if (error.response?.data?.code === 'ROOM_ALREADY_ENDED') {
        alert('이미 종료된 방입니다.')
      } else {
        alert('방 종료 중 오류가 발생했습니다.')
      }
    }
  }

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <header className="sticky top-0 z-20 bg-bg px-pageH pt-4 pb-2">
          <div className="relative grid h-14 items-center">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="absolute left-0 grid h-10 w-10 place-items-center"
            >
              <ChevronLeft aria-hidden="true" size={30} color={colors.text} />
            </button>
            <h1
              className="text-center text-[21px] font-black text-text"
              style={{ letterSpacing: -0.7 }}
            >
              {displayRoom.name}{' '}
              {displayRoom.status === 'ENDED' && (
                <span className="text-sm font-bold text-danger">(종료됨)</span>
              )}
            </h1>
            <button
              type="button"
              onClick={() => navigate(`/room/${roomNo}/settings`)}
              className="absolute right-0 grid h-8 w-8 place-items-center"
            >
              <Settings aria-hidden="true" size={24} color={colors.text} />
            </button>
          </div>
        </header>
        <section className="px-pageH pt-2" style={{ paddingBottom: 124 }}>
          <div className="space-y-3">
            <div className="space-y-2">
              <SummaryRow
                Icon={WalletCards}
                label="오늘의 예산"
                trailing={`${money(remaining)} 원`}
                bg={remaining < 0 ? '#FFE8E8' : '#F4F6FF'}
              />
              <div className="px-4 pt-1">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-border/50">
                  <div 
                    className={`h-full transition-all duration-700 ${remaining < 0 ? 'bg-danger' : 'bg-accent'}`}
                    style={{ width: `${Math.min(Math.max((spent / (total || 1)) * 100, 0), 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-lightSub">지출</span>
                    <span className={`text-[12px] font-black ${remaining < 0 ? 'text-danger' : 'text-text'}`}>
                      {money(spent)}원
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-lightSub">전체 예산</span>
                    <span className="text-[12px] font-bold text-sub">{money(total)}원</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/room/${roomNo}/rating`)}
              className="w-full"
            >
              <SummaryRow
                Icon={Trophy}
                label="거지평가 보기"
                trailing="순위 확인"
                bg="#FFF6D8"
              />
            </button>
          </div>
          <div className="h-4" />
          <div
            className="inline-flex h-10 items-center px-[17px]"
            style={softBox({ radius: radii.card })}
          >
            <span
              className="text-base font-medium text-text"
              style={{ letterSpacing: -0.71 }}
            >
              {displayRoom.status === 'ENDED'
                ? '종료된 방은 추천을 받을 수 없습니다.'
                : '오늘의 예산을 바탕으로 추천해보겠습니다.'}
            </span>
          </div>
          <div className="h-1" />
          {initialRecommendationLoading ? (
            <div className="flex h-[146px] items-center justify-center rounded-card border border-border bg-white">
              <Loader2 className="animate-spin" size={28} color={colors.accent} />
            </div>
          ) : initialRecommendationError ? (
            <button
              type="button"
              onClick={() => openRecommendation(room?.tags[0] || fallbackTags[0])}
              className="flex h-[96px] w-full items-center justify-center rounded-card border border-border bg-white px-4 text-sm font-bold text-sub"
            >
              {initialRecommendationError}
            </button>
          ) : initialRecommendedPlaces.length > 0 ? (
            initialRecommendedPlaces.slice(0, 1).map((place) => {
              const tag = tagColors(place.category)
              return (
                <RecommendationCard
                  key={place.storeId ?? place.name}
                  image={place.thumbnailUrl}
                  tag={place.category}
                  title={place.name}
                  walk={`${place.walkTime ?? '도보 정보 없음'} · ${place.address}`}
                  rating={place.menuName ?? '추천 메뉴'}
                  amount={placeAmount(place)}
                  tagBg={tag.bg}
                  tagColor={tag.fg}
                  onMapTap={() => openRecommendation(room?.tags[0] || fallbackTags[0])}
                />
              )
            })
          ) : (
            <button
              type="button"
              onClick={() => openRecommendation(room?.tags[0] || fallbackTags[0])}
              className="flex h-[96px] w-full items-center justify-center rounded-card border border-border bg-white px-4 text-sm font-bold text-sub"
            >
              조건에 맞는 추천을 다시 찾아볼게요.
            </button>
          )}
          <div className="h-3.5" />
          <div className="space-y-3">
            {allTimelineItems.map((item, idx) => {
              if (item.timelineType === 'SPLIT_GROUP') {
                const group = item as SplitGroup
                if (group.status === 'OPEN') {
                  return (
                    <button
                      key={`open-${group.splitGroupId}`}
                      type="button"
                      onClick={() => navigate(`/receipts/split?roomNo=${roomNo}`)}
                      className="flex w-full items-center justify-between rounded-card border border-accent bg-white p-4 text-left"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Scissors size={18} color={colors.accent} />
                          <p className="truncate text-[15px] font-black text-text">
                            분할 진행 중 · {group.storeName}
                          </p>
                        </div>
                        <p className="mt-1 text-xs font-bold text-sub">
                          {group.receiptCount}장 · {group.contributorCount}명
                        </p>
                      </div>
                      <span className="shrink-0 text-[15px] font-black text-accent">
                        {money(group.totalAmount)}원
                      </span>
                    </button>
                  )
                } else {
                  return (
                    <button
                      key={`closed-${group.splitGroupId}`}
                      type="button"
                      onClick={() => setSelectedReceipt({
                        receiptType: 'SPLIT',
                        title: group.storeName,
                        amount: group.totalAmount,
                        address: group.address,
                        createdAt: group.createdAt,
                        imageUrl: group.items[0]?.imageUrl,
                        date: group.createdAt?.slice(0, 10) || '',
                        room: displayRoom.name,
                        image: group.items[0]?.imageUrl || '',
                        images: group.items.map(item => ({
                          url: item.imageUrl || '',
                          uploaderName: item.uploaderName
                        })).filter(img => img.url),
                        splits: group.items.map(item => ({
                          userName: item.uploaderName,
                          amount: item.amount
                        }))
                      } as Receipt)}
                      className="flex w-full items-center justify-between rounded-card border border-border bg-white p-4 text-left"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-black text-text">[분할] {group.storeName}</p>
                        <p className="mt-1 text-xs font-bold text-sub">
                          마감 · {group.receiptCount}장 · {group.contributorCount}명
                        </p>
                      </div>
                      <span className="shrink-0 text-[15px] font-black text-text">
                        {money(group.totalAmount)}원
                      </span>
                    </button>
                  )
                }
              } else {
                const receipt = item as Receipt
                const prefix = receipt.receiptType === 'COMBINED' ? '[통합] ' : receipt.receiptType === 'SPLIT' ? '[분할] ' : ''
                const title = (receipt.title || receipt.storeName || '이름 없는 지출')
                
                return (
                  <div key={receipt.id || idx} onClick={() => setSelectedReceipt(receipt)} className="cursor-pointer">
                    <ReceiptCard
                      date={receipt.date || receipt.createdAt?.slice(0, 10).replaceAll('-', '.') || ''}
                      room={receipt.room || displayRoom.name}
                      image={receipt.image || receipt.imageUrl || ''}
                      title={`${prefix}${title}`}
                      amount={`${money(receipt.amount || receipt.totalAmount || 0)}원`}
                    />
                  </div>
                )
              }
            })}

            {allTimelineItems.length === 0 && (
              <div 
                className="flex h-[96px] w-full flex-col items-center justify-center rounded-card border border-border bg-white text-sub"
                onClick={() => navigate(`/receipts/register?roomNo=${roomNo}`)}
              >
                <p className="text-sm font-bold">등록된 영수증이 없어요.</p>
                <p className="mt-1 text-[11px] font-semibold">첫 영수증을 등록해보세요!</p>
              </div>
            )}
          </div>
          <div className="h-6" />
          {hasReceiptTimeline && (
            <>
              <section
                className="p-[18px]"
                style={softBox({ radius: radii.card, shadow: true })}
              >
                <h2
                  className="text-[19px] font-black text-text"
                  style={{ letterSpacing: -0.5 }}
                >
                  다음 코스 고르기
                </h2>
                <p
                  className="mt-1 text-[13px] font-semibold leading-[1.45] text-sub"
                  style={{ letterSpacing: -0.23 }}
                >
                  {displayRoom.status === 'ENDED'
                    ? '종료된 방은 새로운 추천을 받을 수 없어요.'
                    : '태그를 바꾸면 남은 예산에 맞춰 추천이 다시 나와요.'}
                </p>
                <div className="h-4" />
                <div className="flex flex-wrap gap-2">
                  {fallbackTags.map((tag) => {
                    const selected = selectedTag === tag
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`flex h-[38px] items-center justify-center rounded-chip border px-4 text-[13px] font-extrabold ${
                          tag === '기타 요식업' ? 'w-[142px]' : 'w-[78px]'
                        }`}
                        style={{
                          backgroundColor: selected ? '#FFE7B8' : '#FFFFFF',
                          borderColor: selected ? '#5E4B24' : colors.border,
                          color: selected ? colors.text : colors.sub,
                        }}
                      >
                        {selected && <Check aria-hidden="true" size={16} />}
                        <span className={selected ? 'ml-[5px]' : undefined}>
                          {tag}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="h-[18px]" />
                <div className="flex items-center">
                  <h3 className="text-base font-black text-text">{selectedTag} 추천</h3>
                  <div className="flex-1" />
                  <span className="text-xs font-bold text-lightSub">
                    남은 예산 기준
                  </span>
                </div>
                <div className="h-2.5" />
                <div className="space-y-2.5">
                  {courseRecommendationLoading ? (
                    <div className="flex h-[118px] items-center justify-center rounded-card border border-border bg-accentBg">
                      <Loader2 className="animate-spin" size={26} color={colors.accent} />
                    </div>
                  ) : courseRecommendationError ? (
                    <button
                      type="button"
                      onClick={() => openRecommendation()}
                      className="flex h-[76px] w-full items-center justify-center rounded-card border border-border bg-accentBg px-4 text-sm font-bold text-sub"
                    >
                      {courseRecommendationError}
                    </button>
                  ) : budgetSafeCoursePlaces.length === 0 ? (
                    <div className="flex min-h-[86px] w-full flex-col items-center justify-center rounded-card border border-border bg-accentBg px-4 py-4 text-center">
                      <p className="text-sm font-black text-text">
                        남은 예산에 맞는 추천이 없어요.
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-[1.45] text-sub">
                        다른 태그를 선택하거나 예산을 다시 확인해보세요.
                      </p>
                    </div>
                  ) : budgetSafeCoursePlaces.slice(0, 2).map((place) => (
                    <button
                      key={place.storeId ?? place.name}
                      type="button"
                      onClick={() => openRecommendation()}
                      className="flex h-[118px] w-full items-center rounded-card border border-border bg-accentBg p-3.5 text-left"
                    >
                      <img
                        src={place.thumbnailUrl}
                        alt=""
                        className="h-[58px] w-[58px] shrink-0 rounded-compact object-cover"
                      />
                      <div className="w-[13px]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-accent">
                          착한가격 업소
                        </p>
                        <p className="mt-1 truncate text-[17px] font-black text-text">
                          {place.name}
                        </p>
                        <p className="mt-[5px] truncate text-xs font-bold text-sub">
                          {place.walkTime ?? '도보 정보 없음'} · {placeAmount(place)}
                        </p>
                        <p className="mt-1 text-xs font-extrabold text-darkSub">
                          남은 예산 {money(Math.max(remaining, 0))}원 기준
                        </p>
                      </div>
                      <ChevronRight aria-hidden="true" color={colors.brown} />
                    </button>
                  ))}
                  {!courseRecommendationLoading && !courseRecommendationError && budgetSafeCoursePlaces.length > 0 && budgetSafeCoursePlaces.length <= 2 && (
                    <button
                      type="button"
                      onClick={() => openRecommendation()}
                      className="flex h-[76px] w-full items-center justify-center rounded-card border border-border bg-accentBg px-4 text-sm font-bold text-sub"
                    >
                      더 많은 추천 보러가기
                    </button>
                  )}
                </div>
              </section>
              <div className="h-5" />
            </>
          )}
          {isOwner && displayRoom.status !== 'ENDED' && (
            <button
              type="button"
              className="h-[52px] w-full rounded-compact border border-border bg-white text-sm font-bold text-sub"
              onClick={handleCloseRoom}
            >
              오늘 방 종료하기
            </button>
          )}
          {displayRoom.status === 'ENDED' && (
            <div className="space-y-3">
              <button
                type="button"
                className="h-[52px] w-full rounded-compact bg-danger text-sm font-black text-white shadow-[0_8px_14px_rgba(217,115,76,0.22)]"
                onClick={() => navigate(`/room/${roomNo}/roulette`)}
              >
                거지룰렛 돌리기
              </button>
              <div className="flex h-[52px] w-full items-center justify-center rounded-compact border border-border bg-gray-100 text-sm font-bold text-gray-400">
                종료된 방입니다
              </div>
            </div>
          )}
          <div className="h-7" />
        </section>
        {displayRoom.status !== 'ENDED' && <RoomReceiptBar roomNo={roomNo} />}

        {/* 영수증 상세 중앙 팝업 */}
        {selectedReceipt && (
          <div 
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-6"
            onClick={() => {
              setSelectedReceipt(null)
              setShowImage(false)
              setCurrentImgIdx(0)
            }}
          >
            <div 
              className="w-full max-w-[360px] rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {showImage && (
                <div className="relative w-full bg-white border-b border-border/50 animate-in slide-in-from-top duration-300">
                  <div 
                    className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar" 
                    style={{ maxHeight: '55vh' }}
                    onScroll={(e) => {
                      const container = e.currentTarget
                      const idx = Math.round(container.scrollLeft / container.clientWidth)
                      if (idx !== currentImgIdx) setCurrentImgIdx(idx)
                    }}
                  >
                    {(selectedReceipt.images && selectedReceipt.images.length > 0 
                      ? selectedReceipt.images 
                      : [{ url: selectedReceipt.image || selectedReceipt.imageUrl || '', uploaderName: '' }]
                    ).map((imgObj, idx, arr) => (
                      <div key={idx} className="relative min-w-full snap-center flex flex-col items-center justify-center bg-white py-4">
                        <img
                          src={imgObj.url}
                          alt={`영수증 ${idx + 1}`}
                          className="w-full h-auto max-h-[45vh] object-contain px-2"
                        />
                        {arr.length > 1 && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                            {idx + 1} / {arr.length}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowImage(false)}
                    className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/10 text-white backdrop-blur-sm"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              
              <div className="p-6">
                {!showImage ? (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[20px] font-black text-text leading-tight truncate">
                          {selectedReceipt.receiptType === 'COMBINED' ? '[통합] ' : selectedReceipt.receiptType === 'SPLIT' ? '[분할] ' : ''}
                          {selectedReceipt.title || selectedReceipt.storeName || '이름 없는 지출'}
                        </h3>
                        <button 
                          onClick={() => setShowImage(true)}
                          className="mt-1 flex items-center gap-1 text-[13px] font-bold text-accent hover:opacity-80 transition-opacity"
                        >
                          <ReceiptText size={14} />
                          영수증 보기
                        </button>
                      </div>
                      <span className="text-[17px] font-black text-accent whitespace-nowrap pt-1">
                        {money(selectedReceipt.amount || selectedReceipt.totalAmount || 0)}원
                      </span>
                    </div>
                    
                    <div className="mt-5 space-y-3.5">
                      <div className="flex items-start">
                        <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accentBg">
                          <MapPin size={12} color={colors.accent} />
                        </div>
                        <p className="ml-2.5 text-[14px] font-semibold leading-relaxed text-sub">
                          {selectedReceipt.address || '주소 정보가 없습니다.'}
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accentBg">
                          <ReceiptText size={12} color={colors.accent} />
                        </div>
                        <p className="ml-2.5 text-[14px] font-semibold leading-relaxed text-sub">
                          등록일: {selectedReceipt.date || selectedReceipt.createdAt?.slice(0, 16).replaceAll('-', '.').replace('T', ' ') || '-'}
                        </p>
                      </div>
                    </div>

                    {/* 결제 참여자 내역 - 분할 영수증일 때만 텍스트 모드에서 표시 */}
                    {selectedReceipt.receiptType === 'SPLIT' && selectedReceipt.splits && selectedReceipt.splits.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-dashed border-border/60">
                        <p className="text-[13px] font-bold text-lightSub mb-3">결제 참여자 내역</p>
                        <div className="space-y-3">
                          {selectedReceipt.splits.map((s, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <span className="text-[15px] font-bold text-text">{s.userName}</span>
                              <span className="text-[15px] font-black text-accent">{money(s.amount || 0)}원</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* 이미지 모드 */
                  <div className="animate-in fade-in duration-500">
                    {selectedReceipt.receiptType === 'SPLIT' ? (
                      <>
                        <p className="text-[13px] font-bold text-lightSub mb-1.5">영수증 업로더</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[18px] font-black text-text">
                            {selectedReceipt.images?.[currentImgIdx]?.uploaderName || '정보 없음'}
                          </span>
                          <span className="rounded-full bg-accent/10 px-3 py-1 text-[12px] font-black text-accent">
                            증빙 완료
                          </span>
                        </div>
                      </>
                    ) : (
                      /* 통합 영수증은 추가 정보 없이 사진만 보여줌 */
                      null
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedReceipt(null)
                    setShowImage(false)
                    setCurrentImgIdx(0)
                  }}
                  className="mt-8 h-14 w-full rounded-2xl bg-accent text-[16px] font-bold text-white shadow-lg shadow-accent/20 active:scale-[0.98] transition-transform"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PhoneFrame>
  )
}
