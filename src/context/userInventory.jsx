import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, setDoc, query, collection, getDoc, onSnapshot, updateDoc } from "@firebase/firestore";
import { useAppTheme } from '../components/Settings/ThemeProviderCustom'
import { useUserAuth } from "./userAuthConfig";
import { useUserData } from "./userData";

const userInventory = createContext();

export function UserInventoryContextProvider({ children }) {
    const [inventory, setInventory] = useState(null)
    const { userData } = useUserData()
    const { user } = useUserAuth();

    useEffect(() => {
        if(!user) return;
        console.log(userData)

        const ref = collection(db, 'Users', user.uid, 'Inventory')
        
        const unsubscribe = onSnapshot(ref, (snapshot) => {
                const data = snapshot.docs
                if (snapshot.empty) {
                    setInventory(null)
                } else {
                    setInventory(data)
                }
        });

        return () => unsubscribe(); 
    }, [user]);

    const getItems = () => {
        return inventory
    }

    const getItemById = (id) => {
        if(!inventory) return
        return inventory.find(el => el.id === id)
    }

    const addItem = async (id, amount) => {
        const docRef = doc(db, 'Users', user.uid, 'Inventory',id)

        await setDoc(docRef, {
            amount: amount
        })
    }

    const addItemV2 = async (id) => {
        const docRef = doc(db, 'Users', user.uid, 'Inventory', id)
        const newAmount = inventory?.find(el => el.id === id)?.data().amount + 1 || 1

        await setDoc(docRef, {
            amount: newAmount
        }, {merge: true})
    }

    const equipItem = async (id, slot) => {
        const docRef = doc(db, 'Users', user.uid)
        return new Promise(async(resolve) => {
            if(typeof userData.equipSlots === 'undefined') {
                const newSlots = {}
                newSlots[slot] = id
    
                await setDoc(docRef, {
                    equipSlots: newSlots
                }, {merge: true})

                resolve({text: 'Item erfolgreich Ausgerüstet', severity: 'success'})
            }else {
                if(userData.equipSlots[slot] === id) {
                    resolve({text: 'Item bereits ausgerüstet', severity: 'warning'})
                    return
                }

                const newSlots = userData.equipSlots
                newSlots[slot] = id

                await setDoc(docRef, {
                    equipSlots: newSlots
                }, {merge: true})

                resolve({text: 'Item erfolgreich ausgerüstet', severity: 'success'})
            }
        })
    }

    const unequipItem = async (id, slot) => {
        const docRef = doc(db, 'Users', user.uid)

        return new Promise(async (resolve) => {
            if(userData.equipSlots[slot] === id) {

                const newSlots = userData.equipSlots
                delete newSlots[slot]
                console.log(newSlots)
    
                await updateDoc(docRef, {
                    equipSlots: newSlots
                })

                resolve({text: 'Item erfolgreich abgelegt', severity: 'success'})
            }
        })
    }


    return (
        <userInventory.Provider value={{ getItems, getItemById, addItem, addItemV2, inventory, equipItem, unequipItem }}>
            {children}
        </userInventory.Provider>
    );
}

export function useUserInventory() {
  return useContext(userInventory);
}