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
import { doc, setDoc, query, collection, getDoc, onSnapshot, runTransaction, getDocs, Timestamp } from "@firebase/firestore";
import { useUserAuth } from "./userAuthConfig";
import { useStreak } from "./userStreak";
import * as maptilersdk from '@maptiler/sdk';
import dayjs from 'dayjs';
import { point } from '@turf/turf';

const userBadgesContext = createContext();

export function UserBadgesContextProvider({ children }) {
    const [badgeOpen, setBadgeOpen] = useState(false)
    const [badgeMessage, setBadgeMessage] = useState('Neues Abzeichen Freigeschaltet!')
    const { user } = useUserAuth();
    const streakContext = useStreak()

    const handleBadgeAlertClose = () => {
        setBadgeOpen(false)
    }

    async function updateStats(geolocation, willStreakIncrement) {
        console.log(typeof geolocation[1])
        console.log(geolocation)
        console.trace()
        const o = point([geolocation[0], geolocation[1]])
        await runTransaction(db, async (tx) => {
            const statRef = doc(db, "Users", user.uid, 'Stats', 'main')
            const stats = (await tx.get(statRef)).data()
    
            const height = await maptilersdk.elevation.at([o.geometry.coordinates[1], o.geometry.coordinates[0]])
            const smokeMetaData = await maptilersdk.geocoding.reverse([o.geometry.coordinates[1], o.geometry.coordinates[0]])
    
            //check in which city we are
            var city
            if (smokeMetaData.features.find(el => el.place_type[0] === 'municipality')) {
                city = smokeMetaData.features.find(el => el.place_type[0] === 'municipality').text
            }else if (smokeMetaData.features.find(el => el.place_type[0] === 'county')) {
                city = smokeMetaData.features.find(el => el.place_type[0] === 'county').text
            }else if (smokeMetaData.features.find(el => el.place_type[0] === 'region')) {
                city = smokeMetaData.features.find(el => el.place_type[0] === 'region').text
            }
    
            //check in which country we are
            const country = smokeMetaData.features.filter(el => {return el.place_type[0] === 'country'})[0].text
    
            //check on which height we are
            const isNewHeight = height[2] >= 150
            
            //calc new streak
            const newStreak = willStreakIncrement ? streakContext?.streak.amount + 1 : streakContext?.streak?.amount
            console.log(newStreak)

            //check if city or country is new
            const isNewCity = !stats?.visitedCities?.includes(city)
            const isNewCountry = !stats?.visitedCountries?.includes(country)
            const isNewStreak = newStreak > stats?.streak?.amount
            
            //check if its night 
            const isNightCig = dayjs().format('HH') > 21 || dayjs().format('HH') < 5

            //construct stats or update stats based on existance of stats field
            if (typeof stats === 'undefined') {
                tx.set(statRef, {
                    visitedCities: isNewCity ? [city] : [],
                    visitedCountries: isNewCountry ? [country] : [],
                    nightCigs: isNightCig ? 1 : 0,
                    over150M: isNewHeight ? 1 : 0,
                    streak: {
                        amount: isNewStreak ? streakContext.streak.amount : 0,
                        lastIncrement: Timestamp.now()
                    }
                })
            }else{
                tx.set(statRef, {
                    visitedCities: isNewCity ? [...stats?.visitedCities, city] : stats?.visitedCities,
                    visitedCountries: isNewCountry ? [...stats?.visitedCountries, country] : stats?.visitedCountries,
                    nightCigs: isNightCig ? stats?.nightCigs + 1 : stats?.nightCigs,
                    over150M: typeof stats?.over150M !== 'undefined' ? isNewHeight ? stats?.over150M + 1 : stats?.over150M : isNewHeight ? 1 : 0,
                    streak: {
                        amount: typeof stats?.streak === 'undefined' ? newStreak : isNewStreak ? newStreak : stats?.streak.amount,
                        lastIncrement: Timestamp.now()
                    }
                })
            }
        })


        await runTransaction(db, async (tx) => {
            const docRef = doc(db, "Users", user.uid, 'Stats', 'main')
            const statsNew = (await tx.get(docRef)).data()

            const badgeSnap = await getDocs(collection(db, "Badges"))
            
            badgeSnap.forEach((doc) => {
                const badge = doc.data()
                const criteriaField = badge.criteriaField
                
                let criteriaFieldValue 
                if (criteriaField.includes('.')) {
                    const criteriaFieldPath = criteriaField.split('.')
                    criteriaFieldValue = typeof statsNew[criteriaFieldPath[0]][criteriaFieldPath[1]] === 'number' ? statsNew[criteriaFieldPath[0]][criteriaFieldPath[1]] : statsNew[criteriaFieldPath[0]][criteriaFieldPath[1]].length
                }else{
                    criteriaFieldValue = typeof statsNew[criteriaField] === 'number' ? statsNew[criteriaField] : statsNew[criteriaField].length
                }

                switch (badge.type) {
                    case "LEVEL":
                        var newBadgeLevel = 0
                        var progress = 0

                        for (let i = 0; i <= badge.levels.length; i++) {
                            const level = badge.levels[i];
                            if (criteriaFieldValue >= level) {
                                newBadgeLevel = i + 1
                                progress = (i+1 == badge.levels.length) ? 1 : criteriaFieldValue / badge.levels[i+1]
                            }
                        }  

                        updateBadge(progress, newBadgeLevel, badge)

                        break;
                    
                    case "COUNTER": 
                        updateBadge(null, criteriaFieldValue, badge)
                        break
                
                    default:
                        break;
                }
            })
        })

        async function updateBadge(progress, level, badge) {
            const docRef = doc(db, 'Users', user.uid, 'Badges', badge.id)

            //Wenn progress null ist, dann handelt es sich um ein counter badge bei dem nicht jeder levelaufstieg wichtig ist
            if (!progress) {
                await runTransaction(db, async(tx) => {
                    tx.set(docRef, {
                        level: level,
                        progress: progress,
                        id: badge.id,
                    })
                })
            } else{
                await runTransaction(db, async(tx) => {
                    const badgeLevel = await (await tx.get(docRef)).data().level
    
                    if (typeof badge !== 'undefined') {
                        console.log(badge)
                        if (badgeLevel == 0 && level > 0) {
                            setBadgeOpen(true)
                            setBadgeMessage('Neues Abzeichen Freigeschaltet!')
                            console.log('new badge unlocked: ', badge.id)
                        }
                        else if(badgeLevel < level){
                            setBadgeOpen(true)
                            setBadgeMessage('Neues Abzeichen Level Freigeschaltet!')
                            console.log('new level on badge unlocked: ', badge.id)
    
                        }
                    }
    
                    tx.set(docRef, {
                        level: level,
                        progress: progress,
                        id: badge.id,
                    })
                })
            }
        }
        
    }


    return (
        <userBadgesContext.Provider value={{ updateStats, badgeMessage, badgeOpen, handleBadgeAlertClose }}>
            {children}
        </userBadgesContext.Provider>
    );
}

export function useUserBadges() {
  return useContext(userBadgesContext);
}