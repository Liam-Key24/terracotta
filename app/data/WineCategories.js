import { wineListData } from "./WineListData";

export const whiteWine = wineListData.filter(item => item.category === "White Wine");
export const redWine = wineListData.filter(item => item.category === "Red Wine");
export const roseSangria = wineListData.filter(item => item.category === "Rosé and Sangria");
export const sparklingChampagne = wineListData.filter(item => item.category === "Sparkling and Champagne");