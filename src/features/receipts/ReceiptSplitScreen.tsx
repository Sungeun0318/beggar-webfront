import { Camera, Check, Image, Minus, Plus, Scissors, Users } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { RoundIcon } from '../../components/RoundIcon'
import { softBox } from '../../components/ui/softBox'
import { money } from '../../lib/format'
import { members, receipts } from '../../mocks'
import { colors, gradients, radii, spacing } from '../../theme/tokens'

const initialTotal = receipts[2]?.amount ?? 52000

type SplitMode = 'equal' | 'custom'

function toEqualSplit(total: number) {
  const base = Math.floor(total / members.length)
  const remainder = total - base * members.length

  return members.map((member, index) => ({
    name: member.name,
    amount: base + (index === 0 ? remainder : 0),
  }))
}

export function ReceiptSplitScreen() {
  const navigate = useNavigate()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [totalAmount, setTotalAmount] = useState(initialTotal)
  const [mode, setMode] = useState<SplitMode>('equal')
  const [splits, setSplits] = useState(() => toEqualSplit(initialTotal))

  const splitTotal = useMemo(
    () => splits.reduce((sum, split) => sum + split.amount, 0),
    [splits],
  )
  const remaining = totalAmount - splitTotal

  const applyEqualSplit = (nextTotal = totalAmount) => {
    setMode('equal')
    setSplits(toEqualSplit(nextTotal))
  }

  const changeTotal = (delta: number) => {
    const nextTotal = Math.max(totalAmount + delta, 0)
    setTotalAmount(nextTotal)
    if (mode === 'equal') {
      setSplits(toEqualSplit(nextTotal))
    }
  }

  const changeSplitAmount = (name: string, value: string) => {
    setMode('custom')
    setSplits((current) =>
      current.map((split) =>
        split.name === name
          ? { ...split, amount: Number(value.replace(/\D/g, '')) || 0 }
          : split,
      ),
    )
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 실제 구현 시에는 여기서 OCR API를 호출하거나 이미지를 업로드합니다.
      console.log('Selected file:', file.name)
      navigate('/receipts')
    }
  }

  return (
    <PhoneFrame height={930}>
      <main className="min-h-[930px] bg-bg">
        <AppHeaderTitled title="분할 영수증" onBack={() => navigate(-1)} />

        <section
          className="px-pageH pt-2"
          style={{ paddingBottom: spacing.bottomSafe }}
        >
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handlePhotoChange}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={handlePhotoChange}
            className="hidden"
          />

          <div
            className="p-5"
            style={softBox({ color: colors.accentBg, radius: radii.card })}
          >
            <div className="flex items-center">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-white">
                <Scissors aria-hidden="true" size={23} color={colors.accent} />
              </div>
              <div className="ml-3">
                <h1 className="text-[22px] font-black text-text">
                  분할 영수증 등록
                </h1>
                <p className="mt-1 text-[13px] font-semibold text-sub">
                  각자 낼 금액을 나눠서 기록해요
                </p>
              </div>
            </div>
          </div>

          <div className="h-6" />
          <h2 className="text-[17px] font-extrabold text-text">
            영수증 총액
          </h2>
          <div className="h-[13px]" />
          <div
            className="flex h-[72px] items-center px-[17px]"
            style={softBox({ radius: radii.compact })}
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-accentBg">
              <Users aria-hidden="true" size={22} color={colors.brown} />
            </div>
            <div className="ml-3">
              <p className="text-[12px] font-semibold text-sub">총 결제 금액</p>
              <p className="text-xl font-extrabold text-text">
                {money(totalAmount)}원
              </p>
            </div>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => changeTotal(-1000)}
              className="disabled:opacity-45"
              disabled={totalAmount <= 0}
            >
              <RoundIcon Icon={Minus} />
            </button>
            <div className="w-2" />
            <button type="button" onClick={() => changeTotal(1000)}>
              <RoundIcon Icon={Plus} />
            </button>
          </div>

          <div className="h-6" />
          <h2 className="text-[17px] font-extrabold text-text">
            분할 방식
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => applyEqualSplit()}
              className={`h-10 rounded-chip text-[13px] font-bold ${
                mode === 'equal' ? 'bg-accent text-white' : 'bg-muted text-sub'
              }`}
            >
              N분의 1
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`h-10 rounded-chip text-[13px] font-bold ${
                mode === 'custom' ? 'bg-accent text-white' : 'bg-muted text-sub'
              }`}
            >
              직접 입력
            </button>
          </div>

          <div className="h-6" />
          <div className="flex items-end justify-between">
            <h2 className="text-[17px] font-extrabold text-text">
              참여자별 부담액
            </h2>
            <span
              className={`text-[12px] font-bold ${
                remaining === 0 ? 'text-accent' : 'text-danger'
              }`}
            >
              {remaining === 0
                ? '분할 완료'
                : `${money(Math.abs(remaining))}원 ${
                    remaining > 0 ? '남음' : '초과'
                  }`}
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {splits.map((split) => (
              <div
                key={split.name}
                className="flex h-[64px] items-center px-4"
                style={softBox({ radius: radii.compact })}
              >
                <div className="grid h-9 w-9 place-items-center rounded-full bg-accentBg">
                  <Check aria-hidden="true" size={18} color={colors.accent} />
                </div>
                <span className="ml-3 flex-1 text-[15px] font-bold text-text">
                  {split.name}
                </span>
                <input
                  value={money(split.amount)}
                  onFocus={() => setMode('custom')}
                  onChange={(event) =>
                    changeSplitAmount(split.name, event.target.value)
                  }
                  inputMode="numeric"
                  className="w-[100px] bg-transparent text-right text-[15px] font-extrabold text-text outline-none"
                />
                <span className="ml-1 text-[13px] font-semibold text-sub">
                  원
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-5 p-4 text-[13px] font-semibold leading-[1.5] text-sub"
            style={softBox({ radius: radii.card })}
          >
            실제 영수증 OCR 연동 전까지는 총액과 참여자별 부담액을 직접
            조정할 수 있게 둬요.
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex h-[60px] flex-1 items-center justify-center gap-2 rounded-card text-[15px] font-bold text-white shadow-md"
              style={{ background: gradients.goldGradient }}
            >
              <Camera size={20} />
              카메라
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex h-[60px] flex-1 items-center justify-center gap-2 rounded-card text-[15px] font-bold text-white shadow-md"
              style={{ background: gradients.goldGradient }}
            >
              <Image size={20} />
              갤러리
            </button>
          </div>
        </section>
      </main>
    </PhoneFrame>
  )
}
