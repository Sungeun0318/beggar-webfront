import { LocateFixed, MapPin, Search, WalletCards, X, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { AppHeaderTitled } from "../../components/AppHeader"
import { PhoneFrame } from "../../components/PhoneFrame"
import { PrimaryButton } from "../../components/PrimaryButton"
import { RecommendationCard } from "../../components/RecommendationCard"
import { SummaryRow } from "../../components/SummaryRow"
import { softBox } from "../../components/ui/softBox"
import { getRecommendation } from "../../lib/api/recommendation"
import { searchLocations } from "../../lib/api/locations"
import { getRoom } from "../../lib/api/rooms"
import { money } from "../../lib/format"
import { colors, radii, spacing } from "../../theme/tokens"
import type {
  LocationSearchResult,
  RecommendationResult,
  RecommendedPlace,
  Room,
} from "../../types"

function tagColors(category: string) {
  if (category.includes("카페")) {
    return { bg: colors.tagBgCafe, fg: colors.tagFgCafe }
  }
  if (category.includes("놀거리")) {
    return { bg: colors.tagBgPlay, fg: colors.tagFgPlay }
  }
  return { bg: colors.tagBgFood, fg: colors.danger }
}

function placeAmount(place: RecommendedPlace) {
  return place.expectedPrice == null
    ? "금액 정보 없음"
    : `${money(place.expectedPrice)}원`
}

const nearbyRadius = 5000

export function RecommendationScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roomNo = Number(searchParams.get("roomNo")) || 1

  const [room, setRoom] = useState<Room | null>(null)
  const [selectedTag, setSelectedTag] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedRegionQuery, setSelectedRegionQuery] = useState<string | null>(null)
  const [selectedLat, setSelectedLat] = useState<number | null>(null)
  const [selectedLng, setSelectedLng] = useState<number | null>(null)
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<RecommendedPlace | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRoom(roomNo).then((roomData) => {
      setRoom(roomData)
      if (!selectedTag) setSelectedTag(roomData.tags[0] || "")
      if (!selectedRegion) setSelectedRegion(roomData.location || "")
    })
  }, [roomNo])

  useEffect(() => {
    setLoading(true)
    getRecommendation(roomNo, {
      tag: selectedTag,
      region: selectedRegionQuery ?? (selectedLat === null ? selectedRegion : undefined),
      lat: selectedLat ?? undefined,
      lng: selectedLng ?? undefined,
      radius: selectedLat === null ? undefined : nearbyRadius,
    }).then((res) => {
      setResult(res)
      setLoading(false)
    })
  }, [roomNo, selectedTag, selectedRegion, selectedRegionQuery, selectedLat, selectedLng])

  const recommendationBudget = result?.recommendationBudget
  const budgetLabel =
    recommendationBudget == null
      ? "전체 예산 기준 추천"
      : `1인 추천 예산 ${money(recommendationBudget)}원`

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled title="예산에 맞는 추천" onBack={() => navigate(-1)} />
        <section className="px-pageH pt-2">
          <button
            type="button"
            className="w-full text-left"
            onClick={() => setSheetOpen(true)}
          >
            <SummaryRow
              Icon={MapPin}
              label={selectedRegion || "지역전체"}
              trailing="변경"
              bg={colors.accentBg}
            />
          </button>
          <div className="h-2.5" />
          <SummaryRow Icon={WalletCards} label={budgetLabel} bg="#F4F6FF" />
          
          {room && room.tags.length > 0 && (
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
                        backgroundColor: selected ? colors.accentBg : "#FFFFFF",
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
              {result.fallbackApplied ? "인기 추천지에서 " : ""}
              {result.budgetGuide}
            </div>
          )}

          <div className="h-[22px]" />
          
          {loading ? (
            <div className="flex py-10 justify-center">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : (
            (result?.places ?? []).map((place) => {
              const tag = tagColors(place.category)
              return (
                <div key={place.storeId ?? place.name} className="mb-3.5">
                  <RecommendationCard
                    image={place.thumbnailUrl}
                    tag={place.category}
                    title={place.name}
                    walk={`${place.walkTime ?? "도보 정보 없음"} · ${place.address}`}
                    rating={`${place.menuName ?? "추천 메뉴"} · ★${
                      place.rating?.toFixed(1) ?? "-"
                    }`}
                    amount={placeAmount(place)}
                    tagBg={tag.bg}
                    tagColor={tag.fg}
                    onMapTap={() => setSelectedPlace(place)}
                  />
                </div>
              )
            })
          )}

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
                있는 예산까지 고려한 조합 추천
              </p>
              <p className="mt-1 text-xs font-semibold leading-[1.45] text-sub">
                착한가격업소와 남은 예산을 함께 보고 추천해줘.
              </p>
            </div>
          </div>
          <div className="h-6" />
          <PrimaryButton
            label="거지방 시작하기"
            onTap={() => navigate(`/room/${roomNo}`)}
          />
          <div style={{ height: spacing.bottomSafe }} />
        </section>

        {selectedPlace && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-8">
            <div className="w-full max-w-[360px] p-5" style={softBox({ radius: radii.card })}>
              <h2 className="text-center text-lg font-extrabold text-text">
                카카오맵으로 이동할까요?
              </h2>
              <p className="mt-2.5 text-center text-sm font-semibold leading-[1.45] text-sub">
                선택한 가게를 카카오맵에서 확인하실 수 있어요.
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
                    window.open(selectedPlace.mapUrl, "_blank")
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
            locationError={locationError}
            onClose={() => setSheetOpen(false)}
            onCurrentLocation={() => {
              setLocationError(null)
              if (!navigator.geolocation) {
                setLocationError("현재 위치를 사용할 수 없는 브라우저입니다.")
                return
              }
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setSheetOpen(false)
                  setSelectedRegion("현재 위치")
                  setSelectedRegionQuery(null)
                  setSelectedLat(position.coords.latitude)
                  setSelectedLng(position.coords.longitude)
                },
                () => {
                  setLocationError("현재 위치를 가져오지 못했어요.")
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
              )
            }}
            onSelect={(loc) => {
              setSheetOpen(false)
              setSelectedRegion(loc.name || loc.address)
              setSelectedRegionQuery(regionQuery(loc.address))
              setSelectedLat(loc.lat)
              setSelectedLng(loc.lng)
            }}
            onManualRegion={(region) => {
              setSheetOpen(false)
              setSelectedRegion(region.trim())
              setSelectedRegionQuery(region.trim())
              setSelectedLat(null)
              setSelectedLng(null)
            }}
          />
        )}
      </main>
    </PhoneFrame>
  )
}

