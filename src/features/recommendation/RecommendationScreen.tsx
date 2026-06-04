import { MapPin, Navigation, Search, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { RecommendationCard } from '../../components/RecommendationCard'
import { SummaryRow } from '../../components/SummaryRow'
import { getRecommendation } from '../../lib/api/recommendation'
import { money } from '../../lib/format'
import { room } from '../../mocks'
import type { RecommendationResult, RecommendedPlace } from '../../types'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

const mockLocations = [
  { name: '명학역', address: '경기 안양시 만안구 안양동' },
  { name: '안양역', address: '경기 안양시 만안구 안양로' },
]

function tagColors(category: string) {
  if (category.includes('카페')) {
    return { bg: colors.tagBgCafe, fg: colors.tagFgCafe }
  }
  if (category.includes('놀이')) {
    return { bg: colors.tagBgPlay, fg: colors.tagFgPlay }
  }
  return { bg: colors.tagBgFood, fg: colors.danger }
}

function placeAmount(place: RecommendedPlace) {
  return place.expectedPrice == null
    ? '가격 정보 없음'
    : `${money(place.expectedPrice)}원`
}

export function RecommendationScreen() {
  const navigate = useNavigate()
  const [selectedTag, setSelectedTag] = useState(room.tags[0] ?? '한식')
  const [selectedRegion, setSelectedRegion] = useState(room.location)
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<RecommendedPlace | null>(
    null,
  )

  useEffect(() => {
    void getRecommendation(room.no, {
      tag: selectedTag,
      region: selectedRegion,
    }).then(setResult)
  }, [selectedRegion, selectedTag])

  const refreshWithTag = (tag: string) => {
    setSelectedTag(tag)
  }

  const recommendationBudget = result?.recommendationBudget
  const budgetLabel =
    recommendationBudget == null
      ? '남은 예산 기준 추천'
      : `1인 추천 예산 ${money(recommendationBudget)}원`

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled
          title="예산에 맞는 추천"
          onBack={() => navigate(-1)}
        />
        <section
          className="absolute inset-x-0 bottom-0 overflow-y-auto px-pageH"
          style={{ top: spacing.contentTop }}
        >
          <button type="button" className="w-full text-left">
            <SummaryRow
              Icon={MapPin}
              label={selectedRegion || '지역 전체'}
              trailing="변경"
              bg={colors.accentBg}
            />
          </button>
          <div className="h-2.5" />
          <SummaryRow Icon={WalletCards} label={budgetLabel} bg="#F4F6FF" />
          <div className="h-4" />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRegion('현재 위치')}
              className="flex h-10 items-center justify-center rounded-compact bg-accentBg text-sm font-extrabold text-accent"
            >
              <Navigation aria-hidden="true" size={16} />
              <span className="ml-1.5">현재 위치</span>
            </button>
            {mockLocations.map((location) => (
              <button
                key={location.name}
                type="button"
                onClick={() => setSelectedRegion(location.name)}
                className="flex h-10 items-center justify-center rounded-compact border border-border bg-white text-sm font-bold text-sub"
              >
                <Search aria-hidden="true" size={15} />
                <span className="ml-1.5">{location.name}</span>
              </button>
            ))}
          </div>
          {room.tags.length > 1 && (
            <>
              <div className="h-4" />
              <div className="flex flex-wrap gap-2">
                {room.tags.map((tag) => {
                  const selected = selectedTag === tag
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => refreshWithTag(tag)}
                      className="h-[38px] rounded-chip border px-4 text-[13px] font-extrabold"
                      style={{
                        backgroundColor: selected ? '#FFE7B8' : '#FFFFFF',
                        borderColor: selected ? '#5E4B24' : colors.border,
                        color: selected ? colors.text : colors.sub,
                      }}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </>
          )}
          {result?.budgetGuide && (
            <div
              className="mt-3.5 rounded-card px-4 py-3 text-[13px] font-bold text-sub"
              style={softBox({ color: colors.accentBg, radius: radii.card })}
            >
              {result.fallbackApplied ? '대체 추천이에요. ' : ''}
              {result.budgetGuide}
            </div>
          )}
          <div className="h-[22px]" />
          {(result?.places ?? []).map((place) => {
            const tag = tagColors(place.category)
            return (
              <div key={place.storeId ?? place.name} className="mb-3.5">
                <RecommendationCard
                  image={place.thumbnailUrl}
                  tag={place.category}
                  title={place.name}
                  walk={`${place.walkTime ?? '도보 정보 없음'} · ${place.address}`}
                  rating={`${place.menuName ?? '대표 메뉴'} · ★ ${
                    place.rating?.toFixed(1) ?? '-'
                  }`}
                  amount={placeAmount(place)}
                  tagBg={tag.bg}
                  tagColor={tag.fg}
                  onMapTap={() => setSelectedPlace(place)}
                />
              </div>
            )
          })}
          <div className="h-2.5" />
          <div
            className="flex items-center p-[18px]"
            style={softBox({ radius: radii.card, shadow: true })}
          >
            <img
              src="/assets/images/figma/mascot_small.png"
              alt=""
              className="h-[58px] w-[58px] object-contain"
            />
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-[15px] font-extrabold text-text">
                남는 예산까지 고려한 조합 추천
              </p>
              <p className="mt-1 text-xs font-semibold leading-[1.45] text-sub">
                착한가격업소와 남은 예산을 함께 보고 추천했어.
              </p>
            </div>
          </div>
          <div className="h-6" />
          <PrimaryButton
            label="거지방 시작하기"
            onTap={() => navigate(`/room/${room.no}`)}
          />
          <div style={{ height: spacing.bottomSafe }} />
        </section>
        {selectedPlace && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 px-8">
            <div
              className="w-full p-5"
              style={softBox({ radius: radii.card })}
            >
              <h2 className="text-center text-lg font-extrabold text-text">
                카카오맵으로 이동할까요?
              </h2>
              <p className="mt-2.5 text-center text-sm font-semibold leading-[1.45] text-sub">
                선택한 가게를 카카오맵에서 확인할 수 있어요.
              </p>
              <div className="mt-[18px] flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPlace(null)}
                  className="h-[46px] flex-1 rounded-compact border border-muted bg-bg text-sm font-extrabold text-sub"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.open(selectedPlace.mapUrl, '_blank')
                    setSelectedPlace(null)
                  }}
                  className="h-[46px] flex-1 rounded-compact bg-accent text-sm font-extrabold text-white"
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
