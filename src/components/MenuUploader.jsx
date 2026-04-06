import { doc, setDoc} from "firebase/firestore";
import { db } from "../services/firebase"; // تأكد من مسار ملف الفيربيز عندك
import { useState } from "react";
const newMenuData = {
  items: [
    // Shelter Rice (1 item)
    {
      category: "Shelter Rice",
      id: "shelter-rice",
      name: { ar: "شيلتر رايس", en: "Shelter Rice" },
      price: 120,
      description: "معاه صوص من اختيارك: شيلتر ناشفل / شيلتر تندوري / شيلتر رايز كريسي / شيلتر فاهيتا / شيلتر شيش. معاه صوص من (رانش، سموكي، سويت اند، ساور، تشيز).",
      optionGroups: [
        { title: "flavor", options: ["شيلتر ناشفل", "شيلتر تندوري", "شيلتر رايز كريسي", "شيلتر فاهيتا", "شيلتر شيش"] },
        { title: "sauce", options: ["رانش", "سموكي", "سويت اند", "ساور", "تشيز"] }
      ]
    },

    // Sauces (11 items)
    { category: "Sauces", id: "bbq-sauce", name: { ar: "باربيكيو صوص", en: "BBQ Sauce" }, price: 15, description: "" },
    { category: "Sauces", id: "mayonnaise", name: { ar: "صوص مايونيز", en: "Mayonnaise" }, price: 10, description: "" },
    { category: "Sauces", id: "friskies-sauce", name: { ar: "صوص فريسكس", en: "Friskies Sauce" }, price: 15, description: "" },
    { category: "Sauces", id: "mini-cheddar-jar", name: { ar: "ميني جار جبنة شيدر", en: "Mini Cheddar Jar" }, price: 30, description: "" },
    { category: "Sauces", id: "cheddar-jar", name: { ar: "جار جبنة شيدر", en: "Cheddar Jar" }, price: 75, description: "" },
    { category: "Sauces", id: "shelter-cheese-sauce", name: { ar: "صوص جبنة شيلتر", en: "Shelter Cheese Sauce" }, price: 15, description: "" },
    { category: "Sauces", id: "ranch-sauce", name: { ar: "صوص رانش", en: "Ranch Sauce" }, price: 15, description: "" },
    { category: "Sauces", id: "spicy-buffalo-sauce", name: { ar: "صوص بافلو حار", en: "Spicy Buffalo Sauce" }, price: 10, description: "" },
    { category: "Sauces", id: "spicy-rizo-sauce", name: { ar: "صوص ريزو حار", en: "Spicy Rizo Sauce" }, price: 15, description: "" },
    { category: "Sauces", id: "tahini", name: { ar: "صوص طحينة", en: "Tahini" }, price: 10, description: "" },
    { category: "Sauces", id: "garlic-dip", name: { ar: "صوص الثومية", en: "Garlic Dip" }, price: 10, description: "" },

    // Extras (13 items)
    { category: "Extras", id: "kaiser-burger-bread", name: { ar: "خبز كايزر برجر", en: "Kaiser Burger Bread" }, price: 10, description: "" },
    { category: "Extras", id: "toasted-bread", name: { ar: "خبز محمص", en: "Toasted Bread" }, price: 10, description: "" },
    { category: "Extras", id: "extra-mozzarella", name: { ar: "جبنة موزريلا", en: "Mozzarella" }, price: 20, description: "" },
    { category: "Extras", id: "extra-sausage", name: { ar: "سجق", en: "Sausage" }, price: 20, description: "" },
    { category: "Extras", id: "extra-pepperoni", name: { ar: "بيروني أو سلامي", en: "Pepperoni or Salami" }, price: 20, description: "" },
    { category: "Extras", id: "kaiser-meal-bread", name: { ar: "خبز كايزر وجبة", en: "Kaiser Meal Bread" }, price: 5, description: "" },
    { category: "Extras", id: "broast-breast", name: { ar: "قطعه بروست صدر", en: "Broast Breast Piece" }, price: 50, description: "" },
    { category: "Extras", id: "broast-thigh", name: { ar: "قطعة بروست فخذ", en: "Broast Thigh Piece" }, price: 45, description: "" },
    { category: "Extras", id: "broast-pin", name: { ar: "قطعة بروست دبوس", en: "Broast Pin Piece" }, price: 35, description: "" },
    { category: "Extras", id: "strips-slice", name: { ar: "شريحة استريس", en: "Strips Slice" }, price: 35, description: "" },
    { category: "Extras", id: "2-zinger-pieces", name: { ar: "2 قطعة زنجر", en: "2 Zinger Pieces" }, price: 20, description: "" },
    { category: "Extras", id: "hot-dog", name: { ar: "هوت دوج", en: "Hot Dog" }, price: 20, description: "" },
    { category: "Extras", id: "beef-bacon-smoked-turkey", name: { ar: "بيف بيكون أو رومي مدخن", en: "Beef Bacon or Smoked Turkey" }, price: 15, description: "" },

    // Salads (4 items)
    { category: "Salads", id: "green-salad", name: { ar: "سلطة خضراء", en: "Green Salad" }, price: 45, description: "خيار - طماطم - خس - فلفل - جزر" },
    { category: "Salads", id: "chicken-ranch-salad", name: { ar: "تشيكن رانش سلط", en: "Chicken Ranch Salad" }, price: 100, description: "خس و طماطم و فلفل ألوان و صدور مشوية مع صوص الرانش" },
    { category: "Salads", id: "coleslaw", name: { ar: "كولو سلو", en: "Coleslaw" }, prices: { price1: 35, price2: 25 }, priceNote: "Two prices are shown in the menu without visible labels.", description: "" },
    { category: "Salads", id: "pickles", name: { ar: "مخلل", en: "Pickles" }, price: 15, description: "" },

    // Kids' Meals (4 items)
    { category: "Kids' Meals", id: "kids-burger-meal", name: { ar: "بيف / تشيكن برجر", en: "Beef/Chicken Burger" }, price: 120, description: "ساندوتش بيف أو تشيكن من اختيارك والبطاطس والعصير ولعبة هدية" },
    { category: "Kids' Meals", id: "kids-strips-meal", name: { ar: "استريس كيدز", en: "Strips Kids" }, price: 120, description: "2 قطعة استريس وبطاطس و عصير و لعبة هدية" },
    { category: "Kids' Meals", id: "kids-meal-no-toy", name: { ar: "أي وجبة أطفال بدون لعبة", en: "Any Kids Meal without Toy" }, price: 95, description: "" },
    { category: "Kids' Meals", id: "kids-toy", name: { ar: "لعبة", en: "Toy" }, price: 25, description: "" },

    // Waffle (5 items)
    { category: "Waffle", id: "waffle-caramel", name: { ar: "شريحة وافل كراميل", en: "Caramel" }, price: 25, description: "" },
    { category: "Waffle", id: "waffle-nutella", name: { ar: "شريحة وافل نوتيلا", en: "Nutella" }, price: 25, description: "" },
    { category: "Waffle", id: "waffle-white-chocolate", name: { ar: "شريحة وافل وايت شوكليت", en: "White Chocolate" }, price: 25, description: "" },
    { category: "Waffle", id: "waffle-lotus", name: { ar: "شريحة وافل لوتس", en: "Lotus" }, price: 30, description: "" },
    { category: "Waffle", id: "waffle-cake", name: { ar: "تورتة وافل", en: "Waffle Cake" }, price: 90, description: "" },

    // Drinks (4 items)
    { category: "Drinks", id: "small-water", name: { ar: "مياه معدنية صغيرة", en: "Small Water" }, price: 15, description: "" },
    { category: "Drinks", id: "soda", name: { ar: "مشروب غازي", en: "Soda" }, price: 20, description: "" },
    { category: "Drinks", id: "liter-soda", name: { ar: "مشروب غازي لتر", en: "1 Liter Soda" }, price: 35, description: "" },
    { category: "Drinks", id: "sun-top", name: { ar: "عصير صن توب", en: "Sun Top" }, price: 20, description: "" },

    // Sides (10 items)
    { category: "Sides", id: "french-fries", name: { ar: "فرنش فرايز", en: "French Fries" }, price: 35, description: "بطاطس مقرمشة بهار لذيذ من شيلتر" },
    { category: "Sides", id: "frisks-fries", name: { ar: "بطاطس فريسكس", en: "Friskies fries" }, price: 45, description: "بطاطس بتتبيلة كريسي خاصة بنا مع صوص الفرنسكس الرائع" },
    { category: "Sides", id: "onion-rings", name: { ar: "حلقات بصل", en: "Onion Rings" }, price: 40, description: "حلقات بصل مقرمشة" },
    { category: "Sides", id: "mozzarella-sticks", name: { ar: "أصابع موزريلا", en: "Mozzarella Sticks" }, price: 50, description: "5 أصابع موزريلا مقرمست" },
    { category: "Sides", id: "zinger-cup", name: { ar: "كب زنجر", en: "Zinger Cup" }, price: 70, description: "4 ( رانش صوص + شيدر صوص & سويت أند ساور صوص ) قطع فراخ مقرمشة بصوص من اختيارك" },
    { category: "Sides", id: "chicken-rizo", name: { ar: "تشيكن ريزو", en: "Chicken risotto" }, price: 70, description: "أرز بسمتي مع قطع دجاج الزنجر الحارة و غرقانة صوص الريزو الرائع الحار" },
    { category: "Sides", id: "mac-and-cheese", name: { ar: "ماك & تشيز", en: "Mac & Cheese" }, prices: { price1: 55, price2: 30 }, priceNote: "Two prices are shown in the menu without visible labels.", description: "طبق مكرونة بنا غرقان بصوص الجبنة الرائع" },
    { category: "Sides", id: "jalapeno-cheese-fries", name: { ar: "هالينو تشيز فرايز", en: "Jalapeño Cheese Fries" }, price: 60, description: "بطاطس مقلية مع الهالينو الحار و صوص الجبنة الرائع" },
    { category: "Sides", id: "rice-platter", name: { ar: "طبق أرز", en: "Rice Dish" }, prices: { price1: 40, price2: 25 }, priceNote: "Two prices are shown in the menu without visible labels.", description: "" },
    { category: "Sides", id: "sweet-corn", name: { ar: "سويت كورن", en: "Sweetcorn" }, price: 35, description: "" },

    // Shelter Milkshake (3 items)
    { category: "Shelter Milkshake", id: "chocolate-milkshake", name: { ar: "ميلك تشيك شيكولاتة", en: "Chocolate Milkshake" }, price: 50, description: "مع اضافه صوص من اختيارك", optionGroups: [{ title: "sauce", options: ["كراميل", "شيكولاتة", "بلو بيري", "فراولة"] }] },
    { category: "Shelter Milkshake", id: "vanilla-milkshake", name: { ar: "ميلك تشيك فانيليا", en: "Vanilla Milkshake" }, price: 45, description: "مع اضافه صوص من اختيارك", optionGroups: [{ title: "sauce", options: ["كراميل", "شيكولاتة", "بلو بيري", "فراولة"] }] },
    { category: "Shelter Milkshake", id: "strawberry-milkshake", name: { ar: "ميلك تشيك فراولة", en: "Strawberry Milkshake" }, price: 45, description: "مع اضافه صوص من اختيارك", optionGroups: [{ title: "sauce", options: ["كراميل", "شيكولاتة", "بلو بيري", "فراولة"] }] },

    // Mojitos (4 items)
    { category: "Mojitos", id: "mint-lemon-mojito", name: { ar: "موهيتو ليمون نعناع", en: "Mint Lemon Mojito" }, price: 40, description: "" },
    { category: "Mojitos", id: "blueberry-mojito", name: { ar: "موهيتو بلوبيري", en: "Blueberry Mojito" }, price: 45, description: "" },
    { category: "Mojitos", id: "strawberry-mojito", name: { ar: "موهيتو فراولة", en: "Strawberry Mojito" }, price: 45, description: "" },
    { category: "Mojitos", id: "tropical-fruit-mojito", name: { ar: "موهيتو فواكه استوائية", en: "Tropical Fruit Mojito" }, price: 45, description: "" },

    // Meals (10 items)
    { category: "Meals", id: "mix-grill-meal", name: { ar: "مكس جريل", en: "Mix Grill" }, price: 235, description: "شيش طاووق مع الكفتة المشوية...", optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }] },
    { category: "Meals", id: "shish-tawook-meal", name: { ar: "شيش طاووق", en: "Shish Tawook" }, price: 200, description: "قطع الشيش طاووق المتبلة...", optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }] },
    { category: "Meals", id: "grilled-chicken-breasts-meal", name: { ar: "صدور مشوية", en: "Grilled Chicken Breasts" }, price: 200, description: "شرائح الصدور المشوية...", optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }] },
    { category: "Meals", id: "chicken-mushroom-meal", name: { ar: "تشيكن مشروم", en: "Chicken Mushroom" }, price: 210, description: "الصدور المشوية مع صوص الديمجلاس...", optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }] },
    { category: "Meals", id: "cordon-bleu-meal", name: { ar: "كوردن بلو", en: "Cordon Bleu" }, price: 200, description: "5 قطع كوردن بلو...", optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }] },
    { category: "Meals", id: "crunchy-smoked-cheese-meal", name: { ar: "كرانشي تشيز سموكد", en: "Crunchy Smoked Cheese" }, price: 190, description: "4 قطع استرس المقرمش الحار...", optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }] },
    { category: "Meals", id: "chicken-sticks", name: { ar: "تشيكن استيكس", en: "Chicken Sticks" }, price: 140, description: "3 قطع استرس مقرمش حار...", optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }] },
    { category: "Meals", id: "crunchy-strips-meal", name: { ar: "استربس كرانشي", en: "Crunchy Strips" }, price: 195, description: "5 قطع استربس مقرمش حار...", optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }] },
    { category: "Meals", id: "nashville-meal", name: { ar: "ناشفل", en: "Nashville" }, price: 150, description: "3 قطع استريس معاهم بطاطس...", optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }] },
    { category: "Meals", id: "tandoori-meal", name: { ar: "وجبة تندوري", en: "Tandoori Meal" }, price: 200, description: "5 قطع تندوري وخبز وكلو سلو وصوص", optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }] },

    // Broast Saver & Broast (8 items combined)
    { category: "Broast Saver", id: "economic-snack", name: { ar: "سناك بوكس موفرة", en: "Snack Box Saver" }, price: 125, description: "2 قطعه بروست و بطاطس و خبز و صوص الريزو الحار" },
    { category: "Broast Saver", id: "dinner-box-saver", name: { ar: "دينر بوكس موفرة", en: "Dinner Box Saver" }, price: 165, description: "3 قطع بروست و بطاطس و خبز و صوص الريزو الحار" },
    { category: "Broast Saver", id: "4-pieces-of-broasted-chicken-saver", name: { ar: "4 قطع بروست موفرة", en: "4 pieces of Broasted chicken Saver" }, price: 200, description: "4 قطع بروست و البطاطس والخبز" },
    { category: "Broast Saver", id: "super-dinner", name: { ar: "سوبر دينر موفرة", en: "Super Dinner Saver" }, price: 235, description: "5 قطع بروست و البطاطس والخبز" },
    { category: "Broast", id: "snack-box", name: { ar: "سناك بوكس", en: "Snack Box" }, price: 155, description: "2 قطعه بروست و الأرز و البطاطس والخبز..." },
    { category: "Broast", id: "economic-dinner", name: { ar: "دينر بوكس", en: "Dinner Box" }, price: 200, description: "3 قطع بروست و الأرز و البطاطس والخبز..." },
    { category: "Broast", id: "4-Piece-broasted-meal", name: { ar: "وجبة 4 قطع بروست", en: "4-Piece Broasted Meal" }, price: 235, description: "4 قطع بروست و الأرز والبطاطس والخبز..." },
    { category: "Broast", id: "economic-super-dinner", name: { ar: "سوبر دينر", en: "Super Dinner" }, price: 270, description: "5 قطع بروست و الأرز و البطاطس والخبز..." },

    // Family Meals (5 items)
    { category: "Family Meals", id: "10-strips", name: { ar: "وجبة 10 قطع استربس", en: "10-Piece Chicken Meal" }, price: 370, description: "10 قطع استربس والبطاطس و 4 خبز و كلو سلو عائلي و مشروب غازي لتر و صوص الريزو الحار" },
    { category: "Family Meals", id: "9-broast", name: { ar: "وجبة 9 قطع بروست", en: "9-Piece Broasted Chicken Meal" }, price: 450, description: "9 قطع بروست و البطاطس و 3 خبز و كلو سلو عائلي و مشروب غازي لتر و صوص الريزو الحار" },
    { category: "Family Meals", id: "12-Piece-broasted-chicken-meal", name: { ar: "وجبة 12 قطعة بروست", en: "12-Piece Broasted Chicken Meal" }, price: 595, description: "12 قطعة بروست و البطاطس و 4 خبز و كلو سلو عائلي و مشروب غازي لتر و صوص الريزو الحار" },
    { category: "Family Meals", id: "torta-broast", name: { ar: "تورتة بروست", en: "Broasted Chicken Cake" }, price: 840, description: "20 قطعة بروست و البطاطس و 10 خبز و 2 كلو سلو عائلي و 2 مشروب غازي لتر و صوص الريزو الحار" },
    { category: "Family Meals", id: "gang-deal", name: { ar: "عرض الشلة", en: "Gang Deal" }, price: 795, description: "14 قطعة بروست و البطاطس و 4 خبز و مشروب غازي لتر و نافورة الجبنة" },

    // Pizza (7 items)
    { category: "Pizza", id: "pizza-mix-cheese", name: { ar: "مكس تشيز", en: "Mixed Cheese" }, price: 150, description: "صلصة البيتزا الرائعة مع الجبنة الموتزريلا...", sizeNote: "All pizzas are 28 cm" },
    { category: "Pizza", id: "chicken-ranch-pizza", name: { ar: "تشيكن رانش", en: "Chicken Ranch" }, price: 195, description: "صوص الرانش الخاص بشيلتر...", sizeNote: "All pizzas are 28 cm" },
    { category: "Pizza", id: "alfredo-white-sauce-pizza", name: { ar: "ألفريدو وايت صوص", en: "Alfredo White Sauce" }, price: 195, description: "الوايت صوص الرائع مع الشيش طاووق...", sizeNote: "All pizzas are 28 cm" },
    { category: "Pizza", id: "chicken-buffalo-zinger-pizza", name: { ar: "تشيكن بافلو زنجر", en: "Chicken Buffalo Zinger" }, price: 190, description: "صوص البافلو الحار والرومي المدخن...", sizeNote: "All pizzas are 28 cm" },
    { category: "Pizza", id: "supreme-meat-pizza", name: { ar: "سوبريم لحوم", en: "Meat Supreme" }, price: 205, description: "صلصة البيتزا والكفتة المشوية...", sizeNote: "All pizzas are 28 cm" },
    { category: "Pizza", id: "double-pepperoni-pizza", name: { ar: "دابل ببروني", en: "Double Pepperoni" }, price: 210, description: "", sizeNote: "All pizzas are 28 cm" },
    { category: "Pizza", id: "pastrami-pizza", name: { ar: "بيتزا بسطرمة", en: "Pastrami Pizza" }, price: 205, description: "", sizeNote: "All pizzas are 28 cm" },

    // Pasta (10 items)
    { category: "Pasta", id: "seafood-pasta", name: { ar: "باستا سي فود", en: "Seafood Pasta (Grilled or Fried)" }, price: 190, description: "المكرونة بصوص جبنة شيدر الرائع مع الجمبري..." },
    { category: "Pasta", id: "shrimp-pasta", name: { ar: "باستا جمبري", en: "Shrimp Pasta (Grilled or Fried)" }, price: 180, description: "المكرونة بصوص جبنة شيدر الرائع مع الجمبري..." },
    { category: "Pasta", id: "penne-red-sauce", name: { ar: "بنا ريد صوص", en: "Penne Red" }, price: 65, description: "المكرونة البنا بالصوص الطماطم الرائع..." },
    { category: "Pasta", id: "bolognese", name: { ar: "باستا بولونيز", en: "Pasta Bolognese" }, price: 105, description: "المكرونة البنا بصوص الطماطم الرائع..." },
    { category: "Pasta", id: "grilled-chicken-noodles", name: { ar: "نودلز صدور مشوية", en: "Grilled Chicken Noodles" }, price: 100, description: "" },
    { category: "Pasta", id: "zinger-noodles", name: { ar: "نودلز زنجر", en: "Zinger Noodles" }, price: 100, description: "" },
    { category: "Pasta", id: "veg-noodles", name: { ar: "نودلز خضروات", en: "Vegetable Noodles" }, price: 60, description: "" },
    { category: "Pasta", id: "alfredo", name: { ar: "باستا ألفريدو", en: "Pasta Alfredo" }, price: 170, description: "" },
    { category: "Pasta", id: "cordon-bleu-pasta", name: { ar: "كوردن بلو باستا", en: "Corden bleu Pasta" }, price: 165, description: "" },
    { category: "Pasta", id: "chicken-balls", name: { ar: "تشيكن بولز", en: "Chicken balls" }, price: 155, description: "" },

    // Cheese Pan (9 items)
    { category: "Cheese Pan", id: "mix-meat-tasa", name: { ar: "مكس لحوم تشيز طاسة", en: "Meat mix Cheese" }, price: 145, description: "صوص الجبنة الخاصة بشيلتر..." },
    { category: "Cheese Pan", id: "seafood-cheese-pan", name: { ar: "سي فود تشيز طاسة", en: "Seafood Cheese" }, price: 190, description: "صوص الجبنة الخاصة بشيلتر مع الجمبري..." },
    { category: "Cheese Pan", id: "shrimp-cheese-pan", name: { ar: "جمبري تشيز طاسة", en: "Shrimp Cheese" }, price: 160, description: "صوص الجبنة الخاصة بشيلتر مع الجمبري..." },
    { category: "Cheese Pan", id: "chilly-cheese-fries-tasa", name: { ar: "تشيلي تشيز فرايز", en: "Chili Cheese Fries" }, price: 135, description: "صوص الجبنة الخاصة بشيلتر مع اللحمة المفرومة..." },
    { category: "Cheese Pan", id: "sausage-cheese-tasa", name: { ar: "سجق تشيز طاسة", en: "Sausage Cheese" }, price: 140, description: "صوص الجبنة الخاصة بشيلتر مع شرائح السجق..." },
    { category: "Cheese Pan", id: "spinach-mushroom-tasa", name: { ar: "سبانخ ماشروم تشيز طاسة", en: "Spinach Mushroom Cheese" }, price: 125, description: "صوص الخاصة بشيلتر مع الماشروم..." },
    { category: "Cheese Pan", id: "zinger-cheese-tasa", name: { ar: "زنجر تشيز طاسة", en: "Zinger Cheese" }, price: 165, description: "صوص الجبنة الخاصة بشيلتر مع شرائح الزنجر..." },
    { category: "Cheese Pan", id: "cheese-fries-pan", name: { ar: "تشيز فرايز", en: "Cheese Fries" }, price: 115, description: "" },
    { category: "Cheese Pan", id: "pastrami-pan", name: { ar: "طاسة بسطرمة", en: "Pastrami Pan" }, price: 140, description: "" },

    // Beef Burger (7 items)
    { category: "Beef Burger", id: "street-burger", name: { ar: "ستريت برجر", en: "Street Burger" }, prices: { single: 165, double: 210 }, description: "بيف برجر - صوص البيج تيستي..." },
    { category: "Beef Burger", id: "jalapeno-maharaja-burger", name: { ar: "هالينو مهراجا", en: "Jalapeño Maharaja" }, prices: { single: 175, double: 220 }, description: "بيف برجر - صوص البيج تيستي..." },
    { category: "Beef Burger", id: "bacon-mushroom-burger", name: { ar: "بيكون ماشروم", en: "Bacon Mushroom" }, prices: { single: 175, double: 220 }, description: "بيف برجر - صوص المايونيز..." },
    { category: "Beef Burger", id: "smoky-cheese-burger", name: { ar: "سموكي تشيز برجر", en: "Smoky Cheese Burger" }, prices: { single: 180, double: 260 }, description: "بيف برجر مع شرائح السموك بيف..." },
    { category: "Beef Burger", id: "molten-cheese-burger", name: { ar: "مولتن تشيز برجر", en: "Molten Cheese Burger" }, prices: { single: 180, double: 240 }, description: "بيف برجر المحشو مكس تشيز..." },
    { category: "Beef Burger", id: "smash-burger", name: { ar: "سماش برجر", en: "Smash Burger" }, prices: { single: 165, double: 200 }, description: "شريحة اللحمة - صوص البيج تيستي..." },
    { category: "Beef Burger", id: "shelter-rings-burger", name: { ar: "شيلتر رينجز", en: "Shelter rings" }, prices: { single: 180, double: 235 }, description: "بيف برجر - صوص البيج تيستي..." },

    // Chicken Burger (6 items)
    { category: "Chicken Burger", id: "chicken-jalapeno-burger", name: { ar: "تشيكن هالينو", en: "Chicken Jalapeño" }, prices: { single: 130, double: 165, triple: null }, description: "صدور مقلية - صوص البيج تيستي..." },
    { category: "Chicken Burger", id: "crunchy-chicken-burger", name: { ar: "تشيكن كرانشي", en: "Chicken Crunchy" }, prices: { single: 130, double: 160, triple: null }, description: "صدور مقلية - صوص البيج تيستي..." },
    { category: "Chicken Burger", id: "chicken-grill-burger", name: { ar: "تشيكن جريل", en: "Chicken Grill" }, prices: { single: 135, double: 165, triple: null }, description: "صدور مشوية - مايونيز..." },
    { category: "Chicken Burger", id: "cordon-bleu-burger", name: { ar: "كوردن بلو", en: "Cordon Bleu" }, prices: { single: 135, double: 180, triple: null }, description: "كوردن بلو - مايونيز..." },
    { category: "Chicken Burger", id: "chicken-shelter-burger", name: { ar: "تشيكن شيلتر", en: "Chicken Shelter" }, prices: { single: 145, double: 175, triple: 210 }, description: "صدور مقرمشة - صوص البيج تيستي..." },
    { category: "Chicken Burger", id: "chicken-ranch-burger", name: { ar: "تشيكن رانش", en: "Chicken Ranch" }, prices: { single: 115, double: 150, triple: null }, description: "صدور مقرمشة - صوص الرانش..." },

    // Mix Box (3 items)
    { category: "Mix Box", id: "mix-box-2", name: { ar: "ميكس بوكس 2", en: "Mix Box 2" }, price: 150, description: "ساندويش بيف برجر و ساندوتش تشيكن برجر..." },
    { category: "Mix Box", id: "mix-box-4", name: { ar: "ميكس بوكس 4", en: "Mix Box 4" }, price: 260, description: "2 بيف برجر و 2 تشيكن برجر..." },
    { category: "Mix Box", id: "mix-box-6", name: { ar: "ميكس بوكس 6", en: "Mix Box 6" }, price: 390, description: "3 بيف برجر و 3 تشيكن برجر...", optionGroups: [{ title: "beef burger choices", options: ["ستريت", "بيكون مشروم", "سماش برجر"] }, { title: "chicken burger choices", options: ["تشيكن هالينو", "كرانشي", "رانش"] }] },

    // Chicken Sandwich (5 items)
    { category: "Chicken Sandwich", id: "chicken-fajita-sand", name: { ar: "فاهيتا تشكن", en: "Chicken Fajita" }, prices: { price1: 115, price2: 95 }, priceNote: "Two prices are shown in the menu without visible labels.", description: "فاهيتا الدجاج المشوية..." },
    { category: "Chicken Sandwich", id: "shish-tawook-sand", name: { ar: "شيش طاووق", en: "Shish Tawook" }, prices: { price1: 110, price2: 90 }, priceNote: "Two prices are shown in the menu without visible labels.", description: "شيش طاووق مع صوص الثومية..." },
    { category: "Chicken Sandwich", id: "tashken-zanjar", name: { ar: "تاشكن زنجر", en: "Tashken Zanjar" }, price: 115, description: "استريس مقرمش مع المايونيز..." },
    { category: "Chicken Sandwich", id: "cordon-bleu-sand", name: { ar: "كوردن بلو", en: "Cordon Bleu" }, price: 120, description: "2 صابع كوردن مع المايونيز..." },
    { category: "Chicken Sandwich", id: "chicken-roll", name: { ar: "تشيكن رول", en: "Chicken Roll" }, price: 115, description: "الاستربس المقرمش في العيش السوري..." },

    // Beef Sandwich (2 items)
    { category: "Beef Sandwich", id: "grilled-kofta-sand", name: { ar: "الكفتة المشوية", en: "Grilled Kofta" }, prices: { price1: 130, price2: 100 }, priceNote: "Two prices are shown in the menu without visible labels.", description: "كفتة مشوية مع صوص الطحينة..." },
    { category: "Beef Sandwich", id: "grilled-sausage-sand", name: { ar: "السجق المشوي", en: "Grilled Sausage" }, prices: { price1: 95, price2: 80 }, priceNote: "Two prices are shown in the menu without visible labels.", description: "السجق المشوي مع صوص المايونيز..." }
  ]
};

