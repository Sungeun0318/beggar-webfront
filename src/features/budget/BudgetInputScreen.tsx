import { Edit3, Info } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { ParticipantTile } from '../../components/ParticipantTile'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { SectionTitle } from '../../components/SectionTitle'
import { money } from '../../lib/format'
import { room } from '../../mocks'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

export function BudgetInputScreen() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState(15000)

  return (
    <PhoneFrame height={930}>
      <main className="relative min-h-[930px] bg-bg">
        <AppHeaderTitled title="예산 입력" onBack={() => navigate(-1)} />
        <section className="px-pageH pt-2">
          <div
            className="w-full p-5"
            style={softBox({ color: colors.accentBg, radius: radii.card })}
          >
            <h1 className="text-lg font-bold text-text">{room.name}</h1>
            <p className="mt-2 text-[13px] font-semibold text-sub">
              명학역 1번 출구 근처 · 참여 인원 {room.memberCount}명
            </p>
          </div>
          <div className="h-6" />
          <SectionTitle text="내 예산을 입력해주세요" />
          <div className="h-[13px]" />
          <label
            className="flex h-[72px] items-center px-5"
            style={softBox({ radius: radii.compact })}
          >
            <input
              value={money(amount)}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, '')
                setAmount(digits ? Number(digits) : 0)
              }}
              inputMode="numeric"
              className="w-[120px] bg-transparent text-[28px] font-bold text-text outline-none"
            />
            <span className="ml-1 text-lg font-semibold text-sub">원</span>
            <div className="flex-1" />
            <Edit3 aria-hidden="true" size={24} color={colors.placeholder} />
          </label>
          <div className="h-7" />
          <SectionTitle text="참여자 입력 현황" />
          <div className="h-3.5" />
          <ParticipantTile name="거지판다" status="입력 중" active />
          <ParticipantTile name="절약왕" status="제출 완료" active={false} />
          <ParticipantTile name="김짠돌" status="제출 완료" active={false} />
          <ParticipantTile
            name="거짓말마세요거지님"
            status="제출 완료"
            active={false}
          />
          <div className="h-[18px]" />
          <div className="flex items-start">
            <Info
              aria-hidden="true"
              size={18}
              color={colors.accent}
              className="mt-0.5 shrink-0"
            />
            <p className="ml-2 text-[13px] font-semibold leading-[1.5] text-sub">
              시스템이 가장 낮은 제출 금액을 기준으로
              <br />
              오늘의 총예산을 계산해요.
            </p>
          </div>
          <div className="h-6" />
          <PrimaryButton
            label="입력 완료"
            onTap={() => navigate('/budget/result')}
          />
          <div style={{ height: spacing.bottomSafe }} />
        </section>
      </main>
    </PhoneFrame>
  )
}
