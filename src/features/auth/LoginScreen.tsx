import { AtSign, Cake, KeyRound, Users, type LucideIcon } from 'lucide-react'
import { type KeyboardEvent, type ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { softBox } from '../../components/ui/softBox'
import { login, loginWithKakaoCode } from '../../lib/api/auth'
import {
  authorizeWithKakao,
  consumeKakaoCode,
  getKakaoRedirectUri,
} from '../../lib/kakao'
import { colors, radii } from '../../theme/tokens'

type AuthTextFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: 'email' | 'password' | 'text'
  Icon: LucideIcon
}

function fieldStyle() {
  return {
    backgroundColor: colors.bg,
    borderRadius: radii.compact,
  }
}

function AuthTextField({
  value,
  onChange,
  placeholder,
  type = 'text',
  Icon,
}: AuthTextFieldProps) {
  return (
    <label className="flex h-14 items-center px-4" style={fieldStyle()}>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
        style={{
          backgroundColor: colors.accentBg,
          borderColor: colors.border,
        }}
      >
        <Icon aria-hidden="true" size={18} color={colors.accent} strokeWidth={2.4} />
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        className="ml-3 min-w-0 flex-1 bg-transparent text-base font-semibold text-text outline-none placeholder:text-placeholder"
      />
    </label>
  )
}

function AuthSelect({
  value,
  onChange,
  placeholder,
  Icon,
  children,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  Icon: LucideIcon
  children: ReactNode
}) {
  return (
    <label className="flex h-14 items-center px-4" style={fieldStyle()}>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
        style={{
          backgroundColor: colors.accentBg,
          borderColor: colors.border,
        }}
      >
        <Icon aria-hidden="true" size={18} color={colors.accent} strokeWidth={2.4} />
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="ml-3 min-w-0 flex-1 appearance-none bg-transparent text-base font-semibold text-text outline-none"
        style={{ color: value ? colors.text : colors.placeholder }}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
    </label>
  )
}

