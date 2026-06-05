import { Edit3, Info, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { ParticipantTile } from '../../components/ParticipantTile'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { SectionTitle } from '../../components/SectionTitle'
import { submitBudget } from '../../lib/api/budget'
import { getRoom, getRoomMembers } from '../../lib/api/rooms'
import { money } from '../../lib/format'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { Member, Room } from '../../types'

export function BudgetInputScreen() {
  const navigate = useNavigate()
  const { roomNo } = useParams()
  const targetRoomNo = Number(roomNo) || 1

  const [room, setRoom] = useState<Room | null>(null)
  const [roomMembers, setRoomMembers] = useState<Member[]>([])
  const [amount, setAmount] = useState(15000)
  const [draftAmount, setDraftAmount] = useState(String(amount))
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

useEffect(() => {
    Promise.all([
      getRoom(targetRoomNo).catch(err => { console.error("방 정보 실패:", err); return null; }),
      getRoomMembers(targetRoomNo).catch(err => { console.error("멤버 실패:", err); return null; })
    ])
      .then(([roomData, membersData]) => {
        setRoom(roomData)


        let finalMembers = []
        if (membersData && membersData.data) {
          finalMembers = membersData.data
        } else if (Array.isArray(membersData)) {
          finalMembers = membersData
        } else {
          // 🏷 백엔드가 완성되기 전까지 화면이 굳지 않게 띄워놓을 임시 가짜 데이터!
          finalMembers = [
            { name: '박소영 (나)', status: '예산 입력 대기', mine: true },
            { name: '대기 중인 거지 1', status: '입장 완료', mine: false }
          ]
        }

        setRoomMembers(finalMembers)
      })
      .catch((err) => {
        console.error('🔥 데이터 로딩 실패:', err)
      })
      .finally(() => {
        setDataLoading(false)
      })
  }, [targetRoomNo])

  const startEditing = () => {
    setDraftAmount(String(amount))
    setIsEditing(true)
  }

  const commitAmount = () => {
    const nextAmount = Number(draftAmount.replace(/\D/g, ''))
    setAmount(Number.isFinite(nextAmount) ? nextAmount : amount)
    setIsEditing(false)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await submitBudget(targetRoomNo, amount)
      console.log('💰 백엔드 DB에 익명 예산 제출 성공!')
      navigate(`/budget/result/${targetRoomNo}`)
    } catch (error) {
      console.error('백엔드 서버 통신 에러:', error)
      alert('예산 제출에 실패했습니다. 서버 상태를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  if (dataLoading || !room) {
    return (
      <PhoneFrame>
        <main className="flex min-h-[852px] items-center justify-center bg-bg">
          <Loader2 className="animate-spin" size={48} color={colors.accent} />
        </main>
      </PhoneFrame>
    )
  }

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
              참여 인원 {room.memberCount} / {room.maxMemberCount}명
            </p>
          </div>
          <div className="h-6" />
          <SectionTitle text="내 예산을 입력해주세요" />
          <div className="h-[13px]" />
          <div
            onClick={() => {
              if (!isEditing) startEditing()
            }}
            className="flex h-[72px] w-full items-center px-5 text-left"
            style={softBox({ radius: radii.compact })}
          >
            {isEditing ? (
              <input
                autoFocus
                value={draftAmount}
                onChange={(event) => {
                  setDraftAmount(event.target.value.replace(/\D/g, ''))
                }}
                onBlur={commitAmount}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') commitAmount()
                  if (event.key === 'Escape') setIsEditing(false)
                }}
                inputMode="numeric"
                className="w-[150px] bg-transparent text-[28px] font-bold text-text outline-none"
              />
            ) : (
              <span className="text-[28px] font-bold text-text">
                {money(amount)}
              </span>
            )}
            <span className="ml-1 text-lg font-semibold text-sub">원</span>
            <div className="flex-1" />
            <Edit3
              aria-hidden="true"
              className="shrink-0"
              size={24}
              color={colors.placeholder}
            />
          </div>
          <div className="h-7" />
          <SectionTitle text="참여자 입력 현황" />
          <div className="h-3.5" />
          {roomMembers.map((member) => (
            <ParticipantTile
              key={member.name}
              name={member.name}
              status={member.status}
              active={member.mine}
            />
          ))}
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
            label={isLoading ? '제출 중...' : '입력 완료'}
            onTap={handleSubmit}
          />
          <div style={{ height: spacing.bottomSafe }} />
        </section>
      </main>
    </PhoneFrame>
  )
}