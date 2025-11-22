

import { tapasMenu } from "../../data/tapasData";

export default function TapasMenu() {
  return (
    <div className="w-auto h-auto flex flex-col md:flex-row md:items-center space-y-2 md:space-x-2">

      <div className="relative inset-0 md:w-1/2">
        <div className="absolute inset-0 z-30 flex justify-center items-center">
          <h2 className="text-5xl text-white/80">Tapas</h2>
        </div>
        <div className="relative h-50 md:h-[90vh] inset-0 bg-[url(/assets/menu/tapas-menu.jpg)] bg-cover bg-center rounded-lg"></div>
        <div className="absolute h-50 md:h-[90vh] inset-0 bg-black/30 backdrop-blur-xs rounded-lg"></div>
      </div>

      <div className="w-auto h-auto grid grid-cols-1 md:grid-cols-2 gap-2 md:w-1/2 text-center md:item-center">
      {tapasMenu.map((item, index) => (
        <div key={index} className="space-y-1">
          <h3 className="text-xl md:text-2xl text-orange-700">{item.name}</h3>
          <p className="text-xs md:text-lg italic">{item.description}</p>
        </div>
      ))}

      </div>

    </div>
  );
}
