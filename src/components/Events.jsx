import React, { useEffect, useState, useRef } from 'react'
import { 
    Box, Button, Typography, ListItemButton, List, ListItem, Stack, ToggleButtonGroup, ToggleButton, useTheme,
    TextField, ListItemAvatar, ListItemText, Avatar, Divider, Dialog, Paper, Input, InputBase,
    InputAdornment, IconButton, AppBar, FormControl, Badge
 } from '@mui/material'
import SouthEastIcon from '@mui/icons-material/SouthEast';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ForumIcon from '@mui/icons-material/Forum';
import SendIcon from '@mui/icons-material/Send';
import { DatePicker } from '@mui/x-date-pickers';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { db } from '../firebase.js';
import { collection, doc, getDoc, addDoc, updateDoc, onSnapshot, arrayRemove, deleteDoc, increment, query, orderBy, serverTimestamp } from "@firebase/firestore";
import { useUserAuth } from '../context/userAuthConfig.jsx';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import { setDate } from 'date-fns';
import { data } from 'react-router-dom';
import { grey } from '@mui/material/colors';
import { fi } from 'date-fns/locale';

export function Message({callback, message}) {
    const { user } = useUserAuth()
    const theme = useTheme()

    useEffect(() => {
      callback()
    }, [])

    return (
        <React.Fragment>
            <Paper elevation={0} key={message.id} sx={message.senderId !== user.uid ? 
                {position: 'relative',color:'#fff', p: 2,  alignSelf: 'start', maxWidth: '70%', ':before': {content: '""', position: 'absolute', width: '10px', height: '10px', left: -6, top: 0, background: `linear-gradient(225deg, ${theme.palette.background.paper} 50%, rgba(0,0,0,0) 50%)`, filter: 'opacity(1)'}} 
                : 
                {position: 'relative',color:'#fff', p: 2,  alignSelf: 'end', maxWidth: '70%', ':before': {content: '""', position: 'absolute', width: '10px', height: '10px', right: -6, top: 0, background: `linear-gradient(135deg, ${theme.palette.background.paper} 50%, rgba(0,0,0,0) 50%)`, filter: 'opacity(1)'}}}>
                <Stack position={'relative'}>
                    <Typography fontSize={17} pr={5}>{message.text}</Typography>
                    <Typography fontSize={12} alignSelf={'end'} position={'absolute'} bottom={-12} right={-7} color={grey[100]}>{dayjs(message.timestamp?.toDate()).format('HH:mm')}</Typography>
                </Stack>
            </Paper>
        </React.Fragment>
    )
}

