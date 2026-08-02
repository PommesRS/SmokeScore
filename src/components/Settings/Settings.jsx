import React, { useEffect, useState } from 'react'
import {
    Box, List, ListItem, ListItemButton, Avatar, ListItemAvatar, ListItemText, Divider, Dialog, 
    DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Select, FormControl, InputLabel, TextField,
    Alert, Snackbar, Switch, Stack, Typography, useTheme
} from '@mui/material'
import {Image, Work, Restore, DeleteForever, NotificationsActive, Edit, Sell, Palette, Email, Badge, FiberNew, MyLocation} from '@mui/icons-material'
import { messaging } from '../../firebase.js'
import { getMessaging, getToken } from "firebase/messaging"
import { useUserAuth } from '../../context/userAuthConfig.jsx';
import { collection, doc, getDoc, updateDoc, getDocs, setDoc } from "@firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from '../../firebase.js';
import { PushNotifications } from '@capacitor/push-notifications';
import { ThemeToggleButton } from '../index.js'
import {useNavigate} from 'react-router-dom';


const Settings = ({callback}) => {
      const { user } = useUserAuth();
      let TokenGlobal
    // const [token, setToken] = useState();
    
    useEffect(() => {
        initSettings()
    }, [user])

    const initSettings = async () => {
        const docRef = doc(db, 'Users', user.uid)
        const statsSnap = await getDocs(collection(db, 'Users', user.uid, 'monthly'))
        const data = (await getDoc(docRef)).data().tags

        let months = 0

        statsSnap.forEach((doc) => {
            doc.data().months.forEach((month) => {
                months += month
            })
        });
        setMonthlySum(months)

        const notificationValue = (await getDoc(docRef)).data().canGetNotifications
        const postionValue = (await getDoc(docRef)).data().sharesPostion
        if(data){
            setCigType(data.cigType)
            setTobacco(data.tobacco)
            setUsername(user.displayName)
        }
        
        if(typeof notificationValue !== 'undefined'){
            setNotificationSwitchValue(notificationValue)
        }else{
            setNotificationSwitchValue(true)
        }

        if(typeof postionValue !== 'undefined'){
            setPostitionSwitchValue(postionValue)
        }else{
            setPostitionSwitchValue(true)
        }

    }

    const [open, setOpen] = useState(false);
    const [openCustomization, setCustomizationOpen] = useState(false);
    const [openNotificationSetting, setOpenNotificationSetting] = useState(false);
    const [openPositionSetting, setOpenPositionSetting] = useState(false);
    const [openRestore, setOpenRestore] = useState(false)
    const [cigType, setCigType] = useState('');
    const [tobacco, setTobacco] = useState('');
    const [username, setUsername] = useState('');
    const [alertState, setAlertState] = useState(false)
    const [alertText, setAlertText] = useState('')
    const [notificationSwitchValue, setNotificationSwitchValue] = useState(false)
    const [positionSwitchValue, setPostitionSwitchValue] = useState(false)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [monthlySum, setMonthlySum] = useState(null)
    const theme = useTheme()

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleRestorenOpen = () => {
        setOpenRestore(true);
    };

    const handleCustomizationOpen = () => {
        setCustomizationOpen(true);
    };
    
    const handleNotificationSettingsOpen = () => {
        setOpenNotificationSetting(true);
    };

    const handlePositionSettingsOpen = () => {
        setOpenPositionSetting(true);
    };

    const handleClose = () => {
        setOpen(false);
        setOpenRestore(false)
        setCustomizationOpen(false);
        setOpenNotificationSetting(false)
        setOpenPositionSetting(false)
        initSettings()
    };

    const handleChange = (event) => {
        setCigType(event.target.value || '');
        console.log(event.target.value)
    }

    const handleNotificationSwitch = (event) => {
        setNotificationSwitchValue(event.target.checked);
    }

    const handlePostionSwitch = (event) => {
        setPostitionSwitchValue(event.target.checked);
    }

    const handleTextInput = (event) => {
        setTobacco(event.target.value)
    }

    const handleUsernameInput = (event) => {
        setUsername(event.target.value)
    }

    const handleTagSave = async () => {
        const docRef = doc(db, 'Users', user.uid)
        try {
            setLoading(true)
            await updateDoc(docRef, {
                tags: {
                    cigType: cigType,
                    tobacco: tobacco
                },
                displayName: username
            })
            updateProfile(user, {
                displayName: username
            }).then((result) => {
                setLoading(false)
                handleClose()
                setAlertText('Einstellungen gespeichert!')
                setAlertState(true)
            })
            
        } catch (error) {
            
        }
        
    }

    const handleRestore = async () => {
        const docRef = doc(db, 'Users', user.uid)
        if(!monthlySum || monthlySum < 1) return
        try {
            setLoading(true)
            await updateDoc(docRef, {
                counter: monthlySum
            }).then((result) => {
                setLoading(false)
                handleClose()
                setAlertText('Counter gespeichert!')
                setAlertState(true)
            })
            
        } catch (error) {
            console.log(error)
        }
        
    }

    const handleShowWhatsNew = async () => {
        navigate(`/tracker`)
        callback('tracker')
        const docRef = doc(db, 'Users', user.uid)

        await setDoc(docRef, {
            currentAppVersion: 1
        }, {merge: true})
    }

    const handleNotificationSave = async () => {
        const docRef = doc(db, 'Users', user.uid)
        try {
            await updateDoc(docRef, {
                canGetNotifications: notificationSwitchValue
            })
            setAlertText('Einstellungen gespeichert!')
            setAlertState(true)
            handleClose()
        } catch (error) {
            
        }
    }

    const handlePositionSave = async () => {
        const docRef = doc(db, 'Users', user.uid)
        try {
            await updateDoc(docRef, {
                sharesPostion: positionSwitchValue
            })
            setAlertText('Einstellungen gespeichert!')
            setAlertState(true)
            handleClose()
        } catch (error) {
            
        }
    }

    const handleCloseAlert = () => {
        setAlertState(false)
    }

    const handleCopyToClipboard = () => {
        try {
            navigator.clipboard.writeText(user.uid)
            setAlertText('Id kopiert!')
            setAlertState(true)
            
        } catch (error) {
        }
    }
    
    return (
        <Box paddingTop={8} width={'100%'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="top">
            
            {/* Delete Account Dialog */}
            <Dialog
                slotProps={
                    {paper: 
                        {sx: 
                            {background: theme.palette.background.paper}
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
                    <Button>Zustimmen</Button>
                </DialogActions> 
            </Dialog>

            {/* Restore Counter Dialog */}
            <Dialog
                slotProps={
                    {paper: 
                        {sx: 
                            {background: theme.palette.background.paper}
                        }
                    }
                }
                sx={
                    {backdropFilter: "blur(2px)"}
                }
                open={openRestore}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Counter neu berechnen"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Wenn du auf 'Wiederherstellen' tippst wird dein Counter auf den unten stehenden Wert gesetzt! 
                    </DialogContentText>
                    <DialogContentText sx={{color: 'gray'}}>
                        Monatssumme: {!monthlySum ? '...loading' : monthlySum }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Abbrechen</Button>
                    <Button onClick={handleRestore} loading={loading}>Wiederherstellen</Button>
                </DialogActions> 
            </Dialog>
            
            {/* Customization Dialog */}
            <Dialog
                slotProps={
                    {paper: 
                        {sx: 
                            {background: theme.palette.background.paper}
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
                <DialogTitle id="alert-dialog-title">{'Profil anpassen'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Die Informationen werden deinen Freunden auf der "Freunde" Seite angezeigt.
                    </DialogContentText>
                    <Divider />
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
                    <FormControl variant='standard' sx={{ m: 1, minWidth: '70%' }}>
                        <TextField value={username} onChange={handleUsernameInput} id="standard-basic" label="Benutzernamen ändern" variant="standard" />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {handleClose()}}>Abbrechen</Button>
                    <Button loading={loading} onClick={() => {handleTagSave()}}>Speichern</Button>
                </DialogActions> 
            </Dialog>
            
            {/* Notification Dialog */}
            <Dialog
                slotProps={
                    {paper: 
                        {sx: 
                            {background: theme.palette.background.paper}
                        }
                    }
                }
                sx={
                    {backdropFilter: "blur(2px)"}
                }
                open={openNotificationSetting}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Benachrichtigungen anpassen'}</DialogTitle>
                <DialogContent>
                    <Stack direction={'row'} flex={'true'} alignItems={'center'}>
                        <Switch
                            checked={notificationSwitchValue}
                            onChange={handleNotificationSwitch}
                            />
                        <Stack>
                            <Typography>Benarichtigungen aktivieren</Typography>
                            <Divider />
                            <DialogContentText fontSize={15}>Du wirst {!notificationSwitchValue ? 'nicht' : ''} benachrichtigt wenn ein Freund eine Zigarette einträgt.</DialogContentText>
                        </Stack>
                    </Stack>
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {handleClose()}}>Abbrechen</Button>
                    <Button onClick={() => {handleNotificationSave()}}>Speichern</Button>
                </DialogActions> 
            </Dialog>

            {/* last known position Dialog */}
            <Dialog
                slotProps={
                    {paper: 
                        {sx: 
                            {background: theme.palette.background.paper}
                        }
                    }
                }
                sx={
                    {backdropFilter: "blur(2px)"}
                }
                open={openPositionSetting}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Position teilen'}</DialogTitle>
                <DialogContent>
                    <Stack direction={'row'} flex={'true'} alignItems={'center'}>
                        <Switch
                            checked={positionSwitchValue}
                            onChange={handlePostionSwitch}
                            />
                        <Stack>
                            <Typography>Position teilen aktivieren</Typography>
                            <Divider />
                            <DialogContentText fontSize={15}>Deine Freunde können die Position {!positionSwitchValue ? 'nicht' : ''} sehen, an der du warst als du das letzte mal SmokeScore benutzt hast.</DialogContentText>
                        </Stack>
                    </Stack>
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {handleClose()}}>Abbrechen</Button>
                    <Button onClick={() => {handlePositionSave()}}>Speichern</Button>
                </DialogActions> 
            </Dialog>

            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal:'center'}}
                autoHideDuration={3000}
                open={alertState}
                onClose={handleCloseAlert}
            >
                <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
                    {alertText}
                </Alert>
            </Snackbar>
            {/* <button onClick={sendNotification} style={{color: 'white'}}>Nachricht senden</button>
            <br />
            <button onClick={getAndroidPermission} style={{color: 'white'}}>Berechtigung für Nachrichten anfragen</button>
            <br />
            <button onClick={saveFCMToken} style={{color: 'white'}}>Dieses Gerät als Benachrichtungsgerät festlegen</button> */}
            <List sx={{ width: '100%', mb: 10}}>
                <ListItemButton onClick={handleNotificationSettingsOpen}>
                    <ListItemAvatar>
                    <Avatar>
                        <NotificationsActive />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Benachrichtigungen" />
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={handleCustomizationOpen}>
                    <ListItemAvatar>
                    <Avatar>
                        <Edit />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Profil Anpassen" />
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={handlePositionSettingsOpen}>
                    <ListItemAvatar>
                    <Avatar>
                        <MyLocation />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Position teilen" />
                </ListItemButton>
            <Divider />
                <ListItemButton disabled href={'https://billing.stripe.com/p/login/test_aFa3cugMoeqz8pv4Qld3i00' + '?prefilled_email=' + user.email} sx={{':hover': {color: 'inherit'}}}>
                    <ListItemAvatar>
                    <Avatar>
                        <Sell />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Abonnement Optionen" secondary='Zum Kundenportal' />
                </ListItemButton>
            <Divider />
                <ListItemButton disabled onClick={handleClickOpen}>
                    <ListItemAvatar>
                    <Avatar>
                        <DeleteForever />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Zurücksetzen" secondary="Alle Daten auf diesem Account werden Zurückgesetzt!" sx={{ color: 'red'}} />
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={handleRestorenOpen}>
                    <ListItemAvatar>
                    <Avatar>
                        <Restore />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Counter neu berechnen" secondary="Der Counter wird aus deinen Monatlichen Statitiken neu berechnet"
                        slotProps={{ secondary: {sx: {color: 'gray'}}}}
                    />
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={handleShowWhatsNew}>
                    <ListItemAvatar>
                    <Avatar>
                        <FiberNew />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Neuheiten" secondary="'Was ist neu?' erneut anzeigen lassen."
                        slotProps={{ secondary: {sx: {color: 'gray'}}}}
                    />
                    
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={() => {navigate(`/style`)}}>
                    <ListItemAvatar>
                        <Avatar>
                            <Palette />
                        </Avatar>
                        </ListItemAvatar>
                    <ListItemText primary="Farbstil ändern"/>
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={() => {navigate(`/support`)}}>
                    <ListItemAvatar>
                        <Avatar>
                            <Email />
                        </Avatar>
                        </ListItemAvatar>
                    <ListItemText primary="Support"/>
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={handleCopyToClipboard}>
                    <ListItemAvatar>
                        <Avatar>
                            <Badge />
                        </Avatar>
                        </ListItemAvatar>
                    <ListItemText primary='Nutzer Id' secondary={user.uid} slotProps={{secondary: {sx: { width: '100%',color:'gray', display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}}}/>
                </ListItemButton>
            <Divider />
            
            </List>
        </Box>
    )
}

export default Settings