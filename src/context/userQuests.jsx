import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { db } from "../firebase";
import { quests } from "../components/Badge/questsDetails";
import { doc, setDoc, query, collection, getDoc, onSnapshot, runTransaction } from "@firebase/firestore";
import { useAppTheme } from '../components/Settings/ThemeProviderCustom'
import { useUserAuth } from "./userAuthConfig";
import { buffer, bbox } from '@turf/turf';
import { useUserCollectables } from "./userCollectables";
import dayjs from "dayjs";

const userQuestsContext = createContext();

export function UserQuestsContextProvider({ children }) {
    const [completedQuest, setCompletedQuests] = useState(null)
    const [openQuests, setOpenQuests] = useState(null)
    const [loading, setLoading] = useState(true)
    const { user } = useUserAuth();
    const collectables = useUserCollectables()

    useEffect(() => {
        if(!user) return;

        const q = query(collection(db, 'Users', user.uid, 'QuestProgress'))
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            setLoading(true)
            const completedQuestsTemp = []
            snapshot.forEach((doc) => {
                if(doc.data().completed){
                    completedQuestsTemp.push(doc.id)
                }
            })
            const result = quests.filter((quest) => typeof completedQuestsTemp.find((el) => el === quest.id) === 'undefined')
            setCompletedQuests(completedQuestsTemp)
            setOpenQuests(result)
            setLoading(false)
        });

        return () => unsubscribe(); 
    }, [user]);

    async function checkForSocialQuests (uid, eventType, data = {}) {
        const questsToCheck = openQuests.filter((quest) => quest.type === eventType)
        if (questsToCheck.length < 1) return

        await Promise.all(
            questsToCheck.map(async (quest) => {
                if(completedQuest.includes(quest.id)) return

                const questProgressRef = doc(db, 'Users', user.uid, 'QuestProgress', quest.id)
                await runTransaction(db, async (transaction) => {
                    const progressSnap = await transaction.get(questProgressRef);
                    const progressData = progressSnap.exists() ? progressSnap.data() : {};

                    if (progressData.completed) return

                    let progress = progressData.progress ?? 0;
                    let visitedIds = progressData.visitedIds ?? [];
                    console.log(data.objectId)
                    if (quest.unique && data.objectId) {
                        if (visitedIds.includes(data.objectId)) return;

                        visitedIds = [...visitedIds, data.objectId];
                        progress = visitedIds.length;
                    } else {
                        progress += 1;
                    }

                    const completed = progress >= quest.target;

                    transaction.set(
                        questProgressRef,
                        {
                            progress: Math.min(progress, quest.target),
                            visitedIds,
                            completed,
                            updatedAt: new Date(),
                        },{ merge: true }
                    );

                    if (completed) {
                        collectables.increaseAmount(quest.reward.smokeDollars)
                    }
                })
            })
        )
    }

    function checkForSmokementQuests (eventType, data = {}) {
        const questsToCheck = openQuests.filter((quest) => quest.type === eventType)
        console.log(questsToCheck)
        if (questsToCheck.length < 1) return
        
        questsToCheck.map(async (quest) => {
            if(completedQuest.includes(quest.id)) return

            if (quest.id === 'golden_hour_smokeMent') {
                const response = await fetch(
                    "https://api.sunrisesunset.io/json?lat=38.907192&lng=-77.036873&elevation=0&time_format=unix"
                );

                const data = await response.json();
                const start = dayjs(1791673200)
                const end = dayjs(1791676800)
                if ((start > dayjs() > end)) return
            }

            const questProgressRef = doc(db, 'Users', user.uid, 'QuestProgress', quest.id)
            await runTransaction(db, async (transaction) => {

                const progressSnap = await transaction.get(questProgressRef);
                const progressData = progressSnap.exists() ? progressSnap.data() : {};

                if (progressData.completed) return

                let progress = progressData.progress ?? 0;
                console.log(progress)
                if (quest.unique && data.objectId) {

                } else {
                    progress += 1;
                }

                const completed = progress >= quest.target;
                transaction.set(
                    questProgressRef,
                    {
                        progress: Math.min(progress, quest.target),
                        completed,
                        updatedAt: new Date(),
                    },{ merge: true }
                );

                if (completed) {
                    collectables.increaseAmount(quest.reward.smokeDollars)
                }
            })
        })
    }

    function checkForPlaceQuests (cig) {
        var buffer2 = buffer(cig, 300, {units: 'meters'});
        var cigBbox = bbox(buffer2);
        const questsToCheck = openQuests.filter((quest) => quest.category === 'place')
        if (questsToCheck.length < 1) return

        questsToCheck.map((quest) => {
            if (cigBbox[2] > quest.condition.lat && quest.condition.lat > cigBbox[0] && cigBbox[3] > quest.condition.lng && quest.condition.lng > cigBbox[1]) {
              collectables.increaseAmount(quest.reward.smokeDollars)
            }else {
                console.log(quest.id, ' -> ', false)
            }

        })
    }


    return (
        <userQuestsContext.Provider value={{ checkForPlaceQuests, checkForSocialQuests, checkForSmokementQuests, completedQuest, loading }}>
            {children}
        </userQuestsContext.Provider>
    );
}

export function useUserQuests() {
  return useContext(userQuestsContext);
}