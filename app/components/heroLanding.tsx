'use client'

import HeroBtn from "./btns"
export default function HeroLanding() {
    return (
        <>
            <div className="relative inset-0">
                <div className="absolute z-30 top-36 space-y-5">
                    <h1 className="text-white text-3xl text-center">
                        Sun filled flavours, shared plates, flowing wine
                    </h1>
                    <h2 className="text-white text-lg text-center">
                        Your Mediterranean escape starts here
                    </h2>
                    <div className="my-2">
                        <HeroBtn />
                    </div>
                </div>

                <div className="relative h-[50vh] inset-0 bg-[url(/assets/hero-background.avif)] bg-cover bg-center rounded-lg"></div>
                <div className="absolute h-[50vh] inset-0 bg-black/30 backdrop-blur-xs rounded-lg"></div>

            </div>


        </>

    )
}