'use client'

type PictureComponentProps = {
  className?: string
}

export default function PictureComponent({ className = '' }: PictureComponentProps) {
  return (
    <div className={`h-44 sm:h-52 md:h-full md:min-h-0 ${className}`}>
      <div
        className="relative h-full rounded-xl shadow-lg bg-[url(/assets/reserve-photo.avif)] bg-cover bg-center"
        role="img"
        aria-label="Terracotta restaurant dining"
      />
    </div>
  )
}
