import { Check, Copy, Link, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { InfoCard } from '../../components/InfoCard'
import { ParticipantTile } from '../../components/ParticipantTile'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { SectionTitle } from '../../components/SectionTitle'
import { getRoom, getRoomMembers } from '../../lib/api/rooms'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { Member } from '../../types'

export function InviteRoomScreen() {
  const navigate = useNavigate()
  const { roomNo } = useParams()
  const location = useLocation()
  const targetRoomNo = Number(roomNo) || 1

  // 방 생성 직후 넘어온 경우, 생성 응답의 roomCode를 바로 사용 (백엔드 GET /rooms/{no} 미구현 대비)
  const presetRoom = (location.state as { room?: { name?: string; code?: string; maxMemberCount?: number } } | null)?.room

  const [roomData, setRoomData] = useState({
    roomName: presetRoom?.name ?? '로딩 중...',
    roomCode: presetRoom?.code ?? 'loading...',
    maxMemberCount: presetRoom?.maxMemberCount ?? 0,
  })
  const [roomMembers, setRoomMembers] = useState<Member[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    console.log('🚀 백엔드 방 상세조회 호출!! 방 번호:', targetRoomNo)

    Promise.all([
      getRoom(targetRoomNo).catch((err) => {
        console.error('방 정보 로딩 실패:', err)
        return null
      }),
      getRoomMembers(targetRoomNo).catch((err) => {
        console.error('멤버 로딩 실패:', err)
        return null
      }),
    ])
      .then(([roomResponse, membersResponse]) => {
        console.log('📦 백엔드가 준 원본 방 데이터:', roomResponse)
        console.log('👥 백엔드가 준 원본 멤버 데이터:', membersResponse)


        if (roomResponse) {
          setRoomData({
            roomName: roomResponse.name || '이름 없는 거지방',
            roomCode: roomResponse.code || 'code-error',
            maxMemberCount: roomResponse.maxMemberCount || 4,
          })
        }

        let finalMembers: Member[] = []
        if (Array.isArray(membersResponse) && membersResponse.length > 0) {
          finalMembers = membersResponse
        } else {
          finalMembers = [
            { name: '나', status: '방장', mine: true },
            { name: '대기 중인 거지 1', status: '초대 중', mine: false },
          ]
        }

        setRoomMembers(finalMembers)
      })
      .catch((err) => {
        console.error('🔥 데이터 최종 결합 실패:', err)
      })
  }, [targetRoomNo])

  const invitePath = `/join/${roomData.roomCode}`
  const inviteUrl =
    roomData.roomCode === 'loading...'
      ? '초대 링크 생성 중...'
      : `${window.location.origin}${invitePath}`
  const canCopy = roomData.roomCode !== 'loading...'

  const copyInviteUrl = async () => {
    if (!canCopy) return

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl)
      } else {
        copyWithFallback(inviteUrl)
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      copyWithFallback(inviteUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled title="친구 초대" onBack={() => navigate(-1)} />
        <section className="px-pageH pt-2">
          <div className="flex flex-col items-center">
            <div
              className="w-full px-[22px] pb-[22px] pt-6"
              style={softBox({ color: colors.accentBg, radius: radii.card })}
            >
              <div className="flex flex-col items-center">
                <img
                  src="/assets/images/figma/mascot_small.png"
                  alt=""
                  className="h-[82px] w-[82px] object-contain"
                />
                <h1 className="mt-4 text-[22px] font-extrabold text-text">
                  {roomData.roomName}
                </h1>
                <p className="mt-2 text-sm font-semibold text-sub">
                  정원 {roomData.maxMemberCount}명
                </p>
                <div className="h-[18px]" />
                <div className="flex h-[54px] w-full items-center rounded-compact border border-border bg-white px-[18px]">
                  <Link aria-hidden="true" size={22} color={colors.accent} />
                  <span className="ml-2.5 min-w-0 flex-1 truncate text-sm font-bold text-darkSub">
                    {inviteUrl}
                  </span>
                  <button
                    type="button"
                    onClick={copyInviteUrl}
                    disabled={!canCopy}
                    className="ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accentBg disabled:opacity-40"
                    aria-label="초대 링크 복사"
                  >
                    {copied ? (
                      <Check aria-hidden="true" size={18} color={colors.accent} />
                    ) : (
                      <Copy aria-hidden="true" size={18} color={colors.accent} />
                    )}
                  </button>
                </div>
                <p className="mt-2 h-4 text-[11px] font-bold text-accent">
                  {copied ? '초대 링크를 복사했어요' : ''}
                </p>
              </div>
            </div>
            <div className="h-6" />
            <div className="w-full">
              <SectionTitle text="입장 현황" />
              <div className="h-3.5" />
              {roomMembers.map((member) => (
                <ParticipantTile
                  key={member.name}
                  name={member.name}
                  status={member.status}
                  active={member.mine}
                />
              ))}
            </div>
            <div className="h-2.5" />
            <InfoCard
              Icon={MessageCircle}
              title="카톡 링크 공유만 사용해요"
              body="채팅 없이 초대와 예산 제출 상태만 확인해요."
            />
            <div className="h-6" />
            <PrimaryButton
              label="예산 입력 시작"
              onTap={() => navigate(`/budget/input/${targetRoomNo}`)}
            />
            <div style={{ height: spacing.bottomSafe }} />
          </div>
        </section>
      </main>
    </PhoneFrame>
  )
}

function copyWithFallback(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
