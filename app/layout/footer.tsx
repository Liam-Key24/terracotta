'use client'
import { PhoneCallIcon } from "@phosphor-icons/react"
export default function Footer(){
    return(
        <>
        <footer className="w-full ">
            <h1>TerraCotta</h1>
            <div>
                <div>
                    <span className="flex space-x-2 items-center justify-center"><PhoneCallIcon/> <h2>020202002</h2></span>
                </div>
                <div>
                    <h2>Contact</h2>
                    <p>020---</p>
                </div>
            </div>
        </footer>
        </>
    )
}