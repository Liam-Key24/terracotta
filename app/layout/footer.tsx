'use client'
import { AtIcon, PhoneCallIcon } from "@phosphor-icons/react"
import Link from "next/link"
export default function Footer() {
    return (
        <>
            <footer className="w-full h-auto flex flex-col space-y-10 py-5 my-2 items-center  bg-orange-700/70
        border border-white/20 shadow-lg shadow-black/10
        backdrop-blur-xl rounded-sm">

                <div className="flex flex-col w-full h-auto items-center mx-auto">
                    <h1 className="text-6xl">Terracotta</h1>
                    <div className="flex items-center w-full justify-center">
                        <p className="text-lg">Mon - Sun |</p>
                        <p className="text-lg">10am - 10pm</p>

                    </div>
                </div>

                <div className="w-full h-auto flex flex-col items-start ">
                    <div className="flex flex-col w-full h-auto items-center mx-auto space-y-3">
                        <Link href={'/'} className="text-xl">Menu</Link>
                        <Link href={'/'} className="text-xl">Book Table</Link>
                        <Link href={'/'} className="text-xl">About</Link>
                    </div>
                </div>

                <div className="w-full h-auto flex items-center justify-center space-x-3">

                    <div>
                        <span className="flex space-x-2 items-center"><PhoneCallIcon size={20} /><p>020202002</p></span>
                    </div>
                    <div>
                        <span className="flex space-x-1 items-center"><AtIcon size={20} /><a href="email">terracotta-acton@gmail.com</a></span>
                    </div>
                </div>


            </footer>
        </>
    )
}

