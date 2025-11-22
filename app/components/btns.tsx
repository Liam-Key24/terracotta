'use client'

import { ArrowRightIcon,ArrowUpRightIcon } from "@phosphor-icons/react"
import BookTableBtn from './bookTablebtn'
import Link from "next/link"

export default function HeroBtn() {
  return (
    <div className="w-full h-auto flex items-center justify-center space-x-3 text-white mt-5">
      
      
      <BookTableBtn/>

      <Link
        href="/menu"
        className="group w-fit h-fit flex space-x-2 p-2 md:p-3 items-center justify-center glass rounded-full 
                   hover:-translate-y-1 hover:translate-x-2 
                   transition-transform duration-300 ease-in-out"
      >
        <span className="text-lg md:text-2xl">See Menu</span>

        <ArrowRightIcon className="group-hover:hidden" />

        <ArrowUpRightIcon className="hidden group-hover:block"  />
      </Link>
    </div>
  )
}
