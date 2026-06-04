import { CircleCheck, Hourglass, User } from 'lucide-react'

import { colors, radii } from '../theme/tokens'
import { softBox } from './ui/softBox'

type ParticipantTileProps = {
  name: string
  status: string
  active: boolean
}

export function ParticipantTile({ name, status, active }: ParticipantTileProps) {
  const stateColor = active ? colors.accent : colors.sub
  const StateIcon = active ? Hourglass : CircleCheck

  return (
    <div
      className="mb-2.5 flex h-[58px] items-center px-4"
      style={softBox({ radius: radii.compact })}
    >
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
        style={{ backgroundColor: active ? colors.accentBg : colors.bg }}
      >
        <User
          aria-hidden="true"
          size={20}
          color={active ? colors.accent : colors.lightSub}
        />
      </div>
      <div className="w-3" />
      <span className="text-[15px] font-semibold">{name}</span>
      <div className="flex-1" />
      <span className="text-[13px] font-semibold" style={{ color: stateColor }}>
        {status}
      </span>
      <div className="w-1" />
      <StateIcon aria-hidden="true" size={18} color={stateColor} />
    </div>
  )
}
