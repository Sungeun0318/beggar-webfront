import { Cake, Lock, Mail, User, Users, Verified } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { InfoCard } from '../../components/InfoCard'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { SectionTitle } from '../../components/SectionTitle'
import { colors, radii, spacing } from '../../theme/tokens'

type SignupFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: 'email' | 'password' | 'text'
  Icon: typeof User
}

const ageRanges = [
  { label: '10대', value: '10~19' },
  { label: '20대', value: '20~29' },
  { label: '30대', value: '30~39' },
  { label: '40대', value: '40~49' },
  { label: '50대 이상', value: '50~' },
]

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
      <Icon aria-hidden="true" size={20} color={colors.placeholder} />
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
  Icon: typeof User
  children: React.ReactNode
}) {
  return (
    <label className="flex h-14 items-center px-4" style={fieldShellStyle()}>
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

export function SignupScreen() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState('')
  const [ageRange, setAgeRange] = useState('')

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
              처음 오셨나요?
            </h1>
            <p className="mt-2 text-sm font-semibold leading-[1.5] text-sub">
              연령대는 추천 품질 개선에만 사용돼.
            </p>
            <div className="h-[30px]" />
            <SectionTitle text="기본 정보" />
            <div className="h-[13px]" />
            <SignupField
              value={nickname}
              onChange={setNickname}
              placeholder="닉네임"
              Icon={User}
            />
            <div className="h-3" />
            <SignupField
              value={email}
              onChange={setEmail}
              placeholder="이메일"
              type="email"
              Icon={Mail}
            />
            <div className="h-3" />
            <SignupField
              value={password}
              onChange={setPassword}
              placeholder="비밀번호"
              type="password"
              Icon={Lock}
            />
            <div className="h-3" />
            <SignupSelect
              value={gender}
              onChange={setGender}
              placeholder="성별"
              Icon={Users}
            >
              <option value="none">선택 안 함</option>
              <option value="0">남성</option>
              <option value="1">여성</option>
            </SignupSelect>
            <div className="h-3" />
            <SignupSelect
              value={ageRange}
              onChange={setAgeRange}
              placeholder="연령대"
              Icon={Cake}
            >
              {ageRanges.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </SignupSelect>
            <div className="h-6" />
            <InfoCard
              Icon={Verified}
              title="예산 정보는 익명으로 보호돼요"
              body={'성별과 연령대는 추천 품질 개선에만 사용하고\n개인 예산은 다른 사람에게 공개하지 않아요.'}
            />
            <div className="h-6" />
            <PrimaryButton
              label="회원가입 완료"
              onTap={() => navigate('/login')}
            />
          </div>
        </section>
      </main>
    </PhoneFrame>
  )
}
