import type {
  RoomFreeChat,
  RoomFreePost,
  RoomFreePostDetail,
} from '../../types'
import { client } from './client'
import { USE_MOCK } from './mockMode'

const now = new Date().toISOString()
const mockPosts: RoomFreePost[] = [
  {
    id: 1,
    title: '오늘 점심 8천원 이하 맛집 공유해요',
    content: '강남역 근처에서 가성비 괜찮았던 곳 있으면 같이 추천해봐요.',
    author: '거지판다',
    tag: '절약팁',
    commentCount: 12,
    createdAt: '방금 전',
  },
  {
    id: 2,
    title: '데이트 예산 3만원이면 어떻게 짜?',
    content: '밥이랑 카페까지 가고 싶은데 괜찮은 루트 있으면 알려줘.',
    author: '거지판다',
    tag: '질문',
    commentCount: 8,
    createdAt: '9분 전',
  },
  {
    id: 3,
    title: '이번 주말 홍대 근처 절약 모임',
    content: '카페 대신 무료 전시 보고 산책하는 코스로 생각 중이에요.',
    author: '소금커피',
    tag: '같이해요',
    commentCount: 5,
    createdAt: '18분 전',
  },
  {
    id: 4,
    title: '쿠폰 같이 쓰면 편의점 도시락도 괜찮아요',
    content: '멤버십 할인에 앱 쿠폰까지 겹치면 점심 예산을 꽤 줄일 수 있어요.',
    author: '절약왕',
    tag: '절약팁',
    commentCount: 3,
    createdAt: '27분 전',
  },
]

export async function getPosts(keyword?: string): Promise<RoomFreePost[]> {
  if (USE_MOCK) {
    return keyword
      ? mockPosts.filter((post) => post.title.includes(keyword))
      : mockPosts
  }

  // 실제 경로: GET /api/freerooms/posts
  const response = await client.get<{ data: RoomFreePost[] }>(
    '/api/freerooms/posts',
    keyword ? { keyword } : undefined,
  )
  return response.data
}

export async function getPostDetail(
  postId: number,
): Promise<RoomFreePostDetail> {
  if (USE_MOCK) {
    return { ...mockPosts[0], id: postId, comments: [] }
  }

  // 실제 경로: GET /api/freerooms/posts/{id}
  const response = await client.get<{ data: RoomFreePostDetail }>(
    `/api/freerooms/posts/${postId}`,
  )
  return response.data
}

export async function createPost(request: {
  title: string
  content: string
  tag: string
}): Promise<RoomFreePost> {
  if (USE_MOCK) {
    return {
      id: mockPosts.length + 1,
      author: '거지판다',
      commentCount: 0,
      createdAt: now,
      ...request,
    }
  }

  // 실제 경로: POST /api/freerooms/posts
  const response = await client.post<{ data: RoomFreePost }>(
    '/api/freerooms/posts',
    request,
  )
  return response.data
}

export async function createComment(
  postId: number,
  content: string,
): Promise<void> {
  if (USE_MOCK) {
    return
  }

  // 실제 경로: POST /api/freerooms/posts/{id}/comments
  await client.post(`/api/freerooms/posts/${postId}/comments`, { content })
}

export async function getChats(): Promise<RoomFreeChat[]> {
  if (USE_MOCK) {
    return []
  }

  // 실제 경로: GET /api/freerooms/chats
  const response = await client.get<{ data: RoomFreeChat[] }>(
    '/api/freerooms/chats',
  )
  return response.data
}

export async function sendChat(message: string): Promise<void> {
  if (USE_MOCK) {
    return
  }

  // 실제 경로: POST /api/freerooms/chats
  await client.post('/api/freerooms/chats', message)
}
