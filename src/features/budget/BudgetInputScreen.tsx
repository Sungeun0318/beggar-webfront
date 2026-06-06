import { Edit3, Info, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { AppHeaderTitled } from "../../components/AppHeader"
import { ParticipantTile } from "../../components/ParticipantTile"
import { PhoneFrame } from "../../components/PhoneFrame"
import { PrimaryButton } from "../../components/PrimaryButton"
import { SectionTitle } from "../../components/SectionTitle"
import { submitBudget } from "../../lib/api/budget"
import { getRoom, getRoomMembers } from "../../lib/api/rooms"
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
      const [roomData, membersData] = await Promise.all([
        getRoom(targetRoomNo),
        getRoomMembers(targetRoomNo),
      ])
      setRoom(roomData)
      setRoomMembers(membersData)
      setSubmittedCount(membersData.filter(m => m.budgetSubmitted).length)
    } catch (err) {
      console.error("?°ì´??ë¡œë”© ?¤íŒ¨:", err)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    loadRoomState()

    wsClient.connect(() => {
      // 1. ë©¤ë²„ ëª©ë¡ ?°ì´?¸ìš© (ë©¤ë²„ê° ?œì¶œ?˜ë©´ ë©¤ë²„ ?íƒœ ë³ ê²?ì²˜ë¦¬ë¥?ê°™ì´ ? ìˆ˜?ˆìŒ)
      wsClient.subscribe(`/topic/rooms/${targetRoomNo}/members`, (message) => {
        const event = JSON.parse(message.body)
        if (event.type === "MEMBERS_UPDATED") {
          setRoomMembers(event.data)
          setSubmittedCount(event.data.filter((m: any) => m.budgetSubmitted).length)
        }
      })

      // 2. ?ˆì‚° ?œì¶œ ?„í™© ê²Ã²? (?„ì œ ë©¤ë²„ ?œì¶œ ë²ˆí˜¸ë§??•ì¸)
      wsClient.subscribe(`/topic/rooms/${targetRoomNo}/budget`, (message) => {
        const event = JSON.parse(message.body)
        if (event.type === "BUDGET_SUBMITTED") {
          setSubmittedCount(event.data.submittedCount)
          // ë©¤ë²„ ëª©ë¡???¤ì‹œ ë¶µ¨Ÿ¬?? ?œì¶œ ?„ë£Œ ì²˜ë¦¬ ?•ì¸
          getRoomMembers(targetRoomNo).then(setRoomMembers)
        }
      })

      // 3. ?ˆì‚° ?•ì • ?´ë²¤??êµ¬ë™
      wsClient.subscribe(`/topic/rooms/${targetRoomNo}/state`, (message) => {
        const event = JSON.parse(message.body)
        if (event.type === "BUDGET_CONFIRMED") {
          navigate(event.data)
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
      setSubmitMessage("?ˆì‚°???œì¶œ?ì–´?? ëª¨ë“  ì¹œêµ¬ê° ?…ë ¥?˜ë©´ ê²°ê³¼ ?”ë©´?¼ë¡œ ?˜ì–´ê°??")
    } catch (error) {
      alert("?ˆì‚° ?œì¶œ???¤íŒ¨?ˆìŠµ?ˆë‹¤.")
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
        <AppHeaderTitled title="?ˆì‚° ?…ë ¥" onBack={() => navigate(-1)} />
        <section className="px-pageH pt-2">
          <div
            className="w-full p-5"
            style={softBox({ color: colors.accentBg, radius: radii.card })}
          >
            <h1 className="text-lg font-bold text-text">{room.name}</h1>
            <p className="mt-2 text-[13px] font-semibold text-sub">
              ì°¸ì—¬ ?¸ì› {roomMembers.length} / {room.maxMemberCount}ëª? ( {submittedCount}ëª??œì¶œ )
            </p>
          </div>
          <div className="h-6" />
          <SectionTitle text="???ˆì‚°???…ë ¥?´ì£¼?¸ìš”" />
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
            <span className="ml-1 text-lg font-semibold text-sub">??/span>
            <div className="flex-1" />
            <Edit3
              aria-hidden="true"
              className="shrink-0"
              size={24}
              color={colors.placeholder}
            />
          </div>
          <div className="h-7" />
          <SectionTitle text="ì°¸ì—¬???…ë ¥ ?„í™©" />
          <div className="h-3.5" />
          {roomMembers.map((member) => (
            <ParticipantTile
              key={member.name}
              name={member.name}
              status={member.budgetSubmitted ? "?œì¶œ ?„ë£Œ" : "?…ì¥ ?„ë£Œ"}
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
              ?œìŠ¤?œì´ ê°????? ?œì¶œ ê¸ˆì•¡??ê¸°ì??¼ë¡œ
              <br />
              ?¤ëŠ˜??ì´ì˜ˆ?°ì„ ê³„ì‚°?´ìš”.
            </p>
          </div>
          <div className="h-6" />

          {submitMessage && (
            <p className="mb-3 text-center text-[13px] font-bold leading-5 text-accent">
              {submitMessage}
            </p>
          )}
          <PrimaryButton
            label={isLoading ? "?œì¶œ ì¤?.." : "?…ë ¥ ?„ë£Œ"}
            enabled={!isLoading && !hasSubmitted}
            onTap={handleSubmit}
          />
          <div style={{ height: spacing.bottomSafe }} />
        </section>
      </main>
    </PhoneFrame>
  )
}

