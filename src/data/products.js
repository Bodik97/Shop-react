// src/data/products.js
import img1 from "../img/pnevmo.png";
import img2 from "../img/pist.png";
import img3 from "../img/knifes.png"
import img4 from "../img/acsesory.png";


export const categories = [
  { id: "pistols",      name: "Пістолети" },
  { id: "rifles",       name: "Пневматичні гвинтівки" },
  { id: "knives",       name: "Ножі" },
  { id: "accessories",  name: "Аксесуари" },
];

export const products = [
  { id: 1, title: "Title product name 1",        price: 3300, image: img1, category: "rifles" },
  { id: 1, title: "Title product name 2",        price: 3300, image: img1, category: "rifles" },
  { id: 1, title: "Title product name 3",        price: 3300, image: img1, category: "rifles" },
  { id: 1, title: "Title product name 4",        price: 3300, image: img1, category: "rifles" },
  { id: 1, title: "Title product name 5",        price: 3300, image: img1, category: "rifles" },
  { id: 2, title: "Title product name 6",        price: 1800, image: img2, category: "pistols" },
  { id: 2, title: "Title product name 7",        price: 1800, image: img2, category: "pistols" },
  { id: 2, title: "Title product name 8",        price: 1800, image: img2, category: "pistols" },
  { id: 2, title: "Title product name 9",        price: 1800, image: img2, category: "pistols" },
  { id: 3, title: "Title product name 10",        price: 420,  image: img3, category: "knives" },
  { id: 3, title: "Title product name 11",        price: 420,  image: img3, category: "knives" },
  { id: 3, title: "Title product name 12",        price: 420,  image: img3, category: "knives" },
  { id: 3, title: "Title product name 13",        price: 420,  image: img3, category: "knives" },
  { id: 3, title: "Title product name 14",        price: 420,  image: img3, category: "knives" },
  { id: 4, title: "Title product name 15",        price: 150,  image: img4, category: "accessories" },
  { id: 4, title: "Title product name 16",        price: 150,  image: img4, category: "accessories" },
  { id: 4, title: "Title product name 17",        price: 150,  image: img4, category: "accessories" },
  { id: 4, title: "Title product name 18",        price: 150,  image: img4, category: "accessories" },
  { id: 4, title: "Title product name 19",        price: 150,  image: img4, category: "accessories" },
  
];


