import { ChevronDown, ReceiptText, Loader2, X, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderBrand } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { ReceiptCard } from '../../components/ReceiptCard'
import { getMyReceipts, getReceiptDetail } from '../../lib/api/receipts'
import { money } from '../../lib/format'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { Receipt } from '../../types'

function publicReceiptImage(image: string) {
  if (image.startsWith('http')) return image
  return `/${image}`
}

function validStoreName(name?: string) {
  const normalized = name?.trim()
  return Boolean(normalized && normalized !== '분석 중...')
}

export function ReceiptsScreen() {
  const navigate = useNavigate()
  const [receiptList, setReceiptList] = useState<Receipt[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)

  useEffect(() => {
    async function loadReceipts() {
      try {
        // 임시로 roomNo 1 사용
        const data = await getMyReceipts()
        const receipts = await Promise.all(data.receipts.map(async (receipt) => {
          let detail = null

          if (!validStoreName(receipt.storeName)) {
            detail = await getReceiptDetail(receipt.roomNo, receipt.receiptId).catch(() => null)
          }

          const storeName =
            validStoreName(receipt.storeName)
              ? receipt.storeName
              : validStoreName(detail?.storeName)
                ? detail?.storeName
                : validStoreName(detail?.title)
                  ? detail?.title
                  : ''

          return {
            receiptId: receipt.receiptId,
            roomNo: receipt.roomNo,
            date: receipt.createdAt?.slice(0, 10).replaceAll('-', '.') || '',
            room: receipt.roomName,
            image: detail?.image || detail?.imageUrl || '',
            title: storeName || '이름 없는 지출',
            storeName,
            amount: detail?.amount || detail?.totalAmount || receipt.amount,
            address: detail?.address,
            createdAt: receipt.createdAt,
            receiptType: receipt.receiptType,
            splits: detail?.splits,
          }
        }))

        setReceiptList(receipts)
        setTotalAmount(data.totalAmount)
      } catch (error) {
        console.error('영수증 목록 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    loadReceipts()
  }, [])

  if (loading) {
    return (
      <PhoneFrame>
        <main className="flex min-h-[852px] items-center justify-center bg-bg">
          <Loader2 className="animate-spin" size={48} color={colors.accent} />
        </main>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg overflow-hidden">
        <AppHeaderBrand
          title="지출 내역"
          onBack={() => navigate(-1)}
          showNotification
        />
        <section className="px-pageH pt-2 h-[calc(100%-60px)] overflow-y-auto">
          <div className="flex items-center">
            <h1
              className="text-xl font-semibold text-text"
              style={{ letterSpacing: -0.45 }}
            >
              모든 지출 내역
            </h1>
            <div className="flex-1" />
            <span className="text-[13px] font-semibold text-sub">최신순</span>
            <ChevronDown aria-hidden="true" size={16} color={colors.sub} />
          </div>
          <div className="h-5" />
          <div
            className="flex h-[98px] items-center px-5 pb-[18px] pt-5"
            style={softBox({ color: colors.accentBg, radius: radii.card })}
          >
            <div>
              <p className="text-[13px] font-semibold text-lightSub">
                이번 달 총 지출
              </p>
              <p className="mt-[5px] text-text">
                <span className="text-[22px] font-black">{money(totalAmount)}</span>
                <span className="text-base font-semibold text-sub">원</span>
              </p>
            </div>
            <div className="flex-1" />
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white">
              <ReceiptText aria-hidden="true" size={21} color={colors.accent} />
            </div>
          </div>
          <div className="h-6" />
          {receiptList.length > 0 ? (
            receiptList.map((receipt, index) => {
              const amount = receipt.amount || (receipt as any).totalAmount || 0
              const date = receipt.date || (receipt as any).createdAt?.slice(0, 10).replaceAll('-', '.') || ''
              const title = receipt.title || (receipt as any).storeName || '이름 없는 지출'
              const imageUrl = receipt.image || (receipt as any).imageUrl || ''

              return (
                <div key={`${date}-${title}-${index}`} className="mb-4">
                  <ReceiptCard
                    date={date}
                    room={receipt.room || '방 정보 없음'}
                    image={imageUrl ? publicReceiptImage(imageUrl) : undefined}
                    title={title}
                    amount={`${money(amount)}원`}
                    onClick={() => setSelectedReceipt(receipt)}
                  />
                </div>
              )
            })
          ) : (
            <div className="flex h-40 flex-col items-center justify-center text-sub">
              <p className="text-sm font-semibold">지출 내역이 없어요.</p>
            </div>
          )}
          <div style={{ height: spacing.bottomSafe }} />
        </section>

        {/* 상세 정보 모달 */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div 
              className="w-full max-w-[400px] bg-white rounded-[24px] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col"
              style={{ maxHeight: '90vh' }}
            >
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h2 className="text-xl font-black text-text">영수증 상세</h2>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="p-2 rounded-full bg-muted active:bg-border/50 -mr-2"
                >
                  <X size={20} color={colors.sub} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar pb-2">
                {/* 영수증 이미지 */}
                {(selectedReceipt.image || (selectedReceipt as any).imageUrl) && (
                  <div className="w-full h-72 rounded-2xl bg-gray-100 border border-border mb-6 flex items-center justify-center p-2">
                    <img 
                      src={publicReceiptImage(selectedReceipt.image || (selectedReceipt as any).imageUrl)} 
                      alt="영수증" 
                      className="max-w-full max-h-full object-contain drop-shadow-sm"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-[15px] font-bold text-sub">가게명</span>
                    <span className="text-[17px] font-extrabold text-text">
                      {selectedReceipt.title || (selectedReceipt as any).storeName || '이름 없음'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-[15px] font-bold text-sub">결제 일시</span>
                    <span className="text-[15px] font-bold text-text">
                      {selectedReceipt.date || (selectedReceipt as any).createdAt?.slice(0, 16).replace('T', ' ')}
                    </span>
                  </div>

                  {((selectedReceipt as any).address) && (
                    <div className="flex justify-between items-center pb-4 border-b border-border">
                      <span className="text-[15px] font-bold text-sub">위치</span>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} color={colors.accent} />
                        <span className="text-[15px] font-bold text-text truncate max-w-[200px]">
                          {(selectedReceipt as any).address}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-[15px] font-bold text-sub">총 결제 금액</span>
                    <span className="text-[20px] font-black text-danger">
                      {money(selectedReceipt.amount || (selectedReceipt as any).totalAmount || 0)}원
                    </span>
                  </div>

                  {/* 분할 내역이 있는 경우 표시 */}
                  {(selectedReceipt as any).splits && (selectedReceipt as any).splits.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[15px] font-bold text-sub mb-3 block">분할 내역 (N분의 1)</span>
                      <div className="bg-muted rounded-xl p-4 space-y-2">
                        {(selectedReceipt as any).splits.map((split: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-text">참여자 {split.roomMemberId}</span>
                            <span className="text-sm font-bold text-text">{money(split.amount)}원</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </PhoneFrame>
  )
}
