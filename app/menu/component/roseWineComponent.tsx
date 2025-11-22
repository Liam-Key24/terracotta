'use client'

import { roseSangria } from "../../data/WineCategories";

export default function RoseSangriaMenu() {
  return (
    <div className="w-auto h-auto flex flex-col md:flex-row md:space-x-10 space-y-6 md:space-y-0">

      {/* LEFT SIDE (IMAGE) */}
      <div className="relative inset-0 md:w-1/2">
        <div className="absolute inset-0 z-30 flex justify-center items-center">
          <h2 className="text-5xl text-white/80">Rosé & Sangria</h2>
        </div>

        <div className="relative h-50 md:h-[30vh] inset-0 bg-[url(/assets/menu/sangria.jpg)] bg-cover bg-center rounded-lg"></div>
        <div className="absolute h-50 md:h-[30vh] inset-0 bg-black/30 backdrop-blur-xs rounded-lg"></div>
      </div>

      {/* RIGHT SIDE (MENU ITEMS) */}
      <div className="grid grid-cols-1 gap-4 md:w-1/2 place-content-center">
        {roseSangria.map((item, index) => (
          <div key={index} className="w-full h-auto flex items-center justify-between px-4 text-orange-700">
            <h3 className="text-xl md:text-2xl">{item.name}</h3>
            <p className="text-xs  md:text-lg  italic">{item.price}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
