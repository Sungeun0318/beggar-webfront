import { budgetResult } from '../../mocks'
import type { BudgetResult } from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export async function submitBudget(roomNo: number, amount: number): Promise<void> {
  if (MOCK.budget) {
    return
  }

  // 실제 경로: POST /rooms/{no}/budget
  await client.post(`/rooms/${roomNo}/budget`, { budgetAmount: amount })
}

export async function confirmBudget(roomNo: number): Promise<void> {
  if (MOCK.budget) {
    return
  }

  // 실제 경로: POST /rooms/{no}/budget/confirm
  await client.post(`/rooms/${roomNo}/budget/confirm`)
}

export async function getBudgetResult(roomNo: number): Promise<BudgetResult> {
  if (MOCK.budget) {
    return budgetResult
  }

  // 실제 경로: GET /rooms/{no}/budget/result
  const response = await client.get<ApiResponse<BudgetResult>>(
    `/rooms/${roomNo}/budget/result`,
  )
  return response.data
}
