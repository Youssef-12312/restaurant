import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const menu = [

  // ───────── MILKSHAKES ─────────
  {
    category: "Milkshake",
    name: "Chocolate Milkshake",
    price: 50,
    description: "ميلك شيك شوكولاتة",
    options: {
      sauces: ["caramel", "chocolate", "blueberry", "strawberry"]
    }
  },
  {
    category: "Milkshake",
    name: "Vanilla Milkshake",
    price: 45,
    description: "ميلك شيك فانيليا",
    options: {
      sauces: ["caramel", "chocolate", "blueberry", "strawberry"]
    }
  },
  {
    category: "Milkshake",
    name: "Strawberry Milkshake",
    price: 45,
    description: "ميلك شيك فراولة",
    options: {
      sauces: ["caramel", "chocolate", "blueberry", "strawberry"]
    }
  },

  // ───────── MOJITO ─────────
  { category: "Mojito", name: "Mint Lemon Mojito", price: 40 },
  { category: "Mojito", name: "Blueberry Mojito", price: 45 },
  { category: "Mojito", name: "Strawberry Mojito", price: 45 },
  { category: "Mojito", name: "Tropical Fruit Mojito", price: 45 },

  // ───────── MEALS ─────────
  {
    category: "Meals",
    name: "Mix Grill",
    price: 235,
    description: "شيش طاووق + كفتة + صدور مشوية + خبز + كول سلو + طحينة",
    options: {
      sides: ["rice", "fries", "vegetables", "mac & cheese", "sweet corn"]
    }
  },
  {
    category: "Meals",
    name: "Shish Tawook",
    price: 200,
    description: "قطع دجاج متبلة + خبز + بطاطس + صوص",
    options: {
      sides: ["rice", "fries", "vegetables", "mac & cheese", "sweet corn"]
    }
  },
  {
    category: "Meals",
    name: "Grilled Chicken Breasts",
    price: 200,
    description: "صدور مشوية + خبز + صوص",
    options: {
      sides: ["rice", "fries", "vegetables", "mac & cheese", "sweet corn"]
    }
  },
  {
    category: "Meals",
    name: "Chicken Mushroom",
    price: 210,
    description: "صدور + مشروم + صوص ديمي جلاس",
  },
  {
    category: "Meals",
    name: "Cordon Bleu",
    price: 200,
    description: "قطع كوردن بلو + خبز + كول سلو",
  },

  // ───────── CRUNCHY / STRIPS ─────────
  {
    category: "Meals",
    name: "Crunchy Smoked Cheese",
    price: 190,
    description: "4 قطع استربس + صوص شيدر + بيكون",
  },
  {
    category: "Meals",
    name: "Chicken Sticks",
    price: 140,
    description: "3 قطع استربس + خبز + صوص",
  },
  {
    category: "Meals",
    name: "Crunchy Strips",
    price: 195,
    description: "5 قطع استربس + خبز + صوص",
  },
  {
    category: "Meals",
    name: "Nashville",
    price: 150,
    description: "3 قطع استربس + بطاطس + ماك تشيز",
  },
  {
    category: "Meals",
    name: "Tandoori Meal",
    price: 200,
    description: "5 قطع دجاج تندوري + خبز + صوص",
  },

  // ───────── BROAST ─────────
  {
    category: "Broast",
    name: "Snack Box",
    price: 155,
    description: "2 قطع بروست + رز + بطاطس + خبز + صوص",
  },
  {
    category: "Broast",
    name: "Dinner Box",
    price: 200,
    description: "3 قطع بروست + رز + بطاطس + خبز + صوص",
  },
  {
    category: "Broast",
    name: "4 Piece Broast Meal",
    price: 235,
  },
  {
    category: "Broast",
    name: "Super Dinner",
    price: 270,
  },

  // Saver
  { category: "Broast", name: "Snack Box Saver", price: 125 },
  { category: "Broast", name: "Dinner Box Saver", price: 165 },
  { category: "Broast", name: "4 Piece Saver", price: 200 },
  { category: "Broast", name: "Super Dinner Saver", price: 235 },

  // Family Meals
  { category: "Broast", name: "10 Piece Chicken Meal", price: 370 },
  { category: "Broast", name: "9 Piece Chicken Meal", price: 450 },
  { category: "Broast", name: "12 Piece Chicken Meal", price: 595 },
  { category: "Broast", name: "Chicken Cake", price: 840 },
  { category: "Broast", name: "Mix Meal", price: 670 },
  { category: "Broast", name: "Gang Deal", price: 795 },

  // ───────── PIZZA ─────────
  { category: "Pizza", name: "Mixed Cheese", price: 150 },
  { category: "Pizza", name: "Chicken Ranch", price: 195 },
  { category: "Pizza", name: "Alfredo White Sauce", price: 195 },
  { category: "Pizza", name: "Buffalo Zinger", price: 190 },
  { category: "Pizza", name: "Meat Supreme", price: 205 },
  { category: "Pizza", name: "Double Pepperoni", price: 210 },
  { category: "Pizza", name: "Pastrami Pizza", price: 205 },

  // ───────── PASTA ─────────
  { category: "Pasta", name: "Seafood Pasta", price: 190 },
  { category: "Pasta", name: "Shrimp Pasta", price: 180 },
  { category: "Pasta", name: "Penne Red", price: 65 },
  { category: "Pasta", name: "Bolognese", price: 105 },
  { category: "Pasta", name: "Alfredo", price: 170 },
  { category: "Pasta", name: "Cordon Bleu Pasta", price: 165 },
  { category: "Pasta", name: "Chicken Balls Pasta", price: 155 },

  // ───────── CHEESE PAN ─────────
  { category: "Cheese Pan", name: "Meat Mix Cheese", price: 145 },
  { category: "Cheese Pan", name: "Seafood Cheese", price: 190 },
  { category: "Cheese Pan", name: "Shrimp Cheese", price: 160 },
  { category: "Cheese Pan", name: "Chili Cheese Fries", price: 135 },
  { category: "Cheese Pan", name: "Sausage Cheese", price: 140 },
  { category: "Cheese Pan", name: "Spinach Mushroom Cheese", price: 125 },
  { category: "Cheese Pan", name: "Zinger Cheese", price: 165 },
  { category: "Cheese Pan", name: "Cheese Fries", price: 115 },
  { category: "Cheese Pan", name: "Pastrami Cheese", price: 140 },

  // ───────── BEEF BURGER ─────────
  { category: "Beef Burger", name: "Street Burger", price: 165, priceLarge: 210 },
  { category: "Beef Burger", name: "Jalapeno Maharaja", price: 175, priceLarge: 220 },
  { category: "Beef Burger", name: "Bacon Mushroom", price: 175, priceLarge: 220 },
  { category: "Beef Burger", name: "Smoky Cheese Burger", price: 180, priceLarge: 260 },
  { category: "Beef Burger", name: "Molten Cheese Burger", price: 180, priceLarge: 240 },
  { category: "Beef Burger", name: "Smash Burger", price: 165, priceLarge: 200 },
  { category: "Beef Burger", name: "Shelter Rings Burger", price: 180, priceLarge: 235 },

  // ───────── CHICKEN BURGER ─────────
  { category: "Chicken Burger", name: "Chicken Jalapeno", price: 130 },
  { category: "Chicken Burger", name: "Chicken Crunchy", price: 130 },
  { category: "Chicken Burger", name: "Chicken Grill", price: 135 },
  { category: "Chicken Burger", name: "Cordon Bleu Burger", price: 135 },
  { category: "Chicken Burger", name: "Chicken Shelter", price: 145 },
  { category: "Chicken Burger", name: "Chicken Ranch", price: 115 },

  // ───────── MIX BOX ─────────
  { category: "Mix Box", name: "Mix Box 2", price: 150 },
  { category: "Mix Box", name: "Mix Box 4", price: 260 },
  { category: "Mix Box", name: "Mix Box 6", price: 390 },

  // ───────── SANDWICH ─────────
  { category: "Chicken Sandwich", name: "Chicken Fajita", price: 95 },
  { category: "Chicken Sandwich", name: "Shish Tawook Sandwich", price: 90 },
  { category: "Chicken Sandwich", name: "Tashken Zinger", price: 115 },
  { category: "Chicken Sandwich", name: "Cordon Bleu Sandwich", price: 120 },
  { category: "Chicken Sandwich", name: "Chicken Roll", price: 115 },

  { category: "Beef Sandwich", name: "Grilled Kofta", price: 100 },
  { category: "Beef Sandwich", name: "Grilled Sausage", price: 80 },

  // ───────── DRINKS ─────────
  { category: "Drinks", name: "Water", price: 15 },
  { category: "Drinks", name: "Soda", price: 20 },
  { category: "Drinks", name: "1 Liter Soda", price: 35 },
  { category: "Drinks", name: "Sun Top", price: 20 },

  // ───────── SIDES ─────────
  { category: "Sides", name: "French Fries", price: 35 },
  { category: "Sides", name: "Friskies Fries", price: 45 },
  { category: "Sides", name: "Onion Rings", price: 40 },
  { category: "Sides", name: "Mozzarella Sticks", price: 50 },
  { category: "Sides", name: "Zinger Cup", price: 70 },
  { category: "Sides", name: "Chicken Risotto", price: 70 },
  { category: "Sides", name: "Mac & Cheese", price: 55 },
  { category: "Sides", name: "Jalapeno Cheese Fries", price: 60 },
  { category: "Sides", name: "Rice Dish", price: 40 },
  { category: "Sides", name: "Sweet Corn", price: 35 },

  // ───────── SAUCES ─────────
  { category: "Sauces", name: "BBQ Sauce", price: 15 },
  { category: "Sauces", name: "Mayonnaise", price: 10 },
  { category: "Sauces", name: "Friskies Sauce", price: 15 },
  { category: "Sauces", name: "Cheddar Jar", price: 75 },
  { category: "Sauces", name: "Ranch", price: 15 },
  { category: "Sauces", name: "Buffalo", price: 10 },
  { category: "Sauces", name: "Tahini", price: 10 },
  { category: "Sauces", name: "Garlic", price: 10 },

];
export const uploadMenu = async () => {
  try {
    for (let item of menu) {
      await addDoc(collection(db, "menu"), item);
    }
    console.log("🔥 FULL MENU UPLOADED");
  } catch (err) {
    console.error(err);
  }
};