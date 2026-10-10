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
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc, increment, getDocs, query, onSnapshot, arrayUnion, GeoPoint, Timestamp, runTransaction, deleteField } from "@firebase/firestore";
import { useAppTheme } from '../components/Settings/ThemeProviderCustom'
import { useUserAuth } from "./userAuthConfig";
import { useUserData } from "./userData";
import dayjs from 'dayjs';
import { useUserInventory } from "./userInventory";
import { useFlashMessage } from "./flashMessage";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const userStreakContext = createContext();

export function UserStreakContextProvider({ children }) {
    const [streak, setStreak] = useState(null)
    const [pet, setPet] = useState(false)
    const [petStats, setPetStats] = useState()
    const { userData } = useUserData();
    const { user } = useUserAuth();
    const inventory = useUserInventory()
    const {showFlashMessage} = useFlashMessage()
    const navigate = useNavigate()

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
        const preYesterday = today.subtract(1, "day");
        const prepreYesterday = today.subtract(2, "day")

        if (lastIncrement.isBefore(preYesterday, 'day')) {
            const freezeStreakAmount = inventory.getItems().find((item) => item.id === 'freezeStreak')
            if(typeof freezeStreakAmount !== 'undefined' && freezeStreakAmount.data().amount > 0) {
                await updateDoc(docRef, {
                    streak: {
                        amount: streak.amount,
                        lastIncrement: Timestamp.now()
                    }
                })
                inventory.addItem('freezeStreak', freezeStreakAmount.data().amount - 1)
            }else {
                await updateDoc(docRef, {
                    streak: {
                        amount: 0,
                        lastIncrement: Timestamp.now()
                    }
                })
            }

            if(lastIncrement.isBefore(prepreYesterday, 'day')){
                await updateDoc(docRef, {
                    pet: deleteField()
                })
            }
        }
    }

    const increasePetXP = async (amount) => {
        if(!pet) return
        const increaseFormula = Math.floor(50 * Math.pow(userData.pet.level + 1, 1.2))

        const newXP = petStats.xpPoints + amount
        const newLevel = newXP >= increaseFormula ? petStats.level + 1 : petStats.level
        if(newXP >= increaseFormula ) {
            updatePetBasedOnLevelIncrease(newLevel)
        }

        const docRef = doc(db, 'Users', user.uid)

        await setDoc(docRef, {
            pet: {
                xpPoints: newXP,
                level: newLevel
            }
        }, {merge: true})
    }

    const updatePetBasedOnLevelIncrease = async (lvl) => {
        const docRef = doc(db, 'Users', user.uid)
        showFlashMessage(
          `${petStats.name} hat ein neues Level erreicht!`, 
          'success',
          <Button variant='contained' sx={{':focus': {outline: 'none'}}} onClick={() => {navigate('/pet')}}>ansehen</Button>
        )

        if (lvl === 1) {
            await setDoc(docRef, {
                pet: {
                    bluePrint: {
                        base: 'basePet1',
                        mouth: 'mouth_cheekSmile',
                        eyes: 'eyes_baby'
                    }
                }
            }, {merge: true})
        } else if (lvl === 2) {
            await setDoc(docRef, {
                pet: {
                    bluePrint: {
                        base: 'basePet2',
                        eyes: 'eyes_baby'
                    }
                }
            }, {merge: true})
        } else if (lvl === 3) {
            await setDoc(docRef, {
                pet: {
                    bluePrint: {
                        base: 'basePet3',
                    }
                }
            }, {merge: true})
        }
    }

    useEffect(() => {
        if (!user) return;
        const ref = doc(db, 'Users', user.uid)

        const unsubscribe = onSnapshot(ref, async (snapshot) => {
        if (snapshot.exists()) {
            const streak = snapshot.data().streak
            const pet = snapshot.data().pet
            const isPetActive = typeof pet !== 'undefined' ? true : false
            setStreak(streak)
            setPetStats(pet)
            setPet(isPetActive)
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
        <userStreakContext.Provider value={{ calculateStreak, streak, pet, increasePetXP }}>
            {children}
        </userStreakContext.Provider>
    );
}

export function useStreak() {
  return useContext(userStreakContext);
}