import { Users } from 'lucide-react'

import { radii } from '../theme/tokens'
import { ChipLabel } from './ChipLabel'
import { softBox } from './ui/softBox'

type ReceiptCardProps = {
  date: string
  room: string
  image?: string
  title: string
  amount: string
  onClick?: () => void
}

function ReceiptImage({ src }: { src?: string }) {
  if (!src) {
    return <div className="h-[54px] w-[54px] shrink-0 rounded-compact bg-muted" />
  }

  return (
    <img
      src={src}
      alt=""
      className="h-[54px] w-[54px] shrink-0 rounded-compact object-cover"
    />
  )
}

export function ReceiptCard({
  date,
  room,
  image,
  title,
  amount,
  onClick,
}: ReceiptCardProps) {
  return (
    <div 
      className="h-[138px] p-[17px] transition-opacity active:opacity-70 cursor-pointer" 
      style={softBox({ radius: radii.card })}
      onClick={onClick}
    >
      <div className="flex items-center">
        <span className="text-xs font-semibold text-lightSub">{date}</span>
        <div className="flex-1" />
        <ChipLabel Icon={Users} label={room} />
      </div>
      <div className="h-2.5" />
      <div className="h-px bg-muted" />
      <div className="h-3" />
      <div className="flex items-center">
        <ReceiptImage src={image} />
        <div className="w-4" />
        <div className="min-w-0">
          <h3
            className="truncate text-base font-semibold"
            style={{ letterSpacing: -0.7 }}
          >
            {title}
          </h3>
          <p className="mt-1 text-base font-black text-danger">{amount}</p>
        </div>
      </div>
    </div>
  )
}
