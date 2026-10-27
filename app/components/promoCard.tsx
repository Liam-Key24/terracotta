'use client'

type PromoCardProps = {
  className?: string
  eyebrow?: string
  title: string
  description: string
  secondary?: string
  code?: string
}

export default function PromoCard({
  className = '',
  eyebrow = 'Limited Offer',
  title,
  description,
  secondary,
  code,
}: PromoCardProps) {
  return (
    <div
      className={`rounded-xl overflow-hidden shadow-lg bg-[#631732] flex flex-col justify-center items-center text-center gap-2.5 sm:gap-3 p-5 sm:p-6 md:h-full md:min-h-0 md:p-8 md:gap-3 text-white ${className}`}
    >
      <span className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase bg-white/20 px-3 py-1 rounded-full">
        {eyebrow}
      </span>

      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold leading-snug max-w-md">
        {title}
      </h3>

      <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-md">
        {description}
      </p>

      {secondary ? (
        <p className="hidden sm:block text-sm md:text-base text-white/90 leading-relaxed max-w-md">
          {secondary}
        </p>
      ) : null}

      {code ? (
        <span className="text-sm font-medium bg-white/15 border border-white/30 rounded-md px-4 py-2 mt-0.5 sm:mt-1">
          Code: <span className="font-bold tracking-wider">{code}</span>
        </span>
      ) : null}
    </div>
  )
}
