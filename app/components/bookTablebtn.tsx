'use client'

import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react'

export default function BookTableBtn() {
    return (
        <>
            <a
                href="/#form"
                className="group w-fit h-fit flex space-x-2 p-2 md:p-3 items-center justify-center glass rounded-full 
        hover:-translate-y-1 hover:translate-x-2 
        transition-transform duration-300 ease-in-out"
            >
                <span className="text-lg md:text-2xl">Book table</span>

                <ArrowRightIcon className="group-hover:hidden" />

                <ArrowUpRightIcon className="hidden group-hover:block" />
            </a>
        </>
    )
}