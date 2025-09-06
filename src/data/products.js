// src/data/products.js
import img1 from "../img/pnevmo.png";
import img2 from "../img/pist.png";
import img3 from "../img/knifes.png";
import img4 from "../img/acsesory.png";
// Hatsan
import imgHatsan_1 from "../img/hvintivki/hatsan/hatsan-1.jpg";
import imgHatsan_2 from "../img/hvintivki/hatsan/hatsan-2.jpg";
import imgHatsan_3 from "../img/hvintivki/hatsan/hatsan-3.jpg";
import imgHatsan_4 from "../img/hvintivki/hatsan/hatsan-4.jpg";
import imgHatsan_5 from "../img/hvintivki/hatsan/hatsan-5.jpg";
// Giv
import imgGiv_1 from "../img/pistolets/giw/pist-1.jpg";
import imgGiv_2 from "../img/pistolets/giw/pist-2.jpg";
import imgGiv_3 from "../img/pistolets/giw/pist-3.jpg";
import imgGiv_4 from "../img/pistolets/giw/pist-4.jpg";
import imgGiv_5 from "../img/pistolets/giw/pist-5.jpg";
// WinGun
import imgWinGun_1 from "../img/pistolets/WinGun/pist-1.jpg";
import imgWinGun_2 from "../img/pistolets/WinGun/pist-2.jpg";
import imgWinGun_3 from "../img/pistolets/WinGun/pist-3.jpg";
import imgWinGun_4 from "../img/pistolets/WinGun/pist-4.jpg";
import imgWinGun_5 from "../img/pistolets/WinGun/pist-5.jpg";

// Glock
import imgGlock_1 from "../img/pistolets/Glock/pist-1.jpg";
import imgGlock_2 from "../img/pistolets/Glock/pist-2.jpg";
import imgGlock_3 from "../img/pistolets/Glock/pist-3.jpg";
import imgGlock_4 from "../img/pistolets/Glock/pist-4.jpg";
import imgGlock_5 from "../img/pistolets/Glock/pist-5.jpg";
import imgGlock_6 from "../img/pistolets/Glock/pist-6.jpg";
// Sur
import imgSur_1 from "../img/pistolets/Sur/pist-1.jpg";
import imgSur_2 from "../img/pistolets/Sur/pist-2.jpg";
import imgSur_3 from "../img/pistolets/Sur/pist-3.jpg";
import imgSur_4 from "../img/pistolets/Sur/pist-4.jpg";
//Blow 
import imgBlow_1 from "../img/pistolets/Blow/pist-1.jpg";
import imgBlow_2 from "../img/pistolets/Blow/pist-2.jpg";
import imgBlow_3 from "../img/pistolets/Blow/pist-3.jpg";
//Sur-1
import imgSur1_1 from "../img/pistolets/Sur-1/pist-1.jpg";
import imgSur1_2 from "../img/pistolets/Sur-1/pist-2.jpg";



export const categories = [
  { id: "pistols",     name: "Пістолети" },
  { id: "rifles",      name: "Пневматичні гвинтівки" },
  { id: "knives",      name: "Ножі" },
  { id: "accessories", name: "Аксесуари" },
];

