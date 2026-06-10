import { Edit3, MessageCircle, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderBrand } from '../../components/AppHeader'
import { BottomNav } from '../../components/BottomNav'
import { PhoneFrame } from '../../components/PhoneFrame'
import { softBox } from '../../components/ui/softBox'
import { getPopularPosts, getPosts } from '../../lib/api/community'
import { colors, radii, textStyles } from '../../theme/tokens'
import type { RoomFreePost } from '../../types'

const tabs = ['인기글', '최신글', '절약팁', '질문']

function PostCard({ post }: { post: RoomFreePost }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/community/post/${post.id}`)}
      className="block h-[170px] w-full text-left"
      style={softBox({ radius: radii.card, shadow: true })}
    >
      <div className="flex h-full flex-col px-5 py-[18px]">
        <span className="w-fit rounded-chip bg-accentBg px-3 py-1.5 text-[11px] font-bold text-accent">
          {post.tag}
        </span>
        <h3 className="mt-3 line-clamp-1 text-[17px] font-extrabold text-text">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-[1.55] text-sub">
          {post.content}
        </p>
        <p className="mt-auto text-[12px] font-semibold text-lightSub">
          댓글 {post.commentCount} · {post.createdAt}
        </p>
      </div>
    </button>
  )
}

export function CommunityScreen() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(tabs[1]) // 최신글(tabs[1])을 기본값으로 설정 권장 (백엔드 기본 정렬)
  const [posts, setPosts] = useState<RoomFreePost[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let data: RoomFreePost[] = []
        if (searchKeyword.trim()) {
          data = await getPosts(searchKeyword.trim())
        } else if (activeTab === '인기글') {
          data = await getPopularPosts()
        } else if (activeTab === '최신글') {
          data = await getPosts()
        } else if (activeTab === '절약팁' || activeTab === '질문') {
          // 태그 필터링의 경우: 일단 최신글을 가져와서 필터링 (필요시 백엔드에 태그별 조회 API 요청 가능)
          const allPosts = await getPosts()
          data = allPosts.filter((post) => post.tag === activeTab)
        }
        const uniquePosts = data.filter(
          (post, index, self) => index === self.findIndex((p) => p.id === post.id)
        )
        setPosts(uniquePosts)
      } catch (err) {
        console.error('게시글 로딩 실패:', err)
      }
    }

    void fetchPosts()
  }, [activeTab, searchKeyword])

  return (
    <PhoneFrame>
      <main className="min-h-[852px] bg-bg pb-bottomSafe">
        <AppHeaderBrand title="커뮤니티" showNotification />

        <section className="px-pageH pt-2 pb-[120px]">
          <p className="text-[14px] font-semibold leading-[1.5] text-sub">
            모든 사용자들과 절약 팁과 모임 이야기를 나눠요.
          </p>

          <div
            className="mt-5 flex h-[54px] items-center px-[18px]"
            style={softBox()}
          >
            <Search aria-hidden="true" size={20} color={colors.placeholder} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="게시글 검색"
              className="ml-3 flex-1 bg-transparent text-[14px] font-semibold text-text placeholder:text-placeholder focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/community/chat')}
            className="mt-5 flex h-[104px] w-full items-center justify-between px-5 text-left"
            style={softBox({ color: colors.accentBg, radius: radii.card })}
          >
            <div className="flex items-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white">
                <MessageCircle
                  aria-hidden="true"
                  size={24}
                  color={colors.accent}
                />
              </div>
              <div className="ml-4">
                <h2 className="text-[18px] font-extrabold text-text">
                  전체 채팅방
                </h2>
                <p className="mt-1 text-[13px] font-semibold text-sub">
                  다양한 거지들이 절약 이야기를 나누는 중...
                </p>
              </div>
            </div>
            <span className="text-[22px] font-semibold text-lightSub">›</span>
          </button>

          <div className="mt-8 flex items-center justify-between">
            <h2 style={{ ...textStyles.sectionHeading, fontSize: 22 }}>
              게시판
            </h2>
            <button
              type="button"
              onClick={() => navigate('/community/write')}
              className="flex items-center text-[13px] font-bold text-accent"
            >
              <Edit3 aria-hidden="true" size={15} />
              <span className="ml-1.5">글쓰기</span>
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            {tabs.map((tab) => {
              const active = tab === activeTab

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`h-9 rounded-chip px-4 text-[13px] font-bold ${
                    active ? 'bg-accent text-white' : 'bg-muted text-sub'
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          <div className="mt-5 space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        <BottomNav />
      </main>
    </PhoneFrame>
  )
}
