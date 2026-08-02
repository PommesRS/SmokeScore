import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signInWithRedirect
} from "firebase/auth";
import { auth } from "../firebase";
import { db } from "../firebase";
import { doc, setDoc, query, collection, getDoc, onSnapshot } from "@firebase/firestore";
import { useAppTheme } from '../components/Settings/ThemeProviderCustom'
import { useUserAuth } from "./userAuthConfig";


const userDataContext = createContext();

export function UserDataContextProvider({ children }) {
    const [userData, setUserData] = useState(null)
    const { user } = useUserAuth();

    useEffect(() => {
        if(!user) return;

        const ref = doc(db, 'Users', user.uid)
        
        const unsubscribe = onSnapshot(ref, async (snapshot) => {
            if (snapshot.exists()) {
            const data = snapshot.data()
            setUserData(data)
            }
        });

        return () => unsubscribe(); 
    }, [user]);


    return (
        <userDataContext.Provider value={{ userData }}>
            {children}
        </userDataContext.Provider>
    );
}

export function useUserData() {
  return useContext(userDataContext);
}