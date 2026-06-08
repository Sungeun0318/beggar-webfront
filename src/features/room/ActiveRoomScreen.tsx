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
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { RecommendationCard } from '../../components/RecommendationCard'
import { ReceiptCard } from '../../components/ReceiptCard'
import { PhoneFrame } from '../../components/PhoneFrame'
import { SummaryRow } from '../../components/SummaryRow'
import { getBudgetResult } from '../../lib/api/budget'
import { getRecommendation } from '../../lib/api/recommendation'
import { getRoom } from '../../lib/api/rooms'
import { money } from '../../lib/format'
import { receipts, room as mockRoom, budgetResult as mockBudgetResult } from '../../mocks'
import { colors, radii } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { BudgetResult, RecommendedPlace, Room } from '../../types'

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
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState('한식')
  const [recommendedPlaces, setRecommendedPlaces] = useState<RecommendedPlace[]>([])
  const [recommendationLoading, setRecommendationLoading] = useState(false)
  const [recommendationError, setRecommendationError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [roomData, budgetData] = await Promise.all([
          getRoom(roomNo),
          getBudgetResult(roomNo).catch(() => null), // 예산이 아직 없을 수 있음
        ])
        setRoom(roomData)
        setBudget(budgetData)
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
    if (!room) {
      return
    }

    setRecommendationLoading(true)
    setRecommendationError(null)
    getRecommendation(roomNo, {
      tag: selectedTag,
      region: room.location,
    })
      .then((result) => {
        setRecommendedPlaces(result.places.slice(0, 3))
      })
      .catch((error) => {
        console.error('Failed to fetch recommendations:', error)
        setRecommendedPlaces([])
        setRecommendationError('추천을 불러오지 못했어요.')
      })
      .finally(() => setRecommendationLoading(false))
  }, [room, roomNo, selectedTag])

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
  const spent = receipts[0].amount + receipts[1].amount
  const remaining = total - spent
  const roomTags = displayRoom.tags.length > 0 ? displayRoom.tags : fallbackTags
  const openRecommendation = () => navigate(`/recommend?roomNo=${roomNo}`)

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
              {displayRoom.name}
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
        <section className="px-5 pt-2" style={{ paddingBottom: 124 }}>
          <SummaryRow
            Icon={WalletCards}
            label="오늘의 예산"
            trailing={`${money(total)} 원`}
            bg="#F4F6FF"
          />
          <div className="h-2.5" />
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
          <div className="h-2.5" />
          <div
            className="inline-flex h-10 items-center px-[17px]"
            style={softBox({ radius: radii.card })}
          >
            <span
              className="text-base font-medium text-text"
              style={{ letterSpacing: -0.71 }}
            >
              오늘의 예산을 바탕으로 추천해보겠습니다.
            </span>
          </div>
          <div className="h-1" />
          {recommendationLoading ? (
            <div className="flex h-[146px] items-center justify-center rounded-card border border-border bg-white">
              <Loader2 className="animate-spin" size={28} color={colors.accent} />
            </div>
          ) : recommendationError ? (
            <button
              type="button"
              onClick={openRecommendation}
              className="flex h-[96px] w-full items-center justify-center rounded-card border border-border bg-white px-4 text-sm font-bold text-sub"
            >
              {recommendationError}
            </button>
          ) : recommendedPlaces.length > 0 ? (
            recommendedPlaces.slice(0, 1).map((place) => {
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
                  onMapTap={openRecommendation}
                />
              )
            })
          ) : (
            <button
              type="button"
              onClick={openRecommendation}
              className="flex h-[96px] w-full items-center justify-center rounded-card border border-border bg-white px-4 text-sm font-bold text-sub"
            >
              조건에 맞는 추천을 다시 찾아볼게요.
            </button>
          )}
          <div className="h-3.5" />
          <ReceiptCard
            date={receipts[0].date}
            room={receipts[0].room}
            image="/assets/images/figma/receipt_food.png"
            title={receipts[0].title}
            amount={`${money(receipts[0].amount)}원`}
          />
          <div className="h-6" />
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
              태그를 바꾸면 남은 예산에 맞춰 추천이 다시 나와요.
            </p>
            <div className="h-4" />
            <div className="flex flex-wrap gap-2">
              {roomTags.map((tag) => {
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
              {recommendationLoading ? (
                <div className="flex h-[118px] items-center justify-center rounded-card border border-border bg-accentBg">
                  <Loader2 className="animate-spin" size={26} color={colors.accent} />
                </div>
              ) : recommendedPlaces.slice(1, 3).map((place) => (
                <button
                  key={place.storeId ?? place.name}
                  type="button"
                  onClick={openRecommendation}
                  className="flex h-[118px] w-full items-center rounded-card border border-border bg-accentBg p-3.5 text-left"
                >
                  <div className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full bg-white">
                    <ReceiptText aria-hidden="true" size={28} color={colors.accent} />
                  </div>
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
              {!recommendationLoading && recommendedPlaces.length <= 1 && (
                <button
                  type="button"
                  onClick={openRecommendation}
                  className="flex h-[76px] w-full items-center justify-center rounded-card border border-border bg-accentBg px-4 text-sm font-bold text-sub"
                >
                  더 많은 추천 보러가기
                </button>
              )}
            </div>
          </section>
          <div className="h-5" />
          <button
            type="button"
            className="h-[52px] w-full rounded-compact border border-border bg-white text-sm font-bold text-sub"
            onClick={() => undefined}
          >
            오늘 방 종료하기
          </button>
          <div className="h-7" />
        </section>
        <RoomReceiptBar roomNo={roomNo} />
      </main>
    </PhoneFrame>
  )
}
