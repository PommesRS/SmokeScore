import React, { useEffect, useState } from 'react'
import { 
    Dialog, Stack, Button, AppBar, useTheme, Paper, InputBase, Typography, IconButton, Box } from '@mui/material'
import dayjs from 'dayjs'
import { ArrowBackIosNew, Send } from '@mui/icons-material'
import { grey } from '@mui/material/colors';
import { db, } from '../../../firebase.js';
import { collection, where, getDocs, query, orderBy, doc, getDoc, setDoc, addDoc, updateDoc,onSnapshot, Timestamp, serverTimestamp } from "@firebase/firestore";
import ChatMessages from './ChatMessages.jsx';
import { useUserAuth } from '../../../context/userAuthConfig.jsx';
import { useFriendChat } from '../../../context/friendChat.jsx';

const FriendChat = ({friendIndex, friend, onClose, open, chatID, updateFriend}) => {
    const theme = useTheme()
    const [typedMessage, setTypedMessage] = useState('')
    const [messages, setMessages] = useState(null)
    const { user } = useUserAuth()
    const friendChat = useFriendChat()
    var chatId = chatID

    useEffect(() => {
        if (!open) return;
        if(!chatId) {
            const docRef = doc(collection(db, 'Chats'))
            chatId = docRef.id
            updateFriend(docRef.id, friend[0])
            constructChat(docRef.id)
        }

        const messagesRef = collection(db, 'Chats', chatId, 'Messages')
        const q = query(messagesRef, orderBy("time", "asc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            }));
            setMessages(newMessages);
        });

        return () => unsubscribe();
        
    }, [open, chatId])

const constructChat = async (id) => {
    await setDoc(doc(db, 'Chats', id), {
        newMsg: true,
        participants: [doc(db, 'Users', friend[0]), doc(db, 'Users', user.uid)]
    })
}

const handleSendMessage = async () => {
        if (!typedMessage.trim()) return
        const messagesRef = collection(db, "Chats", chatId, "Messages");
        const chatRef = doc(db, 'Chats', chatId)
        await addDoc(messagesRef, {
            text: typedMessage,
            time: serverTimestamp(),
            senderID: user.uid,
            seen: false
        });

        await setDoc(chatRef, {
            newMsg: true
        }, {merge: true})

        setTypedMessage('')

        const receiverRef = doc(db, 'Users', friend[0])
        const receiverToken = (await getDoc(receiverRef)).data().fcmToken
        console.log(receiverToken)
        fetch('https://sendpushtotoken-wcqbnpknwa-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              token: await receiverToken,
              title: 'Nachricht von ' + user.displayName,
              body: typedMessage,
              msgType: 'notification',
              eventDate: '-', 
              senderName: '-',
          }),
          })
          .then(res => res.json())
          .then((res) => {console.log(res)})
          .catch(console.error);
    }

  return (
    <Dialog slotProps={{paper: { sx: {background: theme.palette.background.gradient}}}} fullScreen sx={{alignItems: 'end'}} onClose={onClose} open={open} display={'flex'}>
        <AppBar position='fixed' sx={{pr: '0px !important'}}>
            <Button fullWidth startIcon={<ArrowBackIosNew/>} sx={{':focus': {outline: 'none'}, zIndex: 10, background: theme.palette.background.paper}} onClick={onClose}>{typeof friend !== 'undefined' ? friend[1] : 'Loading...'}</Button>
        </AppBar>
        
        <Stack justifyContent={'space-between'} gap={2} height={'100vh'}>
            <Stack px={1} gap={2} overflow={'auto'}>
                <Box my={2}/>
                <ChatMessages friendName={typeof friend !== 'undefined' ? friend[1] : 'Loading...'} messages={messages} chatId={chatId}/>
            </Stack>
            
            <Paper elevation={8} sx={{display: 'flex', alignItems: 'center', borderRadius: '20px', background: theme.palette.primary.main, ml: 2, mr: 2, mb: 2, }}>
                <InputBase
                    multiline
                    maxRows={5}
                    fullWidth
                    size=''
                    sx={{ml: 0, pl: 2, background: theme.palette.background.paper, borderRadius: '20px',}}
                    placeholder="Nachricht"
                    onChange={(e) => setTypedMessage(e.target.value)}
                    value={typedMessage}
                    slotProps={{input: { sx: {py: 0.5}}}}
                />
                <IconButton type='submit' onClick={() => {handleSendMessage(chatId)}} sx={{pr: 1.5, ':focus': {outline: 'none'}}}>
                    <Send/>
                </IconButton>
            </Paper>
        </Stack>
    </Dialog>
  )
}

export default FriendChat