import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase.js";
import localMenu from "../data/menu.json";

export async function fetchMenuData() {
  try {
    console.log("🔍 جاري محاولة جلب المنيو من كوليكشن 'menu'...");

  
    const menuCollectionRef = collection(db, "menu");
    const querySnapshot = await getDocs(menuCollectionRef);

  
    if (querySnapshot.empty) {
      throw new Error("Collection 'menu' is empty or not found");
    }

    // 2. تحويل الدوكيومنتس لمصفوفة (Array) أصناف
    const firebaseData = querySnapshot.docs.map(doc => ({
      docId: doc.id,
      ...doc.data()
    }));

    console.log(`✅ تم جلب ${firebaseData.length} صنف من فيربيز بنجاح.`);

    // حفظ النسخة دي في الكاش عشان لو النت فصل المرة الجاية
    localStorage.setItem("cached_menu_data", JSON.stringify(firebaseData));
    
    return firebaseData;

  } catch (error) {
    // -------------------------------------------------------
    // 🚨 تفعيل خطة الطوارئ لو الكوتا خلصت أو مفيش نت
    // -------------------------------------------------------
    console.warn("⚠️ فشل جلب البيانات من فيربيز، جاري استخدام البدائل...");
    console.error("السبب:", error.message);

    // أولاً: جرب لو فيه حاجة متسيفة في الكاش من المرة اللي فاتت
    const lastCache = localStorage.getItem("cached_menu_data");
    if (lastCache) {
      console.log("📦 تم التحميل من الكاش المحلي.");
      return JSON.parse(lastCache);
    }

    // ثانياً: لو مفيش كاش، هات من ملف الـ JSON اللي في الكود
    console.log("📂 تم التحميل من ملف menu.json المحلي.");
    return localMenu.menu || [];
  }
}