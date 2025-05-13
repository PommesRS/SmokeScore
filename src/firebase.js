import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_authDomain,
  projectId: import.meta.env.VITE_FIREBASE_projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_appId,
  measurementId: import.meta.env.VITE_FIREBASE_measurementId
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export const generateToken = async () => {
  const permission = await Notification.requestPermission();
  console.log(permission)
  if (permission === 'granted') {
    console.log(await getToken(messaging, {xapiKey: 'BP5WjUBgUmAI5Ec80vu-1BoaoUzooBFr0IIseivX6DYKdtE1b77hw3-WSAQ9NRP3KD1hG8N8pJ6H2JMfWoO8hKI'}))
  }
}

export default app;