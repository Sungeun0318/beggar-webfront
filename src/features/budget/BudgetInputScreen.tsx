import { Edit3, Info, Loader2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { AppHeaderTitled } from "../../components/AppHeader"
import { ParticipantTile } from "../../components/ParticipantTile"
import { PhoneFrame } from "../../components/PhoneFrame"
import { PrimaryButton } from "../../components/PrimaryButton"
import { SectionTitle } from "../../components/SectionTitle"
import { confirmBudget, getBudgetResult, submitBudget } from "../../lib/api/budget"
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
  const resultNavigationStartedRef = useRef(false)

  const goToResult = useCallback(() => {
    navigate(`/budget/result/${targetRoomNo}`)
  }, [navigate, targetRoomNo])

  const goToResultIfReady = useCallback(async () => {
    if (resultNavigationStartedRef.current) {
      return true
    }

    try {
      await getBudgetResult(targetRoomNo)
      resultNavigationStartedRef.current = true
      goToResult()
      return true
    } catch (firstError) {
      try {
        await confirmBudget(targetRoomNo)
        await getBudgetResult(targetRoomNo)
        resultNavigationStartedRef.current = true
        goToResult()
        return true
      } catch (secondError) {
        console.error("예산 결과 확정/조회 실패:", {
          firstError,
          secondError,
        })
        return false
      }
    }
  }, [goToResult, targetRoomNo])

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
      if (
        membersData.length > 0 &&
        membersData.every((member) => member.budgetSubmitted)
      ) {
        void goToResultIfReady()
      }

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

  const refreshBudgetProgress = useCallback(async () => {
    const membersData = await getRoomMembers(targetRoomNo)
    setRoomMembers(membersData)

    const nextSubmittedCount = membersData.filter((member) => member.budgetSubmitted).length
    setSubmittedCount(nextSubmittedCount)

    if (membersData.length > 0 && nextSubmittedCount >= membersData.length) {
      return goToResultIfReady()
    }

    return false
  }, [goToResultIfReady, targetRoomNo])

  const markMemberBudgetSubmitted = useCallback((submittedUserNo?: number) => {
    if (!submittedUserNo) {
      return
    }

    setRoomMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.userNo === submittedUserNo
          ? { ...member, status: "제출 완료", budgetSubmitted: true }
          : member,
      ),
    )
  }, [])

  useEffect(() => {
    loadRoomState()

    wsClient.connect().then(() => {
      const handleRoomEvent = async (event: any) => {
        if (event.type === "MEMBERS_UPDATED") {
          setRoomMembers(event.data)
          setSubmittedCount(event.data.filter((m: any) => m.budgetSubmitted).length)
          return
        }

        if (event.type === "BUDGET_SUBMITTED") {
          const nextSubmittedCount = Number(event.data?.submittedCount) || 0
          const nextMemberCount = Number(event.data?.memberCount) || 0
          const submittedUserNo = Number(event.data?.userNo) || undefined

          markMemberBudgetSubmitted(submittedUserNo)
          setSubmittedCount(nextSubmittedCount)
          window.setTimeout(() => {
            getRoomMembers(targetRoomNo).then(setRoomMembers)
          }, 500)

          if (nextMemberCount > 0 && nextSubmittedCount >= nextMemberCount) {
            await goToResultIfReady()
          }
          return
        }

        if (event.type === "BUDGET_CONFIRMED") {
          goToResult()
        }
      }

      // 백엔드는 모든 방 이벤트를 /topic/rooms/{roomNo} 단일 채널로 발행한다.
      wsClient.subscribe(`/topic/rooms/${targetRoomNo}`, (message) => {
        void handleRoomEvent(JSON.parse(message.body))
      })

      // 1. 멤버 목록 실시간 반영
      wsClient.subscribe(`/topic/rooms/${targetRoomNo}/members`, (message) => {
        const event = JSON.parse(message.body)
        if (event.type === "MEMBERS_UPDATED") {
          setRoomMembers(event.data)
          setSubmittedCount(event.data.filter((m: any) => m.budgetSubmitted).length)
        }
      })

      // 2. 예산 제출 상황 동기화 (budget 토픽)
      wsClient.subscribe(`/topic/rooms/${targetRoomNo}/budget`, (message) => {
        const event = JSON.parse(message.body)
        if (event.type === "BUDGET_SUBMITTED") {
          const submittedUserNo = Number(event.data?.userNo) || undefined
          markMemberBudgetSubmitted(submittedUserNo)
          setSubmittedCount(event.data.submittedCount)
          window.setTimeout(() => {
            getRoomMembers(targetRoomNo).then(setRoomMembers)
          }, 500)
          if (event.data.memberCount > 0 && event.data.submittedCount >= event.data.memberCount) {
            void goToResultIfReady()
          }
        } else if (event.type === "BUDGET_CONFIRMED") {
          // 예산 토픽으로 확정 이벤트가 오는 경우 대응
          goToResult()
        }
      })

      // 3. 예산 확정 및 방 상태 변경 이벤트 구동 (state 토픽)
      wsClient.subscribe(`/topic/rooms/${targetRoomNo}/state`, (message) => {
        const event = JSON.parse(message.body)
        
        // BUDGET_CONFIRMED 타입이거나 STATE_CHANGED를 통한 상태 변화 감지
        const isConfirmed = event.type === "BUDGET_CONFIRMED"
        const isCompletedState = 
          event.type === "STATE_CHANGED" && 
          (event.data === "BUDGET_COMPLETED" || event.data?.state === "COMPLETED")

        if (isConfirmed || isCompletedState) {
          goToResult()
        }
      })
    })

    return () => {
      wsClient.disconnect()
    }
  }, [targetRoomNo, navigate, goToResult, goToResultIfReady, markMemberBudgetSubmitted])

  useEffect(() => {
    if (!hasSubmitted || resultNavigationStartedRef.current) {
      return
    }

    let stopped = false
    let isPolling = false

    const pollBudgetProgress = async () => {
      if (isPolling || stopped || resultNavigationStartedRef.current) {
        return
      }

      isPolling = true
      try {
        const moved = await refreshBudgetProgress()
        if (moved) {
          stopped = true
        }
      } catch (error) {
        console.error("예산 제출 상태 동기화 실패:", error)
      } finally {
        isPolling = false
      }
    }

    void pollBudgetProgress()
    const timer = window.setInterval(pollBudgetProgress, 2000)

    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [hasSubmitted, refreshBudgetProgress])

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
      const moved = await refreshBudgetProgress()
      if (!moved) {
        setSubmitMessage("예산이 제출되었어요! 모든 친구가 입력하면 결과 화면으로 넘어갑니다.")
      }
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
              key={member.userNo ?? member.name}
              name={member.name}
              status={member.budgetSubmitted || member.status === "제출 완료" ? "제출 완료" : "입장 완료"}
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
