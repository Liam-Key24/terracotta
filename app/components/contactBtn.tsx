'use client'

import Link from 'next/link'
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react"

export default function ContactBtn() {
    return (
        <div>
            <Link
                href="/#form"
                className="
            group w-fit h-fit flex items-center justify-center 
            px-4 py-2 md:px-6 md:py-3 
            rounded-lg
             bg-orange-700/70 backdrop-blur-md border border-white/20
               text-white font-medium
             hover:bg-orange-700/90
              hover:-translate-y-1 hover:translate-x-2 
            transition-all duration-300 ease-in-out
    "
            >
                <span className="text-sm md:text-2xl">Contact</span>
                <ArrowRightIcon className="group-hover:hidden" />
                <ArrowUpRightIcon className="hidden group-hover:block" />
            </Link>
        </div>


    )
}