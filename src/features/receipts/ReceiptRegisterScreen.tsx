import { Camera, Edit3, Image as ImageIcon, Store, Coins, Loader2, MapPin, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ActionBox } from '../../components/ActionBox'
import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { SectionTitle } from '../../components/SectionTitle'
import { searchLocations } from '../../lib/api/locations'
import { createReceipt, getReceiptDetail, uploadReceiptImage, updateReceipt } from '../../lib/api/receipts'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { LocationSearchResult } from '../../types'

type Step = 'METHOD' | 'MANUAL'

export function ReceiptRegisterScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roomNo = Number(searchParams.get('roomNo')) || 1
  
  const [currentReceiptId, setCurrentReceiptId] = useState<number | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  
  const [step, setStep] = useState<Step>('METHOD')
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
    if (step === 'MANUAL') {
      setStep('METHOD')
      setStoreName('')
      setAmount('')
      setSelectedStore(null)
    } else {
      navigate(-1)
    }
  }

  const complete = () => navigate('/receipts')

  // OCR 결과
  const pollOcrResult = async (targetRoomNo: number, receiptId: any) => {
    if (!receiptId) {
      console.error('영수증 ID가 없습니다.')
      setOcrLoading(false)
      alert('영수증 생성에 실패했습니다. 직접 입력해주세요.')
      setStep('MANUAL')
      return
    }

    let attempts = 0
    const maxAttempts = 30

    const interval = setInterval(async () => {
      attempts++
      try {
        const detail = await getReceiptDetail(targetRoomNo, receiptId)
        // 분석 완료 조건 완화: SUCCESS 상태이거나, 실제 데이터(가게명 또는 금액)가 들어왔을 때
        const hasStore = detail.storeName && detail.storeName !== '분석 중...' && detail.storeName !== ''
        const hasAmount = (detail.totalAmount && detail.totalAmount !== 0) || (detail as any).amount !== 0
        const isSuccess = (detail as any).ocrStatus === 'SUCCESS'

        if (isSuccess || hasStore || hasAmount) {
          clearInterval(interval)
          
          setStoreName(hasStore ? detail.storeName! : '')
          const finalAmount = detail.totalAmount || (detail as any).amount || ''
          setAmount(finalAmount ? String(finalAmount) : '')
          
          setOcrLoading(false)
          setStep('MANUAL')
        }
      } catch (e) {
        console.error('OCR 결과 확인 중 오류:', e)
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        setOcrLoading(false)
        alert('영수증 분석 시간이 초과되었습니다. 직접 입력해주세요.')
        setStep('MANUAL')
      }
    }, 3000)
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>, method: 'CAMERA' | 'GALLERY') => {
    const file = event.target.files?.[0]
    if (!file) return

    setOcrLoading(true)
    setActiveInputMethod(method)
    try {
      // 1. S3 업로드
      const imageUrl = await uploadReceiptImage(roomNo, file)
// 2. OCR 트리거를 위한 영수증 생성
const receipt = await createReceipt(roomNo, {
  storeName: '',
  amount: 0,
  receiptType: 'COMBINED',
  inputMethod: method,
  image: imageUrl,

  imageUrl: imageUrl,
})

// 3. 결과 폴링
const finalReceiptId = (receipt as any).receiptId || receipt.id || receipt.no
setCurrentReceiptId(finalReceiptId)
pollOcrResult(roomNo, finalReceiptId)

    } catch (error: any) {
      console.error('영수증 처리 실패:', error)
      if (error.data) console.error('상세 에러 내용:', error.data)
      setOcrLoading(false)
      alert('영수증 업로드에 실패했습니다.')
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
        title: selectedStore?.name || storeName, // title 필드도 함께 전송
        amount: numericAmount,
        receiptType: 'COMBINED' as const,
        inputMethod: (currentReceiptId ? activeInputMethod : 'MANUAL') as any,
        address: selectedStore?.address,
        centerLat: selectedStore?.lat,
        centerLng: selectedStore?.lng,
      }

      if (currentReceiptId) {
        // 이미 생성된 영수증이 있으면 업데이트 (PATCH)
        await updateReceipt(roomNo, currentReceiptId, payload)
      } else {
        await createReceipt(roomNo, payload)
      }
      complete()
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

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled
          title="영수증 등록"
          onBack={handleBack}
        />
        
        {step === 'METHOD' ? (
          <section className="px-pageH pt-2">
            <div
              className="p-5"
              style={softBox({ color: colors.accentBg, radius: radii.card })}
            >
              <h1
                className="text-[22px] font-black text-text"
                style={{ letterSpacing: -0.7 }}
              >
                {modeTitle}
              </h1>
              <p className="mt-2 text-sm font-semibold leading-[1.5] text-sub">
                {modeDescription}
              </p>
            </div>
            <div className="h-6" />
            <h2
              className="text-[17px] font-extrabold leading-[1.5] text-text"
              style={{ letterSpacing: -0.43 }}
            >
              등록 방법을 선택해주세요
            </h2>
            <div className="h-[13px]" />
            <ActionBox
              Icon={Camera}
              title="사진 촬영"
              body="카메라로 영수증을 바로 찍어요"
              onTap={() => cameraInputRef.current?.click()}
            />
            <div className="h-3" />
            <ActionBox
              Icon={ImageIcon}
              title="갤러리에서 가져오기"
              body="이미 찍어둔 영수증 사진을 선택해요"
              onTap={() => galleryInputRef.current?.click()}
            />
            <div className="h-3" />
            <ActionBox
              Icon={Edit3}
              title="직접 입력"
              body="금액과 내용을 직접 입력해요"
              onTap={() => setStep('MANUAL')}
            />
            <div className="h-6" />
            <div
              className="p-4 text-[13px] font-semibold leading-[1.5] text-sub"
              style={softBox({ radius: radii.card })}
            >
              현재 프로토타입에서는 선택 후 지출 내역 화면으로 이동해요. 실제
              연동 때 카메라, 갤러리, 직접 입력 화면을 각각 연결하면 돼요.
            </div>
            <div style={{ height: spacing.bottomSafe }} />
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
          </section>
        ) : (
          <section className="px-pageH pt-2">
            {/* ... (Manual Input Form - same as before) */}
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
                  autoFocus
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

            <div className="h-10" />
            <PrimaryButton
              label={isSubmitting ? '등록 중...' : '등록 완료'}
              enabled={!isSubmitting && storeName.length > 0 && amount.length > 0}
              onTap={handleManualSubmit}
            />
            {isSubmitting && (
              <div className="mt-4 flex justify-center">
                <Loader2 className="animate-spin" size={24} color={colors.accent} />
              </div>
            )}
            <div style={{ height: spacing.bottomSafe }} />
          </section>
        )}

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