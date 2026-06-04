import { receipts } from '../../mocks'
import type { Receipt } from '../../types'
import { client } from './client'
import { USE_MOCK } from './mockMode'

type ReceiptRequest = {
  title: string
  amount: number
  image?: string
}

export async function createReceipt(
  roomNo: number,
  request: ReceiptRequest,
): Promise<Receipt> {
  if (USE_MOCK) {
    return {
      date: new Date().toISOString().slice(0, 10).replaceAll('-', '.'),
      room: '명학역 데이트',
      image: request.image ?? '',
      title: request.title,
      amount: request.amount,
    }
  }

  // 실제 경로: POST /rooms/{no}/receipts
  return client.post<Receipt>(`/rooms/${roomNo}/receipts`, request)
}

export async function updateReceipt(
  roomNo: number,
  receiptId: number,
  request: ReceiptRequest,
): Promise<Receipt> {
  if (USE_MOCK) {
    return { ...receipts[0], ...request }
  }

  // 실제 경로: PATCH /rooms/{no}/receipts/{id}
  return client.patch<Receipt>(
    `/rooms/${roomNo}/receipts/${receiptId}`,
    request,
  )
}

export async function getRoomReceipts(roomNo: number): Promise<Receipt[]> {
  if (USE_MOCK) {
    return receipts
  }

  // 실제 경로: GET /rooms/{no}/receipts
  return client.getList<Receipt>(`/rooms/${roomNo}/receipts`)
}

export async function getMyReceipts(): Promise<Receipt[]> {
  if (USE_MOCK) {
    return receipts
  }

  // 실제 경로: GET /users/me/receipts
  return client.getList<Receipt>('/users/me/receipts')
}
