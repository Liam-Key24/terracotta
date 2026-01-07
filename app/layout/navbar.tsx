'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowUpRightIcon, ListIcon, XIcon } from '@phosphor-icons/react'
import Link from 'next/link'

export default function NavBar() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Animate navbar in on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Hide navbar while scrolling
      setIsVisible(false)
      setIsNavOpen(false)

      // Show navbar when scroll stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      
      <nav className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-60
        w-[90%] h-12 px-6 flex items-center justify-between
        rounded-lg glass bg-[#631732]/70
        md:w-[96%]
        md:h-18
        transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
      `}>
        <Link href="/" className="cursor-pointer">
          <h1 className="text-xl text-white md:text-3xl">Terracotta</h1>
        </Link>

        <div className='md:hidden'>
          {isNavOpen ? (
            <XIcon size={20} onClick={() => setIsNavOpen(false)} color="white" />
          ) : (
            <ListIcon size={20} onClick={() => setIsNavOpen(true)} color="white" />
          )}
        </div>
      
        <div className='hidden w-fit h-auto md:flex md:space-x-4 text-white text-lg items-center'>

                
          <Link href={'/about'}>About</Link>
          <Link href={'/menu'}>Menu</Link>
          <Link  href={'/contact'} className='w-fit h-fit glass p-1 px-2 rounded-lg flex space-x-2 items-center'><span>Contact</span><ArrowUpRightIcon/></Link>
        </div>
  
      
      </nav>


      {/* BLURRED DROPDOWN CONTAINER */}
      <div
        className={`
          fixed left-1/2 -translate-x-1/2 top-4 z-50 w-[90%]
          glass shadow-lg shadow-black/10
          rounded-lg overflow-hidden
          transition-all duration-300 ease-in-out
          ${isNavOpen ? 'h-fit pb-2' : 'h-10 opacity-0'}
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        {/* CONTENT */}
        <div
          className={`
            w-3/4 mx-auto
            grid grid-cols-2 place-items-center gap-2
            text-white transition-[max-height,opacity,padding]
            duration-300 ease-in-out
            ${isNavOpen ? 'opacity-100 max-h-fit pt-15' : 'opacity-0 max-h-0 pt-0'}
          `}
        >
          <Link href="/" className="text-xl cursor-pointer">Home</Link>
          <Link href="/about" className="text-xl cursor-pointer">About</Link>
          <Link href="/menu" className="text-xl cursor-pointer">Menu</Link>
          <Link href="/contact" className="text-xl cursor-pointer">Contact</Link>
        </div>
      </div>
    </>
  )
}
