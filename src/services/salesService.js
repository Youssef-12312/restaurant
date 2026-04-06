import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "./firebase";
import { normalizeBranchKey } from "./branchSales";

export async function addOrderToSales(order) {
  const date = order.createdAt?.toDate?.() ?? new Date();
  const monthId = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  const ref = doc(db, "sales_summary", monthId);
  const total = Number(order.total ?? 0);
  const branch = normalizeBranchKey(order.branch);

  const update = {
    totalRevenue: increment(total),
    totalOrders: increment(1),
  };


  if (branch) {
    update[`branches.${branch}.revenue`] = increment(total);
    update[`branches.${branch}.orders`] = increment(1);
  }

  await setDoc(ref, update, { merge: true });
}
