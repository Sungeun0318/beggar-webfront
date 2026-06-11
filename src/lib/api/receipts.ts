import { receipts } from '../../mocks'
import type { Receipt, ReceiptHistory } from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

type ReceiptRequest = {
  storeName: string
  amount: number
  receiptType: 'COMBINED' | 'SPLIT'
  inputMethod: 'CAMERA' | 'GALLERY' | 'MANUAL'
  image?: string
  imageUrl?: string
  uploaderUserNo?: number
}

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export async function createReceipt(
  roomNo: number,
  request: ReceiptRequest,
): Promise<Receipt> {
  return client.post<Receipt>(`/rooms/${roomNo}/receipts`, {
    ...request,
    uploaderUserNo: request.uploaderUserNo ?? 1,
  })
}

export async function updateReceipt(
  roomNo: number,
  receiptId: number,
  request: Partial<ReceiptRequest>,
): Promise<Receipt> {
  if (MOCK.receipts) {
    const index = receipts.findIndex(r => r.id === receiptId)
    if (index !== -1) {
      receipts[index] = { ...receipts[index], title: request.storeName || receipts[index].title, amount: request.amount || receipts[index].amount }
      return receipts[index]
    }
    return receipts[0]
  }

  // 실제 경로: PATCH /rooms/{no}/receipts/{id}
  return client.patch<Receipt>(`/rooms/${roomNo}/receipts/${receiptId}`, request)
}

export async function uploadReceiptImage(
  roomNo: number,
  file: File,
): Promise<string> {
  if (MOCK.receipts) {
    return 'assets/images/figma/receipt_food.png'
  }

  const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`
  const uploadUrl = await client.post<string>(
    `/rooms/${roomNo}/receipts/upload-url`,
    null,
    { fileName },
  )

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error('S3 업로드 실패')
  }

  return uploadUrl.split('?')[0]
}

let mockPollCount = 0

export async function getReceiptDetail(
  roomNo: number,
  receiptId: number,
): Promise<Receipt & { storeName?: string; totalAmount?: number; address?: string }> {
  if (MOCK.receipts) {
    const receipt = receipts.find(r => r.id === receiptId) || receipts[0]
    

    mockPollCount++
    if (mockPollCount < 3) {
      return { ...receipt, storeName: '', totalAmount: 0 }
    }
    
    mockPollCount = 0
    return {
      ...receipt,
      storeName: '메가커피 명학역점',
      totalAmount: 12500,
      address: '경기 안양시 만안구 안양동 123-45',
    }
  }

  // 실제 경로: GET /rooms/{no}/receipts/{id}
  return client.get(`/rooms/${roomNo}/receipts/${receiptId}`)
}

export async function getRoomReceipts(roomNo: number): Promise<Receipt[]> {
  if (MOCK.receipts) {
    return receipts
  }

  // 실제 경로: GET /rooms/{no}/receipts
  return client.getList<Receipt>(`/rooms/${roomNo}/receipts`)
}

export async function getMyReceipts(): Promise<ReceiptHistory> {
  if (MOCK.receipts) {
    return {
      receipts: receipts.map((receipt, index) => ({
        receiptId: receipt.receiptId || receipt.id || index + 1,
        roomNo: 1,
        roomName: receipt.room,
        receiptType: receipt.receiptType || 'COMBINED',
        amount: receipt.amount,
        createdAt: receipt.createdAt || `${receipt.date.replaceAll('.', '-')}T00:00:00`,
      })),
      totalAmount: receipts.reduce((sum, receipt) => sum + receipt.amount, 0),
    }
  }

  // 실제 경로: GET /users/me/receipts
  const response = await client.get<ApiResponse<ReceiptHistory>>('/users/me/receipts')
  return response.data
}

export async function deleteReceipt(
  roomNo: number,
  receiptId: number,
): Promise<void> {
  if (MOCK.receipts) {
    const index = receipts.findIndex(r => r.id === receiptId)
    if (index !== -1) {
      receipts.splice(index, 1)
    }
    return
  }

  // 실제 경로: DELETE /rooms/{no}/receipts/{id}
  return client.del(`/rooms/${roomNo}/receipts/${receiptId}`)
}
