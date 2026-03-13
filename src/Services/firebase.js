import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAC9Zuw9ahjkQjWqBqMHM6Atn2KueExjII",
  authDomain: "resturant-test-2553a.firebaseapp.com",
  projectId: "resturant-test-2553a",
  storageBucket: "resturant-test-2553a.firebasestorage.app",
  messagingSenderId: "197189644385",
  appId: "1:197189644385:web:be00dd2cc25328fb5cba20"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); 