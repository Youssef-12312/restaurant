// menuData.js
// Extracted manually from the provided menu images.
// Notes I added:
// 1) `name` is always split into ar/en.
// 2) `description` is kept exactly in the menu language as much as possible.
// 3) When the menu shows multiple prices without a visible label, I used `prices: { price1, price2 }` and `priceNote`.
// 4) When the menu clearly shows size/stack labels like single/double/triple, I used them directly.
// 5) I added `optionGroups` where the menu itself mentions choices/add-ons.

export const menu = [

  // Shelter Rice (1 item)
  {
    category: "Shelter Rice",
    id: "",
    name: { ar: "شيلتر رايس", en: "Shelter Rice" },
    price: 120,
    description: "معاه صوص من اختيارك: شيلتر ناشفل / شيلتر تندوري / شيلتر رايز كريسي / شيلتر فاهيتا / شيلتر شيش. معاه صوص من (رانش، سموكي، سويت اند، ساور، تشيز).",
    optionGroups: [
      {
        title: "flavor",
        options: ["شيلتر ناشفل", "شيلتر تندوري", "شيلتر رايز كريسي", "شيلتر فاهيتا", "شيلتر شيش"]
      },
      {
        title: "sauce",
        options: ["رانش", "سموكي", "سويت اند", "ساور", "تشيز"]
      }
    ]
  },

  // Sauces (11 items)
  {
    category: "Sauces",
    id: "",
    name: { ar: "باربيكيو صوص", en: "باربيكيو صوص" },
    price: 15,
    description: ""
  },
  {
    category: "Sauces",
    id: "mayonnaise",
    name: { ar: "صوص مايونيز", en: "صوص مايونيز" },
    price: 10,
    description: ""
  },
  {
    category: "Sauces",
    id: "",
    name: { ar: "صوص فريسكس", en: "صوص فريسكس" },
    price: 15,
    description: ""
  },
  {
    category: "Sauces",
    id: "",
    name: { ar: "ميني جار جبنة شيدر", en: "ميني جار جبنة شيدر" },
    price: 30,
    description: ""
  },
  {
    category: "Sauces",
    id: "",
    name: { ar: "جار جبنة شيدر", en: "جار جبنة شيدر" },
    price: 75,
    description: ""
  },
  {
    category: "Sauces",
    id: "",
    name: { ar: "صوص جبنة شيلتر", en: "صوص جبنة شيلتر" },
    price: 15,
    description: ""
  },
  {
    category: "Sauces",
    id: "",
    name: { ar: "صوص رانش", en: "صوص رانش" },
    price: 15,
    description: ""
  },
  {
    category: "Sauces",
    id: "",
    name: { ar: "صوص بافلو حار", en: "صوص بافلو حار" },
    price: 10,
    description: ""
  },
  {
    category: "Sauces",
    id: "",
    name: { ar: "صوص ريزو حار", en: "صوص ريزو حار" },
    price: 15,
    description: ""
  },
  {
    category: "Sauces",
    id: "tahini",
    name: { ar: "صوص طحينة", en: "صوص طحينة" },
    price: 10,
    description: ""
  },
  {
    category: "Sauces",
    id: "garlic-dip",
    name: { ar: "صوص الثومية", en: "صوص الثومية" },
    price: 10,
    description: ""
  },

  // Extras (13 items)
  {
    category: "Extras",
    id: "",
    name: { ar: "خبز كايزر برجر", en: "خبز كايزر برجر" },
    price: 10,
    description: ""
  },
  {
    category: "Extras",
    id: "",
    name: { ar: "خبز محمص", en: "خبز محمص" },
    price: 10,
    description: ""
  },
  {
    category: "Extras",
    id: "extra-mozzarella",
    name: { ar: "جبنة موزريلا", en: "جبنة موزريلا" },
    price: 20,
    description: ""
  },
  {
    category: "Extras",
    id: "extra-sausage",
    name: { ar: "سجق", en: "سجق" },
    price: 20,
    description: ""
  },
  {
    category: "Extras",
    id: "extra-pepperoni",
    name: { ar: "بيروني أو سلامي", en: "بيروني أو سلامي" },
    price: 20,
    description: ""
  },
  {
    category: "Extras",
    id: "",
    name: { ar: "خبز كايزر وجبة", en: "خبز كايزر وجبة" },
    price: 5,
    description: ""
  },
  {
    category: "Extras",
    id: "",
    name: { ar: "قطعه بروست صدر", en: "قطعه بروست صدر" },
    price: 50,
    description: ""
  },
  {
    category: "Extras",
    id: "",
    name: { ar: "قطعة بروست فخذ", en: "قطعة بروست فخذ" },
    price: 45,
    description: ""
  },
  {
    category: "Extras",
    id: "",
    name: { ar: "قطعة بروست دبوس", en: "قطعة بروست دبوس" },
    price: 35,
    description: ""
  },
  {
    category: "Extras",
    id: "",
    name: { ar: "شريحة استريس", en: "شريحة استريس" },
    price: 35,
    description: ""
  },
  {
    category: "Extras",
    id: "",
    name: { ar: "2 قطعة زنجر", en: "2 قطعة زنجر" },
    price: 20,
    description: ""
  },
  {
    category: "Extras",
    id: "",
    name: { ar: "هوت دوج", en: "هوت دوج" },
    price: 20,
    description: ""
  },
  {
    category: "Extras",
    id: "",
    name: { ar: "بيف بيكون أو رومي مدخن", en: "بيف بيكون أو رومي مدخن" },
    price: 15,
    description: ""
  },

  // Salads (4 items)
  {
    category: "Salads",
    id: "green-salad",
    name: { ar: "سلطة خضراء", en: "Green Salad" },
    price: 45,
    description: "خيار - طماطم - خس - فلفل - جزر"
  },
  {
    category: "Salads",
    id: "chicken-ranch-salad",
    name: { ar: "تشيكن رانش سلط", en: "Chicken Ranch Salad" },
    price: 100,
    description: "خس و طماطم و فلفل ألوان و صدور مشوية مع صوص الرانش"
  },
  {
    category: "Salads",
    id: "coleslaw",
    name: { ar: "كولو سلو", en: "Coleslaw" },
    prices: { price1: 35, price2: 25 },
    priceNote: "Two prices are shown in the menu without visible labels.",
    description: ""
  },
  {
    category: "Salads",
    id: "pickles",
    name: { ar: "مخلل", en: "Pickles" },
    price: 15,
    description: ""
  },

  // Kids' Meals (4 items)
  {
    category: "Kids' Meals",
    id: "",
    name: { ar: "بيف / تشيكن برجر", en: "Beef/Chicken Burger" },
    price: 120,
    description: "ساندوتش بيف أو تشيكن من اختيارك والبطاطس والعصير ولعبة هدية"
  },
  {
    category: "Kids' Meals",
    id: "",
    name: { ar: "استريس كيدز", en: "Stress Kids" },
    price: 120,
    description: "2 قطعة استريس وبطاطس و عصير و لعبة هدية"
  },
  {
    category: "Kids' Meals",
    id: "",
    name: { ar: "أي وجبة أطفال بدون لعبة", en: "أي وجبة أطفال بدون لعبة" },
    price: 95,
    description: ""
  },
  {
    category: "Kids' Meals",
    id: "",
    name: { ar: "لعبة", en: "Toy" },
    price: 25,
    description: ""
  },

  // Waffle (5 items)
  {
    category: "Waffle",
    id: "caramel",
    name: { ar: "شريحة وافل كراميل", en: "Caramel" },
    price: 25,
    description: ""
  },
  {
    category: "Waffle",
    id: "nutella",
    name: { ar: "شريحة وافل نوتيلا", en: "Nutella" },
    price: 25,
    description: ""
  },
  {
    category: "Waffle",
    id: "white-chocolate",
    name: { ar: "شريحة وافل وايت شوكليت", en: "White Chocolate" },
    price: 25,
    description: ""
  },
  {
    category: "Waffle",
    id: "",
    name: { ar: "شريحة وافل لوتس", en: "Lotus" },
    price: 30,
    description: ""
  },
  {
    category: "Waffle",
    id: "",
    name: { ar: "تورتة وافل", en: "Waffle Cake" },
    price: 90,
    description: ""
  },

  // Drinks (4 items)
  {
    category: "Drinks",
    id: "",
    name: { ar: "مياه معدنية صغيرة", en: "Small Water" },
    price: 15,
    description: ""
  },
  {
    category: "Drinks",
    id: "",
    name: { ar: "مشروب غازي", en: "Soda" },
    price: 20,
    description: ""
  },
  {
    category: "Drinks",
    id: "",
    name: { ar: "مشروب غازي لتر", en: "1 Liter Soda" },
    price: 35,
    description: ""
  },
  {
    category: "Drinks",
    id: "",
    name: { ar: "عصير صن توب", en: "Sun Top" },
    price: 20,
    description: ""
  },

  // Sides (10 items)
  {
    category: "Sides",
    id: "french-fries",
    name: { ar: "فرنش فرايز", en: "French Fries" },
    price: 35,
    description: "بطاطس مقرمشة بهار لذيذ من شيلتر"
  },
  {
    category: "Sides",
    id: "frisks-fries",
    name: { ar: "بطاطس فريسكس", en: "Friskies fries" },
    price: 45,
    description: "بطاطس بتتبيلة كريسي خاصة بنا مع صوص الفرنسكس الرائع"
  },
  {
    category: "Sides",
    id: "onion-rings",
    name: { ar: "حلقات بصل", en: "Onion Rings" },
    price: 40,
    description: "حلقات بصل مقرمشة"
  },
  {
    category: "Sides",
    id: "mozzarella-sticks",
    name: { ar: "أصابع موزريلا", en: "Mozzarella Sticks" },
    price: 50,
    description: "5 أصابع موزريلا مقرمست"
  },
  {
    category: "Sides",
    id: "",
    name: { ar: "كب زنجر", en: "Zinger Cup" },
    price: 70,
    description: "4 ( رانش صوص + شيدر صوص & سويت أند ساور صوص ) قطع فراخ مقرمشة بصوص من اختيارك"
  },
  {
    category: "Sides",
    id: "",
    name: { ar: "تشيكن ريزو", en: "Chicken risotto" },
    price: 70,
    description: "أرز بسمتي مع قطع دجاج الزنجر الحارة و غرقانة صوص الريزو الرائع الحار"
  },
  {
    category: "Sides",
    id: "mac-and-cheese",
    name: { ar: "ماك & تشيز", en: "Mac & Cheese" },
    prices: { price1: 55, price2: 30 },
    priceNote: "Two prices are shown in the menu without visible labels.",
    description: "طبق مكرونة بنا غرقان بصوص الجبنة الرائع"
  },
  {
    category: "Sides",
    id: "",
    name: { ar: "هالينو تشيز فرايز", en: "Jalapeño Cheese Fries" },
    price: 60,
    description: "بطاطس مقلية مع الهالينو الحار و صوص الجبنة الرائع"
  },
  {
    category: "Sides",
    id: "rice-platter",
    name: { ar: "طبق أرز", en: "Rice Dish" },
    prices: { price1: 40, price2: 25 },
    priceNote: "Two prices are shown in the menu without visible labels.",
    description: ""
  },
  {
    category: "Sides",
    id: "sweet-corn",
    name: { ar: "سويت كورن", en: "Sweetcorn" },
    price: 35,
    description: ""
  },

  // Shelter Milkshake (3 items)
  {
    category: "Shelter Milkshake",
    id: "",
    name: { ar: "ميلك تشيك شيكولاتة", en: "Chocolate Milkshake" },
    price: 50,
    description: "مع اضافه صوص من اختيارك ( كراميل / شيكولاتة / بلو بيري / فراولة )",
    optionGroups: [{ title: "sauce", options: ["كراميل", "شيكولاتة", "بلو بيري", "فراولة"] }]
  },
  {
    category: "Shelter Milkshake",
    id: "",
    name: { ar: "ميلك تشيك فانيليا", en: "Vanilla Milkshake" },
    price: 45,
    description: "مع اضافه صوص من اختيارك ( كراميل / شيكولاتة / بلو بيري / فراولة )",
    optionGroups: [{ title: "sauce", options: ["كراميل", "شيكولاتة", "بلو بيري", "فراولة"] }]
  },
  {
    category: "Shelter Milkshake",
    id: "",
    name: { ar: "ميلك تشيك فراولة", en: "Strawberry Milkshake" },
    price: 45,
    description: "مع اضافه صوص من اختيارك ( كراميل / شيكولاتة / بلو بيري / فراولة )",
    optionGroups: [{ title: "sauce", options: ["كراميل", "شيكولاتة", "بلو بيري", "فراولة"] }]
  },

  // Mojitos (4 items)
  {
    category: "Mojitos",
    id: "",
    name: { ar: "موهيتو ليمون نعناع", en: "Mint Lemon Mojito" },
    price: 40,
    description: ""
  },
  {
    category: "Mojitos",
    id: "",
    name: { ar: "موهيتو بلوبيري", en: "Blueberry Mojito" },
    price: 45,
    description: ""
  },
  {
    category: "Mojitos",
    id: "",
    name: { ar: "موهيتو فراولة", en: "Strawberry Mojito" },
    price: 45,
    description: ""
  },
  {
    category: "Mojitos",
    id: "",
    name: { ar: "موهيتو فواكه استوائية", en: "Tropical Fruit Mojito" },
    price: 45,
    description: ""
  },

  // Meals (10 items)
  {
    category: "Meals",
    id: "mix-grill-meal",
    name: { ar: "مكس جريل", en: "Mix Grill" },
    price: 235,
    description: "شيش طاووق مع الكفتة المشوية و الصدور المشوية والخبر والكلو سلو و الطحينة",
    optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }]
  },
  {
    category: "Meals",
    id: "shish-tawook-meal",
    name: { ar: "شيش طاووق", en: "Shish Tawook" },
    price: 200,
    description: "قطع الشيش طاووق المتبلة بتتبيلة شيلتر و الفلفل و البصل و الخبز و الثومية و الكلو سلو",
    optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }]
  },
  {
    category: "Meals",
    id: "",
    name: { ar: "صدور مشوية", en: "Grilled Chicken Breasts" },
    price: 200,
    description: "شرائح الصدور المشوية مع الخبز و صوص الثومية الرائع من شيلتر و الكلو سلو",
    optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }]
  },
  {
    category: "Meals",
    id: "",
    name: { ar: "تشيكن مشروم", en: "Chicken Mushroom" },
    price: 210,
    description: "الصدور المشوية مع صوص الديمجلاس و الماشروم الرائع مع الخبز و الكلو سلو",
    optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }]
  },
  {
    category: "Meals",
    id: "",
    name: { ar: "كوردن بلو", en: "Cordon Bleu" },
    price: 200,
    description: "5 قطع كوردن بلو مع الخبز و الكلو سلو",
    optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }]
  },
  {
    category: "Meals",
    id: "",
    name: { ar: "كرانشي تشيز سموكد", en: "Crunchy Smoked Cheese" },
    price: 190,
    description: "4 قطع استرس المقرمش الحار مع اسف بيكون و صوص الشيدر و الخبز و الكلو سلو",
    optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }]
  },
  {
    category: "Meals",
    id: "chicken-sticks",
    name: { ar: "تشيكن استيكس", en: "Chicken Sticks" },
    price: 140,
    description: "3 قطع استرس مقرمش حار مع الخبز و صوص الريزو الحار",
    optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }]
  },
  {
    category: "Meals",
    id: "crunchy-strips-meal",
    name: { ar: "استربس كرانشي", en: "Crunchy Strips" },
    price: 195,
    description: "5 قطع استربس مقرمش حار مع الخبز و صوص الريزو الحار و الكلو سلو",
    optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }]
  },
  {
    category: "Meals",
    id: "",
    name: { ar: "ناشفل", en: "Nashville" },
    price: 150,
    description: "3 قطع استريس معاهم بطاطس وماك تشيز وصوص عسل وعيش ورايب",
    optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }]
  },
  {
    category: "Meals",
    id: "",
    name: { ar: "وجبة تندوري", en: "Tandoori Meal" },
    price: 200,
    description: "5 قطع تندوري وخبز وكلو سلو وصوص",
    optionGroups: [{ title: "sides", options: ["ماك تشيز", "الأرز", "نودلز الخضار", "بطاطس", "سويت كورن"] }]
  },

  // Broast Saver (4 items)
  {
    category: "Broast Saver",
    id: "economic-snack",
    name: { ar: "سناك بوكس موفرة", en: "Snack Box Saver" },
    price: 125,
    description: "2 قطعه بروست و بطاطس و خبز و صوص الريزو الحار"
  },
  {
    category: "Broast Saver",
    id: "dinner-box-saver",
    name: { ar: "دينر بوكس موفرة", en: "Dinner Box Saver" },
    price: 165,
    description: "3 قطع بروست و بطاطس و خبز و صوص الريزو الحار"
  },
  {
    category: "Broast Saver",
    id: "4-pieces-of-broasted-chicken-saver",
    name: { ar: "4 قطع بروست موفرة", en: "4 pieces of Broasted chicken Saver" },
    price: 200,
    description: "4 قطع بروست و البطاطس والخبز و صوص الريزو الحار"
  },
  {
    category: "Broast Saver",
    id: "super-dinner",
    name: { ar: "سوبر دينر موفرة", en: "Super Dinner Saver" },
    price: 235,
    description: "5 قطع بروست و البطاطس والخبز"
  },

  // Broast (4 items)
  {
    category: "Broast",
    id: "snack-box",
    name: { ar: "سناك بوكس", en: "Snack Box" },
    price: 155,
    description: "2 قطعه بروست و الأرز و البطاطس والخبز و الكلو سلو و صوص الريزو الحار"
  },
  {
    category: "Broast",
    id: "economic-dinner",
    name: { ar: "دينر بوكس", en: "Dinner Box" },
    price: 200,
    description: "3 قطع بروست و الأرز و البطاطس والخبز و الكلو سلو و صوص الريزو الحار"
  },
  {
    category: "Broast",
    id: "4-Piece-broasted-meal",
    name: { ar: "وجبة 4 قطع بروست", en: "4-Piece Broasted Meal" },
    price: 235,
    description: "4 قطع بروست و الأرز والبطاطس والخبز و الكلو سلو و صوص الريزو الحار"
  },
  {
    category: "Broast",
    id: "economic-super-dinner",
    name: { ar: "سوبر دينر", en: "Super Dinner" },
    price: 270,
    description: "5 قطع بروست و الأرز و البطاطس والخبز و الكلو سلو و صوص الريزو الحار"
  },

  // Family Meals (6 items)
  {
    category: "Family Meals",
    id: "10-strips",
    name: { ar: "وجبة 10 قطع استربس", en: "10-Piece Chicken Meal" },
    price: 370,
    description: "10 قطع استربس والبطاطس و 4 خبز و كلو سلو عائلي و مشروب غازي لتر و صوص الريزو الحار"
  },
  {
    category: "Family Meals",
    id: "9-broast",
    name: { ar: "وجبة 9 قطع بروست", en: "9-Piece Broasted Chicken Meal" },
    price: 450,
    description: "9 قطع بروست و البطاطس و 3 خبز و كلو سلو عائلي و مشروب غازي لتر و صوص الريزو الحار"
  },
  {
    category: "Family Meals",
    id: "12-Piece-broasted-chicken-meal",
    name: { ar: "وجبة 12 قطعة بروست", en: "12-Piece Broasted Chicken Meal" },
    price: 595,
    description: "12 قطعة بروست و البطاطس و 4 خبز و كلو سلو عائلي و مشروب غازي لتر و صوص الريزو الحار"
  },
  {
    category: "Family Meals",
    id: "torta-broast",
    name: { ar: "تورتة بروست", en: "Broasted Chicken Cake" },
    price: 840,
    description: "20 قطعة بروست و البطاطس و 10 خبز و 2 كلو سلو عائلي و 2 مشروب غازي لتر و صوص الريزو الحار"
  },
  {
    category: "Family Meals",
    id: "12-Piece-broasted-chicken-meal",
    name: { ar: "وجبة مكس", en: "Mix Meal (Broasted & Strips)" },
    price: 670,
    description: "12 قطعة بروست و 4 قطع استريس و بطاطس و 5 خبز و 2 كلو سلو عائلي و مشروب غازي لتر و صوص الريزو الحار"
  },
  {
    category: "Family Meals",
    id: "",
    name: { ar: "عرض الشلة", en: "Gang Deal" },
    price: 795,
    description: "14 قطعة بروست و البطاطس و 4 خبز و مشروب غازي لتر و نافورة الجبنة"
  },

  // Pizza (7 items)
  {
    category: "Pizza",
    id: "pizza-mix-cheese",
    name: { ar: "مكس تشيز", en: "Mixed Cheese" },
    price: 150,
    description: "صلصة البيتزا الرائعة مع الجبنة الموتزريلا و جبنة افانتي و الجبنة الرومي المبشورة و جبنة كيري و صوص جبنة شيدر",
    sizeNote: "All pizzas are 28 cm"
  },
  {
    category: "Pizza",
    id: "chicken-ranch-pizza",
    name: { ar: "تشيكن رانش", en: "Chicken Ranch" },
    price: 195,
    description: "صوص الرانش الخاص بشيلتر و صدور مشوية و الفلفل و الزيتون والجبنة الموتزريلا و جبنة افانتي",
    sizeNote: "All pizzas are 28 cm"
  },
  {
    category: "Pizza",
    id: "",
    name: { ar: "ألفريدو وايت صوص", en: "Alfredo White Sauce" },
    price: 195,
    description: "الوايت صوص الرائع مع الشيش طاووق وشرائح المشروم الفريش والفلفل والزيتون و الجبنة الموتزريلا وجبنة افانتي",
    sizeNote: "All pizzas are 28 cm"
  },
  {
    category: "Pizza",
    id: "",
    name: { ar: "تشيكن بافلو زنجر", en: "Chicken Buffalo Zinger" },
    price: 190,
    description: "صوص البافلو الحار والرومي المدخن و قطع الاستربس الحارة و الرومي المدخن والفلفل والزيتون والجبنة الموتزريلا وجبنة افانتي",
    sizeNote: "All pizzas are 28 cm"
  },
  {
    category: "Pizza",
    id: "supreme-meat-pizza",
    name: { ar: "سوبريم لحوم", en: "Meat Supreme" },
    price: 205,
    description: "صلصة البيتزا والكفتة المشوية وشرائح الهوت دوج و البيبروني و السجق والفلفل والبصل والزيتون والجبنة الموتزريلا و جبنة افانتي",
    sizeNote: "All pizzas are 28 cm"
  },
  {
    category: "Pizza",
    id: "double-pepperoni-pizza",
    name: { ar: "دابل ببروني", en: "Double Pepperoni" },
    price: 210,
    description: "",
    sizeNote: "All pizzas are 28 cm"
  },
  {
    category: "Pizza",
    id: "",
    name: { ar: "بيتزا بسطرمة", en: "Pastrami Pizza" },
    price: 205,
    description: "",
    sizeNote: "All pizzas are 28 cm"
  },

  // Pasta (10 items)
  {
    category: "Pasta",
    id: "",
    name: { ar: "باستا سي فود", en: "Seafood Pasta (Grilled or Fried)" },
    price: 190,
    description: "المكرونة بصوص جبنة شيدر الرائع مع الجمبري المشوي والمقلي و شرائح الكابوريا والكاليماري و الجبنة الموتزريلا"
  },
  {
    category: "Pasta",
    id: "",
    name: { ar: "باستا جمبري", en: "Shrimp Pasta (Grilled or Fried)" },
    price: 180,
    description: "المكرونة بصوص جبنة شيدر الرائع مع الجمبري و الجبنة الموتزريلا و الجبنة الرومي"
  },
  {
    category: "Pasta",
    id: "",
    name: { ar: "بنا ريد صوص", en: "Penne Red" },
    price: 65,
    description: "المكرونة البنا بالصوص الطماطم الرائع و الفلفل الألوان"
  },
  {
    category: "Pasta",
    id: "bolognese",
    name: { ar: "باستا بولونيز", en: "Pasta Bolognese" },
    price: 105,
    description: "المكرونة البنا بصوص الطماطم الرائع و اللحمة المفرومة و الفلفل الألوان"
  },
  {
    category: "Pasta",
    id: "",
    name: { ar: "نودلز صدور مشوية", en: "نودلز صدور مشوية" },
    price: 100,
    description: ""
  },
  {
    category: "Pasta",
    id: "",
    name: { ar: "نودلز زنجر", en: "نودلز زنجر" },
    price: 100,
    description: ""
  },
  {
    category: "Pasta",
    id: "",
    name: { ar: "نودلز خضروات", en: "نودلز خضروات" },
    price: 60,
    description: ""
  },
  {
    category: "Pasta",
    id: "alfredo",
    name: { ar: "باستا ألفريدو", en: "Pasta Alfredo" },
    price: 170,
    description: ""
  },
  {
    category: "Pasta",
    id: "cordon-bleu-pasta",
    name: { ar: "كوردن بلو باستا", en: "Corden bleu Pasta" },
    price: 165,
    description: ""
  },
  {
    category: "Pasta",
    id: "chicken-balls",
    name: { ar: "تشيكن بولز", en: "Chicken balls" },
    price: 155,
    description: ""
  },

  // Cheese Pan (9 items)
  {
    category: "Cheese Pan",
    id: "mix-meat-tasa",
    name: { ar: "مكس لحوم تشيز طاسة", en: "Meat mix Cheese" },
    price: 145,
    description: "صوص الجبنة الخاصة بشيلتر مع الهوت دوج و السجق و البيروني و السلامي و الجبنة الموتزريلا"
  },
  {
    category: "Cheese Pan",
    id: "",
    name: { ar: "سي فود تشيز طاسة", en: "Seafood Cheese (Grilled or Fried)" },
    price: 190,
    description: "صوص الجبنة الخاصة بشيلتر مع الجمبري و كالماري و شرائح الكابوريا و الجبنة الموتزريلا"
  },
  {
    category: "Cheese Pan",
    id: "",
    name: { ar: "جمبري تشيز طاسة", en: "Shrimp Cheese (Grilled or Fried)" },
    price: 160,
    description: "صوص الجبنة الخاصة بشيلتر مع الجمبري المقلي أو المشوي و الجبنة الموتزريلا"
  },
  {
    category: "Cheese Pan",
    id: "chilly-cheese-fries-tasa",
    name: { ar: "تشيلي تشيز فرايز", en: "Chili Cheese Fries" },
    price: 135,
    description: "صوص الجبنة الخاصة بشيلتر مع اللحمة المفرومة و البطاطس المقلية و الجبنة الموتزريلا"
  },
  {
    category: "Cheese Pan",
    id: "sausage-cheese-tasa",
    name: { ar: "سجق تشيز طاسة", en: "Sausage Cheese" },
    price: 140,
    description: "صوص الجبنة الخاصة بشيلتر مع شرائح السجق المشوي و الجبنة الموتزريلا"
  },
  {
    category: "Cheese Pan",
    id: "spinach-mushroom-tasa",
    name: { ar: "سبانخ ماشروم تشيز طاسة", en: "Spinach Mushroom Cheese" },
    price: 125,
    description: "صوص الخاصة بشيلتر مع الماشروم و شرائح السبانخ الفريش الرائعة و الجبنة الموتزريلا"
  },
  {
    category: "Cheese Pan",
    id: "zinger-cheese-tasa",
    name: { ar: "زنجر تشيز طاسة", en: "Zinger Cheese" },
    price: 165,
    description: "صوص الجبنة الخاصة بشيلتر مع شرائح الزنجر الحارة المقلية و الجبنة الموتزريلا"
  },
  {
    category: "Cheese Pan",
    id: "",
    name: { ar: "تشيز فرايز", en: "Cheese Fries" },
    price: 115,
    description: ""
  },
  {
    category: "Cheese Pan",
    id: "",
    name: { ar: "طاسة بسطرمة", en: "Pastrami" },
    price: 140,
    description: ""
  },

  // Beef Burger (7 items)
  {
    category: "Beef Burger",
    id: "street-burger",
    name: { ar: "ستريت برجر", en: "Street Burger" },
    prices: { single: 165, double: 210 },
    description: "بيف برجر - صوص البيج تيستي - خيار - خس - طماطم - بصل - صوص الشيدر"
  },
  {
    category: "Beef Burger",
    id: "jalapeno-maharaja-burger",
    name: { ar: "هالينو مهراجا", en: "Jalapeño Maharaja" },
    prices: { single: 175, double: 220 },
    description: "بيف برجر - صوص البيج تيستي - خيار - خس - بصل - شرائح الهالينو الحارة - صوص الشيدر"
  },
  {
    category: "Beef Burger",
    id: "",
    name: { ar: "بيكون ماشروم", en: "Bacon Mushroom" },
    prices: { single: 175, double: 220 },
    description: "بيف برجر - صوص المايونيز - الخيار - الخس - البصل - الطماطم - البيف بيكون - الماشروم الفريش - صوص الشيدر"
  },
  {
    category: "Beef Burger",
    id: "",
    name: { ar: "سموكي تشيز برجر", en: "Smoky Cheese Burger" },
    prices: { single: 180, double: 260 },
    description: "بيف برجر مع شرائح السموك بيف - صوص البيج تيستي - خيار - خس - بصل - طماطم - ماشرووم - صوص الشيدر"
  },
  {
    category: "Beef Burger",
    id: "molten-cheese-burger",
    name: { ar: "مولتن تشيز برجر", en: "Molten Cheese Burger" },
    prices: { single: 180, double: 240 },
    description: "بيف برجر المحشو مكس تشيز الرائع - صوص البيج تيستي - خيار - خس - بصل - مكرمل - مشروم بصوص الديمجلاس - بيف بيكون - صوص الشيدر"
  },
  {
    category: "Beef Burger",
    id: "smash-burger",
    name: { ar: "سماش برجر", en: "Smash Burger" },
    prices: { single: 165, double: 200 },
    description: "شريحة اللحمة - صوص البيج تيستي - الخيار - البصل - الخس - الطماطم - صوص الشيدر"
  },
  {
    category: "Beef Burger",
    id: "",
    name: { ar: "شيلتر رينجز", en: "Shelter rings" },
    prices: { single: 180, double: 235 },
    description: "بيف برجر - صوص البيج تيستي - الخيار - الخس - حلقات البصل المقلية - أصابع موزتريلا - صوص الشيدر"
  },

  // Chicken Burger (6 items)
  {
    category: "Chicken Burger",
    id: "chicken-jalapeno-burger",
    name: { ar: "تشيكن هالينو", en: "Chicken Jalapeño" },
    prices: { single: 130, double: 165, triple: null },
    description: "صدور مقلية - صوص البيج تيستي - الخيار - الخس - الطماطم - صوص الشيدر - شرائح الهالينو - باربيكيو"
  },
  {
    category: "Chicken Burger",
    id: "crunchy-chicken-burger",
    name: { ar: "تشيكن كرانشي", en: "Chicken Crunchy" },
    prices: { single: 130, double: 160, triple: null },
    description: "صدور مقلية - صوص البيج تيستي - خيار - خس - صوص الشيدر - رومي مدخن - جبنة موزتريلا"
  },
  {
    category: "Chicken Burger",
    id: "chicken-grill-burger",
    name: { ar: "تشيكن جريل", en: "Chicken Grill" },
    prices: { single: 135, double: 165, triple: null },
    description: "صدور مشوية - مايونيز - خيار - خس - البصل المكرمل - صوص الشيدر"
  },
  {
    category: "Chicken Burger",
    id: "cordon-bleu-burger",
    name: { ar: "كوردن بلو", en: "Cordon Bleu" },
    prices: { single: 135, double: 180, triple: null },
    description: "كوردن بلو - مايونيز - خيار - خس - صوص الشيدر"
  },
  {
    category: "Chicken Burger",
    id: "chicken-shelter-burger",
    name: { ar: "تشيكن شيلتر", en: "Chicken Shelter" },
    prices: { single: 145, double: 175, triple: 210 },
    description: "صدور مقرمشة - صوص البيج تيستي - خيار - خس - بيف بيكون - رومي مدخن - صوص الشيدر"
  },
  {
    category: "Chicken Burger",
    id: "",
    name: { ar: "تشيكن رانش", en: "Chicken Ranch" },
    prices: { single: 115, double: 150, triple: null },
    description: "صدور مقرمشة - صوص الرانش - خيار - خس - طماطم - رومي مدخن"
  },

  // Mix Box (3 items)
  {
    category: "Mix Box",
    id: "",
    name: { ar: "ميكس بوكس 2", en: "Mix Box 2" },
    price: 150,
    description: "ساندويش بيف برجر و ساندوتش تشيكن برجر مع بطاطس و مشروب و صوص"
  },
  {
    category: "Mix Box",
    id: "",
    name: { ar: "ميكس بوكس 4", en: "Mix Box 4" },
    price: 260,
    description: "2 بيف برجر و 2 تشيكن برجر مع البطاطس و مشروب لتر و 2 صوص"
  },
  {
    category: "Mix Box",
    id: "",
    name: { ar: "ميكس بوكس 6", en: "Mix Box 6" },
    price: 390,
    description: "3 بيف برجر و 3 تشيكن برجر مع بطاطس و حلقات بصل و مشروب لتر و 3 صوص",
    optionGroups: [
      {
        title: "beef burger choices",
        options: ["ستريت", "بيكون مشروم", "سماش برجر"]
      },
      {
        title: "chicken burger choices",
        options: ["تشيكن هالينو", "كرانشي", "رانش"]
      }
    ]
  },

  // Chicken Sandwich (5 items)
  {
    category: "Chicken Sandwich",
    id: "",
    name: { ar: "فاهيتا تشكن", en: "Chicken Fajita" },
    prices: { price1: 115, price2: 95 },
    priceNote: "Two prices are shown in the menu without visible labels.",
    description: "فاهيتا الدجاج المشوية مع المايونيز والخيار و صوص الباربيكيو والفلفل و البصل و الزيتون"
  },
  {
    category: "Chicken Sandwich",
    id: "",
    name: { ar: "شيش طاووق", en: "Shish Tawook" },
    prices: { price1: 110, price2: 90 },
    priceNote: "Two prices are shown in the menu without visible labels.",
    description: "شيش طاووق مع صوص الثومية والخيار ومخلل والفلفل والبصل"
  },
  {
    category: "Chicken Sandwich",
    id: "",
    name: { ar: "تاشكن زنجر", en: "Tashken Zanjar" },
    price: 115,
    description: "استريس مقرمش مع المايونيز و الخيار والمخلل والخس و الرومي المدخن والجبنة الموتزريلا و صوص التايجر الحار"
  },
  {
    category: "Chicken Sandwich",
    id: "",
    name: { ar: "كوردن بلو", en: "Cordon Bleu" },
    price: 120,
    description: "2 صابع كوردن مع المايونيز والخيار والمخلل و الخس و صوص الجبنة الشيدر"
  },
  {
    category: "Chicken Sandwich",
    id: "",
    name: { ar: "تشيكن رول", en: "Chicken Roll" },
    price: 115,
    description: "الاستربس المقرمش في العيش السوري مع المايونيز و الخيار والمخلل والخس وصوص الجبنة و صوص التايجر الحار"
  },

  // Beef Sandwich (2 items)
  {
    category: "Beef Sandwich",
    id: "",
    name: { ar: "الكفتة المشوية", en: "Grilled Kofta" },
    prices: { price1: 130, price2: 100 },
    priceNote: "Two prices are shown in the menu without visible labels.",
    description: "كفتة مشوية مع صوص الطحينة و الخيار وخضار الكفتة طماطم و بصل و بقدونس"
  },
  {
    category: "Beef Sandwich",
    id: "",
    name: { ar: "السجق المشوي", en: "Grilled Sausage" },
    prices: { price1: 95, price2: 80 },
    priceNote: "Two prices are shown in the menu without visible labels.",
    description: "السجق المشوي مع صوص المايونيز و الخيار و الفلفل و الطماطم وصوص السجق"
  }
];

export default menu;
