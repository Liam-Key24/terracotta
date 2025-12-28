'use client'

import { CtaLinkButton } from './CtaLinkButton'

export default function HeroBtn() {
  return (
    <div className="w-full flex items-center justify-center gap-4 text-white mt-6">
      <CtaLinkButton href="/#form" label="Book table" ariaLabel="Book a table" />
      <CtaLinkButton />
    </div>
  )
}
