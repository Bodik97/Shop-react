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
  {
  id: 1,
  title: "AirTac M4 .177 — Пневматична гвинтівка",
  price: 3300,
  image: img1,
  imgs: [img1, img2, img3],

  // Короткий абзац (герой-опис)
  description: `Легка, збалансована та точна — AirTac M4 створена для щоденних тренувань і розважальної стрільби. 
Алюмінієва платформа, регульований приклад і плавний спуск забезпечують комфорт, а перевірена механіка — стабільну купчастість.`,
  
  // Ключові переваги (для списку)
  features: [
    "Регульований приклад і щока — під різну антропометрію",
    "Антивібраційна система — менше віддачі, більше контролю",
    "Планки Picatinny — швидке встановлення оптики та аксесуарів",
    "Двоступеневий спуск — чистий зрив без «сюрпризів»",
    "Ергономіка M4 — знайома посадка, швидке перезведення"
  ],

  // Характеристики (для блоку «Специфікації»)
  specs: {
    "Калібр": "4.5 мм (.177)",
    "Початкова швидкість": "до 320 м/с",
    "Тип живлення": "Пружинно-поршнева",
    "Матеріал ствола": "Сталь, нарізний",
    "Довжина ствола": "450 мм",
    "Вага": "2.8 кг",
    "Планки": "Picatinny (верх/низ)",
    "Прицільні": "Мушка + цілик (регул.)",
    "Країна виробництва": "EU"
  },

  // Комплектація та гарантія
  inBox: ["Гвинтівка AirTac M4", "Шестигранні ключі", "Інструкція/гарантійний талон"],
  warranty: "Гарантія 12 місяців. Повернення/обмін — 14 днів.",
  
  category: "rifles"
},


  { id: 2, title: "Title product name 2",
    price: 3300,
    image: img1,
    imgs: [img1, img2, img3],
    description: "this is description of product 2",
    category: "rifles" },

  { id: 3, title: "Title product name 3",
    price: 3300,
    image: img1,
    imgs: [img1, img2, img3],
    description: "this is description of product 3",
    category: "rifles" },

  { id: 4, title: "Title product name 4",
    price: 3300,
    image: img1,
    imgs: [img1, img2, img3],
    description: "this is description of product 4",
    category: "rifles" },
    
  { id: 5, title: "Title product name 5",
    price: 3300,
    image: img1,
    imgs: [img1, img2, img3],
    description: "this is description of product 5",
    category: "rifles" },

  { id: 6, title: "Title product name 6",
    price: 1800,
    image: img2,
    imgs: [img2],
    description: "this is description of product 6",
    category: "pistols" },

  { id: 7, title: "Title product name 7",
    price: 1800,
    image: img2,
    imgs: [img2],
    description: "this is description of product 7",
    category: "pistols" },

  { id: 8, title: "Title product name 8",
    price: 1800,
    image: img2,
    imgs: [img2],
    description: "this is description of product 8",
    category: "pistols" },

  { id: 9, title: "Title product name 9",
    price: 1800,
    image: img2,
    imgs: [img2],
    description: "this is description of product 9",
    category: "pistols" },

  { id: 10, title: "Title product name 10",
    price: 420,
    image: img3,
    imgs: [img3],
    description: "this is description of product 10",
    category: "knives" },
  { id: 11, title: "Title product name 11",
    price: 420,
    image: img3,
    imgs: [img3],
    description: "this is description of product 11",
    category: "knives" },
  { id: 12, title: "Title product name 12",
    price: 420,
    image: img3,
    imgs: [img3],
    description: "this is description of product 12",
    category: "knives" },
  { id: 13, title: "Title product name 13",
    price: 420,
    image: img3,
    imgs: [img3],
    description: "this is description of product 13",
    category: "knives" },
  { id: 14, title: "Title product name 14",
    price: 420,
    image: img3,
    imgs: [img3],
    description: "this is description of product 14",
    category: "knives" },
  { id: 15, title: "Title product name 15",
    price: 150,
    image: img4,
    imgs: [img4],
    description: "this is description of product 15",
    category: "accessories" },
  { id: 16, title: "Title product name 16",
    price: 150,
    image: img4,
    imgs: [img4],
    description: "this is description of product 16",
    category: "accessories" },
  { id: 17, title: "Title product name 17",
    price: 150,
    image: img4,
    imgs: [img4],
    description: "this is description of product 17",
    category: "accessories" },
  { id: 18, title: "Title product name 18",
    price: 150,
    image: img4,
    imgs: [img4],
    description: "this is description of product 18",
    category: "accessories" },
  { id: 19, title: "Title product name 19",
    price: 150,
    image: img4,
    imgs: [img4],
    description: "this is description of product 19",
    category: "accessories" },

];


