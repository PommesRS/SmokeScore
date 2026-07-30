import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, setDoc, query, collection, getDoc } from "@firebase/firestore";

const notificationContext = createContext();

export function NotificationContextProvider({children}) {

    async function sendNotification(user, isJoint) {
        console.log(user.displayName)
        const friendsRef = doc(db, "Users", user.uid)
        const friendIDArr = (await getDoc(friendsRef)).data().Friends
        friendIDArr.map(async (friendId) => {
        const FriendFCMRef = doc(db, 'Users', friendId)
        const friendCanNotifications = (await getDoc(FriendFCMRef)).data().canGetNotifications
        if(friendCanNotifications != false){
            const Token = (await getDoc(FriendFCMRef)).data().fcmToken
            fetch('https://sendpushtotoken-wcqbnpknwa-uc.a.run.app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: Token,
                title: isJoint ? 'Neuer Joint 🍁' : 'Neue Kippe 🚬',
                body: isJoint ? user.displayName + ' hat soeben einen Joint eingetragen.' : user.displayName + ' hat soeben eine neue Kippe eingetragen. Ziehe schnell nach!',
                msgType: 'notification',
                eventDate: '-', 
                senderName: '-'
            }),
            })
            .then(res => res.json())
            .catch(console.error);
        }
        })
    }

    return (
        <notificationContext.Provider value={{ sendNotification }}>
            {children}
        </notificationContext.Provider>
    );
}

export function useNotification() {
  return useContext(notificationContext);
}