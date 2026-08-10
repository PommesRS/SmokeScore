import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, setDoc, query, collection, getDoc, onSnapshot, where, getDocs } from "@firebase/firestore";
import { useUserAuth } from "./userAuthConfig";


const friendChatContext = createContext();

export function FriendChatContextProvider({ children }) {
    const [newMessages, setNewMessages] = useState([])
    const [participants, setParticipants] = useState([])
    const { user } = useUserAuth()

    useEffect(() => {
        if(!user) return;

        const userRef = doc(db, 'Users', user.uid)
        const ref = collection(db, 'Chats')

        
        const unsubscribe = onSnapshot(ref, async (snapshot) => {
                const q = query(
                    ref,
                    where("participants", "array-contains", userRef)
                );

                const snapshotP = await getDocs(q);

                snapshotP.forEach(async (chat) => {
                    const ref = collection(db, 'Chats', chat.id, 'Messages')
                    const q = query(
                        ref,
                        where("seen", "==", false),
                        where('senderID', '!=', user.uid)
                    );

                    const docs = await getDocs(q)
                    

                    var numOfNew
                    if(!docs.empty) {
                        numOfNew = {
                            id: chat.data().participants.filter(ref =>  ref.id !== user.uid).map(ref => ref.id)[0], 
                            amount: docs.docs.length
                        }

                        if(typeof newMessages === 'undefined'){
                            setNewMessages([numOfNew])
                        }else {
                            setNewMessages(prev => [...prev, numOfNew])
                        }
                    }

                    const participantIDs = chat.data().participants
                        .filter(ref => ref.id !== user.uid)
                        .map(ref => ref.id);

                    setParticipants(prev => [...prev, ...participantIDs])
                });
                console.log(participants)
        });

        return () => unsubscribe(); 
    }, [user]);

    const setMessages = (isNewMessage) => {
        setNewMessages([])
        setNewMessages(isNewMessage)
    }


    return (
        <friendChatContext.Provider value={{ newMessages, setMessages, participants }}>
            {children}
        </friendChatContext.Provider>
    );
}

export function useFriendChat() {
  return useContext(friendChatContext);
}