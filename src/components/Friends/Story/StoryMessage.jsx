import React, { useState } from 'react'
import { Box, Paper, InputBase, IconButton, useTheme, Typography } from '@mui/material'
import { Send } from '@mui/icons-material'
import { useUserAuth } from '../../../context/userAuthConfig'
import { db } from '../../../firebase'
import { setDoc, collection, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore'

const StoryMessage = ({friendId, updateFriend, friends}) => {
    const [typedMessage, setTypedMessage] = useState('')
    const theme = useTheme()
    const {user} = useUserAuth()

    const handleRequestSend = async () => {
        var chatId = friends.find((el) => el[0] === friendId)[10]

        if(!chatId){
            const docRef = doc(collection(db, "Chats"))
            chatId = docRef.id

            updateFriend(docRef.id, friendId)

            await setDoc(doc(db, 'Chats', chatId), {
                newMsg: true,
                participants: [doc(db, 'Users', friendId), doc(db, 'Users', user.uid)]
            }, {merge: true})

            handleSendMessage(docRef.id)
        }else {
            handleSendMessage(chatId)
        }
    }


    const handleSendMessage = async (id) => {
        if (!typedMessage.trim()) return
        const messagesRef = collection(db, "Chats", id, "Messages");
        await addDoc(messagesRef, {
            text: typedMessage,
            time: serverTimestamp(),
            senderID: user.uid,
            seen: false,
            isReaction: true
        });

        console.log(friendId)

        const docRef = doc(db, 'Users', friendId)
        const receiverToken = (await getDoc(docRef)).data().fcmToken

        setTypedMessage('')
        
        fetch('https://sendpushtotoken-wcqbnpknwa-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              token: await receiverToken,
              title: user.displayName + ' hat auf deinen SmokeMent ragiert.',
              body: typedMessage,
              msgType: 'notification',
              eventDate: '-', 
              senderName: '-'
          }),
          })
          .then(res => res.json())
          .then((res) => {console.log(res)})
          .catch(console.error);
    }

  return (
    <>
        <Box position={'fixed'} bottom={0} width={'100%'} textAlign={'center'} left={0}>
            <Paper elevation={8} sx={{display: 'flex', alignItems: 'center', borderRadius: '20px', background: theme.palette.primary.main, ml: 2, mr: 2, mb: 2, }}>
                <InputBase
                    multiline
                    maxRows={5}
                    fullWidth
                    size=''
                    sx={{ml: 0, pl: 2, background: theme.palette.background.paper, borderRadius: '20px',}}
                    placeholder="Nachricht"
                    onChange={(e) => {setTypedMessage(e.target.value)}}
                    value={typedMessage}
                    slotProps={{input: { sx: {py: 0.5}}}}
                />
                <IconButton type='submit' onClick={handleRequestSend} sx={{pr: 1.5, ':focus': {outline: 'none'}}}>
                    <Send/>
                </IconButton>
            </Paper>
        </Box>
        {/* <Box position={'fixed'} bottom={0} mb={2} width={'100%'} textAlign={'center'} left={0} border={'dotted'} borderColor={'red'} borderRadius={10}>
            <Typography>Wartungsarbeiten</Typography>
        </Box> */}
    </>
  )
}

export default StoryMessage