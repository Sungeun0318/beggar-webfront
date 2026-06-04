export function money(value: number): string {
  return Math.trunc(value).toLocaleString('en-US')
}
