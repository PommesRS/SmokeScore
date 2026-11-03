import { createContext, useContext, useEffect, useState } from "react";
import { useFlashMessage } from "./flashMessage";
import { Button } from "@mui/material";
import { auth } from "../firebase";
import { db } from "../firebase";
import { quests } from "../components/Badge/questsDetails";
import { doc, setDoc, query, collection, getDoc, onSnapshot, runTransaction } from "@firebase/firestore";
import { useAppTheme } from '../components/Settings/ThemeProviderCustom'
import { useUserAuth } from "./userAuthConfig";
import { buffer, bbox } from '@turf/turf';
import { useUserCollectables } from "./userCollectables";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const userQuestsContext = createContext();

export function UserQuestsContextProvider({ children }) {
    const [completedQuest, setCompletedQuests] = useState(null)
    const [openQuests, setOpenQuests] = useState(null)
    const [loading, setLoading] = useState(true)
    const { user } = useUserAuth();
    const { showFlashMessage } = useFlashMessage()
    const navigate = useNavigate()
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
                    "https://api.sunrisesunset.io/json?lat=52&lng=13&elevation=0&time_format=24"
                );
                const date = new Date(1791732600)
                const start = new Date(date);
                const end = new Date(date);

                const data = await response.json();
                const [hours, minutes, seconds] = data.results.golden_hour.split(":").map(Number);
                start.setHours(hours - 0, minutes, seconds || 0, 0);
                end.setHours(hours + 2, minutes, seconds || 0, 0);
                if (!(date >= start && date <= end)) return
            }

            const questProgressRef = doc(db, 'Users', user.uid, 'QuestProgress', quest.id)
            await runTransaction(db, async (transaction) => {
                const progressSnap = await transaction.get(questProgressRef);
                const progressData = progressSnap.exists() ? progressSnap.data() : {};

                if (progressData.completed) return

                let progress = progressData.progress ?? 0;
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

    function checkForCoopQuests(cig) {
        const questsToCheck = openQuests.filter((quest) => quest.category === 'coop')
        if (questsToCheck.length < 1) return

        questsToCheck.map((quest) => {
            if(completedQuest.includes(quest.id)) return

            runTransaction(db, async (transaction) => {
                const questProgressRef = doc(db, 'Users', user.uid, 'QuestProgress', quest.id)
                const questProgressSnap = (await transaction.get(questProgressRef))
                console.log(questProgressSnap.exists())
                if (!questProgressSnap) return
                const progressData = questProgressSnap.data()

                let progress = progressData.progress ?? 0;
                progress += 1
                const completed = progress >= quest.target;

                transaction.set(
                    questProgressRef,
                    {
                        progress: Math.min(progress, quest.target),
                        completed,
                        updatedAt: new Date(),
                    },{ merge: true }
                );

                const friendQuestProgressRef = doc(db, 'Users', progressData.partner, 'QuestProgress', quest.id)
                transaction.set(
                    friendQuestProgressRef,
                    {
                        progress: Math.min(progress, quest.target),
                        completed,
                        updatedAt: new Date(),
                    },{ merge: true }
                );

                if (completed) {
                    let rewardAmount = quest.reward.smokeDollars
                    collectables.increaseAmount(rewardAmount)
                    showFlashMessage(
                        'Du hast eine Quest abgeschlossen!', 
                        'success',
                        <Button variant='contained' sx={{':focus': {outline: 'none'}}} onClick={() => {navigate('/quests')}}>ansehen</Button>
                    )
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
                //console.log(quest.id, ' -> ', false)
            }

        })
    }

    function checkForStreakQuests (streak) {
        const questsToCheck = openQuests.filter((quest) => quest.type === "STREAK")
        if (questsToCheck.length < 1) return

        var rewardAmount = 0

        questsToCheck.map(async (quest, index) => {
            if(completedQuest.includes(quest.id)) return
            console.log(completedQuest)
            const questProgressRef = doc(db, 'Users', user.uid, 'QuestProgress', quest.id)
            await runTransaction(db, async (transaction) => {
                const progressSnap = await transaction.get(questProgressRef);
                const progressData = progressSnap.exists() ? progressSnap.data() : {};

                if (progressData.completed) return

                let progress = streak;
                console.log(quest.id, '->', progress)
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
                    rewardAmount = quest.reward.smokeDollars
                    collectables.increaseAmount(rewardAmount)
                    showFlashMessage(
                        'Du hast eine Quest abgeschlossen!', 
                        'success',
                        <Button variant='contained' sx={{':focus': {outline: 'none'}}} onClick={() => {navigate('/quests')}}>ansehen</Button>
                    )
                }
                    
            })
        })
        

    }

    return (
        <userQuestsContext.Provider value={{ checkForPlaceQuests, checkForSocialQuests, checkForSmokementQuests, checkForStreakQuests, checkForCoopQuests, completedQuest, loading }}>
            {children}
        </userQuestsContext.Provider>
    );
}

export function useUserQuests() {
  return useContext(userQuestsContext);
}