function regionQuery(address: string) {
  const parts = address.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 3) return parts.slice(0, 3).join(" ")
  return address.trim()
}

type LocationSheetProps = {
  selectedRegion: string
  locationError: string | null
  onClose: () => void
  onCurrentLocation: () => void
  onSelect: (location: LocationSearchResult) => void
  onManualRegion: (region: string) => void
}

function LocationSheet({
  selectedRegion,
  locationError,
  onClose,
  onCurrentLocation,
  onSelect,
  onManualRegion,
}: LocationSheetProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<LocationSearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async () => {
    const q = query.trim()
    if (!q || isSearching) return
    setIsSearching(true)
    setError(null)
    try {
      const list = await searchLocations(q)
      setResults(list)
      setSearched(true)
    } catch {
      setError("목록 정보를 불러오지 못했어요.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-6">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/35" />
      <div className="relative w-full max-w-[390px] rounded-card bg-white px-5 pb-6 pt-[22px]">
        <div className="flex items-center">
          <p className="flex-1 text-lg font-extrabold text-text">추천 위치</p>
          <button type="button" onClick={onClose} className="text-sub">
            <X size={22} />
          </button>
        </div>
        <p className="mt-1.5 truncate text-[13px] font-semibold text-sub">{selectedRegion}</p>
        <button
          type="button"
          onClick={onCurrentLocation}
          className="mt-3.5 flex h-12 w-full items-center justify-center gap-2 rounded-compact border border-border text-sm font-bold text-text"
        >
          <LocateFixed size={18} /> 현재 위치 사용
        </button>
        {locationError && <p className="mt-2 text-center text-xs font-semibold text-danger">{locationError}</p>}
        <div className="mt-3.5 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void search() }}
            placeholder="동네, 구, 건물명 등"
            className="h-12 flex-1 rounded-compact bg-bg px-3.5 text-sm text-text placeholder:text-placeholder focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void search()}
            disabled={isSearching}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-compact bg-accent text-white disabled:opacity-60"
          >
            <Search size={20} />
          </button>
        </div>
        <div className="mt-3">
          {isSearching ? (
            <p className="py-6 text-center text-sm font-semibold text-sub">검색 중...</p>
          ) : error ? (
            <LocationMessage message={error} actionLabel="다시 검색" onAction={() => void search()} />
          ) : searched && results.length === 0 ? (
            <LocationMessage message="검색 결과가 없어." actionLabel="입력한 지역으로 설정" onAction={() => onManualRegion(query)} />
          ) : results.length > 0 ? (
            <ul className="max-h-[260px] overflow-y-auto">
              {results.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  <button type="button" onClick={() => onSelect(item)} className="w-full border-b border-border py-3 text-left">
                    <p className="truncate text-sm font-bold text-text">{item.name}</p>
                    <p className="truncate text-[13px] font-medium text-sub">{item.address}</p>
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

function LocationMessage({ message, actionLabel, onAction }: { message: string, actionLabel: string, onAction: () => void }) {
  return (
    <div className="flex flex-col items-center py-4">
      <p className="text-sm font-semibold text-sub">{message}</p>
      <button type="button" onClick={onAction} className="mt-2.5 text-sm font-bold text-accent">{actionLabel}</button>
    </div>
  )
}
