import {
  Beef,
  Hash,
  MapPin,
  Minus,
  Plus,
  Soup,
  UserPlus,
  Users,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { ChoiceBox } from '../../components/ChoiceBox'
import { InputLike } from '../../components/InputLike'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { RoundIcon } from '../../components/RoundIcon'
import { SectionTitle } from '../../components/SectionTitle'
import { currentUser, room } from '../../mocks'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

const tags: Array<{ label: string; Icon: LucideIcon; full?: boolean }> = [
  { label: '한식', Icon: Utensils },
  { label: '양식', Icon: Utensils },
  { label: '일식', Icon: Soup },
  { label: '중식', Icon: Beef },
  { label: '기타 요식업', Icon: Utensils, full: true },
]

function InfoRow({
  Icon,
  label,
  value,
}: {
  Icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-bg">
        <Icon aria-hidden="true" size={20} color={colors.brown} />
      </div>
      <span className="ml-3 text-sm font-semibold text-sub">{label}</span>
      <div className="flex-1" />
      <span className="text-base font-bold text-text">{value}</span>
    </div>
  )
}

export function RoomSettingsScreen() {
  const navigate = useNavigate()
  const [maxMemberCount, setMaxMemberCount] = useState(room.maxMemberCount)
  const [selectedTag, setSelectedTag] = useState(room.tags[0] ?? '한식')
  const isOwner = currentUser.no === room.ownerNo

  const changeMaxMemberCount = (delta: number) => {
    setMaxMemberCount((current) =>
      Math.min(Math.max(current + delta, room.memberCount), 100),
    )
  }

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled
          title="거지방 설정"
          onBack={() => navigate(`/room/${room.no}`)}
        />
        <section
          className="absolute inset-x-0 bottom-0 overflow-y-auto px-pageH"
          style={{ top: spacing.contentTop }}
        >
          <SectionTitle text="거지방 정보" />
          <div className="h-[13px]" />
          <div
            className="px-[18px] py-4"
            style={softBox({ radius: radii.card })}
          >
            <InfoRow Icon={Hash} label="거지방 코드" value={room.code.toUpperCase()} />
            <div className="h-3.5" />
            <InfoRow
              Icon={Users}
              label="현재 참여 인원"
              value={`${room.memberCount} / ${maxMemberCount}명`}
            />
          </div>
          <div className="h-[38px]" />
          <SectionTitle text="인원 제한" />
          <div className="h-[13px]" />
          <div
            className="flex h-[72px] items-center px-[17px]"
            style={softBox({ radius: radii.compact })}
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-bg">
              <UserPlus aria-hidden="true" color={colors.brown} />
            </div>
            <span className="ml-3 text-base font-semibold text-darkSub">
              최대 인원
            </span>
            <div className="flex-1" />
            <button
              type="button"
              disabled={!isOwner || maxMemberCount <= room.memberCount}
              onClick={() => changeMaxMemberCount(-1)}
              className="disabled:opacity-45"
            >
              <RoundIcon Icon={Minus} />
            </button>
            <span
              className="w-[52px] text-center text-xl font-bold"
              style={{ color: isOwner ? colors.text : colors.placeholder }}
            >
              {maxMemberCount}
            </span>
            <button
              type="button"
              disabled={!isOwner || maxMemberCount >= 100}
              onClick={() => changeMaxMemberCount(1)}
              className="disabled:opacity-45"
            >
              <RoundIcon Icon={Plus} />
            </button>
          </div>
          <p className="mt-3 text-[13px] font-bold text-sub">
            {isOwner
              ? '* 반장은 방 생성 후에도 인원 제한을 조정할 수 있어요.'
              : '* 인원 제한 변경은 반장만 가능해요.'}
          </p>
          <div className="h-[38px]" />
          <SectionTitle text="지역 변경" />
          <div className="h-[13px]" />
          <InputLike label={room.location} Icon={MapPin} selected />
          <div className="h-[38px]" />
          <SectionTitle text="추천 태그 변경" />
          <div className="h-[13px]" />
          <div className="grid grid-cols-2 gap-3">
            {tags
              .filter((tag) => !tag.full)
              .map(({ label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedTag(label)}
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
                onClick={() => setSelectedTag(label)}
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
          <PrimaryButton
            label="설정 저장"
            onTap={() => navigate(`/room/${room.no}`)}
          />
          <div style={{ height: spacing.bottomSafe }} />
        </section>
      </main>
    </PhoneFrame>
  )
}
