import { Trophy, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { room } from '../../mocks'
import { colors, radii, spacing, textStyles } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center">
      <span className="text-sm font-bold text-sub">{label}</span>
      <div className="flex-1" />
      <span className="text-[15px] font-extrabold text-text">{value}</span>
    </div>
  )
}

export function RoomRatingScreen() {
  const navigate = useNavigate()

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled
          title="거지방 평가"
          onBack={() => navigate(`/room/${room.no}`)}
        />
        <section className="px-pageH pt-2" style={{ paddingBottom: spacing.bottomSafe }}>
          <h1 style={textStyles.sectionHeading}>거지방1 평가</h1>
          <p className="mt-1.5 text-[13px] font-semibold text-sub">
            이 방 멤버가 함께 만든 공동 절약 점수예요.
          </p>
          <div className="h-5" />
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
              82점
            </p>
            <p className="mt-1 text-base font-bold text-darkSub">알뜰한 거지</p>
          </section>
          <div className="h-5" />
          <section
            className="p-[18px]"
            style={softBox({ radius: radii.card, shadow: true })}
          >
            <BreakdownRow label="예산 준수율" value="92%" />
            <div className="h-3" />
            <BreakdownRow label="절약률" value="18%" />
            <div className="h-3" />
            <BreakdownRow label="착한가격업소 인증" value="1회" />
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
                멤버 모두 같은 방 점수를 공유해요
              </p>
              <p className="mt-[5px] text-xs font-semibold leading-[1.45] text-sub">
                개인별 점수가 아니라 이 방의 예산 사용과 착한가격업소 인증
                결과로 계산돼요.
              </p>
            </div>
          </section>
        </section>
      </main>
    </PhoneFrame>
  )
}
