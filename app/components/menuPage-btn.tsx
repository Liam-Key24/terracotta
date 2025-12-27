'use client'

import Link from 'next/link'
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react"

export default function MenuBtn() {
    return (
        <div>
            <Link
                href="/menu"
                className="
            group w-fit h-fit flex items-center justify-center 
            px-4 py-2 md:px-6 md:py-3 
            rounded-lg
             bg-[#631732]/70 backdrop-blur-md border border-white/20
               text-white font-medium
             hover:bg-[#631732]/90
              hover:-translate-y-1 hover:translate-x-2 
            transition-all duration-300 ease-in-out
    "
            >
                <span className="text-sm md:text-2xl">See Menu</span>
                <ArrowRightIcon className="group-hover:hidden" />
                <ArrowUpRightIcon className="hidden group-hover:block" />
            </Link>
        </div>


    )
}

export function MenuBtnTwo() {
   return( <>
        <a
          href="/menu"
          className="group w-1/3 h-fit flex space-x-2 p-2 md:p-3 items-center justify-center bg-[#631732]/70 backdrop-blur-md border border-white/20 text-white font-medium rounded-2xl 
  hover:-translate-y-1 hover:translate-x-2 hover:bg-[#631732]/90
  transition-transform duration-300 ease-in-out"
        >
          <span className="text-lg md:text-2xl">Menu</span>
  
          <ArrowRightIcon className="group-hover:hidden" />
  
          <ArrowUpRightIcon className="hidden group-hover:block" />
        </a>
      </>)
}