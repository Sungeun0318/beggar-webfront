import { Cake, Lock, Mail, Users } from 'lucide-react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { login, loginWithKakaoCode } from '../../lib/api/auth'
import {
  authorizeWithKakao,
  consumeKakaoCode,
  getKakaoRedirectUri,
} from '../../lib/kakao'
import { colors, radii } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

type AuthTextFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: 'email' | 'password' | 'text'
  Icon: typeof Mail
}

const kakaoProfileStorageKey = 'kakaoLoginProfile'

function AuthTextField({
  value,
  onChange,
  placeholder,
  type = 'text',
  Icon,
}: AuthTextFieldProps) {
  return (
    <label
      className="flex h-14 items-center px-4"
      style={{
        backgroundColor: colors.bg,
        borderRadius: radii.compact,
      }}
    >
      <Icon aria-hidden="true" size={20} color={colors.placeholder} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        className="ml-3 min-w-0 flex-1 bg-transparent text-base font-semibold text-text outline-none placeholder:text-placeholder"
        style={{ letterSpacing: -0.31 }}
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
  Icon: typeof Mail
  children: React.ReactNode
}) {
  return (
    <label
      className="flex h-14 items-center px-4"
      style={{
        backgroundColor: colors.bg,
        borderRadius: radii.compact,
      }}
    >
      <Icon aria-hidden="true" size={20} color={colors.placeholder} />
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

function saveKakaoProfile(profile: { email: string; gender: number; age: number }) {
  sessionStorage.setItem(kakaoProfileStorageKey, JSON.stringify(profile))
}

function consumeKakaoProfile() {
  const rawProfile = sessionStorage.getItem(kakaoProfileStorageKey)
  sessionStorage.removeItem(kakaoProfileStorageKey)
  if (!rawProfile) {
    throw new Error('카카오 로그인에 필요한 추가 정보를 다시 입력해 주세요.')
  }

  const profile = JSON.parse(rawProfile) as {
    email?: unknown
    gender?: unknown
    age?: unknown
  }

  if (
    typeof profile.email !== 'string' ||
    typeof profile.gender !== 'number' ||
    typeof profile.age !== 'number'
  ) {
    throw new Error('카카오 로그인 추가 정보가 올바르지 않습니다.')
  }

  return {
    email: profile.email,
    gender: profile.gender,
    age: profile.age,
  }
}

export function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isKakaoSubmitting, setIsKakaoSubmitting] = useState(false)
  const [kakaoEmail, setKakaoEmail] = useState('')
  const [kakaoGender, setKakaoGender] = useState('')
  const [kakaoAge, setKakaoAge] = useState('')

  const canSubmit = email.trim().length > 0 && password.trim().length > 0
  const kakaoAgeNumber = Number(kakaoAge)
  const canSubmitKakao =
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

  useEffect(() => {
    const code = consumeKakaoCode()
    if (!code) return

    setErrorMessage('')
    setIsKakaoSubmitting(true)
    let kakaoProfile: ReturnType<typeof consumeKakaoProfile>
    try {
      kakaoProfile = consumeKakaoProfile()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '카카오 로그인 추가 정보를 다시 입력해 주세요.',
      )
      setIsKakaoSubmitting(false)
      return
    }

    void loginWithKakaoCode(code, getKakaoRedirectUri(), kakaoProfile)
      .then(navigateAfterLogin)
      .catch((error) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : '카카오 로그인에 실패했어요. 다시 시도해 주세요.',
        )
      })
      .finally(() => setIsKakaoSubmitting(false))
  }, [navigate])

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
    if (!canSubmitKakao || isKakaoSubmitting) return

    setErrorMessage('')
    setIsKakaoSubmitting(true)
    try {
      saveKakaoProfile({
        email: kakaoEmail.trim(),
        gender: Number(kakaoGender),
        age: kakaoAgeNumber,
      })
      await authorizeWithKakao()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '카카오 로그인에 실패했어요. 다시 시도해 주세요.',
      )
      sessionStorage.removeItem(kakaoProfileStorageKey)
    } finally {
      if (!window.location.search.includes('code=')) {
        setIsKakaoSubmitting(false)
      }
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
          <div
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
              Icon={Mail}
            />
            <div className="h-2.5" />
            <AuthTextField
              value={password}
              onChange={setPassword}
              placeholder="비밀번호"
              type="password"
              Icon={Lock}
            />
            {errorMessage && (
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
          </div>
        </section>
        <section className="mt-8">
          <div
            className="mb-4 p-4"
            style={softBox({ radius: radii.card })}
          >
            <h2 className="text-[15px] font-extrabold text-text">카카오 로그인 정보</h2>
            <div className="h-3" />
            <AuthTextField
              value={kakaoEmail}
              onChange={setKakaoEmail}
              placeholder="이메일"
              type="email"
              Icon={Mail}
            />
            <div className="h-2.5" />
            <AuthSelect
              value={kakaoGender}
              onChange={setKakaoGender}
              placeholder="성별"
              Icon={Users}
            >
              <option value="0">남성</option>
              <option value="1">여성</option>
            </AuthSelect>
            <div className="h-2.5" />
            <AuthTextField
              value={kakaoAge}
              onChange={(value) => setKakaoAge(value.replace(/\D/g, '').slice(0, 3))}
              placeholder="나이"
              type="text"
              Icon={Cake}
            />
            {errorMessage && (
              <p className="mt-2 text-[12px] font-semibold leading-[1.4] text-danger">
                {errorMessage}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={submitKakaoLogin}
            disabled={!canSubmitKakao || isKakaoSubmitting}
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
      </main>
    </PhoneFrame>
  )
}
