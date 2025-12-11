import React, { useEffect, useState } from 'react'
import {
    Box, List, ListItem, ListItemButton, Avatar, ListItemAvatar, ListItemText, Divider, Dialog, 
    DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Select, FormControl, InputLabel, TextField,
    Alert, Snackbar, Switch, Stack, Typography
} from '@mui/material'
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EditIcon from '@mui/icons-material/Edit';
import SellIcon from '@mui/icons-material/Sell';
import PaletteIcon from '@mui/icons-material/Palette';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import { messaging } from '../firebase'
import { getMessaging, getToken } from "firebase/messaging"
import { useUserAuth } from '../context/userAuthConfig.jsx';
import { collection, doc, getDoc, updateDoc } from "@firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from '../firebase.js';
import { PushNotifications } from '@capacitor/push-notifications';
import { ThemeToggleButton } from './index.js'
import {useNavigate} from 'react-router-dom';


const Settings = () => {
      const { user } = useUserAuth();
      let TokenGlobal
    // const [token, setToken] = useState();
    
    useEffect(() => {
        initSettings()
    }, [user])

    const initSettings = async () => {
        const docRef = doc(db, 'Users', user.uid)
        const data = (await getDoc(docRef)).data().tags
        const notificationValue = (await getDoc(docRef)).data().canGetNotifications
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

    }

    const [open, setOpen] = useState(false);
    const [openCustomization, setCustomizationOpen] = useState(false);
    const [openNotificationSetting, setOpenNotificationSetting] = useState(false);
    const [cigType, setCigType] = useState('');
    const [tobacco, setTobacco] = useState('');
    const [username, setUsername] = useState('');
    const [alertState, setAlertState] = useState(false)
    const [alertText, setAlertText] = useState('')
    const [notificationSwitchValue, setNotificationSwitchValue] = useState(false)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleCustomizationOpen = () => {
        setCustomizationOpen(true);
    };
    
    const handleNotificationSettingsOpen = () => {
        setOpenNotificationSetting(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCustomizationOpen(false);
        setOpenNotificationSetting(false)
        initSettings()
    };

    const handleChange = (event) => {
        setCigType(event.target.value || '');
        console.log(event.target.value)
    }

    const handleNotificationSwitch = (event) => {
        setNotificationSwitchValue(event.target.checked);
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
                    <Button>Zustimmen</Button>
                </DialogActions> 
            </Dialog>
            
            {/* Customization Dialog */}
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
                            {background: '#0B0B12'}
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
                <DialogTitle id="alert-dialog-title">{'Benachrichtigungen anpassen.'}</DialogTitle>
                <DialogContent>
                    <Stack direction={'row'} flex={'true'} alignItems={'center'}>
                        <Switch
                            checked={notificationSwitchValue}
                            onChange={handleNotificationSwitch}
                            />
                        <Stack>
                            <Typography>Benarichtigungen aktivieren</Typography>
                            <DialogContentText fontSize={15}>Du wirst {!notificationSwitchValue ? 'nicht' : ''} benachrichtigt wenn ein Freund eine Zigarette einträgt.</DialogContentText>
                        </Stack>
                    </Stack>
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {handleClose()}}>Abbrechen</Button>
                    <Button onClick={() => {handleNotificationSave()}}>Speichern</Button>
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
                <ListItemButton disabled href={'https://billing.stripe.com/p/login/test_aFa3cugMoeqz8pv4Qld3i00' + '?prefilled_email=' + user.email} sx={{':hover': {color: 'inherit'}}}>
                    <ListItemAvatar>
                    <Avatar>
                        <SellIcon />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Abonnement Optionen" secondary='Zum Kundenportal' />
                </ListItemButton>
            <Divider />
                <ListItemButton disabled onClick={handleClickOpen}>
                    <ListItemAvatar>
                    <Avatar>
                        <DeleteForeverIcon />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Zurücksetzen" secondary="Alle Daten auf diesem Account werden Zurückgesetzt!" sx={{ color: 'red'}} />
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={() => {navigate(`/style`)}}>
                    <ListItemAvatar>
                        <Avatar>
                            <PaletteIcon />
                        </Avatar>
                        </ListItemAvatar>
                    <ListItemText primary="Farbstil ändern"/>
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={() => {navigate(`/support`)}}>
                    <ListItemAvatar>
                        <Avatar>
                            <EmailIcon />
                        </Avatar>
                        </ListItemAvatar>
                    <ListItemText primary="Support"/>
                </ListItemButton>
            <Divider />
                <ListItemButton onClick={handleCopyToClipboard}>
                    <ListItemAvatar>
                        <Avatar>
                            <BadgeIcon />
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