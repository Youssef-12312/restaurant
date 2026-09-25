import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase.js";

const createOrder = httpsCallable(functions, "createOrder");

export async function createTrustedOrder(order) {
  const result = await createOrder(order);
  return result.data;
}