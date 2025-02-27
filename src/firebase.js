import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBzExQHOQ6dd31JWwaxOzvS99jLPIk0EIE",
  authDomain: "smokescore-a4408.firebaseapp.com",
  projectId: "smokescore-a4408",
  storageBucket: "smokescore-a4408.firebasestorage.app",
  messagingSenderId: "116690554206",
  appId: "1:116690554206:web:97bd984eb092511bb693cf",
  measurementId: "G-8P4RM0RN6N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;