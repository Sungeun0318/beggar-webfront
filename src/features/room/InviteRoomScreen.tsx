import { Check, Copy, Link, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { InfoCard } from '../../components/InfoCard'
import { ParticipantTile } from '../../components/ParticipantTile'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { SectionTitle } from '../../components/SectionTitle'
import { getRoom, getRoomMembers, startBudgetInput } from '../../lib/api/rooms'
import { wsClient } from '../../lib/websocket'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'
import type { Member } from '../../types'
import { shareRoomInvitation } from '../../lib/kakao'

export function InviteRoomScreen() {
  const navigate = useNavigate()
  const { roomNo: pathRoomNo } = useParams()
  const location = useLocation()
  
  // 🌟 URL에 방 번호가 있으면 그걸 최우선으로 사용, 없으면 로컬스토리지 사용
  const urlRoomNo = Number(pathRoomNo)
  const savedRoomNo = Number(localStorage.getItem('recentRoomNo'))
  const finalRoomNo = urlRoomNo || savedRoomNo || 1

  // 방 생성 직후 넘어온 경우, 생성 응답의 roomCode를 바로 사용
  const presetRoom = (location.state as { room?: { name?: string; code?: string; maxMemberCount?: number } } | null)?.room

  const [roomData, setRoomData] = useState({
    roomName: presetRoom?.name ?? '로딩 중...',
    roomCode: presetRoom?.code ?? 'loading...',
    maxMemberCount: presetRoom?.maxMemberCount ?? 0,
    ownerNo: 0,
  })
  const [roomMembers, setRoomMembers] = useState<Member[]>([])
  const [copied, setCopied] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const myUserNo = Number(localStorage.getItem('userNo'))

  useEffect(() => {
    console.log('🚀 백엔드 방 상세조회 호출!! 방 번호:', finalRoomNo)
    let isMounted = true

    Promise.all([
      getRoom(finalRoomNo).catch((err) => {
        console.error('방 정보 로딩 실패:', err)
        return null
      }),
      getRoomMembers(finalRoomNo).catch((err) => {
        console.error('멤버 로딩 실패:', err)
        return null
      }),
    ])
      .then(([roomResponse, membersResponse]) => {
        if (!isMounted) return
        console.log('📦 백엔드가 준 원본 방 데이터:', roomResponse)

        if (roomResponse) {
          const res = roomResponse as any
          const name = res.roomName || res.name || '새로운 거지방'
          const code = res.roomCode || res.code || 'SsWgDgaQt1FC'
          const maxCount = Number(res.maxMemberCount) || 2
          const ownerNo = res.ownerUserNo || res.ownerNo

          setRoomData({
            roomName: name,
            roomCode: code,
            maxMemberCount: maxCount,
            ownerNo,
          })

          // ✅ 데이터를 성공적으로 가져왔을 때만 로컬스토리지를 최신화합니다.
          localStorage.setItem('recentRoomNo', finalRoomNo.toString())
          localStorage.setItem('recentRoomName', name)
          localStorage.setItem('recentRoomCode', code)
          localStorage.setItem('recentMaxMember', maxCount.toString())
        }

        if (Array.isArray(membersResponse)) {
          setRoomMembers(membersResponse)
        }
      })
      .catch((err) => {
        console.error('🔥 데이터 최종 결합 실패:', err)
      })

    // 🌐 WebSocket 연결 및 구독 설정
    const subscriptions: { unsubscribe: () => void }[] = []

    wsClient.connect(() => {
      if (!isMounted) return
      console.log('✅ WebSocket Connected in InviteRoom!')

      // 1. 멤버 현황 채널 구독
      subscriptions.push(
        wsClient.subscribe(`/topic/rooms/${finalRoomNo}/members`, (msg) => {
          if (!isMounted) return
          try {
            const members = JSON.parse(msg.body)
            console.log('👥 멤버 리스트 갱신됨:', members)
            setRoomMembers(members)
          } catch (e) {
            console.error('멤버 리스트 파싱 실패:', e)
          }
        })
      )

      // 2. 방 상태 변경(이동 알림) 채널 구독
      subscriptions.push(
        wsClient.subscribe(`/topic/rooms/${finalRoomNo}/state`, (msg) => {
          if (!isMounted) return
          try {
            const event = JSON.parse(msg.body)
            console.log('🚀 방 상태 변경 감지! 이벤트:', event)

            // 1. 이벤트 타입이 BUDGET_INPUT_STARTED 인지 확인
            if (event.type === 'BUDGET_INPUT_STARTED') {
              // 2. 서버가 준 데이터(nextPath)로 이동 (예: /budget/input?roomNo=11)
              const nextPath = event.data
              if (nextPath) {
                navigate(nextPath)
              }
            }
          } catch (e) {
            console.error('WebSocket 메시지 파싱 에러:', e)
            // 폴백: 예전처럼 문자열 자체가 경로인 경우 처리 (필요시)
            if (msg.body && msg.body.startsWith('/')) {
              navigate(msg.body)
            }
          }
        })
      )
    })

    return () => {
      isMounted = false
      console.log('🔌 Unsubscribing from WebSocket...')
      subscriptions.forEach(s => s.unsubscribe())
    }
  }, [finalRoomNo, navigate])

  const isOwner = roomMembers.find(m => m.userNo === myUserNo || m.mine)?.userNo === roomData.ownerNo || 
                  roomMembers.find(m => m.userNo === myUserNo || m.mine)?.name.includes('방장')
  // 모든 인원이 모여야 시작할 수 있도록 변경
  const isFull = roomMembers.length >= roomData.maxMemberCount
  const canStart = isFull && !isStarting

  const handleStartBudget = async () => {
    if (!canStart) {
      if (!isFull && !isStarting) {
        alert(`모든 인원(${roomData.maxMemberCount}명)이 모여야 시작할 수 있습니다.`)
      }
      return
    }

    setIsStarting(true)
    try {
      await startBudgetInput(finalRoomNo)
      // 💡 방장은 API 성공 시 바로 이동합니다 (WebSocket을 기다리지 않고)
      // 멤버들은 WebSocket 이벤트를 받고 이동하게 됩니다.
      navigate(`/budget/input/${finalRoomNo}`)
    } catch (err: any) {
      console.error('🔥 예산 입력 시작 실패:', err)
      
      // 이미 시작된 경우라면 그냥 이동시켜 줍니다.
      if (err.status === 400 && err.message?.includes('이미 예산')) {
        navigate(`/budget/input/${finalRoomNo}`)
        return
      }

      alert('예산 입력을 시작하지 못했습니다. 다시 시도해 주세요.')
    } finally {
      setIsStarting(false)
    }
  }

  const invitePath = `/join/${roomData.roomCode}`
  const inviteUrl =
    roomData.roomCode === 'loading...'
      ? '초대 링크 생성 중...'
      : `${window.location.origin}${invitePath}`
  const canCopy = roomData.roomCode !== 'loading...'

  const handleKakaoShare = async () => {
    if (!canCopy) return
    try {
      await shareRoomInvitation({
        roomName: roomData.roomName,
        roomCode: roomData.roomCode,
        inviteUrl,
      })
    } catch (err) {
      console.error('카카오 공유 실패:', err)
    }
  }

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

                <button
                  type="button"
                  onClick={handleKakaoShare}
                  disabled={!canCopy}
                  className="mt-2 flex h-[54px] w-full items-center justify-center rounded-compact bg-[#FEE500] text-sm font-bold text-[#3C1E1E] transition-opacity active:opacity-80 disabled:opacity-40"
                >
                  <MessageCircle className="mr-2 fill-[#3C1E1E]" size={20} />
                  카카오톡으로 초대장 보내기
                </button>
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
            
            {isOwner ? (
              <PrimaryButton
                label="예산 입력 시작"
                onTap={handleStartBudget}
                enabled={canStart}
              />
            ) : (
              <div className="w-full py-4 text-center bg-gray-100 rounded-compact">
                <p className="text-sm font-bold text-sub">
                  방장이 예산 입력을 시작할 때까지 기다려 주세요.
                </p>
              </div>
            )}
            
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
