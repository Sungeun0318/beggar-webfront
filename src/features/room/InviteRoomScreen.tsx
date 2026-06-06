import { Check, Copy, Link, MessageCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { AppHeaderTitled } from "../../components/AppHeader"
import { InfoCard } from "../../components/InfoCard"
import { ParticipantTile } from "../../components/ParticipantTile"
import { PhoneFrame } from "../../components/PhoneFrame"
import { PrimaryButton } from "../../components/PrimaryButton"
import { SectionTitle } from "../../components/SectionTitle"
import { getRoom, getRoomMembers, startBudgetInput } from "../../lib/api/rooms"
import { wsClient } from "../../lib/websocket"
import { colors, radii, spacing } from "../../theme/tokens"
import { softBox } from "../../components/ui/softBox"
import type { Member } from "../../types"

export function InviteRoomScreen() {
  const navigate = useNavigate()
  const { roomNo } = useParams()
  const targetRoomNo = Number(roomNo) || 1
  const loginUserNo = Number(localStorage.getItem("userNo"))

  const [roomData, setRoomData] = useState({
    roomName: "Î°úÎî© Ï§?..",
    roomCode: "loading...",
    maxMemberCount: 0,
    ownerUserNo: 0,
  })
  const [roomMembers, setRoomMembers] = useState<Member[]>([])
  const [copied, setCopied] = useState(false)

  const isOwner = roomData.ownerUserNo === loginUserNo

  useEffect(() => {
    // 1. Ï¥àÍ∏∞ ?∞Ïù¥??Î°úÎî©
    Promise.all([
      getRoom(targetRoomNo).catch(() => null),
      getRoomMembers(targetRoomNo).catch(() => []),
    ]).then(([roomResponse, membersResponse]) => {
      if (roomResponse) {
        setRoomData({
          roomName: roomResponse.name,
          roomCode: roomResponse.code,
          maxMemberCount: roomResponse.maxMemberCount,
          ownerUserNo: roomResponse.ownerUserNo,
        })
      }
      if (membersResponse) {
        setRoomMembers(membersResponse)
      }
    })

    // 2. WebSocket ?∞Îèô
    wsClient.connect(() => {
      // Î©§Î≤Ñ ?ÖÏû•/?ÅÌÉú Í≤√≤? Íµ¨Îèô
      wsClient.subscribe(`/topic/rooms/${targetRoomNo}/members`, (message) => {
        const event = JSON.parse(message.body)
        if (event.type === "MEMBERS_UPDATED") {
          setRoomMembers(event.data)
        }
      })

      // Î∞??ÅÌÉú Î≥ Í≤?Íµ¨Îèô (?àÏÇ∞ ?ÖÎ†• ?úÏûë ??
      wsClient.subscribe(`/topic/rooms/${targetRoomNo}/state`, (message) => {
        const event = JSON.parse(message.body)
        if (event.type === "BUDGET_INPUT_STARTED") {
          // ?àÏÇ∞ ?ÖÎ†• ?îÎ©¥?ºÎ°ú ?êÎèô ?¥Îèô
          navigate(event.data)
        }
      })
    })

    return () => {
      wsClient.disconnect()
    }
  }, [targetRoomNo, navigate])

  const invitePath = `/join/${roomData.roomCode}`
  const inviteUrl =
    roomData.roomCode === "loading..."
      ? "Ï¥àÎ? ÎßÅÌÅ¨ ?ùÏÑ± Ï§?.."
      : `${window.location.origin}${invitePath}`
  const canCopy = roomData.roomCode !== "loading..."

  const copyInviteUrl = async () => {
    if (!canCopy) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback
      const textarea = document.createElement("textarea")
      textarea.value = inviteUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
  }

  const handleStartBudget = async () => {
    try {
      await startBudgetInput(targetRoomNo)
      // ?±Í≥µ ??WebSocket ?¥Î≤§?∏Î°ú ?êÎèô ?¥Îèô?òÎ?Î°?Î≥ÑÎèÑ navigate ??
    } catch (err) {
      alert(err instanceof Error ? err.message : "?àÏÇ∞ ?ÖÎ†• ?úÏûë?? ?§Ìå®?àÏäµ?àÎã§.")
    }
  }

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled title="ÏπúÍµ¨ Ï¥àÎ?" onBack={() => navigate(-1)} />
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
                  ?ïÏõê {roomData.maxMemberCount}Î™?
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
                  >
                    {copied ? (
                      <Check aria-hidden="true" size={18} color={colors.accent} />
                    ) : (
                      <Copy aria-hidden="true" size={18} color={colors.accent} />
                    )}
                  </button>
                </div>
                <p className="mt-2 h-4 text-[11px] font-bold text-accent">
                  {copied ? "Ï¥àÎ? ÎßÅÌÅ¨Î•?Î≥µÏÇ¨?àÏñ¥??" : ""}
                </p>
              </div>
            </div>
            <div className="h-6" />
            <div className="w-full">
              <SectionTitle text="?ÖÏû• ?ÑÌô©" />
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
              title="Ïπ¥ÌÜ° ÎßÅÌÅ¨ Í≥µÏú†Îß??¨Ïö©?¥Ïöî"
              body="Ï±ÑÌåÖ ?ÜÏù¥ Ï¥àÎ?? ?àÏÇ∞ ?úÏ∂ú ?≤°?åÎßå ?ïÏù∏?¥Ïöî."
            />
            <div className="h-6" />
            {isOwner && (
              <PrimaryButton
                label="?àÏÇ∞ ?ÖÎ†• ?úÏûë"
                onTap={handleStartBudget}
              />
            )}
            <div style={{ height: spacing.bottomSafe }} />
          </div>
        </section>
      </main>
    </PhoneFrame>
  )
}

