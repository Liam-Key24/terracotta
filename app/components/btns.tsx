'use client'

import { ArrowLineRightIcon } from "@phosphor-icons/react"
import Link from "next/link"

export default function HeroBtn(){
    return(
        <>
            <div className="w-full h-auto flex items-center justify-center space-x-3 text-white z-40 absolute mt-5">
                <Link href={'/'} className="w-fit h-fit p-2 inline-flex space-x-2 items-center justify-center backdrop-blur-3xl bg-orange-700/10 rounded-full px-2 border border-orange-700/10 shadow-lg"> <span className="text-lg">Book table</span><ArrowLineRightIcon /></Link>
                <Link href={'/'} className="w-fit h-fit p-2 inline-flex space-x-2 items-center justify-center backdrop-blur-3xl bg-orange-700/10 rounded-full px-2 border border-orange-700/10 shadow-lg"> <span className="text-lg">See Menu</span><ArrowLineRightIcon /></Link>
            </div> 
        </>
    )
}