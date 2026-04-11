import { doc, getDoc } from "firebase/firestore"; // ⚠️ لاحظ إننا غيرنا collection و getDocs
import { db } from "./firebase.js";
import localMenu from "../data/menu.json";

const CACHE_KEY = "cached_menu_data_v2";
const CACHE_TIME_KEY = "cached_menu_time_v2";

/** Clears client menu cache so the next customer menu load refetches Firestore (e.g. after admin stock change). */
export function invalidateMenuV2Cache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
  } catch {
    /* ignore */
  }
}

export async function fetchMenuData() {
  const EXPIRATION_HOURS = 12; // الكاش هيتجدد كل 12 ساعة

  try {
    // ==========================================
    // 1. محاولة جلب الداتا من الكاش أولاً (0 Reads)
    // ==========================================
    const lastCache = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

    if (lastCache && cacheTime) {
      // بنحسب هل عدى 12 ساعة ولا لأ
      const isExpired = (Date.now() - parseInt(cacheTime)) > (EXPIRATION_HOURS * 60 * 60 * 1000);
      
      if (!isExpired) {
        console.log("0 Reads");
        return JSON.parse(lastCache);
      }
    }

    // ==========================================
    // 2. جلب الداتا من فيربيز الهيكل الجديد (1 Read)
    // ==========================================
    console.log("🔍 جاري جلب المنيو من كوليكشن 'menu_v2'...");
    
    // بنشاور على الدوكيومنت الواحد اللي اسمه active_menu
    const docRef = doc(db, "menu_v2", "active_menu");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Document 'active_menu' not found in 'menu_v2'");
    }

    // بنسحب مصفوفة الأصناف من جوه الدوكيومنت
    const firebaseData = docSnap.data().items || [];

    console.log(`✅ تم جلب ${firebaseData.length} صنف من فيربيز بنجاح.`);

    // ==========================================
    // 3. تحديث الكاش بالداتا الجديدة والوقت الحالي
    // ==========================================
    localStorage.setItem(CACHE_KEY, JSON.stringify(firebaseData));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    
    return firebaseData;

  } catch (error) {
    // ==========================================
    // 🚨 خطة الطوارئ لو النت فصل أو الكوتا خلصت
    // ==========================================
    console.warn("⚠️ فشل جلب البيانات من فيربيز، جاري استخدام البدائل...");
    console.error("السبب:", error.message);

    // أولاً: جرب لو فيه حاجة متسيفة في الكاش حتى لو قديمة
    const lastCache = localStorage.getItem(CACHE_KEY);
    if (lastCache) {
      console.log("📦 تم التحميل من الكاش المحلي كبديل طوارئ.");
      try {
  return JSON.parse(lastCache);
} catch {
  localStorage.removeItem(CACHE_KEY);
}   
    }

    // ثانياً: لو مفيش كاش خالص، هات من ملف الـ JSON المحلي
    console.log("📂 تم التحميل من ملف menu.json المحلي.");
    // يرجى التأكد إن هيكل localMenu.menu متوافق مع الداتا
    return localMenu.menu || []; 
  }
}