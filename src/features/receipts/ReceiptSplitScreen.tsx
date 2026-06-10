import { Camera, Check, Image, Minus, Plus, Scissors, Users, Store, Search, Loader2, MapPin, AlertCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { RoundIcon } from '../../components/RoundIcon'
import { SectionTitle } from '../../components/SectionTitle'
import { softBox } from '../../components/ui/softBox'
import { money } from '../../lib/format'
import { searchLocations } from '../../lib/api/locations'
import { createReceipt, getReceiptDetail, uploadReceiptImage, updateReceipt } from '../../lib/api/receipts'
import { getRoom, getRoomMembers } from '../../lib/api/rooms'
import { colors, gradients, radii, spacing } from '../../theme/tokens'
import type { LocationSearchResult, Member } from '../../types'

const initialTotal = 0

type SplitMode = 'equal' | 'custom'

/**
 * 두 문자열의 유사도를 측정합니다 (Levenshtein Distance 기반)
 */
function getLevenshteinDistance(a: string, b: string): number {
  const tmp = []
  for (let i = 0; i <= a.length; i++) tmp[i] = [i]
  for (let j = 0; j <= b.length; j++) tmp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
  }
  return tmp[a.length][b.length]
}

function isStoreNameSimilar(a: string, b: string): boolean {
  if (!a || !b) return true
  const cleanA = a.replace(/\s/g, '').toLowerCase()
  const cleanB = b.replace(/\s/g, '').toLowerCase()
  
  if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) return true
  
  const distance = getLevenshteinDistance(cleanA, cleanB)
  const maxLength = Math.max(cleanA.length, cleanB.length)
  
  // 길이의 40% 이하로 차이가 나면 유사한 것으로 판단
  return distance <= maxLength * 0.4
}

function calculateEqualSplit(total: number, roomMembers: Member[]) {
  if (roomMembers.length === 0) return []
  const base = Math.floor(total / roomMembers.length)
  const remainder = total - base * roomMembers.length

  return roomMembers.map((member, index) => ({
    name: member.name,
    amount: base + (index === 0 ? remainder : 0),
  }))
}

