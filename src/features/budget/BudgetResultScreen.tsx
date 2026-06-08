import { Lock, Sparkles, Star, Users, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { InfoCard } from '../../components/InfoCard'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { getBudgetResult, downloadBudgetExcel } from '../../lib/api/budget'
import { money } from '../../lib/format'
import type { BudgetResult } from '../../types'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

export function BudgetResultScreen() {
  const navigate = useNavigate()
  const { roomNo } = useParams()
  const [data, setData] = useState<BudgetResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getBudgetResult(Number(roomNo))
        console.log('📦 백엔드가 준 결과 화면 원본 통:', result)

        setData({
          memberCount: result.memberCount || 0,
          minBudgetPerPerson: result.minBudgetPerPerson || 0,
          totalBudget: result.totalBudget || 0,
        })
      } catch (error) {
        console.error('Failed to fetch budget result:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [roomNo])

  if (loading) {
    return (
      <PhoneFrame>
        <main className="flex min-h-[852px] items-center justify-center bg-bg">
          <Loader2 className="animate-spin" size={48} color={colors.accent} />
        </main>
      </PhoneFrame>
    )
  }

  if (!data) {
    return (
      <PhoneFrame>
        <main className="relative min-h-[852px] bg-bg">
          <AppHeaderTitled title="에산 결정 완료" onBack={() => navigate(-1)} />
          <div className="flex flex-col items-center justify-center p-10">
            <p className="text-sub">데이터를 불러오지 못했습니다.</p>
            <PrimaryButton label="다시 시도" onTap={() => window.location.reload()} />
          </div>
        </main>
      </PhoneFrame>
    )
  }

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
              {data.memberCount}명이 모두 예산을 입력했어요!
            </p>
            <div className="h-[15px]" />
            <div className="rounded-chip bg-muted px-3.5 py-[9px] text-[13px]">
              <span className="font-semibold text-sub">1인 기준 최저 예산 </span>
              <span className="font-black text-darkSub">
                {money(data.minBudgetPerPerson)}원
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
                {money(data.totalBudget)}
              </span>
              <span className="text-2xl font-semibold"> 원</span>
            </p>
            <div className="flex-1" />
            <div className="h-px w-full bg-muted" />
            <div className="h-4" />
            <div className="flex h-[49px] items-center justify-center rounded-card border border-muted bg-bg px-4">
              <Users aria-hidden="true" size={16} color={colors.brown} />
              <span className="ml-2 text-[13px] font-semibold text-sub">
                {data.memberCount}명의 참여자 × 최저 예산{' '}
                {money(data.minBudgetPerPerson)}원
              </span>
            </div>
          </div>
          <div className="h-6" />
          <InfoCard Icon={Lock} title="개인 예산은 익명으로 보호돼요" />
          <div className="h-6" />
          <PrimaryButton
            label="추천 보기"
            onTap={() => navigate(`/recommend?roomNo=${roomNo}`)}
          />
          <div className="h-3" />
          <button
            type="button"
            onClick={async () => {
              try {
                await downloadBudgetExcel(Number(roomNo))
              } catch (error) {
                console.error('Excel download failed:', error)
                alert('엑셀 다운로드에 실패했습니다.')
              }
            }}
            className="flex h-[60px] w-full items-center justify-center rounded-card text-base font-semibold border border-border"
            style={{
              backgroundColor: colors.bg,
              color: colors.sub,
              letterSpacing: -0.31,
            }}
          >
            📊 엑셀로 내보내기
          </button>
          <div style={{ height: spacing.bottomSafe }} />
        </section>
      </main>
    </PhoneFrame>
  )
}
