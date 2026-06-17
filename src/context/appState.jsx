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
import { doc, setDoc, query, collection, getDoc } from "@firebase/firestore";
import { useAppTheme } from '../components/ThemeProviderCustom'


const appStateContext = createContext();

export function AppStateContextProvider({ children }) {
    const { setThemeName, themeName } = useAppTheme()
    const [counterVariant, setCounterVariant] = useState(null)
    const [prevTheme, setPrevTheme] = useState(null)

    useEffect(() => {
        setCounterVariant(1)
        setPrevTheme(themeName)
    }, []);

    useEffect(() => {
        console.log(themeName) 
    }, [themeName])

    function setCounterVariantJoint() {
        setPrevTheme(themeName)
        setCounterVariant(2)
        setThemeName('green', true)
    }
    function setCounterVariantCig() {
        setThemeName(prevTheme)
        setCounterVariant(1)
    }

    return (
        <appStateContext.Provider value={{ counterVariant, setCounterVariantCig, setCounterVariantJoint }}>
            {children}
        </appStateContext.Provider>
    );
}

export function useAppState() {
  return useContext(appStateContext);
}