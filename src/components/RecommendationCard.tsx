import { radii } from '../theme/tokens'
import { softBox } from './ui/softBox'

type RecommendationCardProps = {
  image?: string
  tag: string
  title: string
  walk: string
  rating: string
  amount: string
  tagBg: string
  tagColor: string
  onMapTap?: () => void
}

function ImageBox({ src, size }: { src?: string; size: number }) {
  if (!src) {
    return (
      <div
        className="shrink-0 rounded-compact bg-muted"
        style={{ width: size, height: size }}
      />
    )
  }

  const imageSrc = src.startsWith('/') || src.startsWith('http')
    ? src
    : `/${src}`

  return (
    <img
      src={imageSrc}
      alt=""
      className="shrink-0 rounded-compact object-cover"
      style={{ width: size, height: size }}
    />
  )
}

export function RecommendationCard({
  image,
  tag,
  title,
  walk,
  rating,
  amount,
  tagBg,
  tagColor,
  onMapTap,
}: RecommendationCardProps) {
  return (
    <button
      type="button"
      onClick={onMapTap}
      className="relative h-[146px] w-full p-3 text-left"
      style={softBox({ radius: radii.card })}
    >
      <div className="flex">
        <ImageBox src={image} size={94} />
        <div className="w-3.5" />
        <div className="min-w-0 flex-1">
          <span
            className="inline-flex rounded-chip px-2 py-[3px] text-[11px] font-semibold"
            style={{ backgroundColor: tagBg, color: tagColor }}
          >
            {tag}
          </span>
          <div className="h-[7px]" />
          <h3
            className="truncate pr-12 text-[17px] font-extrabold text-text"
            style={{ letterSpacing: -0.5 }}
          >
            {title}
          </h3>
          <div className="h-1.5" />
          <div className="flex items-center">
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-darkSub">
              {rating}
            </span>
            <div className="w-2" />
            <span className="truncate text-[15px] font-extrabold text-accent">
              {amount}
            </span>
          </div>
          <div className="h-[7px]" />
          <p className="truncate text-xs font-semibold text-lightSub">{walk}</p>
        </div>
      </div>
      <span className="absolute right-0 top-0 rounded-bl-compact rounded-tr-card bg-kakaoYellow px-[9px] py-1 text-[11px] font-extrabold text-brown">
        착한가격업소
      </span>
    </button>
  )
}
