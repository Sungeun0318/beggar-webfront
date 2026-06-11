import type {
  RoomFreeChat,
  RoomFreePost,
  RoomFreePostDetail,
} from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

const MOCK_POSTS: RoomFreePost[] = [
  {
    id: 1,
    title: '오늘 점심 8천원 이하 맛집 공유해요',
    content: '명학역 근처에 가성비 좋은 한식 뷔페가 있더라고요. 단돈 7500원!',
    author: '거지판다',
    tag: '절약팁',
    commentCount: 3,
    createdAt: '10분 전',
  },
  {
    id: 2,
    title: '커피값 아끼는 꿀팁 있나요?',
    content: '매일 마시는 아메리카노 값이 너무 부담되네요. 다들 어떻게 아끼시나요?',
    author: '절약왕',
    tag: '질문',
    commentCount: 5,
    createdAt: '1시간 전',
  },
  {
    id: 3,
    title: '내일 코엑스 전시회 같이 가실 분!',
    content: '무료 입장권 2장 있는데 같이 구경하고 도시락 까먹을 분 구합니다.',
    author: '문화거지',
    tag: '같이해요',
    commentCount: 2,
    createdAt: '3시간 전',
  },
  {
    id: 4,
    title: '편의점 1+1 행사 품목 정리',
    content: '이번 달 CU랑 GS25 1+1 품목 중에서 괜찮은 거 골라봤습니다.',
    author: '편의점마스터',
    tag: '절약팁',
    commentCount: 12,
    createdAt: '5시간 전',
  },
]

const MOCK_CHATS: RoomFreeChat[] = [
  {
    id: 1,
    sender: '거지판다',
    message: '안녕하세요! 다들 오늘 얼마 쓰셨나요?',
    createdAt: '14:02',
    isMine: false,
  },
  {
    id: 2,
    sender: '절약왕',
    message: '저는 오늘 0원 지출 성공했습니다 ㅎㅎ',
    createdAt: '14:05',
    isMine: false,
  },
]

export async function getPosts(keyword?: string): Promise<RoomFreePost[]> {
  if (MOCK.communityRead) {
    if (keyword) {
      return MOCK_POSTS.filter(
        (p) => p.title.includes(keyword) || p.content.includes(keyword),
      )
    }
    return MOCK_POSTS
  }

  // 실제 경로: GET /community/posts
  try {
    const response = await client.get<{ data: RoomFreePost[] }>(
      '/community/posts',
      keyword ? { keyword } : undefined,
    )
    return response.data
  } catch (error) {
    console.error('커뮤니티 게시글 API 실패:', error)
    return []
  }
}

export async function getPopularPosts(): Promise<RoomFreePost[]> {
  if (MOCK.communityRead) {
    return [...MOCK_POSTS].sort((a, b) => b.commentCount - a.commentCount)
  }

  // 실제 경로: GET /community/posts/popular
  try {
    const response = await client.get<{ data: RoomFreePost[] }>(
      '/community/posts/popular',
    )
    return response.data
  } catch (error) {
    console.error('인기 게시글 API 실패:', error)
    return []
  }
}

export async function getPostDetail(
  postId: number,
): Promise<RoomFreePostDetail> {
  if (MOCK.communityRead) {
    const post = MOCK_POSTS.find((p) => p.id === postId) || MOCK_POSTS[0]
    return {
      ...post,
      comments: [
        {
          id: 1,
          author: '댓글로봇',
          content: '좋은 정보 감사합니다!',
          createdAt: '5분 전',
        },
      ],
    }
  }

  // 실제 경로: GET /community/posts/{id}
  try {
    const response = await client.get<{ data: RoomFreePostDetail }>(
      `/community/posts/${postId}`,
    )
    return response.data
  } catch (error) {
    console.error('커뮤니티 게시글 상세 API 실패:', error)
    throw error
  }
}

export async function createPost(request: {
  title: string
  content: string
  tag: string
}): Promise<void> {
  if (MOCK.communityWrite) {
    console.log('Mock: Creating post', request)
    return
  }

  // 실제 경로: POST /community/posts
  await client.post('/community/posts', request)
}

export async function deletePost(postId: number): Promise<void> {
  if (MOCK.communityWrite) {
    console.log('Mock: Deleting post', postId)
    return
  }

  // 실제 경로: DELETE /community/posts/{id}
  await client.del(`/community/posts/${postId}`)
}

export async function createComment(
  postId: number,
  content: string,
): Promise<void> {
  if (MOCK.communityWrite) {
    console.log('Mock: Creating comment for post', postId, content)
    return
  }

  // 실제 경로: POST /community/posts/{id}/comments
  await client.post(`/community/posts/${postId}/comments`, { content })
}

export async function getChats(): Promise<RoomFreeChat[]> {
  if (MOCK.communityRead) {
    return MOCK_CHATS
  }

  // 실제 경로: GET /community/chats
  try {
    const response = await client.get<{ data: RoomFreeChat[] }>(
      '/community/chats',
    )
    return response.data
  } catch (error) {
    console.error('커뮤니티 채팅 API 실패:', error)
    return []
  }
}

export async function sendChat(message: string): Promise<void> {
  if (MOCK.communityWrite) {
    console.log('Mock: Sending chat', message)
    return
  }

  // 실제 경로: POST /community/chats
  await client.post('/community/chats', { content: message })
}