// 2. المكون (Component) اللي هيعرض الزرار
// 2. المكون (Component) اللي هيعرض الزرار
export default function MenuUploader() {
  const [status, setStatus] = useState("جاهز للرفع");

  // 3. دالة الرفع
  const uploadMenuToFirebase = async () => {
    try {
      setStatus("⏳ جاري الرفع لـ Firebase...");
      
      const docRef = doc(db, "menu_v2", "active_menu");
      await setDoc(docRef, newMenuData);
      
      setStatus("✅ تم رفع المنيو بنجاح! راجع الفيربيز");
      alert("تم رفع المنيو بنجاح! راجع الـ Firebase Console.");
      
    } catch (error) {
      console.error("❌ حصل خطأ أثناء الرفع:", error);
      setStatus("❌ حصل خطأ أثناء الرفع، راجع الـ Console.");
    }
  };

  // 4. شكل الزرار في الموقع
  return (
    <div style={{ padding: "50px", textAlign: "center", backgroundColor: "#fff", zIndex: 9999, position: "relative" }}>
      <h2>أداة رفع المنيو 🚀</h2>
      <button 
        onClick={uploadMenuToFirebase}
        style={{
          padding: "15px 30px", fontSize: "18px", fontWeight: "bold",
          backgroundColor: "#e8521a", color: "white", border: "none",
          borderRadius: "8px", cursor: "pointer", marginTop: "20px"
        }}
      >
        رفع المنيو الآن
      </button>
      <p style={{ marginTop: "20px", fontSize: "16px", fontWeight: "bold" }}>{status}</p>
    </div>
  );
}