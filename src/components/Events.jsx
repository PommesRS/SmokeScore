import React, { useEffect, useState, useReducer } from 'react'
import { 
    Box, Button, Typography, ListItemButton, List, ListItem, Stack, ToggleButtonGroup, ToggleButton, useTheme,
    TextField, ListItemAvatar, ListItemText, Avatar, Divider
 } from '@mui/material'
import SouthEastIcon from '@mui/icons-material/SouthEast';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { DatePicker } from '@mui/x-date-pickers';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { db } from '../firebase.js';
import { collection, doc, getDoc, addDoc, updateDoc, onSnapshot, arrayRemove, deleteDoc, increment } from "@firebase/firestore";
import { useUserAuth } from '../context/userAuthConfig.jsx';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import { setDate } from 'date-fns';
import { data } from 'react-router-dom';


const Events = () => {
    const { user } = useUserAuth()
    const [friendList, setFriendList] = useState([]);
    const [eventList, setEventList] = useState([]);
    const [toggleButtonValue, setToggleButtonValue] = useState()
    const [stepOneComplete, setStepOneComplete] = useState(false)
    const [activeStep, setActiveStep] = useState(0)
    const [dateOwn, setDate] = useState(dayjs().format('YYYY-MM-DD'))
    const [time, setTime] = useState(dayjs().format('THH:mm:ssZ'))
    const [timeForPickerDefault, setTimeForPickerDefault] = useState(null)
    const [msg, setMsg] = useState()
    const theme = useTheme()
    const [value, setValue] = useState([]);
    

    async function getFriends() {
        const docRef = doc(db, "Users", user.uid)
        const friendListInit = (await getDoc(docRef)).data().Friends

        const friendsData = await Promise.all(
            friendListInit.map(async (friend) => {
            const friendDocRef = doc(db, "Users", friend)
            const friendName = (await getDoc(friendDocRef)).data().displayName
            return [friend, friendName]
            })
        )

        setFriendList(friendsData)
    }

    async function getEvents() {
        const docRef = doc(db, "Users", user.uid)
        const eventsInit = (await getDoc(docRef)).data().events
        console.log(value)

        const eventsData = await Promise.all(
            eventsInit.map(async (event) => {
            const eventsDocRef = doc(db, "Events", event)
            const eventData = (await getDoc(eventsDocRef)).data()
            const senderDocRef = doc(db, "Users", eventData.sender)
            const senderName = (await getDoc(senderDocRef)).data().displayName
            const receiverDocRef = doc(db, "Users", eventData.receiver)
            const receiverName = (await getDoc(receiverDocRef)).data().displayName
            eventData.sender = {
                sender: eventData.sender,
                senderName: senderName
            }
            eventData.receiver = {
                receiver: eventData.receiver,
                receiverName: receiverName
            }
            eventData.eventId = event

            return eventData
            })
        )

        console.log(eventsData)
        setEventList(eventsData)
    }
    
    useEffect(() => {
        getFriends()
        getEvents()
    }, [])

    useEffect(() => {
        const ref = doc(db, "Users", user.uid);
        const refEvents = collection(db, "Events");

        const unsubscribe = onSnapshot(ref, (snapshot) => {
        if (snapshot.exists()) {
            getEvents()
        }
        });

        const unsubscribe2 = onSnapshot(refEvents, (snapshot) => {
            getEvents()
        });

        return () => {unsubscribe(); unsubscribe2()}; // wichtig: Listener beim Unmount entfernen
    }, []);
    


    const handleToggleButtonChange = (event, nextEl) => {
        setToggleButtonValue(nextEl)
        setStepOneComplete(true)
        console.log(nextEl)
    }

    const handleDatePicked = (newValue) => {
        let stringify = dayjs(newValue).format('YYYY-MM-DD')
        setDate(stringify)
    }
    
    const handleTimePicked = (newValue) => {
        let stringify = dayjs(newValue).format('THH:mm:ssZ')
        setTimeForPickerDefault(newValue)
        setTime(stringify)
    }

    const handleMsgChange = (event) => {
        setMsg(event.target.value)
    }

    const handleSentInvite = async () => {
        const docRef = doc(db, "Users", toggleButtonValue)
        const friendToken = (await getDoc(docRef)).data().fcmToken
        let stringDate = `${dateOwn}${time}`
        //console.log(dayjs(stringDate))
        const eventRef = await addDoc(collection(db, 'Events'), {
            date: dayjs().toDate(),
            inviteText: msg,
            location: '',
            receiver: toggleButtonValue,
            sender: user.uid,
            status: 'pending'
        })

        const participatingParties = [toggleButtonValue, user.uid] 

        async function pimmel(participatingParties) {
            await participatingParties.map(async (id) => {
                const docRef = doc(db, "Users", id)
                const eventList = (await getDoc(docRef)).data().events
                let newEventList = await eventList
                if (typeof eventList !== 'undefined') {
                    newEventList.push(eventRef.id)
                    await updateDoc(docRef, {
                        events: newEventList
                    })
                }else{
                    await updateDoc(docRef, {
                        events: [eventRef.id]
                    })
                }
            })

        }

        pimmel(participatingParties).then(setValue(value => value + 1))

        // await updateDoc(doc(db, 'Events', ), {
        //     date: stringDate,
        //     inviteText: msg,
        //     location: '',
        //     receiver: toggleButtonValue,
        //     sender: user.uid,
        // })

        console.log(user.displayName)

        fetch('https://sendpushtotoken-wcqbnpknwa-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: await friendToken,
            // title: eventRef.id,
            title: eventRef.id,
            body: msg,
            msgType: 'invite',
            eventDate: stringDate,
            senderName: user.displayName
        }),
        })
        .then(res => res.json())
        .then(console.log)
        .catch(console.error);
        
    }

    const handleAcceptEvent = async (id) => {
        console.log(id)
        const eventDocRef = doc(db, "Events", id)
        await updateDoc(eventDocRef, {
            status: 'accepted',
        })

        const docRef = doc(db, "Users", user.uid)
        await updateDoc(docRef, {
            updateVar: increment(1)
        })
        await updateDoc(docRef, {
            updateVar: increment(-1)
        })
    }
    
    const handleDenyEvent = async (id) => {
        console.log(id)
        const eventDocRef = doc(db, "Events", id)
        await updateDoc(eventDocRef, {
            status: 'denied'
        })
    }

    const handleDeleteEvent = async (id) => {
        const eventDocRef = doc(db, "Events", id)
        const eventData = (await getDoc(eventDocRef)).data()
        
        console.log((await getDoc(eventDocRef)).data())
        const docRefSender = doc(db, "Users", eventData.sender);
        await updateDoc(docRefSender, {
            events: arrayRemove(id)
        });

        const docRefReceiver = doc(db, "Users", eventData.receiver);
        await updateDoc(docRefReceiver, {
            events: arrayRemove(id)
        });

        await deleteDoc(eventDocRef)

    }

  return (
    <Box pt={9} gap={5} width="100%" height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Typography align="center" variant="h4">
        Einladungen
        </Typography>

        <Box border={1} borderRadius="10px" p={5} position="relative" width="inherit"sx={{
          '&::before': {
            content: '"Neue Einladung"',
            position: 'absolute',
            top: 0,
            transform: 'translateY(-50%)',
            bgcolor: 'background.default',
            p: '0 10px'
          }
        }}>
            {friendList.length > 0 ?

                activeStep == 0 ? 
                <>
                    <ToggleButtonGroup exclusive orientation='vertical' value={toggleButtonValue} onChange={handleToggleButtonChange} sx={{width: '100%'}}>
                        {
                        friendList.map((el, i) => (
                            <ToggleButton key={i} value={el[0]} sx={{':focus': {outline: 'none'}, ':hover': {border: 1}, textTransform: 'none', }}>
                                <Stack direction={'row'} justifyContent={'space-between'} width={'100%'}>
                                    <Box>{el[1]}</Box>
                                </Stack>
                            </ToggleButton>
                        ))
                        }
                    </ToggleButtonGroup>
                    <Box mt={2} width={'100%'} display={'flex'} justifyContent={'flex-end'}>
                        <Button disabled={!stepOneComplete} onClick={() => setActiveStep(1)}>Weiter</Button>
                    </Box>

                </>

                : activeStep == 1 ?
                    <>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'de'}>
                            <DatePicker sx={{width: '100%'}} label="Datum wählen" defaultValue={dateOwn != null ? dayjs(dateOwn) : dayjs()} onChange={(newValue) => handleDatePicked(newValue)}/>
                        </LocalizationProvider>
                        <Box mt={2} width={'100%'} display={'flex'} justifyContent={'space-between'}>
                            <Button onClick={() => setActiveStep(0)}>Zurück</Button>
                            <Button disabled={!dateOwn} onClick={() => setActiveStep(2)}>Weiter</Button>
                        </Box>
                    </> 
                    : activeStep == 2 ? 
                    <>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'de'}>
                                <MobileTimePicker sx={{width: '100%'}} label="Zeit wählen" defaultValue={timeForPickerDefault ? dayjs(timeForPickerDefault) : dayjs()} onChange={(newValue) => handleTimePicked(newValue)}/>
                        </LocalizationProvider>
                        <Box mt={2} width={'100%'} display={'flex'} justifyContent={'space-between'}>
                            <Button onClick={() => setActiveStep(1)}>Zurück</Button>
                            <Button disabled={!time} onClick={() => setActiveStep(3)}>Weiter</Button>
                        </Box>
                    </>
                    :
                    <>
                    <TextField multiline sx={{width: '100%'}} label='Nachricht eingeben' onChange={(event) => handleMsgChange(event)}/>
                        <Box mt={2} width={'100%'}>
                            <Button onClick={() => setActiveStep(2)} sx={{mb: 2}}>Zurück</Button>
                            <Button disabled={!msg} onClick={handleSentInvite} fullWidth sx={{background: theme.palette.background.gradient, ':focus': {outline: 'none'}}} color='#fff'>Einladung abschicken</Button>
                        </Box>
                    </>
            :
                <Box>loading</Box>
            }   
        </Box>

        <List sx={{width: '100%', mb: 10, border: 1, borderRadius: '10px'}} dense={value < 0}>
            {eventList.map((event, i) => (
                event.sender.sender === user.uid ? 
                    <React.Fragment key={event}>
                        <ListItem >
                            <Stack direction={'column'} flex width={'100%'}>
                                <Stack direction={'row'} flex alignItems={'center'}>
                                    <ListItemAvatar>
                                        <Avatar><NorthEastIcon/></Avatar>
                                    </ListItemAvatar>
                                    <ListItemText slotProps={{primary: { component: 'span' },secondary: { component: 'span' }}} primary={`Einladung an ${event.receiver.receiverName}`} secondary={
                                        <React.Fragment>
                                        <Stack direction={'row'} gap={2}>
                                            <Stack direction={'row'} flex alignItems={'center'} gap={1}>
                                                <AccessTimeIcon/>
                                                <Typography alignItems={'center'}>{dayjs(event.date.toDate()).format('DD.MM.YYYY')}</Typography>
                                            </Stack>
                                            <Stack direction={'row'} flex alignItems={'center'} gap={1}>
                                                <CalendarTodayIcon/>
                                                <Typography alignItems={'center'}>{dayjs(event.date.toDate()).format('HH:mm')}</Typography>
                                            </Stack>
                                        </Stack>
                                        </React.Fragment>
                                    }/>
                                </Stack>
                                <Stack>
                                    <ListItemText primary='Status' secondary={event.status === 'accepted' ? 'Akzeptiert' : event.status === 'pending' ? 'Ausstehend' : 'Abgelehnt'}/>
                                </Stack>
                                <Stack>
                                    <Button variant='outlined' startIcon={<DeleteIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleDeleteEvent(event.eventId)}>Löschen</Button>
                                </Stack>
                            </Stack>
                        </ListItem>
                        <Divider  sx={{...(i+1 >= eventList.length && {display: 'none'}), borderBottom: 1}}></Divider>
                    </React.Fragment>
                    :
                    <React.Fragment key={event}>
                        <ListItem>
                            <Stack direction={'column'} flex width={'100%'}>
                                <Stack direction={'row'} flex alignItems={'center'}>
                                    <ListItemAvatar>
                                        <Avatar><SouthEastIcon/></Avatar>
                                    </ListItemAvatar>
                                    <ListItemText slotProps={{primary: { component: 'span' },secondary: { component: 'span' }}} primary={`Einladung von ${event.sender.senderName}`} secondary={
                                        <React.Fragment>
                                        <Stack direction={'row'} gap={2}>
                                            <Stack direction={'row'} flex alignItems={'center'} gap={1}>
                                                <AccessTimeIcon/>
                                                <Typography component='span' alignItems={'center'}>{dayjs(event.date.toDate()).format('DD.MM.YYYY')}</Typography>
                                            </Stack>
                                            <Stack direction={'row'} flex alignItems={'center'} gap={1}>
                                                <CalendarTodayIcon/>
                                                <Typography component='span' alignItems={'center'}>{dayjs(event.date.toDate()).format('HH:mm')}</Typography>
                                            </Stack>
                                        </Stack>
                                        </React.Fragment>
                                    } />
                                </Stack>
                                <Stack>
                                    <ListItemText primary='Status' secondary={event.status === 'accepted' ? 'Akzeptiert' : event.status === 'pending' ? 'Ausstehend' : 'Abgelehnt'}/>
                                </Stack>
                                <Stack>
                                    {event.status === 'pending' ? 

                                        <Stack direction={'row'} width={'100%'} gap={2}>
                                            <Button fullWidth variant='contained' color='error' startIcon={<CloseIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleDenyEvent(event.eventId)}>Ablehnen</Button>
                                            <Button fullWidth variant='outlined' startIcon={<CheckIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleAcceptEvent(event.eventId)}>Annehmen</Button>
                                        </Stack>
                                        
                                    :
                                        <Button variant='outlined' startIcon={<DeleteIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleDeleteEvent(event.eventId)}>Löschen</Button>
                                    }
                                </Stack>
                            </Stack>
                        </ListItem>
                        <Divider  sx={{...(i+1 >= eventList.length && {display: 'none'}), borderBottom: 1}}></Divider>
                    </React.Fragment>
                    
                    
            ))

            }
        </List>


    </Box>
  )
}

export default Events