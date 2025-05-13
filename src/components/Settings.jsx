import React, { useEffect, useState } from 'react'
import {Container, Box, Button, Typography} from '@mui/material'
import { messaging } from '../firebase'
import { getMessaging, getToken } from "firebase/messaging"


const Settings = () => {
    // const [token, setToken] = useState();
    
    // useEffect(() => {
    //     setToken(getToken(messaging, {xapiKey: 'BP5WjUBgUmAI5Ec80vu-1BoaoUzooBFr0IIseivX6DYKdtE1b77hw3-WSAQ9NRP3KD1hG8N8pJ6H2JMfWoO8hKI'}))
    // }, [])

    function sendNotification(){
        fetch('https://sendpushtotoken-wcqbnpknwa-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: 'eF_z-yJYTOy5X6fS2DAeiX:APA91bGnZdk8oU0YgX51jD7LHpDDjRvmsGpx71PIaw4B4ImUG6DZAwwWw3rUyECZZ46sbHdwAl6QvhFDms7Xh56fFvh1By4xfrWdXplGMU_BgCY7uhOXEDY',
            title: 'anus',
            body: 'hodensack'
        }),
        })
        .then(res => res.json())
        .then(console.log)
        .catch(console.error);
    }
    
    return (
        <Box width={'100%'} height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
            <button onClick={sendNotification} style={{color: 'white'}}>Nachricht senden</button>
        </Box>
    )
}

export default Settings