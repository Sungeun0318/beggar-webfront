import { receipts } from '../../mocks'
import type { Receipt } from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

type ReceiptRequest = {
  storeName: string
  amount: number
  receiptType: 'COMBINED' | 'SPLIT'
  inputMethod: 'CAMERA' | 'GALLERY' | 'MANUAL'
  image?: string
  uploaderUserNo?: number
}

export async function createReceipt(
  roomNo: number,
  request: ReceiptRequest,
): Promise<Receipt> {
  if (MOCK.receipts) {
    const newReceipt: Receipt = {
      id: Math.floor(Math.random() * 10000),
      date: new Date().toISOString().slice(0, 10).replaceAll('-', '.'),
      room: '명학역 데이트',
      image: request.image ?? 'assets/images/figma/receipt_food.png',
      title: request.storeName,
      amount: request.amount,
    }
    receipts.unshift(newReceipt) // 최신순으로 처음에 추가
    return newReceipt
  }

  // 실제 경로: POST /rooms/{no}/receipts
  return client.post<Receipt>(`/rooms/${roomNo}/receipts`, {
    ...request,
    uploaderUserNo: request.uploaderUserNo ?? 1, // TODO: 로그인 세션에서 가져와야 함
  })
}

export async function uploadReceiptImage(
  roomNo: number,
  file: File,
): Promise<string> {
  if (MOCK.receipts) {
    return 'assets/images/figma/receipt_food.png'
  }

  // 1. Presigned URL 받기 (fileName은 쿼리 파라미터로 전달)
  const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`
  const uploadUrl = await client.post<string>(
    `/rooms/${roomNo}/receipts/upload-url`,
    null,
    { fileName },
  )

  // 2. S3에 직접 업로드
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  if (!uploadResponse.ok) {
    throw new Error('S3 업로드 실패')
  }

  // 3. 업로드된 이미지의 최종 URL 반환
  return uploadUrl.split('?')[0]
}

let mockPollCount = 0 // Mock 분석 시뮬레이션을 위한 카운터

export async function getReceiptDetail(
  roomNo: number,
  receiptId: number,
): Promise<Receipt & { storeName?: string; totalAmount?: number; address?: string }> {
  if (MOCK.receipts) {
    const receipt = receipts.find(r => r.id === receiptId) || receipts[0]
    
    // 분석 중 시뮬레이션: 3번째 호출부터 결과 반환 (약 4~6초 대기 효과)
    mockPollCount++
    if (mockPollCount < 3) {
      return { ...receipt, storeName: '', totalAmount: 0 }
    }
    
    mockPollCount = 0 // 리셋
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

export async function getMyReceipts(): Promise<Receipt[]> {
  if (MOCK.receipts) {
    return receipts
  }

  // 실제 경로: GET /users/me/receipts
  return client.getList<Receipt>('/users/me/receipts')
}
