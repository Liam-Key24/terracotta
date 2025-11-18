'use client'

import HeroBtn from "./btns"
export default function HeroLanding() {
    return (
        <>
            <div className="relative inset-0">
    
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4">
                    <div className="space-y-5 md:w-fit md:flex md:flex-col md:items-center">
                        <h1 className="text-white text-3xl md:text-5xl text-center">
                            Sun filled flavours, shared plates, <br /> flowing wine
                        </h1>
                        <h2 className="text-white text-lg md:text-2xl text-center">
                            Your Mediterranean escape starts here
                        </h2>
                        <div className="my-2">
                            <HeroBtn />
                        </div>
                    </div>
                </div>

                <div className="relative h-[50vh] md:h-[80vh] inset-0 bg-[url(/assets/hero-background.avif)] bg-cover bg-center rounded-lg"></div>
                <div className="absolute h-[50vh] md:h-[80vh] inset-0 bg-black/30 backdrop-blur-xs rounded-lg"></div>
            </div>




        </>

    )
}