export const products = [
  {
    id: 1,
    title: "Hatsan",
    price: 3300,
    image: imgHatsan_1,
    imgs: [imgHatsan_1, imgHatsan_2, imgHatsan_3, imgHatsan_4, imgHatsan_5],
    description: `Бюджетна пропозиція в полку пневматичних гвинтівок від турецького бренду Hatsan з прицілом на розважальну та спортивну стрільбу. Модель належить до гвардії легких пружинно-поршневих «воздушок».`,
    features: [
    ],
    specs: {
      "Виробник": "Hatsan",
      "Країна виробник": "Туреччина",
      "Тип ствола": "Сталевий з нарізами",
      "Довжина ствола": "370 мм",
      "Калібр": "4.5 мм",
      "Кількість зарядів": "1",
      "Початкова швидкість": "320м/сек",
      "Тип взводу": "Перелом стволу",
      "Довжина": "1135 мм",
      "Вага": "2.75 кг",
      "Гарантійний термін": "12 міс"
    },
    inBox: ["Hatsan", "Шестигранні ключі", "Інструкція/гарантійний талон"],
    warranty: "Повернення/обмін — 14 днів.",
    category: "rifles",
    popular: true,
    popularityScore: 95,
  },
  { id: 2, title: "Title product name 5",
    price: 3300, image: img1, imgs: [img1, img2, img3],
    description: "this is description of product 5",
    category: "rifles" },

  { id: 3, title: "WinGun ",
    price: 3300, image: imgGiv_1,
      imgs: [imgGiv_1, imgGiv_2, imgGiv_3, imgGiv_4, imgGiv_5],
    description: "Пневматичний пістолет WinGun є досить цікавою моделлю від компанії WinGun. Дизайн пістолета повторює всесвітньо відомий пістолет Colt Defender. Пістолет не має висувного магазину, що обнадіює конструкцію пістолета і робить втрату магазину просто неможливою.",
    specs: {
      "Виробник": "WinGun",
      "Країна виробник": "Тайвань",
      "Тип": "Зі стисненим газом СО2",
      "Тип ствола": "95 мм",
      "Кількість зарядів": "15",
      "Початкова швидкість": "120 м/сек",
      "Гарантійний термін": "12 міс"
    },
    warranty: "Повернення/обмін — 14 днів.",
    category: "pistols",
    popular: true, popularityScore: 80 },

  { id: 4, title: "WinGun",
    price: 3300, image: imgWinGun_1, imgs: [imgWinGun_1, imgWinGun_2, imgWinGun_3, imgWinGun_4, imgWinGun_5],
    description: "Пневматичний пістолет Win Gun.Висока потужність, хороша влучність, економічна витрата газу, низька вартість. Все це робить Win Gun одним із найпопулярніших пневматичних пістолетів у своєму класі.",
    specs: {
      "Тип": "Зі стисненим газом СО2",
      "Калібр, мм": "4,5",
      "Початкова швидкість польоту кулі, м/с": "146",
      "Дульна енергія, Дж": "<3",
      "Тип боєприпасів": "Кульки BB",
      "Тип стовбура": "Сталевий гладкий",
      "Довжина ствола, мм": "90",
      "Прицільні пристрої": "Нерегульована прицільна планка з мушкою",
      "Кількість зарядів": "18",
      "Запобіжник": "Ручний",
      "Затвор": "Нерухомий",
      "Матеріал затвора": "Полімер",
      "Матеріал корпусу": "Полімер",
      "Матеріал прикладу/рукоятки": "Полімер",
      "Ударно-спусковий механізм": "Одиночної дії",
      "Колір": "Чорний",
      "Довжина загальна, мм": "175",
      "Ширина, мм": "",
      "Висота, мм": "",
      "Вага, м": "427"
    },
    warranty: "Гарантія — 6 місяців.",
    category: "pistols",
    popular: true, popularityScore: 90
  },

  { id: 5, title: "Glock 17",
    price: 3300, image: imgGlock_1, imgs: [imgGlock_1, imgGlock_2, imgGlock_3, imgGlock_4, imgGlock_5, imgGlock_6],
    description: "Borner зовні повністю повторює всесвітньо відомий австрійський напівавтоматичний пістолет Glock 17. Працює з використанням 12-грамового балона CO2 та стріляє сталевими кульками калібру 4,5 мм. Місткість магазину становить 20 куль. Запобіжник розташований на хвостовій частині спускового гачка. Ідеально підходить для розважальної стрілянини.",
    specs: {
      "Тип": "Зі стисненим газом СО2",
      "Калібр, мм": "4,5",
      "Тип боєприпасів": "Кульки BB",
      "Місткість магазину": "20",
      "Початкова швидкість польоту кулі, м/с": "120",
      "Дульна енергія, Дж": "2,52",
      "Тип стовбура": "Сталевий гладкий",
      "Довжина ствола, мм": "120",
      "Матеріал корпусу": "Полімер",
      "Прицільні пристрої": "Нерегульована прицільна планка з мушкою",
      "Запобіжник": "Механічний",
      "Загальна довжина, мм": "185",
      "Маса, м": "430"
    },
    warranty: "Гарантія — 6 місяців.",
    category: "pistols",
    popular: true, popularityScore: 92 },


  { id: 6, title: "SUR",
    price: 1800, image: imgSur_1, imgs: [imgSur_1, imgSur_2, imgSur_3, imgSur_4],
    description: "SUR  - це сигнально-шумовий пістолет, комфортне використання якого не змусить вас шкодувати про покупку. Для стрільби використовується холостий патрон 9мм, а зарядність магазину становить 7 патронів. Пістолет повністю металевий, з пластиковою ручкою. Для стрільби має дросильное отвір для виходу газів. Має запобіжник і рухомий затвор. Пістолет досить якісний і добре підходить для користування.",
    specs: {
      "Виробник": "SUR Arms",
      "Країна виробник": "Туреччина",
      "Вага": "690 г",
      "Гарантійний термін": "6 міс",
      "Тип": "Стартовий пістолет"
    },
    warranty: "Гарантія — 6 місяців.",
    category: "pistols",
    popular: true, popularityScore: 88 },

  { id: 7, title: "Blow",
    price: 1800, image: imgBlow_1, imgs: [imgBlow_1, imgBlow_2, imgBlow_3],
    description: "Blow - сигнально шумовий пістолет від турецького виробника Blow. Пістолет виконаний у полімерному корпусі з металевим затвором. Місткість магазину пістолета складає 7 патронів, а вага незарядженого примірника становить 525г. Пістолет виконаний у відмінній якості, як деталей так і збірки, тому відмінно підійде і для недосвідчених і для любителів спортивної стрільби",
    specs: {
      "Виробник": "Blow",
      "Країна виробник": "Туреччина",
      "Калібр": "9 мм",
      "Кількість зарядів": "7",
      "Вага, г": "525 гр"
    },
    warranty: "Гарантія — 6 місяців.",
    category: "pistols",
    popular: true, popularityScore: 84 },

  { id: 8, title: "SUR Arms",
    price: 1800, image: imgSur1_1, imgs: [imgSur1_1, imgSur1_2],
    description: "SUR - це сигнально-шумовий пістолет, комфортне використання якого не змусить вас шкодувати про покупку. Для стрільби використовується холостий патрон 9мм, а зарядність магазину становить 17 патронів. Пістолет повністю металевий. Для стрільби має дросильное отвір для виходу газів. Має подвійний запобіжник і рухомий затвор. Пістолет досить якісний і добре підходить для користування.",
    specs: {
      "Виробник": "SUR Arms",
      "Країна виробник": "Туреччина",
      "Вага": "990 г",
      "Місткість магазину": "17",
      "Калібр": "9.0"
    },
    warranty: "Гарантія — 6 місяців.",
    category: "pistols",
    popular: true, popularityScore: 90 },

  { id: 9, title: "Title product name 9",
    price: 1800, image: img2, imgs: [img2],
    description: "this is description of product 9",
    category: "pistols" },

  { id: 10, title: "Title product name 10",
    price: 420, image: img3, imgs: [img3],
    description: "this is description of product 10",
    category: "knives" },

  { id: 11, title: "Title product name 11",
    price: 420, image: img3, imgs: [img3],
    description: "this is description of product 11",
    category: "knives" },

  { id: 12, title: "Title product name 12",
    price: 420, image: img3, imgs: [img3],
    description: "this is description of product 12",
    category: "knives" },

  { id: 13, title: "Title product name 13",
    price: 420, image: img3, imgs: [img3],
    description: "this is description of product 13",
    category: "knives" },

  { id: 14, title: "Title product name 14",
    price: 420, image: img3, imgs: [img3],
    description: "this is description of product 14",
    category: "knives" },

  { id: 15, title: "Title product name 15",
    price: 150, image: img4, imgs: [img4],
    description: "this is description of product 15",
    category: "accessories" },

  { id: 16, title: "Title product name 16",
    price: 150, image: img4, imgs: [img4],
    description: "this is description of product 16",
    category: "accessories" },

  { id: 17, title: "Title product name 17",
    price: 150, image: img4, imgs: [img4],
    description: "this is description of product 17",
    category: "accessories" },

  { id: 18, title: "Title product name 18",
    price: 150, image: img4, imgs: [img4],
    description: "this is description of product 18",
    category: "accessories" },

  { id: 19, title: "Title product name 19",
    price: 150, image: img4, imgs: [img4],
    description: "this is description of product 19",
    category: "accessories" },
];

// Утиліти відбору популярних
export const popularProducts = products
  .filter((p) => p.popular === true)
  .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));

  export default products;
