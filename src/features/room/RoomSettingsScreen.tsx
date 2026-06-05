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
  Loader2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { ChoiceBox } from '../../components/ChoiceBox'
import { InputLike } from '../../components/InputLike'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { RoundIcon } from '../../components/RoundIcon'
import { SectionTitle } from '../../components/SectionTitle'
import { getRoom, updateRoomSettings } from '../../lib/api/rooms'
import { currentUser } from '../../mocks'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { Room } from '../../types'

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
  const { no } = useParams()
  const roomNo = Number(no) || 1

  const [room, setRoom] = useState<Room | null>(null)
  const [maxMemberCount, setMaxMemberCount] = useState(0)
  const [selectedTag, setSelectedTag] = useState('한식')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRoom(roomNo)
      .then((data) => {
        setRoom(data)
        setMaxMemberCount(data.maxMemberCount)
        setSelectedTag(data.tags[0] ?? '한식')
      })
      .catch((err) => {
        console.error('🔥 방 정보 로딩 실패:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [roomNo])

  if (loading || !room) {
    return (
      <PhoneFrame>
        <main className="flex min-h-[852px] items-center justify-center bg-bg">
          <Loader2 className="animate-spin" size={48} color={colors.accent} />
        </main>
      </PhoneFrame>
    )
  }

  const isOwner = currentUser.no === room.ownerNo

  const changeMaxMemberCount = (delta: number) => {
    setMaxMemberCount((current) =>
      Math.min(Math.max(current + delta, room.memberCount), 100),
    )
  }

  const handleSave = async () => {
    try {
      await updateRoomSettings(roomNo, {
        maxMemberCount,
        tags: [selectedTag],
      })
      navigate(`/room/${roomNo}`)
    } catch (err) {
      console.error('🔥 설정 저장 실패:', err)
      alert('설정 저장에 실패했습니다.')
    }
  }

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled
          title="거지방 설정"
          onBack={() => navigate(`/room/${room.no}`)}
        />
        <section className="px-pageH pt-2">
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
          <PrimaryButton label="설정 저장" onTap={handleSave} />
          <div style={{ height: spacing.bottomSafe }} />
        </section>
      </main>
    </PhoneFrame>
  )
}
