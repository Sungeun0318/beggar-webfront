import type {
  RoomFreeChat,
  RoomFreeComment,
  RoomFreePost,
  RoomFreePostDetail,
} from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

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

const mockChats: RoomFreeChat[] = [
  {
    id: 1,
    sender: '절약왕',
    message: '오늘 편의점 도시락 할인 정보 본 사람?',
    createdAt: '오후 2:13',
    isMine: false,
  },
  {
    id: 2,
    sender: '거지판다',
    message: 'CU 앱에서 쿠폰 같이 쓰면 6천원대로 가능하더라.',
    createdAt: '오후 2:14',
    isMine: true,
  },
  {
    id: 3,
    sender: '소금커피',
    message: '명학역 쪽 착한가격 업소도 괜찮았어.',
    createdAt: '오후 2:18',
    isMine: false,
  },
  {
    id: 4,
    sender: '한푼두푼',
    message: '게시판에 링크 올려줄게.',
    createdAt: '오후 2:20',
    isMine: false,
  },
]

const mockComments: RoomFreeComment[] = [
  {
    id: 1,
    author: '소금커피',
    content: '역삼 쪽 착한가격 업소 하나 있는데 링크 찾아볼게.',
    createdAt: '방금 전',
  },
  {
    id: 2,
    author: '거지판다',
    content: '나는 김밥집 + 카페 쿠폰 조합 추천.',
    createdAt: '3분 전',
  },
  {
    id: 3,
    author: '절약왕',
    content: '점심이면 백반집이 제일 안정적이긴 해.',
    createdAt: '7분 전',
  },
]

export async function getPosts(keyword?: string): Promise<RoomFreePost[]> {
  if (MOCK.communityRead) {
    return getMockPosts(keyword)
  }

  // 실제 경로: GET /api/freerooms/posts
  try {
    const response = await client.get<{ data: RoomFreePost[] }>(
      '/api/freerooms/posts',
      keyword ? { keyword } : undefined,
    )
    return response.data
  } catch (error) {
    console.warn('커뮤니티 게시글 API 실패 - mock 대체', error)
    return getMockPosts(keyword)
  }
}

export async function getPopularPosts(): Promise<RoomFreePost[]> {
  if (MOCK.communityRead) {
    // 인기글 모크: 댓글 많은 순으로 정렬하여 상위 10개 (여기서는 그냥 mockPosts 활용)
    return [...mockPosts].sort((a, b) => b.commentCount - a.commentCount).slice(0, 10)
  }

  // 실제 경로: GET /api/freerooms/posts/popular
  try {
    const response = await client.get<{ data: RoomFreePost[] }>(
      '/api/freerooms/posts/popular'
    )
    return response.data
  } catch (error) {
    console.warn('인기 게시글 API 실패 - mock 대체', error)
    return mockPosts.slice(0, 10)
  }
}

export async function getPostDetail(
  postId: number,
): Promise<RoomFreePostDetail> {
  if (MOCK.communityRead) {
    return getMockPostDetail(postId)
  }

  // 실제 경로: GET /api/freerooms/posts/{id}
  try {
    const response = await client.get<{ data: RoomFreePostDetail }>(
      `/api/freerooms/posts/${postId}`,
    )
    return response.data
  } catch (error) {
    console.warn('커뮤니티 게시글 상세 API 실패 - mock 대체', error)
    return getMockPostDetail(postId)
  }
}

export async function createPost(request: {
  title: string
  content: string
  tag: string
}): Promise<void> {
  if (MOCK.communityWrite) {
    return
  }

  // 실제 경로: POST /api/freerooms/posts
  await client.post('/api/freerooms/posts', request)
}

export async function createComment(
  postId: number,
  content: string,
): Promise<void> {
  if (MOCK.communityWrite) {
    return
  }

  // 실제 경로: POST /api/freerooms/posts/{id}/comments
  await client.post(`/api/freerooms/posts/${postId}/comments`, { content })
}

export async function getChats(): Promise<RoomFreeChat[]> {
  if (MOCK.communityRead) {
    return mockChats
  }

  // 실제 경로: GET /api/freerooms/chats
  try {
    const response = await client.get<{ data: RoomFreeChat[] }>(
      '/api/freerooms/chats',
    )
    return response.data
  } catch (error) {
    console.warn('커뮤니티 채팅 API 실패 - mock 대체', error)
    return mockChats
  }
}

export async function sendChat(message: string): Promise<void> {
  if (MOCK.communityWrite) {
    return
  }

  // 실제 경로: POST /api/freerooms/chats
  await client.post('/api/freerooms/chats', { content: message })
}

function getMockPosts(keyword?: string): RoomFreePost[] {
  return keyword
    ? mockPosts.filter((post) => post.title.includes(keyword))
    : mockPosts
}

function getMockPostDetail(postId: number): RoomFreePostDetail {
  const post = mockPosts.find(({ id }) => id === postId) ?? mockPosts[0]

  return { ...post, comments: mockComments }
}
