import { budgetResult } from '../../mocks'
import type { BudgetResult } from '../../types'
import { client } from './client'
import { USE_MOCK } from './mockMode'

export async function submitBudget(roomNo: number, amount: number): Promise<void> {
  if (USE_MOCK) {
    return
  }

  // 실제 경로: POST /rooms/{no}/budget
  await client.post(`/rooms/${roomNo}/budget`, { amount })
}

export async function confirmBudget(roomNo: number): Promise<void> {
  if (USE_MOCK) {
    return
  }

  // 실제 경로: POST /rooms/{no}/budget/confirm
  await client.post(`/rooms/${roomNo}/budget/confirm`)
}

export async function getBudgetResult(roomNo: number): Promise<BudgetResult> {
  if (USE_MOCK) {
    return budgetResult
  }

  // 실제 경로: GET /rooms/{no}/budget/result
  return client.get<BudgetResult>(`/rooms/${roomNo}/budget/result`)
}
