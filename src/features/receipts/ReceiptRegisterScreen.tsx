import { Camera, Coins, Image as ImageIcon, Loader2, MapPin, Search, Receipt } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { SectionTitle } from '../../components/SectionTitle'
import { searchLocations } from '../../lib/api/locations'
import { createReceipt, getReceiptDetail, uploadReceiptImage, updateReceipt } from '../../lib/api/receipts'
import { getRoom } from '../../lib/api/rooms'
import { colors, radii, spacing, gradients } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { LocationSearchResult } from '../../types'

export function ReceiptRegisterScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roomNo = Number(searchParams.get('roomNo')) || 1
  
  const [currentReceiptId, setCurrentReceiptId] = useState<number | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  
  const [storeName, setStoreName] = useState('')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // OCR 로딩 상태
  const [ocrLoading, setOcrLoading] = useState(false)
  const [activeInputMethod, setActiveInputMethod] = useState<'CAMERA' | 'GALLERY' | 'MANUAL'>('MANUAL')

  // 검색 관련 상태
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStore, setSelectedStore] = useState<LocationSearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    getRoom(roomNo).then((data) => {
      if (data.status === 'ENDED') {
        alert('종료된 방에는 영수증을 등록할 수 없습니다.')
        navigate(-1)
      }
    })
  }, [roomNo, navigate])

  const modeTitle = '통합 영수증'
  const modeDescription =
    '한 식당이나 장소에서 한 번에 결제한 영수증을 등록해요.'

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

  const handleBack = () => {
    navigate(-1)
  }

  const complete = () => navigate(`/room/${roomNo}`)

  // OCR 결과 폴링
  const pollOcrResult = async (targetRoomNo: number, receiptId: any) => {
    if (!receiptId) {
      console.error('영수증 ID가 없습니다.')
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
        
        const hasStore = detail.storeName && detail.storeName !== '분석 중...' && detail.storeName !== ''
        const hasAmount = (detail.totalAmount && detail.totalAmount !== 0) || (detail as any).amount !== 0
        const isSuccess = (detail as any).ocrStatus === 'SUCCESS'
        const isFailed = (detail as any).ocrStatus === 'FAILED'

        if (isFailed) {
          clearInterval(interval)
          setOcrLoading(false)
          alert('영수증 분석에 실패했습니다. 직접 입력해주세요.')
          return
        }

        if (isSuccess || hasStore || hasAmount) {
          clearInterval(interval)
          
          setStoreName(hasStore ? detail.storeName! : '')
          const finalAmount = detail.totalAmount || (detail as any).amount || ''
          setAmount(finalAmount ? String(finalAmount) : '')
          
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
      const receiptData = {
        storeName: '',
        amount: 0,
        receiptType: 'COMBINED' as const,
        inputMethod: method,
        image: imageUrl,
        imageUrl: imageUrl,
      }
      const receipt = await createReceipt(roomNo, receiptData)
      const finalReceiptId = (receipt as any).receiptId || receipt.id || receipt.no
      setCurrentReceiptId(finalReceiptId)
      pollOcrResult(roomNo, finalReceiptId)

    } catch (error: any) {
      console.error(`[${method} 처리 에러]`, error)
      setOcrLoading(false)
      alert('영수증 업로드에 실패했습니다.')
    } finally {
      if (event.target) event.target.value = ''
    }
  }

  const handleManualSubmit = async () => {
    if (!storeName || !amount) {
      alert('가게 이름과 금액을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const numericAmount = parseInt(amount.replace(/\D/g, ''), 10)
      
      const payload = {
        storeName: selectedStore?.name || storeName,
        title: selectedStore?.name || storeName,
        amount: numericAmount,
        receiptType: 'COMBINED' as const,
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
      complete()
    } catch (error: any) {
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

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg overflow-y-auto pb-10">
        <AppHeaderTitled
          title="영수증 등록"
          onBack={handleBack}
        />
        
        <section className="px-pageH pt-2">
          <div
            className="p-5"
            style={softBox({ color: colors.accentBg, radius: radii.card })}
          >
            <div className="flex items-center">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-white">
                <Receipt aria-hidden="true" size={23} color={colors.accent} />
              </div>
              <div className="ml-3">
                <h1 className="text-[22px] font-black text-text" style={{ letterSpacing: -0.7 }}>
                  {modeTitle}
                </h1>
                <p className="mt-1 text-[13px] font-semibold text-sub">
                  {modeDescription}
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
          
          <div className="h-7" />
          <SectionTitle text="결제 금액을 입력해주세요" />
          <div className="h-[13px]" />
          <div
            className="flex h-[60px] w-full items-center px-5"
            style={softBox({ radius: radii.compact })}
          >
            <Coins aria-hidden="true" size={24} color={colors.placeholder} className="mr-3" />
            <input
              type="text"
              inputMode="numeric"
              placeholder="얼마를 결제하셨나요?"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-transparent text-base font-bold text-text outline-none placeholder:text-placeholder"
            />
            <span className="ml-1 text-base font-semibold text-sub">원</span>
          </div>

          <div className="mt-10 space-y-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-compact border border-border bg-white text-[14px] font-bold text-sub"
              >
                <Camera size={18} />
                사진 촬영
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-compact border border-border bg-white text-[14px] font-bold text-sub"
              >
                <ImageIcon size={18} />
                갤러리 선택
              </button>
            </div>

            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={isSubmitting || !storeName || !amount}
              className={`flex h-[60px] w-full items-center justify-center rounded-card text-base font-bold text-white shadow-md transition-all ${
                storeName && amount && !isSubmitting ? 'opacity-100' : 'opacity-50'
              }`}
              style={{ background: gradients.goldGradient }}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : '등록 완료'}
            </button>
          </div>

          <div style={{ height: spacing.bottomSafe }} />
        </section>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handlePhotoChange(e, 'CAMERA')}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoChange(e, 'GALLERY')}
        />

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
      </main>
    </PhoneFrame>
  )
}
