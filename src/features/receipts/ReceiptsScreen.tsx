import { ChevronDown, ReceiptText, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderBrand } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { ReceiptCard } from '../../components/ReceiptCard'
import { getRoomReceipts } from '../../lib/api/receipts'
import { money } from '../../lib/format'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { Receipt } from '../../types'

function publicReceiptImage(image: string) {
  if (image.startsWith('http')) return image
  return `/${image}`
}

export function ReceiptsScreen() {
  const navigate = useNavigate()
  const [receiptList, setReceiptList] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReceipts() {
      try {
        // 임시로 roomNo 1 사용
        const data = await getRoomReceipts(1)
        setReceiptList(data)
      } catch (error) {
        console.error('영수증 목록 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    loadReceipts()
  }, [])

  const total = receiptList.reduce((sum, receipt) => {
    const amount = receipt.amount || (receipt as any).totalAmount || 0
    return sum + amount
  }, 0)

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
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderBrand
          title="지출 내역"
          onBack={() => navigate(-1)}
          showNotification
        />
        <section className="px-pageH pt-2">
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
                <span className="text-[22px] font-black">{money(total)}</span>
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
      </main>
    </PhoneFrame>
  )
}
