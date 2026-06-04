import { Lock, Sparkles, Star, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { InfoCard } from '../../components/InfoCard'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { money } from '../../lib/format'
import { budgetResult } from '../../mocks'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

export function BudgetResultScreen() {
  const navigate = useNavigate()

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled title="예산 결정 완료" onBack={() => navigate(-1)} />
        <section className="px-pageH pt-2">
          <div className="relative flex h-[145px] items-center justify-center">
            <Star
              aria-hidden="true"
              size={16}
              color={colors.sparkleYellow}
              className="absolute left-[85px] top-0.5"
            />
            <Sparkles
              aria-hidden="true"
              size={20}
              color={colors.sparkleOrange}
              className="absolute bottom-[22px] left-[90px]"
            />
            <Star
              aria-hidden="true"
              size={15}
              color={colors.sparklePurple}
              className="absolute right-[60px] top-[55px]"
            />
            <img
              src="/assets/images/figma/mascot_celebration.png"
              alt=""
              className="h-[120px] w-[120px] object-contain"
            />
          </div>
          <div className="h-6" />
          <div
            className="flex h-[332px] flex-col items-center px-7 py-7"
            style={softBox({ radius: radii.hero, shadow: true })}
          >
            <p className="text-sm font-semibold text-accent">
              {budgetResult.memberCount}명이 모두 예산을 입력했어요!
            </p>
            <div className="h-[15px]" />
            <div className="rounded-chip bg-muted px-3.5 py-[9px] text-[13px]">
              <span className="font-semibold text-sub">1인 기준 최저 예산 </span>
              <span className="font-black text-darkSub">
                {money(budgetResult.minBudgetPerPerson)}원
              </span>
            </div>
            <div className="h-[25px]" />
            <p className="text-[15px] font-semibold text-lightSub">
              오늘의 총예산
            </p>
            <div className="h-2" />
            <p className="text-text">
              <span
                className="text-[44px] font-semibold"
                style={{ letterSpacing: -1.8 }}
              >
                {money(budgetResult.totalBudget)}
              </span>
              <span className="text-2xl font-semibold"> 원</span>
            </p>
            <div className="flex-1" />
            <div className="h-px w-full bg-muted" />
            <div className="h-4" />
            <div className="flex h-[49px] items-center justify-center rounded-card border border-muted bg-bg px-4">
              <Users aria-hidden="true" size={16} color={colors.brown} />
              <span className="ml-2 text-[13px] font-semibold text-sub">
                {budgetResult.memberCount}명의 참여자 × 최저 예산{' '}
                {money(budgetResult.minBudgetPerPerson)}원
              </span>
            </div>
          </div>
          <div className="h-6" />
          <InfoCard Icon={Lock} title="개인 예산은 익명으로 보호돼요" />
          <div className="h-6" />
          <PrimaryButton
            label="추천 보기"
            onTap={() => navigate('/recommend')}
          />
          <div style={{ height: spacing.bottomSafe }} />
        </section>
      </main>
    </PhoneFrame>
  )
}
