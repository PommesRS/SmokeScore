import React, { useEffect, useState } from 'react'
import { SwipeableDrawer, useTheme, Box, Stack, Typography, Button } from '@mui/material'
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { useUserData } from '../../context/userData';
import { runTransaction, doc, collection, query, where, addDoc, setDoc, serverTimestamp, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUserAuth } from '../../context/userAuthConfig';

export const Puller = styled('div')(({ theme }) => ({
    width: 50,
    height: 6,
    backgroundColor: grey[500],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 25px)'
}));

const QuestModal = ({onClose, open, quest, desc}) => {
    const theme = useTheme()
    const [friendInvite, setFriendInvite] = useState(false)
    const [loading, setLoading] = useState(false)
    const [friends, setFriends] = useState(false)
    const { userData } = useUserData()
    const { user } = useUserAuth()

    useEffect(() => {
        const friendId = userData.Friends

        runTransaction(db, async (transaction) => {
            const friendsFull = []
            friendId.map(async (friend) => {
                const userRef = doc(db, 'Users', friend)
                const friendName = await (await transaction.get(userRef)).data().displayName
                friendsFull.push({name: friendName, id: friend})  
            })
            setFriends(friendsFull)
        })

        
    }, [])

    const handleInviteToCoopQuest = async (friendId) => {
        const q = query(collection(db, "Chats"),
            where("participants", "array-contains", doc(db, "Users", friendId)),
        );

        const chatsSnap = await getDocs(q)
        var chatId
        if(!chatsSnap.empty){
            chatId = chatsSnap.docs.find(doc =>
                doc.data().participants.some(ref => ref.id === user.uid)
            )?.id
            if (typeof chatId === 'undefined'){
                const docRef = doc(collection(db, 'Chats'))
                chatId = docRef.id
                await setDoc(doc(db, 'Chats', chatId), {
                    newMsg: true,
                    participants: [doc(db, 'Users', friendId), doc(db, 'Users', user.uid)]
                })
            }
        }else {
            const docRef = doc(collection(db, 'Chats'))
            chatId = docRef.id
            await setDoc(doc(db, 'Chats', chatId), {
                newMsg: true,
                participants: [doc(db, 'Users', friendId), doc(db, 'Users', user.uid)]
            })
        }

        setLoading(true)

        const messagesRef = collection(db, "Chats", chatId, "Messages");
        const chatRef = doc(db, 'Chats', chatId)
        await addDoc(messagesRef, {
            text: quest.title,
            time: serverTimestamp(),
            senderID: user.uid,
            seen: false,
            coop: {questId: quest.id, status: 'pending'}
        });
        
        await setDoc(chatRef, {
            newMsg: true
        }, {merge: true})
        
        const receiverRef = doc(db, 'Users', friendId)
        const receiverToken = (await getDoc(receiverRef)).data().fcmToken

        fetch('https://sendpushtotoken-wcqbnpknwa-uc.a.run.app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: await receiverToken,
                title: 'Nachricht von ' + user.displayName,
                body: 'penis',
                msgType: 'notification',
                eventDate: '-', 
                senderName: '-',
            }),
        })
        .then(res => res.json())
        .then((res) => {console.log(res)})
        .catch(console.error);
        
        setLoading(false)
        setFriendInvite(false), onClose()
    }

  return (
    <SwipeableDrawer 
        open={open} 
        anchor='bottom' 
        onClose={onClose} 
        keepMounted
        slotProps={{
            paper: {
                sx: {
                    background: 'transparent'
                }
            }
        }}
        sx={{background: 'transparent'}}>
        {friendInvite ? (
            <Box px={2} pb={2} overflow={'auto'} borderRadius={'20px 20px 0 0'} bgcolor={theme.palette.background.paper}>
                <Puller />
                <Stack pt={4} gap={2} height={'100%'} maxWidth={'100%'}>
                    {friends.map((friend) => (
                        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} gap={2}>
                            <Typography overflow={'hidden'} textOverflow={'ellipsis'} whiteSpace={'nowrap'}>{friend.name}</Typography>
                            <Button variant='contained' sx={{px: 4, ':focus': {outline: 'none'}}} onClick={() => {handleInviteToCoopQuest(friend.id)}}>einladen</Button>
                        </Stack>
                    ))}
                </Stack>
            </Box>
        ) : (
            <Box px={2} pb={2} overflow={'auto'} borderRadius={'20px 20px 0 0'} bgcolor={theme.palette.background.paper}>
                <Puller />
                <Stack pt={4} gap={2} height={'100%'} >
                    <Typography fontSize={20}>{quest.title}</Typography>
                    <Typography fontSize={16} color={grey[500]}>{desc}</Typography>
                    {quest.category === 'coop' && (
                        <Button variant='contained' sx={{':focus': {outline: 'none'}}} onClick={() => {setFriendInvite(true)}}>Freund Einladen</Button>
                    )}
                    <Typography fontSize={16}>Belohnung: {quest.reward.smokeDollars} SmokeDollar</Typography>
                </Stack>
            </Box>
        )
        }
    </SwipeableDrawer>
  )
}

export default QuestModal