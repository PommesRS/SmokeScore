import React, { useEffect, useState } from 'react'
import {
    Box, List, ListItem, ListItemButton, Avatar, ListItemAvatar, ListItemText, Divider, Dialog, 
    DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Select, FormControl, InputLabel, TextField,
    Alert, Snackbar
} from '@mui/material'
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EditIcon from '@mui/icons-material/Edit';
import SellIcon from '@mui/icons-material/Sell';
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
    
    useEffect(() => {
        initProfileData()
    }, [user])

    const initProfileData = async () => {
        const docRef = doc(db, 'Users', user.uid)
        const data = (await getDoc(docRef)).data().tags
        if(!data) return
        setCigType(data.cigType)
        setTobacco(data.tobacco)
    }

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

    const [open, setOpen] = useState(false);
    const [openCustomization, setCustomizationOpen] = useState(false);
    const [cigType, setCigType] = useState('');
    const [tobacco, setTobacco] = useState('');
    const [alertState, setAlertState] = useState(false)
    

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleCustomizationOpen = () => {
        setCustomizationOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCustomizationOpen(false);
        initProfileData()
    };

    const handleChange = (event) => {
        setCigType(event.target.value || '');
        console.log(event.target.value)
    }

    const handleTextInput = (event) => {
        setTobacco(event.target.value)
    }

    const handleTagSave = async () => {
        const docRef = doc(db, 'Users', user.uid)
        try {
            await updateDoc(docRef, {
                tags: {
                    cigType: cigType,
                    tobacco: tobacco
                }
            })
            setAlertState(true)
            handleClose()
        } catch (error) {
            
        }
        
    }

    const handleCloseAlert = () => {
        setAlertState(false)
    }
    
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
                    <Button onClick={saveFCMToken}>Zustimmen</Button>
                </DialogActions> 
            </Dialog>

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
                open={openCustomization}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Hier kannst du dein Profil anpassen. Die Informationen werden deinen Freunden auf der "Freunde" Seite angezeigt.'}</DialogTitle>
                <DialogContent>
                    <FormControl variant='standard' sx={{ m: 1, minWidth: '70%' }}>
                        <InputLabel htmlFor="demo-dialog-native">Zigaretten Typ wählen</InputLabel>
                        <Select
                            native
                            autoWidth
                            value={cigType}
                            onChange={handleChange}
                            
                        >
                            <option aria-label="None" value="" />
                            <option value={'gedreht'}>Selbst gedrehte Zigarette</option>
                            <option value={'fertig'}>Fertige Zigarette</option>
                        </Select>
                    </FormControl>
                    <br />
                    <FormControl variant='standard' sx={{ m: 1, minWidth: '70%' }}>
                        <TextField value={tobacco} onChange={handleTextInput} id="standard-basic" label="Tabak Sorte wählen" variant="standard" />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {handleClose()}}>Abbrechen</Button>
                    <Button onClick={() => {handleTagSave()}}>Speichern</Button>
                </DialogActions> 
            </Dialog>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal:'center'}}
                autoHideDuration={3000}
                open={alertState}
                onClose={handleCloseAlert}
            >
                <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
                    Einstellungen gespeichert!
                </Alert>
            </Snackbar>
            {/* <button onClick={sendNotification} style={{color: 'white'}}>Nachricht senden</button>
            <br />
            <button onClick={getAndroidPermission} style={{color: 'white'}}>Berechtigung für Nachrichten anfragen</button>
            <br />
            <button onClick={saveFCMToken} style={{color: 'white'}}>Dieses Gerät als Benachrichtungsgerät festlegen</button> */}
            <List sx={{ width: '100%'}}>
                <ListItemButton onClick={'/*sendNotification*/'}>
                    <ListItemAvatar>
                    <Avatar>
                        <NotificationsActiveIcon />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Benachrichtigungen" />
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={handleCustomizationOpen}>
                    <ListItemAvatar>
                    <Avatar>
                        <EditIcon />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Profil Anpassen" />
                </ListItemButton>
            <Divider />
                <ListItemButton href={'https://billing.stripe.com/p/login/test_aFa3cugMoeqz8pv4Qld3i00' + '?prefilled_email=' + user.email} sx={{':hover': {color: 'inherit'}}}>
                    <ListItemAvatar>
                    <Avatar>
                        <SellIcon />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Abonnement Optionen" secondary='Zum Kundenportal' />
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