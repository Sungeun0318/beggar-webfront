import { MessageCircle, Send, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { softBox } from '../../components/ui/softBox'
import { createComment, deletePost, getPostDetail } from '../../lib/api/community'
import { colors, radii, textStyles } from '../../theme/tokens'
import type { RoomFreeComment, RoomFreePostDetail } from '../../types'

export function CommunityPostDetailScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [post, setPost] = useState<RoomFreePostDetail | null>(null)
  const [comment, setComment] = useState('')
  const [localComments, setLocalComments] = useState<RoomFreeComment[]>([])
  const myName = localStorage.getItem('userName')

  const fetchPostDetail = async () => {
    try {
      const detail = await getPostDetail(Number(id ?? 1))
      setPost(detail)
      setLocalComments(detail.comments)
    } catch (err) {
      console.error('게시글 상세 로딩 실패:', err)
    }
  }

  useEffect(() => {
    void fetchPostDetail()
  }, [id])

  const handleSend = async () => {
    const nextComment = comment.trim()
    if (!nextComment || !post) return

    const name = myName || '익명'

    try {
      await createComment(post.id, nextComment)
      setComment('')
      
      // 즉시 반영을 위한 로컬 상태 업데이트
      setLocalComments((prev) => [
        ...prev,
        {
          id: Date.now(), // 임시 ID
          author: name,
          content: nextComment,
          createdAt: '방금 전',
        },
      ])

      // 서버 데이터와 동기화
      void fetchPostDetail()
    } catch (err) {
      console.error('댓글 전송 실패:', err)
    }
  }

  const handleDelete = async () => {
    if (!post) return
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return

    try {
      await deletePost(post.id)
      navigate('/community')
    } catch (err) {
      console.error('게시글 삭제 실패:', err)
      alert('게시글 삭제에 실패했습니다. 본인 글이 맞는지 확인해주세요.')
    }
  }

  return (
    <PhoneFrame>
      <main className="min-h-[852px] bg-bg">
        <AppHeaderTitled title="게시글" onBack={() => navigate(-1)} />

        <section className="px-pageH pt-2 pb-[120px]">
          {post && (
            <>
              <article
                className="relative px-5 py-5"
                style={softBox({ radius: radii.card, shadow: true })}
              >
                <div className="flex items-start justify-between">
                  <span className="w-fit rounded-chip bg-accentBg px-3 py-1.5 text-[11px] font-bold text-accent">
                    {post.tag}
                  </span>
                  {post.author === myName && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="p-1 text-lightSub hover:text-red-500 transition-colors"
                      aria-label="게시글 삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <h1 className="mt-4 text-[20px] font-extrabold leading-[1.35] text-text">
                  {post.title}
                </h1>
                <p className="mt-2 text-[12px] font-semibold text-lightSub">
                  {post.author} · {post.createdAt}
                </p>
                <div className="mt-5 h-px bg-border" />
                <p className="mt-5 whitespace-pre-line text-[15px] font-semibold leading-[1.7] text-darkSub">
                  {post.content}
                </p>
              </article>

              <div className="mt-8 flex items-center">
                <MessageCircle
                  aria-hidden="true"
                  size={18}
                  color={colors.accent}
                />
                <h2
                  className="ml-2"
                  style={{ ...textStyles.sectionHeading, fontSize: 20 }}
                >
                  댓글{' '}
                  {post.commentCount + localComments.length - post.comments.length}
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {localComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="px-5 py-4"
                    style={softBox({ radius: radii.compact })}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-extrabold text-text">
                        {comment.author}
                      </p>
                      <p className="text-[11px] font-semibold text-lightSub">
                        {comment.createdAt}
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] font-semibold leading-[1.55] text-sub">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto h-[92px] w-full max-w-[430px] border-t border-border bg-white/95 px-pageH pt-3 pb-[18px]">
          <div
            className="flex h-[52px] items-center px-4"
            style={softBox({ radius: radii.chip, shadow: true })}
          >
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSend()
              }}
              placeholder="댓글 입력"
              className="min-w-0 flex-1 bg-transparent text-[14px] font-bold text-text outline-none placeholder:text-placeholder"
            />
            <button
              type="button"
              onClick={handleSend}
              aria-label="댓글 전송"
              className="ml-3 grid h-9 w-9 place-items-center rounded-full text-accent"
            >
              <Send aria-hidden="true" size={22} />
            </button>
          </div>
        </div>
      </main>
    </PhoneFrame>
  )
}
