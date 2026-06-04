import { ChevronDown, ReceiptText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderBrand } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { ReceiptCard } from '../../components/ReceiptCard'
import { money } from '../../lib/format'
import { receipts } from '../../mocks'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

function publicReceiptImage(image: string) {
  return `/${image}`
}

export function ReceiptsScreen() {
  const navigate = useNavigate()
  const total = receipts.reduce((sum, receipt) => sum + receipt.amount, 0)

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
          {receipts.map((receipt) => (
            <div key={`${receipt.date}-${receipt.title}`} className="mb-4">
              <ReceiptCard
                date={receipt.date}
                room={receipt.room}
                image={publicReceiptImage(receipt.image)}
                title={receipt.title}
                amount={`${money(receipt.amount)}원`}
              />
            </div>
          ))}
          <div style={{ height: spacing.bottomSafe }} />
        </section>
      </main>
    </PhoneFrame>
  )
}
