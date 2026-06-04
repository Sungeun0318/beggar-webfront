import type { LucideIcon } from 'lucide-react'

import { colors, radii } from '../theme/tokens'
import { softBox } from './ui/softBox'

type InfoCardProps = {
  Icon: LucideIcon
  title: string
  body?: string
}

export function InfoCard({ Icon, title, body }: InfoCardProps) {
  const hasBody = body != null

  return (
    <div
      className="flex items-center px-5"
      style={{
        ...softBox({ color: colors.accentBg, radius: radii.compact }),
        height: hasBody ? 107 : 67,
      }}
    >
      <div
        className="grid shrink-0 place-items-center rounded-full bg-white"
        style={{
          width: hasBody ? 38 : 34,
          height: hasBody ? 38 : 34,
        }}
      >
        <Icon
          aria-hidden="true"
          color={colors.accent}
          size={hasBody ? 20 : 17}
        />
      </div>
      <div className="w-[13px]" />
      <div className="min-w-0">
        <p
          className="text-[14.5px] font-semibold"
          style={{ letterSpacing: -0.55 }}
        >
          {title}
        </p>
        {body && (
          <p className="mt-1.5 text-[13px] font-bold leading-[1.38] text-sub">
            {body}
          </p>
        )}
      </div>
    </div>
  )
}
