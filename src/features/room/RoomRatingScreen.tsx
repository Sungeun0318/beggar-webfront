import { Loader2, Trophy, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { getBeggarScore } from '../../lib/api/ranking'
import { money } from '../../lib/format'
import { colors, radii, spacing, textStyles } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { BeggarScore } from '../../types'

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center">
      <span className="text-sm font-bold text-sub">{label}</span>
      <div className="flex-1" />
      <span className="text-[15px] font-extrabold text-text">{value}</span>
    </div>
  )
}

function percent(value?: number) {
  if (value == null) return '0%'
  return `${Number(value).toFixed(value % 1 === 0 ? 0 : 1)}%`
}

export function RoomRatingScreen() {
  const navigate = useNavigate()
  const { no } = useParams()
  const roomNo = Number(no) || 1
  const [score, setScore] = useState<BeggarScore | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    getBeggarScore(roomNo)
      .then((data) => {
        if (!ignore) {
          setScore(data)
          setError('')
        }
      })
      .catch((err) => {
        console.error('Failed to load beggar score:', err)
        if (!ignore) setError('거지방 평가를 불러오지 못했어요.')
      })

    return () => {
      ignore = true
    }
  }, [roomNo])

  const loading = !error && score?.roomNo !== roomNo

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled
          title="거지방 평가"
          onBack={() => navigate(`/room/${roomNo}`)}
        />
        <section className="px-pageH pt-2" style={{ paddingBottom: spacing.bottomSafe }}>
          <h1 style={textStyles.sectionHeading}>거지방 평가</h1>
          <p className="mt-1.5 text-[13px] font-semibold text-sub">
            방의 예산 사용과 착한가격업소 인증 결과로 자동 계산돼요.
          </p>
          <div className="h-5" />

          {loading ? (
            <section
              className="grid h-[240px] place-items-center"
              style={softBox({ radius: radii.card, shadow: true })}
            >
              <Loader2 className="animate-spin" size={36} color={colors.accent} />
            </section>
          ) : error ? (
            <section
              className="flex h-[180px] items-center justify-center px-5 text-center text-sm font-bold text-sub"
              style={softBox({ radius: radii.card, shadow: true })}
            >
              {error}
            </section>
          ) : score ? (
            <>
              <section
                className="p-5"
                style={softBox({ radius: radii.card, shadow: true })}
              >
                <div className="flex items-center">
                  <Trophy aria-hidden="true" size={30} color={colors.accent} />
                  <span className="ml-2.5 text-base font-extrabold text-text">
                    이 방 점수
                  </span>
                </div>
                <div className="h-4" />
                <p
                  className="text-[44px] font-black text-text"
                  style={{ letterSpacing: -0.7 }}
                >
                  {score.score}점
                </p>
                <p className="mt-1 text-base font-bold text-darkSub">{score.title}</p>
              </section>
              <div className="h-5" />
              <section
                className="p-[18px]"
                style={softBox({ radius: radii.card, shadow: true })}
              >
                <BreakdownRow label="예산 준수율" value={percent(score.budgetComplianceRate)} />
                <div className="h-3" />
                <BreakdownRow label="절약률" value={percent(score.avgSavingsRatio)} />
                <div className="h-3" />
                <BreakdownRow label="착한가격업소 인증" value={`${score.goodPriceVerifiedCount}건`} />
                <div className="h-3" />
                <BreakdownRow label="총 지출" value={`${money(score.totalSpentAmount)}원`} />
                <div className="h-3" />
                <BreakdownRow label="절약 금액" value={`${money(score.totalSavedAmount)}원`} />
              </section>
              <div className="h-6" />
              <section
                className="flex p-[18px]"
                style={softBox({ radius: radii.card, shadow: true })}
              >
                <Users
                  aria-hidden="true"
                  size={28}
                  color={colors.accent}
                  className="shrink-0"
                />
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-[15px] font-extrabold text-text">
                    점수와 칭호는 자동으로 바뀌어요
                  </p>
                  <p className="mt-[5px] text-xs font-semibold leading-[1.45] text-sub">
                    영수증 등록, 예산 확정, 착한가격업소 인증 결과가 바뀌면 서버가 점수와 칭호를 다시 계산해요.
                  </p>
                </div>
              </section>
            </>
          ) : null}
        </section>
      </main>
    </PhoneFrame>
  )
}
