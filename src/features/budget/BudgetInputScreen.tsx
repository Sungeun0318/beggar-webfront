import { Edit3, Info, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { AppHeaderTitled } from "../../components/AppHeader"
import { ParticipantTile } from "../../components/ParticipantTile"
import { PhoneFrame } from "../../components/PhoneFrame"
import { PrimaryButton } from "../../components/PrimaryButton"
import { SectionTitle } from "../../components/SectionTitle"
import { submitBudget } from "../../lib/api/budget"
import { getMyBudget, getRoom, getRoomMembers } from "../../lib/api/rooms"
import { wsClient } from "../../lib/websocket"
import { money } from "../../lib/format"
import { colors, radii, spacing } from "../../theme/tokens"
import { softBox } from "../../components/ui/softBox"
import type { Member, Room } from "../../types"

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
  const [submitMessage, setSubmitMessage] = useState("")
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submittedCount, setSubmittedCount] = useState(0)

  const loadRoomState = async () => {
    try {
      const [roomData, membersData, myBudgetData] = await Promise.all([
        getRoom(targetRoomNo),
        getRoomMembers(targetRoomNo),
        getMyBudget(targetRoomNo).catch(() => null),
      ])
      setRoom(roomData)
      setRoomMembers(membersData)
      setSubmittedCount(membersData.filter(m => m.budgetSubmitted).length)

      // 기존에 입력한 예산이 있다면 불러오기
      const budgetValue = myBudgetData?.budgetAmount ?? myBudgetData?.amount
      if (myBudgetData && budgetValue) {
        setAmount(budgetValue)
        setDraftAmount(String(budgetValue))
        setHasSubmitted(true)
        setSubmitMessage("이미 예산을 제출하셨습니다. 모든 친구가 입력하면 결과 화면으로 넘어갑니다.")
      }
    } catch (err) {
      console.error("데이터 로딩 실패:", err)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    loadRoomState()

    wsClient.connect(() => {
      // 결과 화면으로 이동하는 공통 함수
      const goToResult = (url?: string) => {
        if (url && url.includes("?roomNo=")) {
          const rNo = url.split("?roomNo=")[1]
          navigate(`/budget/result/${rNo}`)
        } else {
          navigate(`/budget/result/${targetRoomNo}`)
        }
      }

      // 단일 채널 구독으로 통합: /topic/rooms/{roomNo}
      wsClient.subscribe(`/topic/rooms/${targetRoomNo}`, (message) => {
        const event = JSON.parse(message.body)
        console.log("📨 WebSocket 메시지 수신:", event.type, event)

        switch (event.type) {
          case "MEMBERS_UPDATED":
            setRoomMembers(event.data)
            setSubmittedCount(event.data.filter((m: any) => m.budgetSubmitted).length)
            break

          case "BUDGET_SUBMITTED":
            setSubmittedCount(event.data.submittedCount)
            // 멤버 목록을 다시 불러와 제출 완료 처리 확인 (또는 event.data.members가 있다면 그걸 사용 가능)
            getRoomMembers(targetRoomNo).then(setRoomMembers)
            break

          case "BUDGET_CONFIRMED":
            console.log("✅ 예산 확정됨! 결과 화면으로 이동")
            goToResult(event.data)
            break

          case "STATE_CHANGED":
            if (event.data === "BUDGET_COMPLETED" || event.data?.state === "COMPLETED") {
              goToResult()
            }
            break

          default:
            console.log("ℹ️ 처리되지 않은 이벤트 타입:", event.type)
        }
      })
    })

    return () => {
      wsClient.disconnect()
    }
  }, [targetRoomNo, navigate])

  const startEditing = () => {
    setDraftAmount(String(amount))
    setIsEditing(true)
  }

  const commitAmount = () => {
    const nextAmount = Number(draftAmount.replace(/\D/g, ""))
    setAmount(Number.isFinite(nextAmount) ? nextAmount : amount)
    setIsEditing(false)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setSubmitMessage("")
    try {
      await submitBudget(targetRoomNo, amount)
      setHasSubmitted(true)
      setSubmitMessage("예산이 제출되었어요! 모든 친구가 입력하면 결과 화면으로 넘어갑니다.")
    } catch (error) {
      alert("예산 제출에 실패했습니다.")
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
              참여 인원 {roomMembers.length} / {room.maxMemberCount}명 ( {submittedCount}명 제출 )
            </p>
          </div>
          <div className="h-6" />
          <SectionTitle text="개인 예산을 입력해주세요" />
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
                  setDraftAmount(event.target.value.replace(/\D/g, ""))
                }}
                onBlur={commitAmount}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitAmount()
                  if (event.key === "Escape") setIsEditing(false)
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
              status={member.budgetSubmitted ? "제출 완료" : "입장 완료"}
              active={member.mine}
            />
          ))}
          <div className="h-[18px]" />
          <div className="flex items-start">
            <div className="mt-0.5 shrink-0">
              <Info
                aria-hidden="true"
                size={18}
                color={colors.accent}
              />
            </div>
            <p className="ml-2 text-[13px] font-semibold leading-[1.5] text-sub">
              호스트가 설정한 제출 금액을 기준으로
              <br />
              오늘의 총 예산을 계산해요.
            </p>
          </div>
          <div className="h-6" />

          {submitMessage && (
            <p className="mb-3 text-center text-[13px] font-bold leading-5 text-accent">
              {submitMessage}
            </p>
          )}
          <PrimaryButton
            label={isLoading ? "제출 중.." : "입력 완료"}
            enabled={!isLoading && !hasSubmitted}
            onTap={handleSubmit}
          />
          <div style={{ height: spacing.bottomSafe }} />
        </section>
      </main>
    </PhoneFrame>
  )
}
