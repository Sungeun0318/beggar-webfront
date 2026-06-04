import { LocateFixed, MapPin, Search, WalletCards, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { RecommendationCard } from '../../components/RecommendationCard'
import { SummaryRow } from '../../components/SummaryRow'
import { softBox } from '../../components/ui/softBox'
import { getRecommendation } from '../../lib/api/recommendation'
import { searchLocations } from '../../lib/api/locations'
import { money } from '../../lib/format'
import { room } from '../../mocks'
import { colors, radii, spacing } from '../../theme/tokens'
import type {
  LocationSearchResult,
  RecommendationResult,
  RecommendedPlace,
} from '../../types'

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
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    void getRecommendation(room.no, {
      tag: selectedTag,
      region: selectedRegion,
    }).then(setResult)
  }, [selectedRegion, selectedTag])

  const recommendationBudget = result?.recommendationBudget
  const budgetLabel =
    recommendationBudget == null
      ? '남은 예산 기준 추천'
      : `1인 추천 예산 ${money(recommendationBudget)}원`

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled title="예산에 맞는 추천" onBack={() => navigate(-1)} />
        <section
          className="absolute inset-x-0 bottom-0 overflow-y-auto px-pageH"
          style={{ top: spacing.contentTop }}
        >
          <button
            type="button"
            className="w-full text-left"
            onClick={() => setSheetOpen(true)}
          >
            <SummaryRow
              Icon={MapPin}
              label={selectedRegion || '지역 전체'}
              trailing="변경"
              bg={colors.accentBg}
            />
          </button>
          <div className="h-2.5" />
          <SummaryRow Icon={WalletCards} label={budgetLabel} bg="#F4F6FF" />
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
                      onClick={() => setSelectedTag(tag)}
                      className="flex h-[38px] items-center rounded-chip border px-3.5 text-[13px] font-bold"
                      style={{
                        backgroundColor: selected ? colors.accentBg : '#FFFFFF',
                        borderColor: selected ? colors.accent : colors.border,
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
              className="mt-3.5 rounded-compact px-3.5 py-3 text-[13px] font-semibold leading-[1.45] text-darkSub"
              style={softBox({ color: colors.bg, radius: radii.compact })}
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
            style={softBox({ color: colors.accentBg, radius: radii.card, shadow: true })}
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
            <div className="w-full p-5" style={softBox({ radius: radii.card })}>
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

        {sheetOpen && (
          <LocationSheet
            selectedRegion={selectedRegion}
            onClose={() => setSheetOpen(false)}
            onCurrentLocation={() => {
              setSheetOpen(false)
              setSelectedRegion('현재 위치')
            }}
            onSelect={(loc) => {
              setSheetOpen(false)
              setSelectedRegion(loc.name || loc.address)
            }}
            onManualRegion={(region) => {
              setSheetOpen(false)
              setSelectedRegion(region.trim())
            }}
          />
        )}
      </main>
    </PhoneFrame>
  )
}

type LocationSheetProps = {
  selectedRegion: string
  onClose: () => void
  onCurrentLocation: () => void
  onSelect: (location: LocationSearchResult) => void
  onManualRegion: (region: string) => void
}

function LocationSheet({
  selectedRegion,
  onClose,
  onCurrentLocation,
  onSelect,
  onManualRegion,
}: LocationSheetProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationSearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async () => {
    const q = query.trim()
    if (!q || isSearching) {
      return
    }
    setIsSearching(true)
    setError(null)
    try {
      const list = await searchLocations(q)
      setResults(list)
      setSearched(true)
    } catch {
      setError('지역 검색을 불러오지 못했어.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="absolute inset-0 z-30">
      {/* 딤 오버레이 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />
      {/* 바텀시트 */}
      <div className="absolute inset-x-0 bottom-0 rounded-t-card bg-white px-pageH pb-6 pt-[22px]">
        <div className="flex items-center">
          <p className="flex-1 text-lg font-extrabold text-text">추천 지역</p>
          <button type="button" aria-label="닫기" onClick={onClose} className="text-sub">
            <X size={22} />
          </button>
        </div>
        <p className="mt-1.5 truncate text-[13px] font-semibold text-sub">
          {selectedRegion}
        </p>

        <button
          type="button"
          onClick={onCurrentLocation}
          className="mt-3.5 flex h-12 w-full items-center justify-center gap-2 rounded-compact border border-border text-sm font-bold text-text"
        >
          <LocateFixed size={18} />
          현재 위치 사용
        </button>

        <div className="mt-3.5 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void search()
            }}
            placeholder="동네, 역, 건물명 검색"
            className="h-12 flex-1 rounded-compact bg-bg px-3.5 text-sm text-text placeholder:text-placeholder focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void search()}
            disabled={isSearching}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-compact bg-accent text-white disabled:opacity-60"
            aria-label="검색"
          >
            <Search size={20} />
          </button>
        </div>

        <div className="mt-3">
          {isSearching ? (
            <p className="py-6 text-center text-sm font-semibold text-sub">
              검색 중…
            </p>
          ) : error ? (
            <LocationMessage
              message={error}
              actionLabel="다시 검색"
              onAction={() => void search()}
            />
          ) : searched && results.length === 0 ? (
            <LocationMessage
              message="검색 결과가 없어."
              actionLabel="입력한 지역으로 검색"
              onAction={() => onManualRegion(query)}
            />
          ) : results.length > 0 ? (
            <ul className="max-h-[260px] overflow-y-auto">
              {results.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="w-full border-b border-border py-3 text-left"
                  >
                    <p className="truncate text-sm font-bold text-text">
                      {item.name}
                    </p>
                    <p className="truncate text-[13px] font-medium text-sub">
                      {item.address}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function LocationMessage({
  message,
  actionLabel,
  onAction,
}: {
  message: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="flex flex-col items-center py-4">
      <p className="text-sm font-semibold text-sub">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-2.5 text-sm font-bold text-accent"
      >
        {actionLabel}
      </button>
    </div>
  )
}
