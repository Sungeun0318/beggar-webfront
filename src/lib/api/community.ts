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
    title: '명학역 근처 저녁 추천해줘',
    content: '예산 적당한 곳 찾고 있어.',
    author: '거지판다',
    tag: '질문',
    commentCount: 0,
    createdAt: now,
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
