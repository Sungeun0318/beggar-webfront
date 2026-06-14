import {
  AtSign,
  BadgeCheck,
  CalendarDays,
  KeyRound,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { InfoCard } from '../../components/InfoCard'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { SectionTitle } from '../../components/SectionTitle'
import { signup } from '../../lib/api/auth'
import { colors, radii, spacing } from '../../theme/tokens'

type SignupFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: 'email' | 'password' | 'text'
  Icon: LucideIcon
}

function fieldShellStyle() {
  return {
    backgroundColor: colors.bg,
    borderRadius: radii.compact,
  }
}

function SignupField({
  value,
  onChange,
  placeholder,
  type = 'text',
  Icon,
}: SignupFieldProps) {
  return (
    <label className="flex h-14 items-center px-4" style={fieldShellStyle()}>
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

function SignupSelect({
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
  children: React.ReactNode
}) {
  return (
    <label className="flex h-14 items-center px-4" style={fieldShellStyle()}>
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

export function SignupScreen() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const ageNumber = Number(age)

  const canSubmit =
    nickname.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    Number.isInteger(ageNumber) &&
    ageNumber >= 0 &&
    ageNumber <= 120

  const submitSignup = async () => {
    if (!canSubmit || isSubmitting) return

    setErrorMessage('')
    setIsSubmitting(true)
    try {
      await signup({
        nickname: nickname.trim(),
        email: email.trim(),
        password,
        age: ageNumber,
        gender: gender && gender !== 'none' ? Number(gender) : undefined,
      })
      navigate('/login')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '회원가입에 실패했어요. 다시 시도해 주세요.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PhoneFrame height={930}>
      <main className="relative min-h-[930px] bg-bg">
        <AppHeaderTitled title="회원가입" onBack={() => navigate(-1)} />
        <section className="px-pageH pt-2">
          <div style={{ paddingBottom: spacing.bottomSafe }}>
            <h1
              className="text-2xl font-black text-text"
              style={{ letterSpacing: -0.7 }}
            >
              거지방 시작하기
            </h1>
            <p className="mt-2 text-sm font-semibold leading-[1.5] text-sub">
              방에서 사용할 기본 정보를 입력해 주세요.
            </p>
            <div className="h-[30px]" />
            <SectionTitle text="기본 정보" />
            <div className="h-[13px]" />
            <SignupField
              value={nickname}
              onChange={setNickname}
              placeholder="닉네임"
              Icon={Sparkles}
            />
            <div className="h-3" />
            <SignupField
              value={email}
              onChange={setEmail}
              placeholder="이메일"
              type="email"
              Icon={AtSign}
            />
            <div className="h-3" />
            <SignupField
              value={password}
              onChange={setPassword}
              placeholder="비밀번호"
              type="password"
              Icon={KeyRound}
            />
            <div className="h-3" />
            <SignupSelect
              value={gender}
              onChange={setGender}
              placeholder="성별"
              Icon={BadgeCheck}
            >
              <option value="none">선택 안 함</option>
              <option value="1">남성</option>
              <option value="2">여성</option>
            </SignupSelect>
            <div className="h-3" />
            <SignupField
              value={age}
              onChange={(value) => setAge(value.replace(/\D/g, '').slice(0, 3))}
              placeholder="나이"
              type="text"
              Icon={CalendarDays}
            />
            <div className="h-6" />
            <InfoCard
              Icon={ShieldCheck}
              title="모임에서 사용할 기본 정보예요"
              body={'닉네임과 기본 정보는 방 활동에 사용하고\n개인 예산은 다른 사람에게 공개하지 않아요.'}
            />
            {errorMessage && (
              <p className="mt-4 text-[12px] font-semibold leading-[1.4] text-danger">
                {errorMessage}
              </p>
            )}
            <div className="h-6" />
            <PrimaryButton
              label={isSubmitting ? '가입 중' : '회원가입 완료'}
              onTap={submitSignup}
              enabled={canSubmit && !isSubmitting}
            />
          </div>
        </section>
      </main>
    </PhoneFrame>
  )
}
