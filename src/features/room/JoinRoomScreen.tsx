
import { Link, LogIn } from 'lucide-react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { InfoCard } from '../../components/InfoCard'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { joinRoom } from '../../lib/api/rooms'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

export function JoinRoomScreen() {
  const navigate = useNavigate()
  const { code = '' } = useParams()
  const [roomCode, setRoomCode] = useState(code)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      localStorage.setItem('pendingPath', window.location.pathname)
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const submitJoin = async () => {
    const trimmedCode = roomCode.trim()
    if (!trimmedCode || isSubmitting) return

    setErrorMessage('')
    setIsSubmitting(true)
    try {
      const room = await joinRoom(trimmedCode)
      
      // 방 상태가 이미 예산 입력 중이라면 바로 이동, 아니면 대기실로 이동
      if (room.status === 'BUDGET_INPUT' || (room as any).roomStatus === 'BUDGET_INPUT') {
        navigate(`/budget/input/${room.no}`)
      } else {
        navigate(`/room/invite/${room.no}`)
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '초대 코드로 입장하지 못했어요.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled title="초대 코드 입장" onBack={() => navigate(-1)} />
        <section className="px-pageH pt-8">
          <div className="flex flex-col items-center">
            <div className="grid h-[92px] w-[92px] place-items-center rounded-full bg-accentBg">
              <Link aria-hidden="true" size={38} color={colors.accent} />
            </div>
            <h1 className="mt-6 text-center text-[24px] font-black text-text">
              친구가 보낸 거지방에 입장해요
            </h1>
            <p className="mt-2 text-center text-sm font-semibold leading-6 text-sub">
              초대 링크로 들어왔거나 받은 코드를 입력하면
              <br />
              바로 방에 참여할 수 있어요.
            </p>
          </div>

          <div className="h-8" />
          <label
            className="flex h-14 items-center px-5"
            style={softBox({ radius: radii.compact })}
          >
            <LogIn aria-hidden="true" size={20} color={colors.placeholder} />
            <input
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              placeholder="초대 코드 입력"
              className="ml-3 min-w-0 flex-1 bg-transparent text-base font-bold text-text outline-none placeholder:text-placeholder"
            />
          </label>

          {errorMessage && (
            <p className="mt-3 text-[13px] font-bold text-danger">
              {errorMessage}
            </p>
          )}

          <div className="h-6" />
          <InfoCard
            Icon={Link}
            title="초대 코드는 방장이 만든 링크에 포함돼요"
            body="로그인된 계정으로 입장 기록이 남아요."
          />
          <div className="h-6" />
          <PrimaryButton
            label={isSubmitting ? '입장 중...' : '거지방 입장하기'}
            enabled={roomCode.trim().length > 0 && !isSubmitting}
            onTap={submitJoin}
          />
          <div style={{ height: spacing.bottomSafe }} />
        </section>
      </main>
    </PhoneFrame>
  )
}
