import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, setDoc, query, collection, getDoc, onSnapshot } from "@firebase/firestore";
import { useAppTheme } from '../components/Settings/ThemeProviderCustom'
import { useUserAuth } from "./userAuthConfig";
import { useUserData } from "./userData";

const userCollectables = createContext();

export function UserCollectablesContextProvider({ children }) {
    const [amount, setAmount] = useState(null)
    const { userData } = useUserData();
    const { user } = useUserAuth()

    useEffect(() => {
        if(!userData) return;

        if (typeof userData.collectables !== 'undefined') {
            setAmount(userData.collectables)
        }else {
            setAmount(0)
        }

    }, [userData]);

    const increaseAmount = async (amountToIncrease) => {
        if (amount !== null) {
            const docRef = doc(db, 'Users', user.uid)
            await setDoc(docRef, {
                collectables: amount + amountToIncrease
            }, {merge: true})
        }
    }

    const decreaseAmount = async (amountToDecrease) => {
        return new Promise(async (resolve, reject) => {
            if (amount !== null && amount >= amountToDecrease) {
                const docRef = doc(db, 'Users', user.uid)

                await setDoc(docRef, {
                    collectables: amount - amountToDecrease
                }, {merge: true})
                resolve(true)
            }else {
                reject('amount is null or amount is greater than balance')
            }
        })
    }


    return (
        <userCollectables.Provider value={{ amount, increaseAmount, decreaseAmount }}>
            {children}
        </userCollectables.Provider>
    );
}

export function useUserCollectables() {
  return useContext(userCollectables);
}