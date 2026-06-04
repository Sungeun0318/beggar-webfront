type FlowStepProps = {
  index: string
  title: string
  body: string
}

export function FlowStep({ index, title, body }: FlowStepProps) {
  return (
    <div className="flex py-2">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white">
        <span className="font-extrabold text-accent">{index}</span>
      </div>
      <div className="w-3" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold">{title}</p>
        <p className="mt-0.5 text-xs font-semibold text-sub">{body}</p>
      </div>
    </div>
  )
}