export function ReceiptSplitScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roomNo = Number(searchParams.get('roomNo')) || 1

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [currentReceiptId, setCurrentReceiptId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeInputMethod, setActiveInputMethod] = useState<'CAMERA' | 'GALLERY' | 'MANUAL'>('MANUAL')

  // OCR 확인용 임시 상태
  const [pendingOcrResult, setPendingOcrResult] = useState<{ storeName: string; amount: number } | null>(null)
  const [editedStoreName, setEditedStoreName] = useState<string>('')
  const [editedAmount, setEditedAmount] = useState<string>('0')
  const [isStoreMismatch, setIsStoreMismatch] = useState(false)

  // 모달 전용 검색 상태
  const [modalSearchResults, setModalSearchResults] = useState<LocationSearchResult[]>([])
  const [isModalSearching, setIsModalSearching] = useState(false)
  const [showModalResults, setShowModalResults] = useState(false)
  const [modalSelectedStore, setModalSelectedStore] = useState<LocationSearchResult | null>(null)

  const [roomMembers, setRoomMembers] = useState<Member[]>([])
  const [storeName, setStoreName] = useState('')
  const [totalAmount, setTotalAmount] = useState(initialTotal)
  const [mode, setMode] = useState<SplitMode>('equal')
  const [splits, setSplits] = useState<Array<{ name: string; amount: number }>>([])

  // 검색 관련 상태
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStore, setSelectedStore] = useState<LocationSearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)

  // 편집 중인 인덱스 관리
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingTotal, setEditingTotal] = useState(false)
  const [draftTotal, setDraftTotal] = useState(String(initialTotal))
  const [draftSplits, setDraftSplits] = useState<string[]>([])

  useEffect(() => {
    async function init() {
      try {
        const [roomData, membersData] = await Promise.all([
          getRoom(roomNo),
          getRoomMembers(roomNo)
        ])
        
        if (roomData.status === 'ENDED') {
          alert('종료된 방에는 영수증을 등록할 수 없습니다.')
          navigate(-1)
          return
        }

        setRoomMembers(membersData)
        const initialSplits = calculateEqualSplit(initialTotal, membersData)
        setSplits(initialSplits)
        setDraftSplits(initialSplits.map(s => String(s.amount)))
      } catch (error) {
        console.error('초기 데이터 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [roomNo, navigate])

  const splitTotal = useMemo(
    () => splits.reduce((sum, split) => sum + split.amount, 0),
    [splits],
  )
  const remaining = totalAmount - splitTotal

  // 가게 이름 입력 시 검색
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

  // 모달 내 가게 이름 입력 시 검색
  useEffect(() => {
    if (editedStoreName.length < 2 || (modalSelectedStore && modalSelectedStore.name === editedStoreName)) {
      setModalSearchResults([])
      setShowModalResults(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsModalSearching(true)
      try {
        const results = await searchLocations(editedStoreName)
        setModalSearchResults(results)
        setShowModalResults(results.length > 0)
      } catch (error) {
        console.error('모달 내 가게 검색 실패:', error)
      } finally {
        setIsModalSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [editedStoreName, modalSelectedStore])

  const applyEqualSplit = (nextTotal = totalAmount) => {
    setMode('equal')
    const nextSplits = calculateEqualSplit(nextTotal, roomMembers)
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

  // OCR 결과
  const pollOcrResult = async (targetRoomNo: number, receiptId: any) => {
    if (!receiptId) {
      setOcrLoading(false)
      alert('영수증 생성에 실패했습니다. 직접 입력해주세요.')
      return
    }

    let attempts = 0
    const maxAttempts = 50

    const interval = setInterval(async () => {
      attempts++
      try {
        const detail = await getReceiptDetail(targetRoomNo, receiptId)
        
        // 분석 완료 조건
        const hasStore = detail.storeName && detail.storeName !== '분석 중...' && detail.storeName !== ''
        const hasAmount = (detail.totalAmount && detail.totalAmount !== 0) || (detail as any).amount !== 0
        const isSuccess = (detail as any).ocrStatus === 'SUCCESS'

        if (isSuccess || hasStore || hasAmount) {
          clearInterval(interval)
          
          const finalAmount = detail.totalAmount || (detail as any).amount || 0
          const finalStore = hasStore ? detail.storeName! : ''
          
          setPendingOcrResult({
            storeName: finalStore,
            amount: finalAmount,
          })
          setEditedStoreName(finalStore)
          setEditedAmount(String(finalAmount))
          
          setOcrLoading(false)
        }
      } catch (e) {
        console.error('OCR 결과 확인 중 오류:', e)
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        setOcrLoading(false)
        alert('영수증 분석 시간이 초과되었습니다. 직접 입력해주세요.')
      }
    }, 3000)
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>, method: 'CAMERA' | 'GALLERY') => {
    const file = event.target.files?.[0]
    if (!file) return

    setOcrLoading(true)
    setActiveInputMethod(method)
    try {
      const imageUrl = await uploadReceiptImage(roomNo, file)
      const receipt = await createReceipt(roomNo, {
        storeName: '',
        amount: 0,
        receiptType: 'SPLIT',
        inputMethod: method,
        image: imageUrl,
        imageUrl: imageUrl,
      })

      const finalReceiptId = (receipt as any).receiptId || receipt.id || receipt.no
      setCurrentReceiptId(finalReceiptId)
      pollOcrResult(roomNo, finalReceiptId)

    } catch (error) {
      console.error('영수증 처리 실패:', error)
      setOcrLoading(false)
      alert('영수증 업로드에 실패했습니다.')
    } finally {
      // 파일 입력 초기화 (같은 사진을 다시 선택해도 onChange가 발생하도록)
      if (event.target) {
        event.target.value = ''
      }
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

    setIsSubmitting(true)
    try {
      const payload = {
        storeName: selectedStore?.name || storeName,
        title: selectedStore?.name || storeName,
        amount: totalAmount,
        receiptType: 'SPLIT' as const,
        inputMethod: (currentReceiptId ? activeInputMethod : 'MANUAL') as any,
        address: selectedStore?.address,
        centerLat: selectedStore?.lat,
        centerLng: selectedStore?.lng,
      }

      if (currentReceiptId) {
        await updateReceipt(roomNo, currentReceiptId, payload)
      } else {
        await createReceipt(roomNo, payload)
      }
      navigate(`/room/${roomNo}`)
    } catch (error) {
      console.error('영수증 등록 실패:', error)
      alert('영수증 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectStore = (store: LocationSearchResult) => {
    setStoreName(store.name)
    setSelectedStore(store)
    setShowResults(false)
  }

  const handleConfirmOcr = () => {
    if (!pendingOcrResult) return

    const finalAmountToAdd = Number(editedAmount.replace(/\D/g, '')) || 0
    const finalStoreName = modalSelectedStore?.name || editedStoreName

    // 첫 등록이거나 가게 이름이 유사한 경우에만 진행
    if (!storeName || isStoreNameSimilar(storeName, finalStoreName) || isStoreMismatch) {
      setStoreName(finalStoreName)
      if (modalSelectedStore) setSelectedStore(modalSelectedStore)

      const nextTotal = totalAmount + finalAmountToAdd
      setTotalAmount(nextTotal)
      setDraftTotal(String(nextTotal))
      
      // N분의 1 모드인 경우 분할 금액 업데이트
      setSplits(currentSplits => {
        const base = Math.floor(nextTotal / currentSplits.length)
        const remainder = nextTotal - base * currentSplits.length
        return currentSplits.map((member, index) => ({
          ...member,
          amount: base + (index === 0 ? remainder : 0),
        }))
      })

      setPendingOcrResult(null)
      setIsStoreMismatch(false)
      setShowModalResults(false)
    } else {
      // 가게 이름이 너무 다른 경우 경고 상태로 전환
      setIsStoreMismatch(true)
    }
  }

  if (loading) {
    return (
      <PhoneFrame height={930}>
        <main className="flex h-full items-center justify-center bg-bg">
          <Loader2 className="animate-spin" size={48} color={colors.accent} />
        </main>
      </PhoneFrame>
    )
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
            onChange={(e) => handlePhotoChange(e, 'CAMERA')}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={(e) => handlePhotoChange(e, 'GALLERY')}
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
              disabled={isSubmitting || remaining !== 0 || !storeName}
              className={`flex h-[60px] w-full items-center justify-center rounded-card text-base font-bold text-white shadow-md transition-all ${
                remaining === 0 && storeName && !isSubmitting ? 'opacity-100' : 'opacity-50'
              }`}
              style={{ background: gradients.goldGradient }}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : '등록 완료'}
            </button>
          </div>
          
          <div className="h-10" />
        </section>

        {/* OCR 로딩 오버레이 */}
        {ocrLoading && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-2xl">
              <Loader2 className="animate-spin" size={40} color={colors.accent} />
              <p className="mt-4 text-base font-bold text-text">영수증을 분석하고 있어요</p>
              <p className="mt-1 text-sm font-medium text-sub">잠시만 기다려주세요...</p>
            </div>
          </div>
        )}

        {/* OCR 확인 모달 */}
        {pendingOcrResult && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/50 px-PageH backdrop-blur-[1px]">
            <div className="w-full max-w-[340px] rounded-[24px] bg-white p-6 shadow-2xl overflow-visible">
              <div className="flex flex-col items-center">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-accentBg">
                  {isStoreMismatch ? (
                    <AlertCircle size={28} color={colors.danger} />
                  ) : (
                    <Store size={28} color={colors.accent} />
                  )}
                </div>
                
                <h3 className="text-lg font-black text-text text-center leading-tight">
                  {isStoreMismatch ? '가게 이름이 다른 것 같아요' : '영수증을 분석했어요!'}
                </h3>
                <p className="mt-2 text-[13px] font-semibold text-sub text-center whitespace-pre-wrap">
                  기계가 읽은 정보가 맞는지 확인하고 수정해주세요.
                </p>
                
                <div className={`my-6 flex w-full flex-col gap-3 rounded-2xl p-4 ${isStoreMismatch ? 'bg-danger/5 border border-danger/10' : 'bg-muted'}`}>
                  {/* 가게 이름 입력 & 검색 */}
                  <div className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-sub">가게 이름</span>
                      {isModalSearching && <Loader2 size={12} className="animate-spin text-accent" />}
                    </div>
                    <input
                      type="text"
                      value={editedStoreName}
                      onChange={(e) => {
                        setEditedStoreName(e.target.value)
                        if (modalSelectedStore && e.target.value !== modalSelectedStore.name) {
                          setModalSelectedStore(null)
                        }
                      }}
                      placeholder="가게 이름을 입력하세요"
                      className={`w-full bg-transparent text-sm font-extrabold outline-none border-b py-1 ${isStoreMismatch ? 'border-danger/30 text-danger focus:border-danger' : 'border-text/10 text-text focus:border-accent'}`}
                    />
                    
                    {showModalResults && (
                      <div className="absolute top-[50px] left-0 right-0 z-[120] max-h-[160px] overflow-y-auto bg-white shadow-xl border border-border rounded-xl">
                        {modalSearchResults.map((result, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setEditedStoreName(result.name)
                              setModalSelectedStore(result)
                              setShowModalResults(false)
                            }}
                            className="w-full text-left p-3 border-b border-border last:border-none active:bg-accentBg"
                          >
                            <p className="text-xs font-bold text-text">{result.name}</p>
                            <p className="text-[10px] text-sub truncate">{result.address}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 금액 입력 */}
                  <div>
                    <span className="text-xs font-bold text-sub block mb-1">추가할 금액</span>
                    <div className="flex items-center border-b border-text/10 py-1">
                      <input
                        type="text"
                        value={editedAmount}
                        onChange={(e) => setEditedAmount(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-transparent text-base font-black text-accent outline-none"
                        inputMode="numeric"
                      />
                      <span className="ml-1 text-sm font-bold text-accent">원</span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full gap-3">
                  <button
                    onClick={() => {
                      setPendingOcrResult(null)
                      setIsStoreMismatch(false)
                      setShowModalResults(false)
                    }}
                    className="h-12 flex-1 rounded-xl bg-border/30 text-[14px] font-bold text-sub"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirmOcr}
                    disabled={isStoreMismatch}
                    className={`h-12 flex-[2] rounded-xl text-[14px] font-bold text-white shadow-md active:opacity-80 transition-colors ${isStoreMismatch ? 'bg-gray-300 cursor-not-allowed opacity-50' : 'bg-accent'}`}
                  >
                    {isStoreMismatch ? '가게 불일치' : '확인 및 추가'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </PhoneFrame>
  )
}
