import { receipts } from '../../mocks'
import type { Receipt, ReceiptHistory, SplitGroup } from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

export type ReceiptRequest = {
  storeName?: string
  title?: string
  amount: number
  totalAmount?: number
  receiptType: 'COMBINED' | 'SPLIT'
  inputMethod: 'CAMERA' | 'GALLERY' | 'MANUAL'
  image?: string
  imageUrl?: string
  imageHash?: string
  uploaderUserNo?: number
  splitGroupId?: number
  address?: string
  centerLat?: number
  centerLng?: number
  receiptIssuedAt?: string
}

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type ReceiptDuplicateCheckRequest = {
  receiptType: 'COMBINED' | 'SPLIT'
  storeName?: string
  address?: string
  amount: number
  splitGroupId?: number
  receiptIssuedAt?: string
  excludeReceiptId?: number
}

export type ReceiptDuplicateCandidate = {
  receiptId: number
  roomNo: number
  uploaderUserNo: number
  receiptType: string
  inputMethod: string
  storeName?: string
  address?: string
  amount: number
  splitGroupId?: number | null
  receiptIssuedAt?: string | null
  createdAt: string
}

export type ReceiptDuplicateCheckResponse = {
  hasDuplicate: boolean
  candidates: ReceiptDuplicateCandidate[]
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

export async function checkReceiptDuplicate(
  roomNo: number,
  request: ReceiptDuplicateCheckRequest,
): Promise<ReceiptDuplicateCheckResponse> {
  if (MOCK.receipts) {
    const candidates = receipts
      .filter(receipt => {
        const sameStore = (receipt.storeName || receipt.title || '').trim() === (request.storeName || '').trim()
        const sameAmount = receipt.amount === request.amount
        return sameStore && sameAmount
      })
      .slice(0, 5)
      .map(receipt => ({
        receiptId: receipt.receiptId || receipt.id || receipt.no || 0,
        roomNo,
        uploaderUserNo: 0,
        receiptType: receipt.receiptType || 'COMBINED',
        inputMethod: 'MANUAL',
        storeName: receipt.storeName || receipt.title,
        address: receipt.address,
        amount: receipt.amount,
        splitGroupId: receipt.splitGroupId ?? null,
        receiptIssuedAt: receipt.receiptIssuedAt ?? null,
        createdAt: receipt.createdAt || new Date().toISOString(),
      }))

    return {
      hasDuplicate: candidates.length > 0,
      candidates,
    }
  }

  return client.post<ReceiptDuplicateCheckResponse>(
    `/rooms/${roomNo}/receipts/duplicate-check`,
    request,
  )
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
  imageHash?: string,
): Promise<string> {
  if (MOCK.receipts) {
    return 'assets/images/figma/receipt_food.png'
  }

  const safeName = file.name.replace(/\s/g, '_')
  const fileName = imageHash ? `${imageHash}_${safeName}` : `${Date.now()}_${safeName}`
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

export async function uploadReceiptImageWithHash(
  roomNo: number,
  file: File,
): Promise<{ imageUrl: string; imageHash: string }> {
  const imageHash = await calculateFileSha256(file)
  const imageUrl = await uploadReceiptImage(roomNo, file, imageHash)
  return { imageUrl, imageHash }
}

async function calculateFileSha256(file: File): Promise<string> {
  if (!window.crypto?.subtle) {
    throw new Error('브라우저가 파일 중복 검사를 지원하지 않습니다.')
  }

  const hashBuffer = await window.crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
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

export async function createSplitGroup(
  roomNo: number,
  request: {
    storeName: string
    address: string
    centerLat?: number
    centerLng?: number
  },
): Promise<SplitGroup> {
  return client.post<SplitGroup>(`/rooms/${roomNo}/receipts/split-groups`, request)
}

export async function getSplitGroups(
  roomNo: number,
  status?: 'OPEN' | 'CLOSED',
): Promise<SplitGroup[]> {
  return client.getList<SplitGroup>(
    `/rooms/${roomNo}/receipts/split-groups`,
    status ? { status } : undefined,
  )
}

export async function getSplitGroup(
  roomNo: number,
  groupId: number,
): Promise<SplitGroup> {
  return client.get<SplitGroup>(`/rooms/${roomNo}/receipts/split-groups/${groupId}`)
}

export async function closeSplitGroup(
  roomNo: number,
  groupId: number,
): Promise<SplitGroup> {
  return client.post<SplitGroup>(`/rooms/${roomNo}/receipts/split-groups/${groupId}/close`)
}

export async function getMyReceipts(): Promise<ReceiptHistory> {
  if (MOCK.receipts) {
    return {
      receipts: receipts.map((receipt, index) => ({
        receiptId: receipt.receiptId || receipt.id || index + 1,
        roomNo: 1,
        roomName: receipt.room,
        storeName: receipt.storeName || receipt.title,
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
