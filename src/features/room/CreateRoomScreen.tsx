import {
  Beef,
  Lock,
  MapPin,
  Minus,
  Plus,
  Soup,
  Utensils,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { ChoiceBox } from '../../components/ChoiceBox'
import { InfoCard } from '../../components/InfoCard'
import { InputLike } from '../../components/InputLike'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { RoundIcon } from '../../components/RoundIcon'
import { SectionTitle } from '../../components/SectionTitle'
import { colors, radii } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

const tags: Array<{ label: string; Icon: LucideIcon; full?: boolean }> = [
  { label: '한식', Icon: Utensils },
  { label: '양식', Icon: Utensils },
  { label: '일식', Icon: Soup },
  { label: '중식', Icon: Beef },
  { label: '기타 요식업', Icon: Utensils, full: true },
]

export function CreateRoomScreen() {
  const navigate = useNavigate()
  const [roomName, setRoomName] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [maxMemberCount, setMaxMemberCount] = useState(4)

  const changeMemberCount = (delta: number) => {
    setMaxMemberCount((current) => Math.min(Math.max(current + delta, 2), 100))
  }

  return (
    <PhoneFrame height={930}>
      <main className="relative min-h-[930px] bg-bg">
        <AppHeaderTitled
          title="새 거지방 만들기"
          onBack={() => navigate(-1)}
        />
        <section className="px-pageH pt-2" style={{ paddingBottom: 132 }}>
          <SectionTitle text="거지방 이름" />
          <div className="h-[13px]" />
          <input
            value={roomName}
            onChange={(event) => setRoomName(event.target.value)}
            placeholder="예) 마라탕 참기 모임"
            className="h-14 w-full bg-white px-5 text-base font-semibold text-text outline-none placeholder:text-placeholder"
            style={softBox({ radius: radii.compact })}
          />
          <div className="h-6" />
          <SectionTitle text="어디서 모이나요?" />
          <div className="h-[13px]" />
          <InputLike label="예) 강남역, 홍대입구" Icon={MapPin} />
          <div className="h-[38px]" />
          <SectionTitle text="어떤 모임인가요?" />
          <div className="h-[13px]" />
          <div className="grid grid-cols-2 gap-3">
            {tags
              .filter((tag) => !tag.full)
              .map(({ label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    setSelectedTag((current) =>
                      current === label ? null : label,
                    )
                  }
                  className="h-14"
                  style={
                    selectedTag === label
                      ? {
                          border: `2px solid ${colors.brown}`,
                          borderRadius: radii.compact,
                        }
                      : undefined
                  }
                >
                  <ChoiceBox label={label} Icon={Icon} />
                </button>
              ))}
          </div>
          <div className="h-3" />
          {tags
            .filter((tag) => tag.full)
            .map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() =>
                  setSelectedTag((current) => (current === label ? null : label))
                }
                className="h-14 w-full"
                style={
                  selectedTag === label
                    ? {
                        border: `2px solid ${colors.brown}`,
                        borderRadius: radii.compact,
                      }
                    : undefined
                }
              >
                <ChoiceBox label={label} Icon={Icon} />
              </button>
            ))}
          <div className="h-[38px]" />
          <SectionTitle text="몇 명이서 모이나요?" />
          <div className="h-[13px]" />
          <div
            className="flex h-[72px] items-center px-[17px]"
            style={softBox({ radius: radii.compact })}
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-bg">
              <Users aria-hidden="true" color={colors.brown} />
            </div>
            <div className="w-3" />
            <span className="text-base font-semibold text-darkSub">참여 인원</span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => changeMemberCount(-1)}
              disabled={maxMemberCount <= 2}
              className="disabled:opacity-45"
            >
              <RoundIcon Icon={Minus} />
            </button>
            <span className="w-[52px] text-center text-xl font-semibold text-text">
              {maxMemberCount}
            </span>
            <button
              type="button"
              onClick={() => changeMemberCount(1)}
              disabled={maxMemberCount >= 100}
              className="disabled:opacity-45"
            >
              <RoundIcon Icon={Plus} />
            </button>
          </div>
          <p className="mt-3 text-[13px] font-bold text-sub">
            * 최소 2명부터 최대 100명까지 참여 가능해요.
          </p>
          <div className="h-[34px]" />
          <InfoCard
            Icon={Lock}
            title="개인 예산은 익명으로 수집돼요"
            body={'가장 낮은 금액 기준으로\n오늘의 총예산이 정해져요.'}
          />
          <div className="h-6" />
          <PrimaryButton
            label="방 만들기"
            onTap={() => navigate('/room/invite')}
          />
          <div className="h-6" />
        </section>
      </main>
    </PhoneFrame>
  )
}
