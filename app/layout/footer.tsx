'use client'
import { AtIcon, PhoneCallIcon } from "@phosphor-icons/react"
import Link from "next/link"
export default function Footer() {
    return (
        <>
            <footer
                className="w-full py-8 mt-4 bg-[#631732]/70 text-white
               border border-white/20 shadow-lg shadow-black/10
               backdrop-blur-xl rounded-lg
               grid grid-cols-1 md:grid-cols-3 
               place-items-center">

                <div className="flex flex-col items-center text-center">
                    <h1 className="text-6xl">Terracotta</h1>
                    <div className="flex items-center space-x-2">
                        <p className="text-lg">Mon - Sun</p>
                        <p className="text-lg">10am - 10pm</p>
                    </div>
                </div>

                <div className="flex flex-col h-fit w-full lg:flex-row items-center justify-center lg:space-x-4 ">
                    <Link href="/" className="text-xl hover:text-white/80">Menu</Link>
                    <Link href="#form" className="text-xl hover:text-white/80">Book Table</Link>
                    <Link href="/about" className="text-xl hover:text-white/80">About</Link>
                </div>

                <div className="flex flex-col items-center space-y-3">
                    <span className="flex items-center space-x-2 hover:text-white/80">
                        <PhoneCallIcon size={20} />
                        <p>020 4629 8759</p>
                    </span>

                    <span className="flex items-center space-x-2 hover:text-white/80">
                        <AtIcon size={20} />
                        <a href="mailto:info@terracotta-acton.com">
                            info@terracotta-acton.com
                        </a>
                    </span>
                </div>

            </footer>

        </>
    )
}

