import { Camera, Edit3, Image as ImageIcon } from 'lucide-react'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { ActionBox } from '../../components/ActionBox'
import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { colors, radii, spacing } from '../../theme/tokens'
import { softBox } from '../../components/ui/softBox'

export function ReceiptRegisterScreen() {
  const navigate = useNavigate()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const modeTitle = '통합 영수증'
  const modeDescription =
    '한 식당이나 장소에서 한 번에 결제한 영수증을 등록해요.'

  const complete = () => navigate('/receipts')

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderTitled
          title="영수증 등록"
          onBack={() => navigate(-1)}
        />
        <section className="px-pageH pt-2">
          <div
            className="p-5"
            style={softBox({ color: colors.accentBg, radius: radii.card })}
          >
            <h1
              className="text-[22px] font-black text-text"
              style={{ letterSpacing: -0.7 }}
            >
              {modeTitle}
            </h1>
            <p className="mt-2 text-sm font-semibold leading-[1.5] text-sub">
              {modeDescription}
            </p>
          </div>
          <div className="h-6" />
          <h2
            className="text-[17px] font-extrabold leading-[1.5] text-text"
            style={{ letterSpacing: -0.43 }}
          >
            등록 방법을 선택해주세요
          </h2>
          <div className="h-[13px]" />
          <ActionBox
            Icon={Camera}
            title="사진 촬영"
            body="카메라로 영수증을 바로 찍어요"
            onTap={() => cameraInputRef.current?.click()}
          />
          <div className="h-3" />
          <ActionBox
            Icon={ImageIcon}
            title="갤러리에서 가져오기"
            body="이미 찍어둔 영수증 사진을 선택해요"
            onTap={() => galleryInputRef.current?.click()}
          />
          <div className="h-3" />
          <ActionBox
            Icon={Edit3}
            title="수동 입력"
            body="금액과 내용을 직접 입력해요"
            onTap={complete}
          />
          <div className="h-6" />
          <div
            className="p-4 text-[13px] font-semibold leading-[1.5] text-sub"
            style={softBox({ radius: radii.card })}
          >
            현재 프로토타입에서는 선택 후 지출 내역 화면으로 이동해요. 실제
            연동 때 카메라, 갤러리, 직접 입력 화면을 각각 연결하면 돼요.
          </div>
          <div style={{ height: spacing.bottomSafe }} />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={complete}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={complete}
          />
        </section>
      </main>
    </PhoneFrame>
  )
}
