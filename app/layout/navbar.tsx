'use client'

import { useState } from 'react'
import { ListIcon, XIcon } from '@phosphor-icons/react'
import Link from 'next/link'

export default function NavBar() {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <>
      {/* NAV */}
      <nav className="
        fixed top-4 left-1/2 -translate-x-1/2 z-60
        w-[90%] h-12 px-6 flex items-center justify-between
        rounded-lg bg-orange-700/30
        border border-white/20 shadow-lg shadow-black/10
      ">
        <Link href="/" className="cursor-pointer">
          <h1 className="text-xl text-white">Terracotta</h1>
        </Link>

        <div>
          {isNavOpen ? (
            <XIcon size={20} onClick={() => setIsNavOpen(false)} color="white" />
          ) : (
            <ListIcon size={20} onClick={() => setIsNavOpen(true)} color="white" />
          )}
        </div>
      </nav>


      {/* BLURRED DROPDOWN CONTAINER */}
      <div
        className={`
          fixed left-1/2 -translate-x-1/2 top-4 z-50 w-[90%]
          backdrop-blur-xl bg-orange-700/10
          border border-orange-700/20 shadow-lg shadow-black/10
          rounded-lg overflow-hidden
          transition-all duration-300 ease-in-out
          ${isNavOpen ? 'h-50 opacity-100' : 'h-10 opacity-0'}
        `}
      >
        {/* CONTENT */}
        <div
          className={`
            flex flex-col items-center gap-4
            text-white transition-[max-height,opacity,padding]
            duration-300 ease-in-out
            ${isNavOpen ? 'opacity-100 max-h-96 pt-15' : 'opacity-0 max-h-0 pt-0'}
          `}
        >
          <Link href="#" className="text-xl cursor-pointer">About</Link>
          <Link href="#" className="text-xl cursor-pointer">Menu</Link>
          <Link href="#" className="text-xl cursor-pointer">Contact</Link>
        </div>
      </div>
    </>
  )
}
