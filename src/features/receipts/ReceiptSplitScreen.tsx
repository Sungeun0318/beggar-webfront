import { Camera, CheckCircle2, Image as ImageIcon, Loader2, MapPin, Search, Scissors, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { SectionTitle } from '../../components/SectionTitle'
import { softBox } from '../../components/ui/softBox'
import { searchLocations } from '../../lib/api/locations'
import {
  closeSplitGroup,
  createReceipt,
  createSplitGroup,
  deleteReceipt,
  getReceiptDetail,
  getSplitGroup,
  getSplitGroups,
  updateReceipt,
  uploadReceiptImage,
} from '../../lib/api/receipts'
import { getRoom } from '../../lib/api/rooms'
import { money } from '../../lib/format'
import { colors, radii } from '../../theme/tokens'
import type { LocationSearchResult, SplitGroup } from '../../types'

export function ReceiptSplitScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roomNo = Number(searchParams.get('roomNo')) || 1
  const myUserNo = Number(localStorage.getItem('userNo'))

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([])
  const [selectedStore, setSelectedStore] = useState<LocationSearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [group, setGroup] = useState<SplitGroup | null>(null)
  const [amount, setAmount] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [pendingReceiptId, setPendingReceiptId] = useState<number | null>(null)
  const [inputMethod, setInputMethod] = useState<'CAMERA' | 'GALLERY' | 'MANUAL'>('MANUAL')

  const refreshGroup = async (targetGroupId = group?.splitGroupId) => {
    if (!targetGroupId) return
    const nextGroup = await getSplitGroup(roomNo, targetGroupId)
    setGroup(nextGroup)
  }

  useEffect(() => {
    async function init() {
      try {
        const [roomData, openGroups] = await Promise.all([
          getRoom(roomNo),
          getSplitGroups(roomNo, 'OPEN').catch(() => []),
        ])
        if (roomData.status === 'ENDED') {
          alert('종료된 방에는 영수증을 등록할 수 없습니다.')
          navigate(-1)
          return
        }
        setGroup(openGroups[0] ?? null)
      } catch (error) {
        console.error('분할 화면 초기화 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [roomNo, navigate])

  useEffect(() => {
    if (group || storeName.length < 2 || (selectedStore && selectedStore.name === storeName)) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const timer = window.setTimeout(async () => {
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
    }, 400)

    return () => window.clearTimeout(timer)
  }, [group, storeName, selectedStore])

  const pollOcrResult = async (receiptId: number) => {
    let attempts = 0
    const timer = window.setInterval(async () => {
      attempts += 1
      try {
        const detail = await getReceiptDetail(roomNo, receiptId)
        const finalAmount = detail.totalAmount || detail.amount || 0
        const isSuccess = (detail as any).ocrStatus === 'SUCCESS'
        const isFailed = (detail as any).ocrStatus === 'FAILED'

        if (isFailed) {
          window.clearInterval(timer)
          setUploading(false)
          alert('영수증 분석에 실패했습니다. 금액을 직접 입력해주세요.')
          return
        }

        if (isSuccess || finalAmount > 0) {
          window.clearInterval(timer)
          setAmount(String(finalAmount))
          setUploading(false)
          await refreshGroup()
        }
      } catch (error) {
        console.error('OCR 결과 확인 실패:', error)
      }

      if (attempts >= 50) {
        window.clearInterval(timer)
        setUploading(false)
        alert('영수증 분석 시간이 초과되었습니다. 금액을 직접 입력해주세요.')
      }
    }, 3000)
  }

  const startGroup = async () => {
    if (!selectedStore) {
      alert('검색 결과에서 가게를 선택해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const nextGroup = await createSplitGroup(roomNo, {
        storeName: selectedStore.name,
        address: selectedStore.address,
        centerLat: selectedStore.lat,
        centerLng: selectedStore.lng,
      })
      setGroup(nextGroup)
      setStoreName('')
      setSelectedStore(null)
      setSearchResults([])
    } catch (error) {
      console.error('분할 그룹 생성 실패:', error)
      alert('분할을 시작하지 못했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    method: 'CAMERA' | 'GALLERY',
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setInputMethod(method)
    try {
      if (!group || group.status !== 'OPEN') {
        alert('진행 중인 분할 그룹이 없습니다.')
        return
      }
      const nextImageUrl = await uploadReceiptImage(roomNo, file)
      setImageUrl(nextImageUrl)
      const receipt = await createReceipt(roomNo, {
        storeName: group.storeName,
        address: group.address,
        amount: 0,
        totalAmount: 0,
        receiptType: 'SPLIT',
        inputMethod: method,
        imageUrl: nextImageUrl,
        image: nextImageUrl,
        splitGroupId: group.splitGroupId,
      } as any)
      const receiptId = receipt.receiptId || receipt.id || receipt.no
      if (receiptId) {
        setPendingReceiptId(receiptId)
        void pollOcrResult(receiptId)
      } else {
        setUploading(false)
      }
    } catch (error) {
      console.error('영수증 업로드 실패:', error)
      alert('영수증 이미지를 올리지 못했습니다.')
      setUploading(false)
    } finally {
      event.target.value = ''
    }
  }

  const addReceipt = async () => {
    if (!group || group.status !== 'OPEN') return
    const numericAmount = Number(amount.replace(/\D/g, '')) || 0
    if (numericAmount <= 0) {
      alert('금액을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      if (pendingReceiptId) {
        await updateReceipt(roomNo, pendingReceiptId, {
          amount: numericAmount,
          totalAmount: numericAmount,
          storeName: group.storeName,
          address: group.address,
        } as any)
      } else {
        await createReceipt(roomNo, {
        storeName: group.storeName,
        address: group.address,
        amount: numericAmount,
        totalAmount: numericAmount,
        receiptType: 'SPLIT',
        inputMethod,
        imageUrl,
        image: imageUrl,
        splitGroupId: group.splitGroupId,
      } as any)
      }
      setAmount('')
      setImageUrl('')
      setPendingReceiptId(null)
      setInputMethod('MANUAL')
      await refreshGroup(group.splitGroupId)
    } catch (error) {
      console.error('분할 영수증 추가 실패:', error)
      alert('영수증을 추가하지 못했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeGroup = async () => {
    if (!group || !window.confirm('분할을 마감할까요? 마감 후에는 이 그룹에 영수증을 추가할 수 없습니다.')) {
      return
    }

    setIsSubmitting(true)
    try {
      await closeSplitGroup(roomNo, group.splitGroupId)
      navigate(`/room/${roomNo}`)
    } catch (error) {
      console.error('분할 마감 실패:', error)
      alert('분할을 마감하지 못했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PhoneFrame height={852}>
        <main className="flex h-full items-center justify-center bg-bg">
          <Loader2 className="animate-spin" size={48} color={colors.accent} />
        </main>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] overflow-y-auto bg-bg pb-10">
        <AppHeaderTitled title="분할 영수증" onBack={() => navigate(-1)} />

        <section className="px-pageH pt-2">
          <div className="p-5" style={softBox({ color: colors.accentBg, radius: radii.card })}>
            <div className="flex items-center">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-white">
                <Scissors aria-hidden="true" size={23} color={colors.accent} />
              </div>
              <div className="ml-3 min-w-0">
                <h1 className="text-[22px] font-black text-text">분할 영수증</h1>
                <p className="mt-1 text-[13px] font-semibold text-sub">
                  같은 가게 지출을 친구별 영수증으로 모아요.
                </p>
              </div>
            </div>
          </div>

          {!group ? (
            <>
              <div className="h-6" />
              <SectionTitle text="가게를 선택해주세요" />
              <div className="h-[13px]" />
              <div className="relative">
                <div className="flex h-[60px] w-full items-center px-5" style={softBox({ radius: radii.compact })}>
                  {isSearching ? (
                    <Loader2 className="mr-3 animate-spin" size={24} color={colors.accent} />
                  ) : (
                    <Search aria-hidden="true" size={24} color={colors.placeholder} className="mr-3" />
                  )}
                  <input
                    type="text"
                    placeholder="분할할 가게 검색"
                    value={storeName}
                    onChange={(event) => {
                      setStoreName(event.target.value)
                      if (selectedStore && event.target.value !== selectedStore.name) {
                        setSelectedStore(null)
                      }
                    }}
                    className="min-w-0 flex-1 bg-transparent text-base font-bold text-text outline-none placeholder:text-placeholder"
                  />
                </div>

                {showResults && (
                  <div
                    className="absolute left-0 right-0 top-[65px] z-50 max-h-[240px] overflow-y-auto bg-white shadow-lg"
                    style={{ borderRadius: radii.compact, border: `1px solid ${colors.border}` }}
                  >
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.name}-${index}`}
                        type="button"
                        onClick={() => {
                          setStoreName(result.name)
                          setSelectedStore(result)
                          setShowResults(false)
                        }}
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

              {selectedStore && (
                <div className="mt-4 flex items-start rounded-compact border border-accent bg-accentBg p-4">
                  <CheckCircle2 size={20} color={colors.accent} />
                  <div className="ml-2 min-w-0">
                    <p className="text-sm font-black text-text">{selectedStore.name}</p>
                    <p className="mt-1 text-xs font-semibold text-sub">{selectedStore.address}</p>
                  </div>
                </div>
              )}

              <div className="h-6" />
              <PrimaryButton
                enabled={!!selectedStore && !isSubmitting}
                onTap={startGroup}
                label={isSubmitting ? '시작 중...' : '분할 시작'}
              />
            </>
          ) : (
            <>
              <div className="h-5" />
              <section className="p-5" style={softBox({ radius: radii.card, shadow: true })}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[20px] font-black text-text">{group.storeName}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-sub">{group.address}</p>
                  </div>
                  <span className="shrink-0 rounded-chip bg-accentBg px-3 py-1 text-xs font-black text-accent">
                    {group.status === 'OPEN' ? '진행 중' : '마감'}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-compact bg-bg py-3">
                    <p className="text-[11px] font-bold text-sub">합계</p>
                    <p className="mt-1 text-sm font-black text-text">{money(group.totalAmount)}원</p>
                  </div>
                  <div className="rounded-compact bg-bg py-3">
                    <p className="text-[11px] font-bold text-sub">영수증</p>
                    <p className="mt-1 text-sm font-black text-text">{group.receiptCount}장</p>
                  </div>
                  <div className="rounded-compact bg-bg py-3">
                    <p className="text-[11px] font-bold text-sub">기여자</p>
                    <p className="mt-1 text-sm font-black text-text">{group.contributorCount}명</p>
                  </div>
                </div>
              </section>

              <div className="h-6" />
              <SectionTitle text="참여자 입력 현황" />
              <div className="h-3" />
              <div className="space-y-2">
                {group.items.length > 0 ? (
                  group.items.map((item) => (
                    <div key={item.receiptId} className="flex h-[58px] items-center justify-between px-4" style={softBox({ radius: radii.compact })}>
                      <span className="text-[15px] font-black text-text">{item.uploaderName}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[15px] font-black text-accent">{money(item.amount)}원</span>
                        {group.status === 'OPEN' && item.uploaderUserNo === myUserNo && (
                          <button
                            type="button"
                            aria-label="영수증 삭제"
                            onClick={async () => {
                              if (!window.confirm('이 영수증을 삭제할까요?')) return
                              try {
                                await deleteReceipt(roomNo, item.receiptId)
                                await refreshGroup()
                              } catch (error) {
                                console.error('영수증 삭제 실패:', error)
                                alert('영수증을 삭제하지 못했습니다.')
                              }
                            }}
                            className="grid h-7 w-7 place-items-center rounded-full"
                          >
                            <Trash2 size={16} color={colors.sub} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[72px] items-center justify-center rounded-card border border-border bg-white text-sm font-bold text-sub">
                    아직 추가된 영수증이 없어요.
                  </div>
                )}
              </div>

              {group.status === 'OPEN' && (
                <>
                  <div className="h-6" />
                  <SectionTitle text="내 영수증 추가" />
                  <div className="h-3" />
                  <div className="flex h-[64px] items-center px-5" style={softBox({ radius: radii.compact })}>
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value.replace(/[^\d,]/g, ''))}
                      inputMode="numeric"
                      placeholder="금액 입력"
                      className="min-w-0 flex-1 bg-transparent text-[24px] font-black text-text outline-none placeholder:text-placeholder"
                    />
                    <span className="text-lg font-black text-sub">원</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex h-12 items-center justify-center rounded-compact border border-border bg-white text-sm font-black text-text"
                    >
                      <Camera size={18} className="mr-2" /> 촬영
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex h-12 items-center justify-center rounded-compact border border-border bg-white text-sm font-black text-text"
                    >
                      <ImageIcon size={18} className="mr-2" /> 갤러리
                    </button>
                  </div>

                  {uploading && (
                    <div className="mt-3 flex items-center text-sm font-bold text-sub">
                      <Loader2 className="mr-2 animate-spin" size={16} /> 이미지 업로드 중
                    </div>
                  )}

                  {imageUrl && (
                    <div className="mt-3 flex items-center justify-between rounded-compact bg-white px-4 py-3 text-sm font-bold text-sub">
                      <span>이미지 첨부 완료</span>
                      <button type="button" onClick={() => setImageUrl('')} className="grid h-7 w-7 place-items-center">
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => handlePhotoChange(event, 'CAMERA')} />
                  <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handlePhotoChange(event, 'GALLERY')} />

                  <div className="h-5" />
                  <PrimaryButton
                    enabled={!isSubmitting && !uploading}
                    onTap={addReceipt}
                    label={isSubmitting ? '추가 중...' : '내 영수증 추가'}
                  />
                </>
              )}

              <div className="h-3" />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={closeGroup}
                className="h-[54px] w-full rounded-card border border-accent bg-white text-base font-black text-accent disabled:opacity-50"
              >
                분할 마감
              </button>
            </>
          )}
        </section>
      </main>
    </PhoneFrame>
  )
}
