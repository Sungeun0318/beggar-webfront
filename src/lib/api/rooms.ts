import { members, room } from '../../mocks'
import type { Member, Room } from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

type CreateRoomRequest = {
  name: string
  location: string
  tags: string[]
  memberCount: number
}

type UpdateRoomSettingsRequest = Partial<{
  name: string
  location: string
  tags: string[]
  maxMemberCount: number
}>

export async function getMyRooms(): Promise<Room[]> {
  if (MOCK.rooms) {
    return [room]
  }

  // 실제 경로: GET /rooms/my
  return client.getList<Room>('/rooms/my')
}

export async function createRoom(request: CreateRoomRequest): Promise<Room> {
  if (MOCK.rooms) {
    return { ...room, ...request }
  }

  // 실제 경로: POST /rooms
  return client.post<Room>('/rooms', request)
}

export async function getRoom(no: number): Promise<Room> {
  if (MOCK.rooms) {
    return room
  }

  // 실제 경로: GET /rooms/{no}
  return client.get<Room>(`/rooms/${no}`)
}

export async function updateRoomSettings(
  no: number,
  request: UpdateRoomSettingsRequest,
): Promise<Room> {
  if (MOCK.rooms) {
    return { ...room, ...request }
  }

  // 실제 경로: PATCH /rooms/{no}/settings
  return client.patch<Room>(`/rooms/${no}/settings`, request)
}

export async function joinRoom(code: string): Promise<Room> {
  if (MOCK.rooms) {
    return { ...room, code }
  }

  // 실제 경로: POST /rooms/join
  return client.post<Room>('/rooms/join', { code })
}

export async function getRoomMembers(no: number): Promise<Member[]> {
  if (MOCK.rooms) {
    return members
  }

  // 실제 경로: GET /rooms/{no}/members
  return client.getList<Member>(`/rooms/${no}/members`)
}
