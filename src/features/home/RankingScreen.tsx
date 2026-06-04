import { Trophy, User } from 'lucide-react'

import { AppHeaderBrand } from '../../components/AppHeader'
import { BottomNav } from '../../components/BottomNav'
import { PhoneFrame } from '../../components/PhoneFrame'
import { colors, gradients, radii, spacing } from '../../theme/tokens'

const participants = Array.from({ length: 15 }, (_, index) => ({
  rank: index + 1,
  name: index < 3 ? '박진감' : '거지가 아닙니다',
}))

function medalGradient(rank: number) {
  if (rank === 1) return gradients.medalGold
  if (rank === 2) return gradients.medalSilver
  if (rank === 3) return gradients.medalBronze
  return undefined
}

function ParticipantRow({ rank, name }: { rank: number; name: string }) {
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
          : '0 4px 4px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div
        className="w-[50px] text-[25px] font-semibold"
        style={{ color: textColor, letterSpacing: -0.31 }}
      >
        {rank}위
      </div>
      <div className="w-2" />
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/45 bg-bg p-0.5">
        <div className="grid h-full w-full place-items-center rounded-full bg-canvas">
          <User aria-hidden="true" size={22} color={colors.sub} />
        </div>
      </div>
      <div className="w-3" />
      <span
        className="text-[15px] font-bold"
        style={{ color: textColor, letterSpacing: -0.23 }}
      >
        {name}
      </span>
      <div className="flex-1" />
      <div className="grid h-[60px] w-20 place-items-center">
        <Icon aria-hidden="true" size={40} color={textColor} opacity={0.8} />
      </div>
    </div>
  )
}

export function RankingScreen() {
  return (
    <PhoneFrame>
      <main className="relative min-h-[852px] bg-bg">
        <AppHeaderBrand title="거지 랭킹" showNotification={false} />
        <section
          className="absolute inset-x-0 bottom-0 overflow-y-auto px-pageH"
          style={{
            top: spacing.contentTop,
            paddingBottom: spacing.bottomSafe,
          }}
        >
          <div className="flex flex-col gap-2.5">
            {participants.map((participant) => (
              <ParticipantRow key={participant.rank} {...participant} />
            ))}
          </div>
        </section>
        <BottomNav />
      </main>
    </PhoneFrame>
  )
}
