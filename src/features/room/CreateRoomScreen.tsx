import {
  Beef,
  ChevronRight,
  Lock,
  MapPin,
  Minus,
  Plus,
  Search,
  Soup,
  Utensils,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { ChoiceBox } from '../../components/ChoiceBox'
import { InfoCard } from '../../components/InfoCard'
import { InputLike } from '../../components/InputLike'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { RoundIcon } from '../../components/RoundIcon'
import { SectionTitle } from '../../components/SectionTitle'
import { colors, radii } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import { searchLocations } from '../../lib/api/locations'
import type { LocationSearchResult } from '../../types'

const tags: Array<{ label: string; Icon: LucideIcon; full?: boolean }> = [
  { label: '한식', Icon: Utensils },
  { label: '양식', Icon: Utensils },
  { label: '일식', Icon: Soup },
  { label: '중식', Icon: Beef },
  { label: '기타 요식업', Icon: Utensils, full: true },
]

export function CreateRoomScreen() {
  const navigate = useNavigate()
  const [roomName, setRoomName] = useState('')
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSearchResult | null>(null)
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [maxMemberCount, setMaxMemberCount] = useState(4)

  const changeMemberCount = (delta: number) => {
    setMaxMemberCount((current) => Math.min(Math.max(current + delta, 2), 100))
  }

  if (showLocationSearch) {
    return (
      <SearchAddressView
        onBack={() => setShowLocationSearch(false)}
        onSelect={(location) => {
          setSelectedLocation(location)
          setShowLocationSearch(false)
        }}
      />
    )
  }

  return (
    <PhoneFrame height={930}>
      <main className="relative min-h-[930px] bg-bg">
        <AppHeaderTitled
          title="새 거지방 만들기"
          onBack={() => navigate(-1)}
        />
        <section className="px-pageH pt-2" style={{ paddingBottom: 132 }}>
          <SectionTitle text="거지방 이름" />
          <div className="h-[13px]" />
          <input
            value={roomName}
            onChange={(event) => setRoomName(event.target.value)}
            placeholder="예) 마라탕 참기 모임"
            className="h-14 w-full bg-white px-5 text-base font-semibold text-text outline-none placeholder:text-placeholder"
            style={softBox({ radius: radii.compact })}
          />
          <div className="h-6" />
          <SectionTitle text="어디서 모이나요?" />
          <div className="h-[13px]" />
          <button
            type="button"
            onClick={() => setShowLocationSearch(true)}
            className="block w-full text-left"
          >
            <InputLike
              label={locationLabel(selectedLocation)}
              Icon={MapPin}
              selected={selectedLocation !== null}
            />
          </button>
          <div className="h-[38px]" />
          <SectionTitle text="어떤 모임인가요?" />
          <div className="h-[13px]" />
          <div className="grid grid-cols-2 gap-3">
            {tags
              .filter((tag) => !tag.full)
              .map(({ label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    setSelectedTag((current) =>
                      current === label ? null : label,
                    )
                  }
                  className="h-14"
                  style={
                    selectedTag === label
                      ? {
                          border: `2px solid ${colors.brown}`,
                          borderRadius: radii.compact,
                        }
                      : undefined
                  }
                >
                  <ChoiceBox label={label} Icon={Icon} />
                </button>
              ))}
          </div>
          <div className="h-3" />
          {tags
            .filter((tag) => tag.full)
            .map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() =>
                  setSelectedTag((current) => (current === label ? null : label))
                }
                className="h-14 w-full"
                style={
                  selectedTag === label
                    ? {
                        border: `2px solid ${colors.brown}`,
                        borderRadius: radii.compact,
                      }
                    : undefined
                }
              >
                <ChoiceBox label={label} Icon={Icon} />
              </button>
            ))}
          <div className="h-[38px]" />
          <SectionTitle text="몇 명이서 모이나요?" />
          <div className="h-[13px]" />
          <div
            className="flex h-[72px] items-center px-[17px]"
            style={softBox({ radius: radii.compact })}
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-bg">
              <Users aria-hidden="true" color={colors.brown} />
            </div>
            <div className="w-3" />
            <span className="text-base font-semibold text-darkSub">참여 인원</span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => changeMemberCount(-1)}
              disabled={maxMemberCount <= 2}
              className="disabled:opacity-45"
            >
              <RoundIcon Icon={Minus} />
            </button>
            <span className="w-[52px] text-center text-xl font-semibold text-text">
              {maxMemberCount}
            </span>
            <button
              type="button"
              onClick={() => changeMemberCount(1)}
              disabled={maxMemberCount >= 100}
              className="disabled:opacity-45"
            >
              <RoundIcon Icon={Plus} />
            </button>
          </div>
          <p className="mt-3 text-[13px] font-bold text-sub">
            * 최소 2명부터 최대 100명까지 참여 가능해요.
          </p>
          <div className="h-[34px]" />
          <InfoCard
            Icon={Lock}
            title="개인 예산은 익명으로 수집돼요"
            body={'가장 낮은 금액 기준으로\n오늘의 총예산이 정해져요.'}
          />
          <div className="h-6" />
          <PrimaryButton
            label="방 만들기"
            onTap={() => navigate('/room/invite')}
          />
          <div className="h-6" />
        </section>
      </main>
    </PhoneFrame>
  )
}

