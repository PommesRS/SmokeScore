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
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc, increment, getDocs, query, onSnapshot, arrayUnion, GeoPoint, Timestamp, runTransaction } from "@firebase/firestore";
import { useAppTheme } from '../components/ThemeProviderCustom'
import { useUserAuth } from "./userAuthConfig";
import { useUserData } from "./userData";
import dayjs from 'dayjs';

const userStreakContext = createContext();

export function UserStreakContextProvider({ children }) {
    const [streak, setStreak] = useState(null)
    const { userData } = useUserData();
    const { user } = useUserAuth();

    async function calculateStreak() {
        const docRef = doc(db, "Users", user.uid)

        if (userData.streak) {
            const today = dayjs();
            const yesterday = today.subtract(1, "day");
            const date = dayjs(userData.streak.lastIncrement.toDate())


            if (date.isSame(yesterday, 'day')) {
                await updateDoc(docRef, {
                    "streak.amount": increment(1),
                    "streak.lastIncrement": Timestamp.now()
                })
                return true
            }else if(date.isSame(today, 'day')) {
                return false
            } else{
                await updateDoc(docRef, {
                    streak: {
                        amount: 1,
                        lastIncrement: Timestamp.now()
                    }
                })
                return true
            }
    
        }else{
            await updateDoc(docRef, {
            streak: {
                amount: 1,
                lastIncrement: Timestamp.now()
            }
            })
            return true
        }
    }

    const checkIfStreakIsExpired = async () => {
        const docRef = doc(db, "Users", user.uid)
        
        const locDate = streak.lastIncrement.toDate()
        const lastIncrement = dayjs(locDate)

        const today = dayjs();
        const preYesterday = today.subtract(2, "day");
        console.log(lastIncrement.isBefore(preYesterday, 'day'))
        if (lastIncrement.isBefore(preYesterday, 'day')) {
            await updateDoc(docRef, {
                streak: {
                    amount: 0,
                    lastIncrement: Timestamp.now()
                }
            })
        }
    }

    useEffect(() => {
        if (!user) return;
        const ref = doc(db, 'Users', user.uid)

        const unsubscribe = onSnapshot(ref, async (snapshot) => {
        if (snapshot.exists()) {
            const streak = snapshot.data().streak
            setStreak(streak)
        }
        });

        return () => {
            unsubscribe();
        };

    }, [user]);

    useEffect(() => {
        if(!streak) return
        checkIfStreakIsExpired()
    }, [streak])


    return (
        <userStreakContext.Provider value={{ calculateStreak, streak }}>
            {children}
        </userStreakContext.Provider>
    );
}

export function useStreak() {
  return useContext(userStreakContext);
}