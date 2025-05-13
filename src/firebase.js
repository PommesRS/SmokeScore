import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging"

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
export const messaging = getMessaging(app);
export const generateToken = async () => {
  const permission = await Notification.requestPermission();
  console.log(permission)
  if (permission === 'granted') {
    console.log(await getToken(messaging, {xapiKey: 'BP5WjUBgUmAI5Ec80vu-1BoaoUzooBFr0IIseivX6DYKdtE1b77hw3-WSAQ9NRP3KD1hG8N8pJ6H2JMfWoO8hKI'}))
  
  }
}

export default app;