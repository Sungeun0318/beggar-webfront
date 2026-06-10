import {
  Award,
  Camera,
  ChevronRight,
  Loader2,
  ReceiptText,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderBrand } from '../../components/AppHeader'
import { BottomNav } from '../../components/BottomNav'
import { PhoneFrame } from '../../components/PhoneFrame'
import { getCurrentUser, updateProfileImage, uploadProfileImage } from '../../lib/api/auth'
import { currentUser } from '../../mocks'
import { colors, radii, spacing } from '../../theme/tokens'
import type { User as UserType } from '../../types'

type MenuItemProps = {
  Icon: LucideIcon
  title: string
  subtitle?: string
  onTap?: () => void
}

function MenuItem({ Icon, title, subtitle, onTap }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex h-[76px] w-full items-center rounded-card border bg-white px-4 py-3 text-left"
      style={{ borderColor: colors.canvas, borderWidth: 0.65 }}
    >
      <div className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-compact bg-canvas">
        <Icon aria-hidden="true" size={24} color={colors.sub} />
      </div>
      <div className="w-4" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-text">{title}</p>
        {subtitle && (
          <p className="mt-0.5 truncate text-sm text-sub">{subtitle}</p>
        )}
      </div>
      {onTap && <ChevronRight aria-hidden="true" size={20} color={colors.lightSub} />}
    </button>
  )
}

function getStoredUser(): UserType {
  return {
    no: Number(localStorage.getItem('userNo')) || currentUser.no,
    name: localStorage.getItem('userName') || currentUser.name,
    email: localStorage.getItem('userEmail') || currentUser.email,
    profileImageUrl:
      localStorage.getItem('profileImageUrl') ||
      currentUser.profileImageUrl ||
      undefined,
  }
}

export function MyPageScreen() {
  const navigate = useNavigate()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<UserType>(() => getStoredUser())
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    let ignore = false

    const token = localStorage.getItem('accessToken')
    if (!token) {
      console.warn('토큰이 없습니다. 로그인 페이지로 이동합니다.')
      // navigate('/login') // 필요시 주석 해제하여 자동 리다이렉트
    }

    getCurrentUser()
      .then((data) => {
        if (!ignore) setUser((prev) => ({ ...prev, ...data }))
      })
      .catch(() => {
        if (!ignore) setUser(getStoredUser())
      })

    return () => {
      ignore = true
    }
  }, [navigate])

  const handleProfileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 등록할 수 있습니다.')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('로그인 정보가 없습니다. 다시 로그인해 주세요.')
      navigate('/login')
      return
    }

    setIsUploadingImage(true)
    console.log('업로드 시작 - 토큰 상태:', !!token)

    try {
      // 업로드 중에는 로컬 미리보기를 보여줍니다.
      const localPreviewUrl = URL.createObjectURL(file)
      setUser((prev) => ({ ...prev, profileImageUrl: localPreviewUrl }))

      try {
        const imageUrl = await uploadProfileImage(file)
        console.log('S3 업로드 성공, Key:', imageUrl)

        const updatedUser = await updateProfileImage(imageUrl)
        console.log('DB 업데이트 성공:', updatedUser)

        // 중요: imageUrl(파일명)이 아닌 서버에서 다시 받아온 updatedUser 정보를 사용합니다.
        setUser((prev) => ({ ...prev, ...updatedUser }))
        alert('프로필 사진이 성공적으로 저장되었습니다.')
      } catch (error) {
        console.error('프로필 이미지 저장 과정 에러:', error)

        // 토큰이 삭제되었는지 확인 (ApiError 401 시 client.ts에서 삭제함)
        if (!localStorage.getItem('accessToken')) {
          alert('인증이 만료되었습니다. 다시 로그인해 주세요.')
          navigate('/login')
          return
        }

        alert('이미지 저장에 실패했습니다.')
        const freshUser = await getCurrentUser().catch(() => null)
        if (freshUser) setUser((prev) => ({ ...prev, ...freshUser }))
      } finally {
        URL.revokeObjectURL(localPreviewUrl)
      }
    } catch (error) {
      console.error('이미지 처리 에러:', error)
      alert('이미지를 처리하지 못했습니다.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderBrand title="마이페이지" showNotification={false} />
        <section className="px-pageH pt-2" style={{ paddingBottom: spacing.bottomSafe }}>
          <div
            className="flex h-[98px] items-center rounded-card border bg-accentBg p-3"
            style={{ borderColor: colors.canvas, borderWidth: 0.65 }}
          >
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="relative grid h-[78px] w-[78px] shrink-0 place-items-center overflow-hidden rounded-full border bg-white"
              style={{ borderColor: colors.canvas, borderWidth: 0.65 }}
              aria-label="프로필 이미지 등록"
            >
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <User aria-hidden="true" size={40} color={colors.accent} />
              )}
              <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-accent">
                {isUploadingImage ? (
                  <Loader2 className="animate-spin" size={15} color="#fff" />
                ) : (
                  <Camera aria-hidden="true" size={15} color="#fff" />
                )}
              </span>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageChange}
            />
            <div className="w-4" />
            <div className="min-w-0 flex-1">
              <p className="truncate">
                <span className="text-[22px] font-black text-text">
                  {user.name}
                </span>
                <span className="text-base font-medium text-sub"> 님</span>
              </p>
              <p
                className="mt-[5px] truncate text-sm font-medium text-sub"
                style={{ letterSpacing: -0.31 }}
              >
                {user.email}
              </p>
            </div>
          </div>
          <div className="h-6" />
          <MenuItem
            Icon={Award}
            title="칭호 변경"
            subtitle="내 칭호를 선택해요"
          />
          <div className="h-3" />
          <MenuItem
            Icon={ReceiptText}
            title="지출 내역"
            subtitle="내가 등록한 지출을 확인해요"
            onTap={() => navigate('/receipts')}
          />
          <div className="h-6" />
          <section
            className="rounded-card bg-white p-4"
            style={{
              borderRadius: radii.card,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-sub">계정 생성일</span>
              <span className="text-xs font-medium text-lightSub">
                2026.05.05
              </span>
            </div>
            <div className="h-4" />
            <div className="h-px bg-muted" />
            <div className="h-2" />
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="h-9 w-full text-left text-base font-medium text-sub"
            >
              로그아웃
            </button>
            <div className="h-4" />
            <p className="text-left text-[13px] font-semibold text-sub/25">
              탈퇴하기
            </p>
          </section>
        </section>
        <BottomNav />
      </main>
    </PhoneFrame>
  )
}
