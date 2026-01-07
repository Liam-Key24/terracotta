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
                        <p className="text-lg">Mon - Sun  | 10am - 10pm</p>
                    </div>
                </div>

                <div className="flex h-fit w-full flex-row items-center justify-center space-x-4 my-3">
                    <Link href="/menu" className="text-xl hover:text-white/80">Menu</Link>
                    <Link href="/#form" className="text-xl hover:text-white/80">Book Table</Link>
                    <Link href="/about" className="text-xl hover:text-white/80">About</Link>
                </div>

                <div className="flex flex-col items-center space-y-3">
                    <a
                        href="tel:02046298759"
                        className="flex items-center space-x-2 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#631732]/70 rounded-md"
                        aria-label="Call 020 4629 8759"
                    >
                        <PhoneCallIcon size={20} />
                        <span>020 4629 8759</span>
                    </a>

                    <a
                        href="mailto:info@terracotta-acton.com"
                        className="flex items-center space-x-2 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#631732]/70 rounded-md"
                        aria-label="Email info@terracotta-acton.com"
                    >
                        <AtIcon size={20} />
                        <span>info@terracotta-acton.com</span>
                    </a>
                </div>

            </footer>

        </>
    )
}

