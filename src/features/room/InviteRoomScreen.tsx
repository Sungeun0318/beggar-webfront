import { Link, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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
  const targetRoomNo = Number(roomNo) || 1

  const [roomData, setRoomData] = useState({
    roomName: '로딩 중...',
    roomCode: 'loading...',
    maxMemberCount: 0,
  })
  const [roomMembers, setRoomMembers] = useState<Member[]>([])

useEffect(() => {
    console.log('🚀 백엔드 방 상세조회 호출!! 방 번호:', targetRoomNo)

    Promise.all([
      getRoom(targetRoomNo).catch(err => { console.error("방 정보 로딩 실패:", err); return null; }),
      getRoomMembers(targetRoomNo).catch(err => { console.error("멤버 로딩 실패:", err); return null; })
    ])
      .then(([roomResponse, membersResponse]) => {
        console.log('📦 백엔드가 준 원본 방 데이터:', roomResponse)
        console.log('👥 백엔드가 준 원본 멤버 데이터:', membersResponse)


        if (roomResponse) {
          setRoomData({
            roomName: roomResponse.roomName || roomResponse.name || '이름 없는 거지방',
            roomCode: roomResponse.roomCode || roomResponse.code || 'code-error',
            maxMemberCount: roomResponse.maxMemberCount || 4,
          })
        }

// 백엔드가 null을 주더라도 화면이 사라지지 않게 가짜 멤버로 방어
        let finalMembers = []
        if (membersResponse && membersResponse.data) {
          finalMembers = membersResponse.data
        } else if (Array.isArray(membersResponse) && membersResponse.length > 0) {
          finalMembers = membersResponse
        } else {
          // 백엔드가 null이나 빈 값을 주면, API가 완성될 때까지 임시로 띄워둘 가짜 데이터 그릇
          finalMembers = [
            { name: '박소영 (나)', status: '방장', mine: true },
            { name: '대기 중인 거지 1', status: '초대 중', mine: false }
          ]
        }

        setRoomMembers(finalMembers)
      })
      .catch((err) => {
        console.error('🔥 데이터 최종 결합 실패:', err)
      })
  }, [targetRoomNo])

  const inviteUrl = `beggar.app/join/${roomData.roomCode}`

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
                </div>
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
