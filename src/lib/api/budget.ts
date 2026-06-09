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
  await client.post(
    `/rooms/${roomNo}/budget`,
    { budgetAmount: Math.floor(amount) },
  )
}

export async function confirmBudget(roomNo: number): Promise<void> {
  if (MOCK.budget) {
    return
  }

  // 실제 경로: POST /rooms/{no}/budget/confirm
  await client.post(
    `/rooms/${roomNo}/budget/confirm`,
    {},
  )
}

export async function getBudgetResult(roomNo: number): Promise<BudgetResult> {
  if (MOCK.budget) {
    return budgetResult
  }

  const token = localStorage.getItem('accessToken')

  // 실제 경로: GET /rooms/{no}/budget/result
  const response = await client.get<ApiResponse<BudgetResult>>(
    `/rooms/${roomNo}/budget/result`,
    undefined,
    { Authorization: `Bearer ${token}` },
  )
  return response.data
}

export async function downloadBudgetExcel(roomNo: number): Promise<void> {
  if (MOCK.budget) {
    console.log('Mock: Downloading Excel for room', roomNo)
    return
  }

  const blob = await client.blob(`/rooms/${roomNo}/budget/excel`)
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `budget_result_${roomNo}.xlsx`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