function SearchAddressView({
  onBack,
  onSelect,
}: {
  onBack: () => void
  onSelect: (location: LocationSearchResult) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      setResults([])
      setIsLoading(false)
      setErrorMessage(null)
      return
    }

    const timer = window.setTimeout(() => {
      setIsLoading(true)
      setErrorMessage(null)

      void searchLocations(trimmed)
        .then((locations) => {
          setResults(locations)
        })
        .catch((error) => {
          console.warn('방 생성 지역 검색 실패', error)
          setResults([])
          setErrorMessage('지역 검색을 불러오지 못했어요.')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [query])

  const submitSearch = () => {
    const trimmed = query.trim()

    if (!trimmed || isLoading) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    void searchLocations(trimmed)
      .then((locations) => {
        setResults(locations)
      })
      .catch((error) => {
        console.warn('방 생성 지역 검색 실패', error)
        setResults([])
        setErrorMessage('지역 검색을 불러오지 못했어요.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <PhoneFrame height={852}>
      <main className="min-h-[852px] bg-white">
        <AppHeaderTitled title="내 근처 역 검색" onBack={onBack} />
        <section className="px-4 pt-4">
          <div className="flex h-12 items-center rounded-xl bg-bg px-4">
            <Search aria-hidden="true" size={22} color={colors.brown} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitSearch()
                }
              }}
              placeholder="지하철역 이름이나 장소를 입력하세요 (ex: 홍대입구)"
              className="ml-2 min-w-0 flex-1 bg-transparent text-sm font-semibold text-text outline-none placeholder:text-placeholder"
            />
          </div>

          <div className="pt-4">
            {isLoading ? (
              <div className="grid min-h-[560px] place-items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brown" />
              </div>
            ) : errorMessage ? (
              <SearchEmptyMessage message={errorMessage} />
            ) : results.length === 0 ? (
              <SearchEmptyMessage
                message={'검색 결과가 없습니다.\n궁금한 지하철역 명칭을 입력창에 쳐보세요!'}
              />
            ) : (
              <ul>
                {results.map((item, index) => (
                  <li key={`${item.name}-${item.address}-${index}`}>
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="flex w-full items-center py-3 text-left"
                    >
                      <MapPin
                        aria-hidden="true"
                        size={24}
                        color={colors.brown}
                        className="shrink-0"
                      />
                      <div className="ml-4 min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold text-text">
                          {locationLabel(item)}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-medium text-sub">
                          {item.address}
                        </p>
                      </div>
                      <ChevronRight
                        aria-hidden="true"
                        size={16}
                        color={colors.sub}
                        className="ml-3 shrink-0"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </PhoneFrame>
  )
}

function SearchEmptyMessage({ message }: { message: string }) {
  return (
    <div className="grid min-h-[560px] place-items-center">
      <p className="whitespace-pre-line text-center text-sm font-semibold leading-6 text-sub">
        {message}
      </p>
    </div>
  )
}

function locationLabel(location: LocationSearchResult | null) {
  if (!location) {
    return '예) 강남역, 홍대입구'
  }

  return location.name.trim() ? location.name : location.address
}
