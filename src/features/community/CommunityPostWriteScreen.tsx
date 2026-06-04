import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { PrimaryButton } from '../../components/PrimaryButton'
import { softBox } from '../../components/ui/softBox'
import { createPost } from '../../lib/api/community'
import { colors, radii, textStyles } from '../../theme/tokens'

const categories = ['절약팁', '질문', '같이해요']

export function CommunityPostWriteScreen() {
  const navigate = useNavigate()
  const [category, setCategory] = useState(categories[0])
  const [title, setTitle] = useState('오늘 점심 8천원 이하 맛집 공유해요')
  const [content, setContent] = useState(
    '가성비 좋은 식당이나 쿠폰 조합을 공유해보세요.',
  )
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = title.trim().length > 0 && content.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return

    setErrorMessage('')
    setIsSubmitting(true)
    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        tag: category,
      })
      navigate('/community')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '게시글 등록에 실패했어요. 다시 시도해 주세요.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PhoneFrame>
      <main className="min-h-[852px] bg-bg">
        <AppHeaderTitled title="글쓰기" onBack={() => navigate(-1)} />

        <section className="px-pageH pt-2 pb-10">
          <h1 style={{ ...textStyles.sectionHeading, fontSize: 24 }}>
            어떤 이야기를 나눌까요?
          </h1>

          <div className="mt-5 flex gap-2">
            {categories.map((item) => {
              const active = item === category

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`h-10 rounded-chip px-4 text-[13px] font-bold ${
                    active ? 'bg-accent text-white' : 'bg-muted text-sub'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>

          <label className="mt-7 block">
            <span className="text-[15px] font-bold text-text">제목</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-3 h-[92px] w-full bg-transparent px-5 text-[15px] font-semibold text-text outline-none placeholder:text-placeholder"
              placeholder="제목을 입력해 주세요"
              style={softBox({ radius: radii.card })}
            />
          </label>

          <label className="mt-5 block">
            <span className="text-[15px] font-bold text-text">내용</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="mt-3 h-[204px] w-full resize-none bg-transparent px-5 py-5 text-[15px] font-semibold leading-[1.6] text-text outline-none placeholder:text-placeholder"
              placeholder="가성비 좋은 식당이나 쿠폰 조합을 공유해보세요."
              style={softBox({ radius: radii.card })}
            />
          </label>

          <p className="mt-4 text-[12px] font-semibold leading-[1.5] text-lightSub">
            작성한 글은 커뮤니티 사용자 모두에게 보여요.
          </p>
          {errorMessage && (
            <p className="mt-3 text-[12px] font-semibold leading-[1.4] text-danger">
              {errorMessage}
            </p>
          )}

          <div
            className="mt-7 rounded-card px-5 py-4"
            style={{
              backgroundColor: colors.accentBg,
              border: `0.7px solid ${colors.border}`,
            }}
          >
            <p className="text-[13px] font-semibold leading-[1.55] text-sub">
              예산, 쿠폰, 착한가격 업소 정보처럼 친구들의 선택에 도움이 되는 내용을 나눠보세요.
            </p>
          </div>

          <div className="mt-8">
            <PrimaryButton
              label={isSubmitting ? '게시 중' : '게시하기'}
              onTap={handleSubmit}
              enabled={canSubmit && !isSubmitting}
            />
          </div>
        </section>
      </main>
    </PhoneFrame>
  )
}
