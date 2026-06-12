import { Loader2, Trophy, User } from 'lucide-react'
import { useEffect, useState } from 'react'

import { AppHeaderBrand } from '../../components/AppHeader'
import { BottomNav } from '../../components/BottomNav'
import { PhoneFrame } from '../../components/PhoneFrame'
import { getRanking } from '../../lib/api/ranking'
import { colors, gradients, radii, spacing } from '../../theme/tokens'
import type { RankingEntry } from '../../types'

function medalGradient(rank: number) {
  if (rank === 1) return gradients.medalGold
  if (rank === 2) return gradients.medalSilver
  if (rank === 3) return gradients.medalBronze
  return undefined
}

function ParticipantRow({ rank, roomName, score, title }: RankingEntry) {
  const gradient = medalGradient(rank)
  const isMedal = gradient != null
  const textColor = isMedal ? '#FFFFFF' : colors.text
  const Icon = isMedal ? Trophy : User

  return (
    <div
      className="flex h-[79px] items-center rounded-card border px-4"
      style={{
        background: gradient ?? '#FFFFFF',
        borderColor: '#E8D9D9',
        borderWidth: 0.65,
        borderRadius: radii.card,
        boxShadow: isMedal
          ? '0 4px 2px rgba(0, 0, 0, 0.25)'
          : '0 4px 4px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div
        className="w-[50px] text-[25px] font-semibold"
        style={{ color: textColor, letterSpacing: -0.31 }}
      >
        {rank}위
      </div>
      <div className="w-2" />
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/20 bg-bg p-0.5">
        <div className="grid h-full w-full place-items-center rounded-full bg-canvas">
          <User aria-hidden="true" size={22} color={colors.sub} />
        </div>
      </div>
      <div className="w-3" />
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[15px] font-bold"
          style={{ color: textColor, letterSpacing: -0.23 }}
        >
          {roomName}
        </p>
        <p
          className="mt-0.5 truncate text-xs font-semibold"
          style={{ color: textColor, opacity: 0.78 }}
        >
          {title}
        </p>
      </div>
      <div className="grid h-[60px] w-20 place-items-center">
        <span
          className="text-[18px] font-black"
          style={{ color: textColor }}
        >
          {score}점
        </span>
        <Icon aria-hidden="true" size={28} color={textColor} opacity={0.35} />
      </div>
    </div>
  )
}

export function RankingScreen() {
  const [entries, setEntries] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    getRanking(15)
      .then((data) => {
        if (!ignore) setEntries(data)
      })
      .catch((err) => {
        console.error('Failed to load ranking:', err)
        if (!ignore) setError('랭킹을 불러오지 못했어요.')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderBrand title="거지 랭킹" showNotification={false} />
        <section className="px-pageH pt-2" style={{ paddingBottom: spacing.bottomSafe }}>
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="animate-spin" size={40} color={colors.accent} />
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-sm font-bold text-sub">
              {error}
            </div>
          ) : entries.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {entries.map((entry) => (
                <ParticipantRow key={`${entry.roomNo}-${entry.rank}`} {...entry} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm font-bold text-sub">
              아직 랭킹이 없어요.
            </div>
          )}
        </section>
        <BottomNav />
      </main>
    </PhoneFrame>
  )
}
