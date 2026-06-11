import type {
  RoomFreeChat,
  RoomFreePost,
  RoomFreePostDetail,
} from '../../types'
import { client } from './client'

export async function getPosts(keyword?: string): Promise<RoomFreePost[]> {
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
  // 실제 경로: GET /community/posts/popular
  try {
    const response = await client.get<{ data: RoomFreePost[] }>(
      '/community/posts/popular'
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
  // 실제 경로: POST /community/posts
  await client.post('/community/posts', request)
}

export async function deletePost(postId: number): Promise<void> {
  // 실제 경로: DELETE /community/posts/{id}
  await client.del(`/community/posts/${postId}`)
}

export async function createComment(
  postId: number,
  content: string,
): Promise<void> {
  // 실제 경로: POST /community/posts/{id}/comments
  await client.post(`/community/posts/${postId}/comments`, { content })
}

export async function getChats(): Promise<RoomFreeChat[]> {
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
  // 실제 경로: POST /community/chats
  await client.post('/community/chats', { content: message })
}