export function ChatMessages({messages}) {
    const theme = useTheme()

    const callback = () => {
        const container = document.querySelector('.chat-container');
        if(container.lastElementChild) {
            container.lastElementChild.scrollIntoView(true)
        }

    }

    const sortedMessages = [...messages].sort(
    (a, b) => a.timestamp?.toMillis() - b.timestamp?.toMillis()
    );

    const groupedMessages = sortedMessages.reduce((acc, msg) => {
    const ts = msg.timestamp?.toDate();
    const dateKey = dayjs(ts).startOf("day").toDate(); // echtes Date!

    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(msg);

    return acc;
    }, {});

    console.log(groupedMessages)

    function formatChatDate(date) {
        const d = dayjs(date);
        const today = dayjs();
        const yesterday = dayjs().subtract(1, "day");

        if (d.isSame(today, "day")) return "Heute";
        if (d.isSame(yesterday, "day")) return "Gestern";

        return d.format("DD.MM.YY");
    }

    function DateSeparator({ date }) {
        return (
            <Box
                component={'div'}
                sx={{
                    position: "sticky",
                    top: 50, // passe an deinen Header an
                    zIndex: 5,
                    background: theme.palette.background.paper,
                    textAlign: "center",
                    py: 0.5,
                    width: '30%',
                    borderRadius: "10px",
                    alignSelf: 'center',
                }}
            >
            <Typography sx={{ opacity: 0.9 }}>
                {formatChatDate(date)}
            </Typography>
            </Box>
        );
    }

    return (
        <Stack gap={2} className='chat-container'>

            {Object.entries(groupedMessages).map(([date, msgs]) => (
                <React.Fragment key={date}>

                    <DateSeparator date={date} />
                    {msgs.map(message => (
                        <React.Fragment key={message.id}>
                            <Message message={message} callback={callback}/>
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}
            {/* {messages.map(message => (
                <React.Fragment >
                    <Message message={message} callback={callback}/>
                </React.Fragment>

                // <Paper key={message.id} sx={message.receiving ? {color:'#fff', p: 2, width: '70%'} : {color:'#fff', p: 2, width: '70%', alignSelf: 'end'}}>
                //     {message.text}
                // </Paper>
                ))
            } */}
        </Stack >
    )
}

function ChatDialog({ open, onClose, theme, activeEvent, messages, typedMessage, setTypedMessage, handleSendMessage, scrollRef }) {
    const { user } = useUserAuth()
    if (!activeEvent) return null;

    useEffect(() => {
        handleResetNewMsgAlert()
    }, [messages])

    const handleResetNewMsgAlert = async () => {
        const docRef = doc(db, 'Events', activeEvent.eventId)
        const lastMsgSender = (await getDoc(docRef)).data().lastMsgSender
        console.log(await lastMsgSender)
        if (lastMsgSender !== user.uid) {
            await updateDoc(docRef, {
                newMsg: false
            })
            
        }

        const receiverRef = doc(db, 'Users', user.uid)
        const receiverEvents = (await getDoc(receiverRef)).data().updateVar

        await updateDoc(receiverRef, {
            updateVar: increment(1)
        })
        await updateDoc(receiverRef, {
            updateVar: increment(-1)
        })
    }


    return (
        <Dialog slotProps={{paper: { sx: {background: theme.palette.background.gradient}}}} fullScreen sx={{alignItems: 'end'}} onClose={onClose} open={open} display={'flex'}>
                <AppBar position='fixed' sx={{pr: '0px !important'}}>
                    <Button fullWidth startIcon={<ArrowBackIosNewIcon/>} sx={{':focus': {outline: 'none'}, zIndex: 10, background: theme.palette.background.paper}} onClick={onClose}>Zurück</Button>
                </AppBar>
                

                <Stack justifyContent={'space-between'} gap={2} height={'100vh'}>
                    <Stack px={1} gap={2} overflow={'auto'}>
                        <Paper key={'initMessage'} sx={{color:'#fff', p: 2, width: '100%', mt: 6}}>
                            <Stack position={'relative'}>
                                <Typography fontSize={12} alignSelf={'end'} position={'absolute'} top={-12} right={-7} color='primary'>Einladungs Text</Typography>
                                <Typography fontSize={17} pr={5}>{activeEvent.inviteText}</Typography>
                            </Stack>
                        </Paper>
                        <ChatMessages ref={scrollRef} messages={messages}/>
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
                        <IconButton type='submit' onClick={() => {handleSendMessage(activeEvent.eventId)}} sx={{pr: 1.5, ':focus': {outline: 'none'}}}>
                            <SendIcon/>
                        </IconButton>
                    </Paper>
                </Stack>
        </Dialog>
    );
}


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
    const [chatOpen, setChatOpen] = useState(false)
    const [activeEvent, setActiveEvent] = useState(null)
    const [messages, setMessages] = useState([]);
    const [typedMessage, setTypedMessage] = useState('');
    const ChatScroll = useRef(null)

    useEffect(() => {
        if (!chatOpen || !activeEvent) return;
        const messagesRef = collection(db, "Events", activeEvent.eventId, "Messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            }));
            console.log(newMessages)
            setMessages(newMessages);
        });

        return () => unsubscribe();
        
    }, [chatOpen, activeEvent])
    

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
        console.log(eventsInit)

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

                const docRef = doc(db, "Users", user.uid)
        await updateDoc(docRef, {
            updateVar: increment(1)
        })
        await updateDoc(docRef, {
            updateVar: increment(-1)
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

    const handleOpenChat = async (id) => {
        const eventDocRef = doc(db, "Events", id)
        let eventData = (await getDoc(eventDocRef)).data()
        eventData = {...eventData, eventId: id}
        //console.log((await getDoc(eventDocRef)).data())
        setActiveEvent(eventData)
        setChatOpen(true)
    }

    const handleChatClose = () => {
        setChatOpen(false);
    };

    const handleSendMessage = async (event) => {
        if (!typedMessage.trim()) return
        const messagesRef = collection(db, "Events", activeEvent.eventId, "Messages");
        console.log(serverTimestamp())
        await addDoc(messagesRef, {
            receiving: user.uid === activeEvent.sender ? true : false,
            text: typedMessage,
            timestamp: serverTimestamp(),
            senderId: user.uid
        });

        setTypedMessage('')
        const eventRef = doc(db, 'Events', activeEvent.eventId)
        await updateDoc(eventRef, {
            lastMsgSender: user.uid,
            newMsg: true
        })

        const receiverId = activeEvent.receiver === user.uid ? activeEvent.sender : activeEvent.receiver

        const receiverRef = doc(db, 'Users', receiverId)
        const receiverToken = (await getDoc(receiverRef)).data().fcmToken
        console.log(activeEvent.receiver)

        await updateDoc(receiverRef, {
            updateVar: increment(1)
        })

        await updateDoc(receiverRef, {
            updateVar: increment(-1)
        })

        fetch('https://sendpushtotoken-wcqbnpknwa-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              token: await receiverToken,
              title: 'Nachricht von ' + user.displayName,
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
    <Box pt={9} gap={5} width="100%" height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <ChatDialog 
            open={chatOpen}
            onClose={handleChatClose}
            theme={theme}
            activeEvent={activeEvent}
            messages={messages}
            typedMessage={typedMessage}
            setTypedMessage={setTypedMessage}
            handleSendMessage={handleSendMessage}
            scrollRef={ChatScroll}
        />
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
                    <React.Fragment key={event.eventId}>
                        <ListItem>
                            <Stack direction={'column'} flex width={'100%'}>
                                <Stack direction={'row'} flex alignItems={'center'}>
                                    <ListItemAvatar>
                                        {event.status === 'pending' ? 
                                            <Avatar><NorthEastIcon/></Avatar>
                                        : event.status === 'accepted' ? 
                                            <Avatar color='success' sx={{background: theme.palette.primary.main}}><CheckIcon/></Avatar>
                                        : 
                                            <Avatar color='error' sx={{background: 'red'}}><CloseIcon/></Avatar>
                                        }
                                    </ListItemAvatar>
                                    <ListItemText slotProps={{primary: { component: 'span' },secondary: { component: 'span' }}} primary={`Einladung an ${event.receiver.receiverName}`} secondary={
                                        <React.Fragment>
                                        <Stack direction={'row'} gap={2}>
                                            <Stack direction={'row'} flex alignItems={'center'} gap={1}>
                                                <CalendarTodayIcon/>
                                                <Typography alignItems={'center'}>{dayjs(event.date.toDate()).format('DD.MM.YYYY')}</Typography>
                                            </Stack>
                                            <Stack direction={'row'} flex alignItems={'center'} gap={1}>
                                                <AccessTimeIcon/>
                                                <Typography alignItems={'center'}>{dayjs(event.date.toDate()).format('HH:mm')}</Typography>
                                            </Stack>
                                        </Stack>
                                        </React.Fragment>
                                    }/>
                                </Stack>
                                <Stack>
                                    <ListItemText primary='Nachricht:' secondary={event.inviteText}/>
                                </Stack>
                                                                <Stack>
                                    {event.status === 'pending' ? 

                                        <Stack direction={'row'} width={'100%'} gap={2}>
                                            <Button fullWidth variant='contained' color='error' startIcon={<CloseIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleDenyEvent(event.eventId)}>Ablehnen</Button>
                                            <Button fullWidth variant='outlined' startIcon={<CheckIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleAcceptEvent(event.eventId)}>Annehmen</Button>
                                        </Stack>
                                        
                                    :
                                        <Stack direction={'row'} width={'100%'} gap={2}>
                                            {event.status === 'accepted' ? 
                                                <React.Fragment>
                                                    <Button fullWidth variant='outlined' key={'delete'} startIcon={<DeleteIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleDeleteEvent(event.eventId)}>Löschen</Button>
                                                    <Box sx={{width: '100%'}}>
                                                        <Badge sx={{width: '100%'}} variant='dot' color='secondary' invisible={event.newMsg && (event.lastMsgSender !== user.uid) ? false : true}>
                                                            <Button fullWidth variant='contained' key={'openChat'} startIcon={<ForumIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleOpenChat(event.eventId)}>Chat</Button>
                                                        </Badge>
                                                    </Box>
                                                </React.Fragment>
                                            :
                                                <Button fullWidth variant='outlined' startIcon={<DeleteIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleDeleteEvent(event.eventId)}>Löschen</Button>
                                            }
                                        </Stack>
                                        
                                    }
                                </Stack>
                            </Stack>
                        </ListItem>
                        <Divider  sx={{...(i+1 >= eventList.length && {display: 'none'}), borderBottom: 1}}></Divider>
                    </React.Fragment>
                    :
                    <React.Fragment key={event.eventId}>
                        <ListItem>
                            <Stack direction={'column'} flex width={'100%'}>
                                <Stack direction={'row'} flex alignItems={'center'}>
                                    <ListItemAvatar>
                                        {event.status === 'pending' ? 
                                            <Avatar><SouthEastIcon/></Avatar>
                                        : event.status === 'accepted' ? 
                                            <Avatar color='success' sx={{background: theme.palette.primary.main}}><CheckIcon/></Avatar>
                                        : 
                                            <Avatar color='error' sx={{background: 'red'}}><CloseIcon/></Avatar>
                                        }
                                    </ListItemAvatar>
                                    <ListItemText slotProps={{primary: { component: 'span' },secondary: { component: 'span' }}} primary={`Einladung von ${event.sender.senderName}`} secondary={
                                        <React.Fragment>
                                        <Stack direction={'row'} gap={2}>
                                            <Stack direction={'row'} flex alignItems={'center'} gap={1}>
                                                <CalendarTodayIcon/>
                                                <Typography component='span' alignItems={'center'}>{dayjs(event.date.toDate()).format('DD.MM.YYYY')}</Typography>
                                            </Stack>
                                            <Stack direction={'row'} flex alignItems={'center'} gap={1}>
                                                <AccessTimeIcon/>
                                                <Typography component='span' alignItems={'center'}>{dayjs(event.date.toDate()).format('HH:mm')}</Typography>
                                            </Stack>
                                        </Stack>
                                        </React.Fragment>
                                    } />
                                </Stack>
                                <Stack>
                                    <ListItemText primary='Nachricht:' secondary={event.inviteText}/>
                                </Stack>
                                <Stack>
                                    {event.status === 'pending' ? 

                                        <Stack direction={'row'} width={'100%'} gap={2}>
                                            <Button fullWidth variant='contained' color='error' startIcon={<CloseIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleDenyEvent(event.eventId)}>Ablehnen</Button>
                                            <Button fullWidth variant='outlined' startIcon={<CheckIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleAcceptEvent(event.eventId)}>Annehmen</Button>
                                        </Stack>
                                        
                                    :
                                        <Stack direction={'row'} width={'100%'} gap={2}>
                                            {event.status === 'accepted' ? 
                                                <React.Fragment>
                                                    <Button fullWidth variant='outlined' key={'delete'} startIcon={<DeleteIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleDeleteEvent(event.eventId)}>Löschen</Button>
                                                    <Box sx={{width: '100%'}}>
                                                        <Badge sx={{width: '100%'}} variant='dot' color='secondary' invisible={event.newMsg && (event.lastMsgSender !== user.uid) ? false : true}>
                                                            <Button fullWidth variant='contained' key={'openChat'} startIcon={<ForumIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleOpenChat(event.eventId)}>Chat</Button>
                                                        </Badge>
                                                    </Box>
                                                </React.Fragment>
                                            :
                                                <Button fullWidth variant='outlined' startIcon={<DeleteIcon/>} sx={{':focus': {outline: 'none'}, mb: 1}} onClick={() => handleDeleteEvent(event.eventId)}>Löschen</Button>
                                            }
                                        </Stack>
                                        
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