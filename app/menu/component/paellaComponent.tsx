'use client'

import { paellaMenu } from "../../data/paellaData";

export default function PaellaMenu() {
  return (
    <div className="w-auto h-auto flex flex-col md:flex-row md:space-x-10 space-y-6">

      {/* LEFT SIDE (IMAGE) */}
      <div className="relative inset-0 md:w-1/2">
        <div className="absolute inset-0 z-30 flex justify-center items-center">
          <h2 className="text-5xl text-white/80">Paella</h2>
        </div>

        <div className="relative h-50 md:h-[50vh] inset-0 bg-[url(/assets/menu/paella-menu.jpg)] bg-cover bg-bottom rounded-lg"></div>
        <div className="absolute h-50 md:h-[50vh] inset-0 bg-black/30 backdrop-blur-xs rounded-lg"></div>
      </div>

      {/* RIGHT SIDE (MENU ITEMS) */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:w-1/2 md:place-items-center md:text-center place-content-center  text-center">
        {paellaMenu.map((item, index) => (
          <div key={index} className="space-y-1">
            <h3 className="text-xl md:text-2xl text-orange-700">{item.name}</h3>
            <p className="text-xs md:text-lg italic">{item.description}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
