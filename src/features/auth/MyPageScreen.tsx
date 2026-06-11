import {
  Award,
  Camera,
  Check,
  ChevronRight,
  Loader2,
  ReceiptText,
  User,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderBrand } from '../../components/AppHeader'
import { BottomNav } from '../../components/BottomNav'
import { PhoneFrame } from '../../components/PhoneFrame'
import {
  getCurrentUser,
  updateNickname,
  updateProfileImage,
  uploadProfileImage,
  withdraw,
} from '../../lib/api/auth'
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
  const [nicknameDraft, setNicknameDraft] = useState(() => getStoredUser().name)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [isSavingNickname, setIsSavingNickname] = useState(false)
  const [nicknameError, setNicknameError] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    let ignore = false

    getCurrentUser()
      .then((data) => {
        if (ignore) return
        setUser((prev) => ({ ...prev, ...data }))
        setNicknameDraft(data.name)
      })
      .catch(() => {
        if (!ignore) {
          const storedUser = getStoredUser()
          setUser(storedUser)
          setNicknameDraft(storedUser.name)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const requireLogin = () => {
    if (localStorage.getItem('accessToken')) return true

    alert('로그인 정보가 없습니다. 다시 로그인해 주세요.')
    navigate('/login')
    return false
  }

  const cancelNicknameEdit = () => {
    setNicknameDraft(user.name)
    setNicknameError('')
    setIsEditingNickname(false)
  }

  const saveNickname = async () => {
    const nextNickname = nicknameDraft.trim()
    if (!nextNickname || isSavingNickname) return

    if (nextNickname === user.name) {
      setIsEditingNickname(false)
      setNicknameError('')
      return
    }

    if (!requireLogin()) return

    setIsSavingNickname(true)
    setNicknameError('')

    try {
      const updatedUser = await updateNickname(nextNickname)
      setUser((prev) => ({ ...prev, ...updatedUser }))
      setNicknameDraft(updatedUser.name)
      setIsEditingNickname(false)
    } catch (error) {
      if (!localStorage.getItem('accessToken')) {
        alert('인증이 만료되었습니다. 다시 로그인해 주세요.')
        navigate('/login')
        return
      }

      setNicknameError(
        error instanceof Error
          ? error.message
          : '닉네임 변경에 실패했습니다. 다시 시도해 주세요.',
      )
    } finally {
      setIsSavingNickname(false)
    }
  }

  const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 등록할 수 있습니다.')
      return
    }

    if (!requireLogin()) return

    setIsUploadingImage(true)

    try {
      const localPreviewUrl = URL.createObjectURL(file)
      setUser((prev) => ({ ...prev, profileImageUrl: localPreviewUrl }))

      try {
        const imageUrl = await uploadProfileImage(file)
        const updatedUser = await updateProfileImage(imageUrl)
        setUser((prev) => ({ ...prev, ...updatedUser }))
      } catch (error) {
        console.error('Profile image update failed:', error)

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
      console.error('Image processing failed:', error)
      alert('이미지를 처리하지 못했습니다.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleWithdraw = async () => {
    if (isWithdrawing) return
    if (!requireLogin()) return

    const confirmed = window.confirm(
      '회원 탈퇴 시 계정 정보가 삭제됩니다. 정말 탈퇴하시겠습니까?',
    )
    if (!confirmed) return

    setIsWithdrawing(true)

    try {
      await withdraw()
      alert('회원 탈퇴가 완료되었습니다.')
      navigate('/login', { replace: true })
    } catch (error) {
      if (!localStorage.getItem('accessToken')) {
        alert('인증이 만료되었습니다. 다시 로그인해 주세요.')
        navigate('/login', { replace: true })
        return
      }

      alert(
        error instanceof Error
          ? error.message
          : '회원 탈퇴에 실패했습니다. 다시 시도해 주세요.',
      )
    } finally {
      setIsWithdrawing(false)
    }
  }

  const canSaveNickname =
    nicknameDraft.trim().length > 0 &&
    nicknameDraft.trim() !== user.name &&
    !isSavingNickname

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderBrand title="마이페이지" showNotification={false} />
        <section className="px-pageH pt-2" style={{ paddingBottom: spacing.bottomSafe }}>
          <div
            className="flex min-h-[112px] items-center rounded-card border bg-accentBg p-3"
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
              <div className="flex min-h-8 items-center gap-2">
                {isEditingNickname ? (
                  <input
                    value={nicknameDraft}
                    onChange={(event) => {
                      setNicknameDraft(event.target.value)
                      setNicknameError('')
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void saveNickname()
                      if (event.key === 'Escape') cancelNicknameEdit()
                    }}
                    disabled={isSavingNickname}
                    autoFocus
                    maxLength={20}
                    className="min-w-0 flex-1 rounded-compact border bg-white px-3 py-1.5 text-lg font-black text-text outline-none"
                    style={{ borderColor: nicknameError ? colors.danger : colors.canvas }}
                    aria-label="닉네임"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setNicknameDraft(user.name)
                      setNicknameError('')
                      setIsEditingNickname(true)
                    }}
                    className="min-w-0 flex-1 truncate text-left text-[22px] font-black text-text hover:text-blue-600 hover:underline focus-visible:text-blue-600 focus-visible:underline focus-visible:outline-none"
                    aria-label="닉네임 수정"
                  >
                    {user.name}
                  </button>
                )}
                {isEditingNickname ? (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={saveNickname}
                      disabled={!canSaveNickname}
                      className="grid h-8 w-8 place-items-center rounded-full bg-accent disabled:bg-border"
                      aria-label="닉네임 저장"
                    >
                      {isSavingNickname ? (
                        <Loader2 className="animate-spin" size={16} color="#fff" />
                      ) : (
                        <Check aria-hidden="true" size={16} color="#fff" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelNicknameEdit}
                      disabled={isSavingNickname}
                      className="grid h-8 w-8 place-items-center rounded-full bg-white disabled:opacity-60"
                      aria-label="닉네임 수정 취소"
                    >
                      <X aria-hidden="true" size={16} color={colors.sub} />
                    </button>
                  </div>
                ) : null}
              </div>
              <p
                className="mt-[5px] truncate text-sm font-medium text-sub"
                style={{ letterSpacing: -0.31 }}
              >
                {user.email}
              </p>
              {nicknameError && (
                <p className="mt-1 text-[12px] font-semibold text-danger">
                  {nicknameError}
                </p>
              )}
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
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="text-left text-[13px] font-semibold text-sub/25 disabled:cursor-default disabled:opacity-60"
            >
              {isWithdrawing ? '탈퇴 처리 중' : '탈퇴하기'}
            </button>
          </section>
        </section>
        <BottomNav />
      </main>
    </PhoneFrame>
  )
}
