import React, { useEffect, useState } from 'react'
import {Box, List, ListItem, ListItemButton, Avatar, ListItemAvatar, ListItemText, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material'
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { messaging } from '../firebase'
import { getMessaging, getToken } from "firebase/messaging"
import { useUserAuth } from '../context/userAuthConfig.jsx';
import { collection, doc, getDoc, updateDoc } from "@firebase/firestore";
import { db } from '../firebase.js';
import { PushNotifications } from '@capacitor/push-notifications';



const Settings = () => {
      const { user } = useUserAuth();
      let TokenGlobal
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

    const saveFCMToken = async () => {
        let uID = await user.uid

        if (!user) {
            console.warn("Kein eingeloggter Benutzer");
            return;
        }

        const tokenRef = doc(db, 'Users', uID);
            await updateDoc(tokenRef, {
            fcmToken: TokenGlobal
            });
    }

    const getAndroidPermission = () => {
        PushNotifications.requestPermissions().then(result => {
            if (result.receive === 'granted') {
                PushNotifications.register();
            } else {
                console.warn('Keine Berechtigung für Push-Benachrichtigungen');
            }
        });

        // Erfolgreich registriert
        PushNotifications.addListener('registration', token => {
            TokenGlobal = token.value
            console.log('Registriert mit Token:', token.value);

            async () => {
                let uID = await user.uid

                if (!user) {
                console.warn("Kein eingeloggter Benutzer");
                return;
                }

                try {
                    const tokenRef = doc(db, 'Users', uID);
                    await updateDoc(tokenRef, {
                    fcmToken: token.value
                    });
                } catch (error) {
                    console.log(error)
                }
                
            }
        });

        // Fehler bei der Registrierung
        PushNotifications.addListener('registrationError', err => {
        console.error('Registrierungsfehler:', err);
        });

        // Push empfangen (App im Vordergrund)
        PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push erhalten:', notification);
        });

        // Benutzer klickt auf Notification
        PushNotifications.addListener('pushNotificationActionPerformed', notification => {
        console.log('Benutzeraktion:', notification);
        // z. B. Navigation auslösen
        });
    }

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    
    return (
        <Box paddingTop={8} width={'100%'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="top">
            <Dialog
                slotProps={
                    {paper: 
                        {sx: 
                            {background: '#0B0B12'}
                        }
                    }
                }
                sx={
                    {backdropFilter: "blur(2px)"}
                }
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Du bist im begriff deine Daten zu löschen. (Aktuell passiert nichts)"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Wenn du auf zustimmen drückst werden alle Daten die an dein Account gebunden sind gelöscht. Diese Daten sind: Tracker, Standorte, Freunde. Dein Account bleibt weiter bestehen. 
                        
                        
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Abbrechen</Button>
                    <Button onClick={handleClose}>Zustimmen</Button>
                </DialogActions> 
            </Dialog>
            {/* <button onClick={sendNotification} style={{color: 'white'}}>Nachricht senden</button>
            <br />
            <button onClick={getAndroidPermission} style={{color: 'white'}}>Berechtigung für Nachrichten anfragen</button>
            <br />
            <button onClick={saveFCMToken} style={{color: 'white'}}>Dieses Gerät als Benachrichtungsgerät festlegen</button> */}
            <List sx={{ width: '100%'}}>
                <ListItemButton onClick={/*sendNotification*/ arsch}>
                    <ListItemAvatar>
                    <Avatar>
                        <NotificationsActiveIcon />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Benachrichtigungen" />
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={handleClickOpen}>
                    <ListItemAvatar>
                    <Avatar>
                        <DeleteForeverIcon />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Zurücksetzen" secondary="Alle Daten auf diesem Account werden Zurückgesetzt!" sx={{ color: 'red'}} />
                </ListItemButton>
            <Divider />
            </List>
        </Box>
    )
}

export default Settings