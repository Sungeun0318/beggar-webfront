import {
  Check,
  Crown,
  Loader2,
  PartyPopper,
  RotateCw,
  Share2,
  Trophy,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { getRoom, getRoomMembers, startRoulette } from '../../lib/api/rooms'
import { money } from '../../lib/format'
import { members as mockMembers, room as mockRoom } from '../../mocks'
import { colors, radii } from '../../theme/tokens'
import type { Member, Room, RouletteResult } from '../../types'

const segmentColors = [
  '#FFF0A6',
  '#FFD45C',
  '#E2AA2F',
  '#B97922',
  '#F6C04D',
  '#C88D2D',
  '#8F5B20',
  '#D99A36',
]

function Wheel({
  members,
  spinning,
  result,
}: {
  members: Member[]
  spinning: boolean
  result: RouletteResult | null
}) {
  const slices = Math.max(members.length, 1)
  const background = members.length
    ? `conic-gradient(${members
        .map((_, index) => {
          const start = (index / slices) * 360
          const end = ((index + 1) / slices) * 360
          return `${segmentColors[index % segmentColors.length]} ${start}deg ${end}deg`
        })
        .join(', ')})`
    : colors.border
  const winnerIndex = result
    ? Math.max(
        0,
        members.findIndex(
          member => member.userNo === result.winnerUserNo || member.name === result.winnerNickname,
        ),
      )
    : 0
  const sliceAngle = 360 / slices
  const winnerCenterAngle = (winnerIndex + 0.5) * sliceAngle
  const rotation = result ? 360 * 5 - winnerCenterAngle : 0
  const labelRadius = slices <= 2 ? 74 : slices <= 4 ? 86 : 96

  return (
    <div className="relative mx-auto h-[276px] w-[276px]">
      <style>
        {`
          @keyframes rouletteMarkerTick {
            0%, 100% { transform: rotate(0deg) translateY(0); }
            45% { transform: rotate(-12deg) translateY(2px); }
            70% { transform: rotate(9deg) translateY(-1px); }
          }
        `}
      </style>
      <div className="absolute left-1/2 top-[-13px] z-20 h-12 w-12 -translate-x-1/2 rounded-full bg-[#FFF4BF] blur-xl opacity-90" />
      <div className="absolute left-1/2 top-[-2px] z-30 -translate-x-1/2">
        <div
          className="h-0 w-0 border-x-[13px] border-t-[24px] border-x-transparent border-t-[#F6D365] drop-shadow-[0_0_14px_rgba(246,211,101,0.95)]"
          style={{
            animation: spinning ? 'rouletteMarkerTick 120ms steps(2, end) infinite' : undefined,
            transformOrigin: '50% 2px',
          }}
        />
      </div>
      <div
        className="absolute inset-0 overflow-hidden rounded-full border-[10px] border-[#FFF4CF] shadow-[0_18px_35px_rgba(80,60,30,0.18),0_0_34px_rgba(212,175,55,0.28)] transition-transform duration-[2800ms] ease-out"
        style={{
          background,
          transform: `rotate(${spinning ? 1440 : rotation}deg)`,
          transitionTimingFunction: spinning ? 'linear' : 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.36)_0,rgba(255,255,255,0.16)_24%,rgba(92,49,18,0.18)_72%,rgba(61,34,16,0.34)_100%)]" />
        <div className="pointer-events-none absolute inset-[18px] rounded-full border border-white/25" />
        {members.map((member, index) => {
          const angle = (index + 0.5) * sliceAngle
          const angleRad = (angle * Math.PI) / 180
          const x = Math.sin(angleRad) * labelRadius
          const y = -Math.cos(angleRad) * labelRadius
          const label = member.mine ? '나' : member.name
          const isWinner =
            result && (member.userNo === result.winnerUserNo || member.name === result.winnerNickname)

          return (
            <div
              key={`${member.userNo ?? index}-${member.name}`}
              className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            >
              <span
                className={`block h-[26px] max-w-[82px] truncate rounded-full bg-white/92 px-2 text-center text-[11px] font-black leading-[26px] shadow-[0_2px_8px_rgba(72,42,12,0.16)] ${
                  isWinner ? 'text-[#6E4A12] ring-2 ring-[#FFF3A6] shadow-[0_0_14px_rgba(255,246,190,0.95)]' : 'text-text'
                }`}
                title={label}
                style={{
                  minWidth: slices <= 2 ? 54 : 42,
                  width: slices <= 4 ? 72 : 62,
                  textShadow: '0 1px 0 rgba(255,255,255,0.55)',
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="absolute left-1/2 top-1/2 z-10 h-[116px] w-[116px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F7D86A] blur-2xl opacity-70" />
      <div className="absolute left-1/2 top-1/2 z-20 grid h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full bg-white text-center text-white shadow-[0_0_24px_rgba(247,216,106,0.72),0_12px_22px_rgba(44,36,27,0.35)]">
        {spinning ? (
          <RotateCw className="animate-spin" size={28} />
        ) : (
          <img
            src="/assets/images/figma/logo-yellow-ring.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  )
}

function MemberRow({
  member,
  ownerNo,
  winnerUserNo,
}: {
  member: Member
  ownerNo?: number
  winnerUserNo?: number
}) {
  const isOwner = ownerNo !== undefined && member.userNo === ownerNo
  const isWinner = winnerUserNo !== undefined && member.userNo === winnerUserNo

  return (
    <div className={`flex h-[54px] items-center rounded-card border px-4 ${isWinner ? 'border-[#FFF0A8] bg-[#FFFDF2] shadow-[0_0_18px_rgba(255,242,160,0.62)]' : 'border-border bg-white'}`}>
      <div className={`grid h-8 w-8 place-items-center rounded-full ${isWinner ? 'border border-[#FFF0A8] bg-[#FFF9D8] text-[#A87812] shadow-[0_0_14px_rgba(255,240,168,0.9)]' : 'bg-accentBg text-accent'}`}>
        {isWinner ? <Trophy size={17} /> : isOwner ? <Crown size={17} /> : <Check size={17} />}
      </div>
      <div className="ml-3 min-w-0 flex-1">
        <p className="truncate text-[15px] font-black text-text">
          {member.mine ? `${member.name} · 나` : member.name}
        </p>
        <p className="text-[11px] font-bold text-sub">
          {isOwner ? '방장' : member.budgetSubmitted ? '제출 완료' : member.status || '입장 완료'}
        </p>
      </div>
      {isWinner && <span className="rounded-full border border-[#FFEAA0] bg-[#FFFBE6] px-3 py-1 text-[11px] font-black text-[#8A6415] shadow-[0_0_12px_rgba(255,239,168,0.72)]">당첨</span>}
    </div>
  )
}

export function RouletteScreen() {
  const navigate = useNavigate()
  const { roomNo: pathRoomNo } = useParams()
  const [searchParams] = useSearchParams()
  const roomNo = Number(pathRoomNo || searchParams.get('roomNo') || mockRoom.no)

  const [room, setRoom] = useState<Room | null>(null)
  const [memberList, setMemberList] = useState<Member[]>([])
  const [result, setResult] = useState<RouletteResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [roomData, membersData] = await Promise.all([
          getRoom(roomNo).catch(() => mockRoom),
          getRoomMembers(roomNo).catch(() => mockMembers),
        ])
        setRoom(roomData)
        setMemberList(membersData.length ? membersData : mockMembers)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [roomNo])

  const displayRoom = room || mockRoom
  const userNo = Number(localStorage.getItem('userNo'))
  const isOwner =
    userNo === displayRoom.ownerNo ||
    memberList.some(member => member.mine && (!member.userNo || member.userNo === displayRoom.ownerNo))
  const remainingBudget = result?.remainingBudget ?? Math.max((displayRoom.budget || 60000) - (displayRoom.spent || 35500), 0)
  const wheelMembers = useMemo(
    () => (result?.allMembers?.length ? result.allMembers : memberList),
    [memberList, result],
  )
  const canRun = isOwner && !spinning && !result

  const handleRunRoulette = async () => {
    if (!canRun) return

    setError(null)
    setSpinning(true)
    try {
      const rouletteResult = await startRoulette(roomNo)
      window.setTimeout(() => {
        setResult(rouletteResult)
        setMemberList(rouletteResult.allMembers?.length ? rouletteResult.allMembers : memberList)
        setSpinning(false)
      }, 900)
    } catch (err: any) {
      setSpinning(false)
      setError(err?.message || '룰렛을 돌리지 못했어요.')
    }
  }

  const handleShare = async () => {
    if (!result) return

    const text = `오늘의 거지 당첨: ${result.winnerNickname}, 남은 예산 ${money(result.remainingBudget)}원`
    if (navigator.share) {
      await navigator.share({ text }).catch(() => undefined)
      return
    }

    await navigator.clipboard?.writeText(text).catch(() => undefined)
    alert('결과를 클립보드에 복사했어요.')
  }

  if (loading) {
    return (
      <PhoneFrame>
        <main className="flex min-h-[852px] items-center justify-center bg-bg">
          <Loader2 className="animate-spin" size={48} color={colors.accent} />
        </main>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled title="거지룰렛" onBack={() => navigate(`/room/${roomNo}`)} />
        <section className="px-pageH pb-10 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[21px] font-black text-text">{displayRoom.name}</p>
              <p className="mt-1 text-xs font-bold text-sub">정산 종료 · 룰렛 가능</p>
            </div>
            <div className="shrink-0 rounded-full bg-[#FFF1EA] px-3 py-2 text-[12px] font-black text-danger">
              {isOwner ? '방장 권한' : '관전 모드'}
            </div>
          </div>

          <div className="mt-5 rounded-[28px] border border-border bg-white px-5 py-5 shadow-[0_14px_30px_rgba(80,60,30,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-bold text-sub">남은 예산</p>
                <p className="mt-1 text-[36px] font-black text-text">{money(remainingBudget)}원</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-accentBg text-accent">
                <PartyPopper size={24} />
              </div>
            </div>
            <div className="mt-5">
              <Wheel members={wheelMembers} spinning={spinning} result={result} />
            </div>
            <p className="mt-5 text-center text-[13px] font-bold text-sub">
              {spinning ? '거지 선정 중...' : result ? '룰렛이 멈췄어요' : '포인터가 가리키는 멤버가 남은 예산을 가져갑니다'}
            </p>
          </div>

          {result && (
            <div
              className="mt-4 overflow-hidden border-2 border-[#FFF0A8] bg-white p-5 text-center shadow-[0_0_28px_rgba(255,239,168,0.82),0_14px_28px_rgba(169,122,28,0.10)] ring-1 ring-[#FFFBE6]"
              style={{ borderRadius: radii.hero }}
            >
              <div className="mx-auto grid h-[52px] w-[52px] place-items-center rounded-full border border-[#FFF0A8] bg-white text-[#A87812] shadow-[0_0_12px_rgba(255,240,168,0.72)]">
                <Trophy size={26} />
              </div>
              <p className="mt-3 text-[13px] font-black text-[#8A6415]">오늘의 거지 당첨</p>
              <p className="mt-1 text-[30px] font-black text-text">{result.winnerNickname}</p>
              <p className="mt-2 text-sm font-bold text-sub">
                남은 예산 {money(result.remainingBudget)}원을 가져갑니다
              </p>
              <button
                type="button"
                onClick={handleShare}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-card border border-[#FFEAA0] bg-white px-5 text-[13px] font-black text-[#8A6415] shadow-[0_0_12px_rgba(255,239,168,0.46)]"
              >
                <Share2 className="mr-2" size={16} />
                공유하기
              </button>
            </div>
          )}

          <div className="mt-5 flex items-center">
            <Users size={18} color={colors.text} />
            <h2 className="ml-2 text-[18px] font-black text-text">참여자</h2>
            <div className="flex-1" />
            <span className="text-xs font-bold text-sub">{wheelMembers.length}명</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {wheelMembers.map((member, index) => (
              <MemberRow
                key={`${member.userNo ?? index}-${member.name}`}
                member={member}
                ownerNo={displayRoom.ownerNo}
                winnerUserNo={result?.winnerUserNo}
              />
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-card border border-danger bg-[#FFF1EA] px-4 py-3 text-sm font-bold text-danger">
              {error}
            </div>
          )}

          <div className="mt-6">
            <PrimaryButton
              label={spinning ? '룰렛 돌리는 중' : result ? '룰렛 완료' : isOwner ? '룰렛 돌리기' : '방장만 룰렛을 돌릴 수 있어요'}
              enabled={canRun}
              onTap={handleRunRoulette}
            />
          </div>
        </section>
      </main>
    </PhoneFrame>
  )
}