export function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isKakaoSubmitting, setIsKakaoSubmitting] = useState(false)
  const [pendingKakaoCode, setPendingKakaoCode] = useState<string | null>(null)
  const [kakaoEmail, setKakaoEmail] = useState('')
  const [kakaoGender, setKakaoGender] = useState('')
  const [kakaoAge, setKakaoAge] = useState('')

  const canSubmit = email.trim().length > 0 && password.trim().length > 0
  const kakaoAgeNumber = Number(kakaoAge)
  const canSubmitKakaoProfile =
    kakaoEmail.trim().length > 0 &&
    kakaoGender.length > 0 &&
    Number.isInteger(kakaoAgeNumber) &&
    kakaoAgeNumber >= 0 &&
    kakaoAgeNumber <= 120

  const navigateAfterLogin = () => {
    const pendingPath = localStorage.getItem('pendingPath')
    if (pendingPath) {
      localStorage.removeItem('pendingPath')
      navigate(pendingPath)
      return
    }
    navigate('/home')
  }

  const submitOnEnter = (
    event: KeyboardEvent<HTMLFormElement>,
    submit: () => void | Promise<void>,
  ) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return

    event.preventDefault()
    void submit()
  }

  useEffect(() => {
    const code = consumeKakaoCode()
    if (!code) return

    setErrorMessage('')
    setPendingKakaoCode(code)
  }, [])

  const submitLogin = async () => {
    if (!canSubmit || isSubmitting) return

    setErrorMessage('')
    setIsSubmitting(true)
    try {
      await login({ email: email.trim(), password })
      navigateAfterLogin()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '로그인에 실패했어요. 다시 시도해 주세요.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitKakaoLogin = async () => {
    if (isKakaoSubmitting) return

    setErrorMessage('')
    setIsKakaoSubmitting(true)
    try {
      await authorizeWithKakao()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '카카오 로그인에 실패했어요. 다시 시도해 주세요.',
      )
      setIsKakaoSubmitting(false)
    }
  }

  const submitKakaoProfile = async () => {
    if (!pendingKakaoCode || !canSubmitKakaoProfile || isKakaoSubmitting) return

    setErrorMessage('')
    setIsKakaoSubmitting(true)
    try {
      await loginWithKakaoCode(pendingKakaoCode, getKakaoRedirectUri(), {
        email: kakaoEmail.trim(),
        gender: Number(kakaoGender),
        age: kakaoAgeNumber,
      })
      setPendingKakaoCode(null)
      navigateAfterLogin()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '카카오 로그인에 실패했어요. 다시 시도해 주세요.',
      )
    } finally {
      setIsKakaoSubmitting(false)
    }
  }

  return (
    <PhoneFrame>
      <main className="flex min-h-[100dvh] flex-col bg-bg px-pageH pb-6 pt-[72px]">
        <section>
          <div className="flex justify-center">
            <img
              src="/assets/images/figma/logo.png"
              alt=""
              className="h-[104px] w-[104px] object-contain"
            />
          </div>
          <h1
            className="mt-[30px] text-3xl font-extrabold text-text"
            style={{ letterSpacing: -0.8 }}
          >
            거지 우정 수호대
          </h1>
          <p className="mt-3 text-[15px] font-semibold leading-[1.5] text-sub">
            친구의 자존심을 지키는 익명 예산 조율
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void submitLogin()
            }}
            onKeyDown={(event) => submitOnEnter(event, submitLogin)}
            className="mt-[34px] p-4"
            style={softBox({ radius: radii.card })}
          >
            <h2 className="text-[15px] font-extrabold text-text">일반 로그인</h2>
            <div className="h-3" />
            <AuthTextField
              value={email}
              onChange={setEmail}
              placeholder="이메일"
              type="email"
              Icon={AtSign}
            />
            <div className="h-2.5" />
            <AuthTextField
              value={password}
              onChange={setPassword}
              placeholder="비밀번호"
              type="password"
              Icon={KeyRound}
            />
            {errorMessage && !pendingKakaoCode && (
              <p className="mt-2 text-[12px] font-semibold leading-[1.4] text-danger">
                {errorMessage}
              </p>
            )}
            <div className="h-3" />
            <PrimaryButton
              label={isSubmitting ? '로그인 중' : '로그인'}
              onTap={submitLogin}
              enabled={canSubmit && !isSubmitting}
            />
          </form>
        </section>
        <section className="mt-auto pt-8">
          <button
            type="button"
            onClick={submitKakaoLogin}
            disabled={isKakaoSubmitting}
            className="flex h-14 w-full items-center justify-center rounded-card bg-kakaoYellow text-base font-bold text-text disabled:cursor-default disabled:opacity-70"
          >
            {isKakaoSubmitting ? '카카오 로그인 중' : '카카오로 시작하기'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="mt-3.5 h-10 w-full text-sm font-extrabold text-sub"
          >
            아직 계정이 없나요? 회원가입
          </button>
        </section>

        {pendingKakaoCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void submitKakaoProfile()
              }}
              onKeyDown={(event) => submitOnEnter(event, submitKakaoProfile)}
              className="w-full max-w-[360px] p-5"
              style={softBox({ radius: radii.card })}
            >
              <h2 className="text-lg font-extrabold text-text">
                카카오 로그인 정보
              </h2>
              <p className="mt-1.5 text-[13px] font-semibold leading-[1.45] text-sub">
                추천 정확도를 위해 선택 정보를 입력해 주세요.
              </p>
              <div className="mt-4 space-y-2.5">
                <AuthTextField
                  value={kakaoEmail}
                  onChange={setKakaoEmail}
                  placeholder="이메일"
                  type="email"
                  Icon={AtSign}
                />
                <AuthSelect
                  value={kakaoGender}
                  onChange={setKakaoGender}
                  placeholder="성별"
                  Icon={Users}
                >
                  <option value="1">남성</option>
                  <option value="2">여성</option>
                </AuthSelect>
                <AuthTextField
                  value={kakaoAge}
                  onChange={(value) => setKakaoAge(value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="나이"
                  type="text"
                  Icon={Cake}
                />
              </div>
              {errorMessage && (
                <p className="mt-3 text-[12px] font-semibold leading-[1.4] text-danger">
                  {errorMessage}
                </p>
              )}
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPendingKakaoCode(null)
                    setIsKakaoSubmitting(false)
                    setErrorMessage('')
                  }}
                  className="h-[46px] flex-1 rounded-compact border border-border bg-bg text-sm font-extrabold text-sub"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!canSubmitKakaoProfile || isKakaoSubmitting}
                  className="h-[46px] flex-1 rounded-compact bg-accent text-sm font-extrabold text-white disabled:cursor-default disabled:opacity-60"
                >
                  {isKakaoSubmitting ? '저장 중' : '완료'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </PhoneFrame>
  )
}
