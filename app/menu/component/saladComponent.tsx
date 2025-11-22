'use client'

import { saladMenu } from "../../data/saladData";

export default function SaladMenu() {
  return (
    <div className="w-auto h-auto flex flex-col md:flex-row md:space-x-10 space-y-6 md:space-y-0">

      {/* LEFT SIDE (IMAGE) */}
      <div className="relative inset-0 md:w-1/2">
        <div className="absolute inset-0 z-30 flex justify-center items-center ">
          <h2 className="text-5xl text-white/80">Salads</h2>
        </div>

        <div className="relative h-50 md:h-[40vh] inset-0 bg-[url(/assets/menu/Salad-menu.jpg)] bg-cover bg-center rounded-lg"></div>
        <div className="absolute h-50 md:h-[40vh] inset-0 bg-black/30 backdrop-blur-xs rounded-lg"></div>
      </div>

      {/* RIGHT SIDE (MENU ITEMS) */}
      <div className="grid grid-cols-1 gap-4 md:w-1/2 md:text-center place-content-center text-center">
        {saladMenu.map((item, index) => (
          <div key={index} className="space-y-1">
            <h3 className="text-xl md:text-2xl text-orange-700">{item.name}</h3>
            <p className="text-xs italic">{item.description}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
