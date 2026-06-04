import { Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { currentUser } from '../../mocks'
import { colors, radii } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

type AuthTextFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: 'email' | 'password' | 'text'
  Icon: typeof Mail
}

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

export function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(currentUser.email)
  const [password, setPassword] = useState('')

  const goHome = () => navigate('/home')

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <section className="absolute left-pageH right-pageH top-[104px]">
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
            <div className="h-3" />
            <PrimaryButton label="로그인" onTap={goHome} />
          </div>
        </section>
        <section className="absolute bottom-6 left-pageH right-pageH">
          <button
            type="button"
            onClick={goHome}
            className="flex h-14 w-full items-center justify-center rounded-card bg-kakaoYellow text-base font-bold text-text"
          >
            카카오로 시작하기
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
