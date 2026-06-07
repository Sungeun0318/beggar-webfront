import { Camera, Check, Image, Minus, Plus, Scissors, Users, Store, Search, Loader2, MapPin } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { RoundIcon } from '../../components/RoundIcon'
import { SectionTitle } from '../../components/SectionTitle'
import { softBox } from '../../components/ui/softBox'
import { money } from '../../lib/format'
import { members, receipts } from '../../mocks'
import { searchLocations } from '../../lib/api/locations'
import { createReceipt } from '../../lib/api/receipts'
import { colors, gradients, radii, spacing } from '../../theme/tokens'
import type { LocationSearchResult } from '../../types'

const initialTotal = receipts[2]?.amount ?? 52000

type SplitMode = 'equal' | 'custom'

function toEqualSplit(total: number) {
  const base = Math.floor(total / members.length)
  const remainder = total - base * members.length

  return members.map((member, index) => ({
    name: member.name,
    amount: base + (index === 0 ? remainder : 0),
  }))
}

export function ReceiptSplitScreen() {
  const navigate = useNavigate()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [storeName, setStoreName] = useState('')
  const [totalAmount, setTotalAmount] = useState(initialTotal)
  const [mode, setMode] = useState<SplitMode>('equal')
  const [splits, setSplits] = useState(() => toEqualSplit(initialTotal))

  // 검색 관련 상태
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStore, setSelectedStore] = useState<LocationSearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)

  // 편집 중인 인덱스 관리
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingTotal, setEditingTotal] = useState(false)
  const [draftTotal, setDraftTotal] = useState(String(initialTotal))
  const [draftSplits, setDraftSplits] = useState<string[]>(() =>
    toEqualSplit(initialTotal).map((s) => String(s.amount)),
  )

  const splitTotal = useMemo(
    () => splits.reduce((sum, split) => sum + split.amount, 0),
    [splits],
  )
  const remaining = totalAmount - splitTotal

  // 가게 이름 입력 시 검색 (Debounce)
  useEffect(() => {
    if (storeName.length < 2 || (selectedStore && selectedStore.name === storeName)) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchLocations(storeName)
        setSearchResults(results)
        setShowResults(results.length > 0)
      } catch (error) {
        console.error('가게 검색 실패:', error)
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [storeName, selectedStore])

  const applyEqualSplit = (nextTotal = totalAmount) => {
    setMode('equal')
    const nextSplits = toEqualSplit(nextTotal)
    setSplits(nextSplits)
    setDraftSplits(nextSplits.map((s) => String(s.amount)))
  }

  const changeTotal = (delta: number) => {
    const nextTotal = Math.max(totalAmount + delta, 0)
    setTotalAmount(nextTotal)
    setDraftTotal(String(nextTotal))
    if (mode === 'equal') {
      applyEqualSplit(nextTotal)
    }
  }

  const commitTotal = () => {
    const nextTotal = Number(draftTotal.replace(/\D/g, '')) || 0
    setTotalAmount(nextTotal)
    setEditingTotal(false)
    if (mode === 'equal') {
      applyEqualSplit(nextTotal)
    }
  }

  const commitSplit = (index: number) => {
    const nextAmount = Number(draftSplits[index].replace(/\D/g, '')) || 0
    setSplits((current) =>
      current.map((s, i) => (i === index ? { ...s, amount: nextAmount } : s)),
    )
    setEditingIndex(null)
    setMode('custom')
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('Selected file:', file.name)
      // OCR 자동화 이전의 심플한 동작: 목록으로 이동
      navigate('/receipts')
    }
  }

  const handleSubmit = async () => {
    if (!storeName) {
      alert('가게 이름을 입력해주세요.')
      return
    }
    if (remaining !== 0) {
      alert('분할 금액 합계가 총액과 일치해야 합니다.')
      return
    }

    try {
      // roomNo는 임시로 1번 사용
      await createReceipt(1, {
        storeName: selectedStore?.name || storeName,
        amount: totalAmount,
        receiptType: 'SPLIT',
        inputMethod: 'MANUAL',
        address: selectedStore?.address,
        // @ts-ignore
        centerLat: selectedStore?.lat,
        // @ts-ignore
        centerLng: selectedStore?.lng,
      })
      navigate('/receipts')
    } catch (error) {
      console.error('영수증 등록 실패:', error)
      alert('영수증 등록에 실패했습니다.')
    }
  }

  const handleSelectStore = (store: LocationSearchResult) => {
    setStoreName(store.name)
    setSelectedStore(store)
    setShowResults(false)
  }

  return (
    <PhoneFrame height={930}>
      <main className="min-h-[930px] bg-bg overflow-y-auto">
        <AppHeaderTitled title="분할 영수증" onBack={() => navigate(-1)} />

        <section
          className="px-pageH pt-2"
          style={{ paddingBottom: spacing.bottomSafe }}
        >
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handlePhotoChange}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={handlePhotoChange}
            className="hidden"
          />

          <div
            className="p-5"
            style={softBox({ color: colors.accentBg, radius: radii.card })}
          >
            <div className="flex items-center">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-white">
                <Scissors aria-hidden="true" size={23} color={colors.accent} />
              </div>
              <div className="ml-3">
                <h1 className="text-[22px] font-black text-text">
                  분할 영수증 등록
                </h1>
                <p className="mt-1 text-[13px] font-semibold text-sub">
                  각자 낼 금액을 나눠서 기록해요
                </p>
              </div>
            </div>
          </div>

          <div className="h-6" />
          <SectionTitle text="가게 이름을 입력해주세요" />
          <div className="h-[13px]" />
          <div className="relative">
            <div
              className="flex h-[60px] w-full items-center px-5"
              style={softBox({ radius: radii.compact })}
            >
              {isSearching ? (
                <Loader2 className="mr-3 animate-spin" size={24} color={colors.accent} />
              ) : (
                <Search aria-hidden="true" size={24} color={colors.placeholder} className="mr-3" />
              )}
              <input
                type="text"
                placeholder="어디에서 결제하셨나요?"
                value={storeName}
                onChange={(e) => {
                  setStoreName(e.target.value)
                  if (selectedStore && e.target.value !== selectedStore.name) {
                    setSelectedStore(null)
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowResults(true)
                }}
                className="w-full bg-transparent text-base font-bold text-text outline-none placeholder:text-placeholder"
              />
            </div>

            {/* 검색 결과 목록 */}
            {showResults && (
              <div 
                className="absolute top-[65px] left-0 right-0 z-50 max-h-[240px] overflow-y-auto bg-white shadow-lg"
                style={{ borderRadius: radii.compact, border: `1px solid ${colors.border}` }}
              >
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.name}-${index}`}
                    type="button"
                    onClick={() => handleSelectStore(result)}
                    className="flex w-full flex-col border-b border-border p-4 text-left last:border-none active:bg-accentBg"
                  >
                    <span className="text-[15px] font-bold text-text">{result.name}</span>
                    <div className="mt-1 flex items-center">
                      <MapPin size={12} color={colors.sub} className="mr-1" />
                      <span className="text-xs font-medium text-sub">{result.address}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-6" />
          <h2 className="text-[17px] font-extrabold text-text">
            영수증 총액
          </h2>
          <div className="h-[13px]" />
          <div
            className="flex h-[72px] items-center px-[17px]"
            style={softBox({ radius: radii.compact })}
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-accentBg">
              <Users aria-hidden="true" size={22} color={colors.brown} />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-[12px] font-semibold text-sub">총 결제 금액</p>
              {editingTotal ? (
                <div className="flex items-center">
                  <input
                    autoFocus
                    value={draftTotal}
                    onChange={(e) => setDraftTotal(e.target.value.replace(/\D/g, ''))}
                    onBlur={commitTotal}
                    onKeyDown={(e) => e.key === 'Enter' && commitTotal()}
                    inputMode="numeric"
                    className="w-[100px] bg-transparent text-xl font-extrabold text-text outline-none"
                  />
                  <span className="text-xl font-extrabold text-text">원</span>
                </div>
              ) : (
                <p 
                  className="text-xl font-extrabold text-text cursor-pointer"
                  onClick={() => setEditingTotal(true)}
                >
                  {money(totalAmount)}원
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => changeTotal(-1000)}
              className="disabled:opacity-45"
              disabled={totalAmount <= 0}
            >
              <RoundIcon Icon={Minus} />
            </button>
            <div className="w-2" />
            <button type="button" onClick={() => changeTotal(1000)}>
              <RoundIcon Icon={Plus} />
            </button>
          </div>

          <div className="h-6" />
          <h2 className="text-[17px] font-extrabold text-text">
            분할 방식
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => applyEqualSplit()}
              className={`h-10 rounded-chip text-[13px] font-bold transition-colors ${
                mode === 'equal' ? 'bg-accent text-white shadow-sm' : 'bg-muted text-sub'
              }`}
            >
              N분의 1
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`h-10 rounded-chip text-[13px] font-bold transition-colors ${
                mode === 'custom' ? 'bg-accent text-white shadow-sm' : 'bg-muted text-sub'
              }`}
            >
              직접 입력
            </button>
          </div>

          <div className="h-6" />
          <div className="flex items-end justify-between">
            <h2 className="text-[17px] font-extrabold text-text">
              참여자별 부담액
            </h2>
            <span
              className={`text-[12px] font-bold ${
                remaining === 0 ? 'text-accent' : 'text-danger'
              }`}
            >
              {remaining === 0
                ? '분할 완료'
                : `${money(Math.abs(remaining))}원 ${
                    remaining > 0 ? '남음' : '초과'
                  }`}
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {splits.map((split, index) => (
              <div
                key={split.name}
                className={`flex h-[64px] items-center px-4 transition-all ${
                  editingIndex === index ? 'ring-2 ring-accent/30' : ''
                }`}
                style={softBox({ radius: radii.compact })}
              >
                <div className="grid h-9 w-9 place-items-center rounded-full bg-accentBg">
                  <Check aria-hidden="true" size={18} color={colors.accent} />
                </div>
                <span className="ml-3 flex-1 text-[15px] font-bold text-text">
                  {split.name}
                </span>
                {editingIndex === index ? (
                  <input
                    autoFocus
                    value={draftSplits[index]}
                    onChange={(e) => {
                      const newDrafts = [...draftSplits]
                      newDrafts[index] = e.target.value.replace(/\D/g, '')
                      setDraftSplits(newDrafts)
                    }}
                    onBlur={() => commitSplit(index)}
                    onKeyDown={(e) => e.key === 'Enter' && commitSplit(index)}
                    inputMode="numeric"
                    className="w-[100px] bg-transparent text-right text-[15px] font-extrabold text-text outline-none"
                  />
                ) : (
                  <span 
                    className="w-[100px] text-right text-[15px] font-extrabold text-text cursor-pointer"
                    onClick={() => {
                      setMode('custom')
                      setEditingIndex(index)
                    }}
                  >
                    {money(split.amount)}
                  </span>
                )}
                <span className="ml-1 text-[13px] font-semibold text-sub">
                  원
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-compact border border-border bg-white text-[14px] font-bold text-sub"
              >
                <Camera size={18} />
                카메라 촬영
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-compact border border-border bg-white text-[14px] font-bold text-sub"
              >
                <Image size={18} />
                갤러리 선택
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className={`flex h-[60px] w-full items-center justify-center rounded-card text-base font-bold text-white shadow-md transition-all ${
                remaining === 0 && storeName ? 'opacity-100' : 'opacity-50'
              }`}
              style={{ background: gradients.goldGradient }}
            >
              등록 완료
            </button>
          </div>
          
          <div className="h-10" />
        </section>
      </main>
    </PhoneFrame>
  )
}
