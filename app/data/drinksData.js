import { wineListData } from "./WineListData";

export const drinksData = [
  {
    id: 'red-wine',
    title: 'Red Wine',
    items: wineListData
      .filter(item => item.category === "Red Wine")
      .map(item => ({ name: item.name, price: item.price })),
    imagePath: "/assets/menu/red-wine.jpg",
    imageHeight: "70vh",
    reverseOnMobile: false,
    itemLayout: "price",
    gridCols: 1,
    imageBgPosition: "center"
  },
  {
    id: 'white-wine',
    title: 'White Wine',
    items: wineListData
      .filter(item => item.category === "White Wine")
      .map(item => ({ name: item.name, price: item.price })),
    imagePath: "/assets/menu/white-wine.jpg",
    imageHeight: "60vh",
    reverseOnMobile: false,
    itemLayout: "price",
    gridCols: 1,
    imageBgPosition: "center"
  },
  {
    id: 'rose-sangria',
    title: 'Rosé & Sangria',
    items: wineListData
      .filter(item => item.category === "Rosé and Sangria")
      .map(item => ({ name: item.name, price: item.price })),
    imagePath: "/assets/menu/sangria.jpg",
    imageHeight: "30vh",
    reverseOnMobile: false,
    itemLayout: "price",
    gridCols: 1,
    imageBgPosition: "center"
  },
  {
    id: 'sparkling-champagne',
    title: 'Sparkling & Champagne',
    items: wineListData
      .filter(item => item.category === "Sparkling and Champagne")
      .map(item => ({ name: item.name, price: item.price })),
    imagePath: "/assets/menu/spark-wine.jpg",
    imageHeight: "30vh",
    reverseOnMobile: false,
    itemLayout: "price",
    gridCols: 1,
    imageBgPosition: "center"
  },
  {
    id: 'cocktails',
    title: 'Cocktails',
    items: [
      { name: "Gin & tonic", price: "£7 | £12" },
      { name: "Mimosa", price: "£9.95" },
      { name: "Aperol Spritz", price: "£10.95" },
      { name: "Martini Cocktail", price: "£10.95" },
      { name: "Mojito", price: "£10.95" },
      { name: "White Lady", price: "£10.95" }
    ],
    imagePath: "/assets/menu/cocktails.jpg",
    imageHeight: "30vh",
    reverseOnMobile: false,
    itemLayout: "price",
    gridCols: 1,
    imageBgPosition: "center"
  },
  {
    id: 'beers',
    title: 'Beers',
    items: [
      { name: "Estrella Galicia", price: "£4" },
      { name: "Moretti", price: "£4" },
      { name: "Peroni", price: "£4" }
    ],
    imagePath: "/assets/menu/Beer-image.jpg",
    imageHeight: "20vh",
    reverseOnMobile: false,
    itemLayout: "price",
    gridCols: 1,
    imageBgPosition: "center"
  },
  {
    id: 'soft-drinks',
    title: 'Soft Drinks',
    items: [
      { name: "Apple / Orange Juice", price: "£3" },
      { name: "Soda Water / Tonic Water", price: "£3" },
      { name: "Acqua Panna Still Water", price: "£2.50" },
      { name: "San Pellegrino Sparkling Water", price: "£2.50" },
      { name: "Coca Cola / Diet Coke / Lemonade / Fanta", price: "£3" },
    ],
    imagePath: "/assets/menu/soft-drinks.jpg",
    imageHeight: "40vh",
    reverseOnMobile: false,
    itemLayout: "price",
    gridCols: 1,
    imageBgPosition: "center"
  }
];

