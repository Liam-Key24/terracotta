'use client'

type PromoCardProps = {
  className?: string
}

export default function PromoCard({ className = '' }: PromoCardProps) {
  return (
    <div className={`rounded-xl overflow-hidden shadow-lg bg-[#631732] flex flex-col justify-center items-center text-center gap-2.5 sm:gap-3 p-5 sm:p-6 md:h-full md:min-h-0 md:p-8 md:gap-3 text-white ${className}`}>
      <span className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase bg-white/20 px-3 py-1 rounded-full">
        Limited Offer
      </span>

      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold leading-snug max-w-md">
        20% OFF Your Bill at Terracotta Acton ✨
      </h3>

      <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-md">
        Enjoy 20% off tapas, paella and thin crust pizza when you book online. Valid Sunday evening to Thursday.
      </p>

      <p className="hidden sm:block text-sm md:text-base text-white/90 leading-relaxed max-w-md">
        Gather your friends, savour authentic tapas, and make your weekday dining even more rewarding.
      </p>

      <span className="text-sm font-medium bg-white/15 border border-white/30 rounded-md px-4 py-2 mt-0.5 sm:mt-1">
        Code: <span className="font-bold tracking-wider">ACTON76</span>
      </span>
    </div>
  )
}
