import { 
    Dialog, DialogTitle, DialogContent, CircularProgress, Box, Divider, DialogContentText,
    Stack, Button, Alert, Snackbar, 
 } from '@mui/material'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScheduleIcon from '@mui/icons-material/Schedule';
import React, { useEffect, useState } from 'react'
import { db } from '../../firebase.js';
import { collection, doc, getDoc, updateDoc, arrayRemove, arrayUnion, setDoc } from "@firebase/firestore";
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { useUserAuth } from '../../context/userAuthConfig.jsx';

const EventPopup = ({open, eventId, onTrigger, inviteText, eventDate, senderName}) => {
    const [eventData, setEventData] = useState(null)
    const [alertState, setAlertState] = useState(false)
    const [alertText, setAlertText] = useState('')
    const [alertVariant, setAlertVariant] = useState('')
      const { user } = useUserAuth();

    useEffect(() => {
        getEventData()
    }, [eventId])

    const getEventData = async () => {
        const eventRef = doc(db, "Events", eventId)
        const senderUID = (await getDoc(eventRef)).data().sender
        setEventData(senderUID)
        console.log(eventData)
    }

    const acceptInvite = async () => {
        // if(eventData.senderFCMToken != null) {
        //     fetch('https://sendpushtotoken-wcqbnpknwa-uc.a.run.app', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         token: eventData.senderFCMToken,
        //         title: 'Einladung angenommen',
        //         body: `${user.displayName} hat deine Einladung angenommen!`,
        //         msgType: 'noti'
        //     }),
        //     })
        //     .then(res => res.json())
        //     .then(console.log)
        //     .catch(console.error);
        // }
        const eventDocRef = doc(db, "Events", eventId)
        const eventRef = await updateDoc(eventDocRef, {
            status: 'accepted'
        })


        // const participatingParties = [eventData, user.uid]
        // participatingParties.map(async (id) => {
        //     const docRef = doc(db, "Users", id)
        //     const eventList = (await getDoc(docRef)).data().events
        //     let newEventList = await eventList
        //     if (typeof eventList !== 'undefined') {
        //         newEventList.push(eventId)
        //         await updateDoc(docRef, {
        //             events: newEventList
        //         })
        //     }else{
        //         await updateDoc(docRef, {
        //             events: [eventId]
        //         })
        //     }
        // })

        setAlertText('Einladung angenommen')
        setAlertState(true)
        setAlertVariant('success')
        onTrigger()

    }

    const handleDenyInvite = async () => {
        const eventDocRef = doc(db, "Events", eventId)
        const eventRef = await updateDoc(eventDocRef, {
            status: 'denied'
        })

        // const participatingParties = [eventData, user.uid]
        // participatingParties.map(async (id) => {
        //     const docRef = doc(db, "Users", id)
        //     const eventList = (await getDoc(docRef)).data().events
        //     let newEventList = await eventList
        //     if (typeof eventList !== 'undefined') {
        //         newEventList.push(eventId)
        //         await updateDoc(docRef, {
        //             events: newEventList
        //         })
        //     }else{
        //         await updateDoc(docRef, {
        //             events: [eventId]
        //         })
        //     }
        // })

        setAlertText('Einladung abgelehnt')
        setAlertVariant('warning')
        setAlertState(true)
        onTrigger()

    }

    const handleCloseAlert = () => {
        setAlertState(false)
    }

    return (
        <>
        
        <Snackbar
            anchorOrigin={{vertical: 'top', horizontal:'center'}}
            autoHideDuration={3000}
            open={alertState}
            onClose={handleCloseAlert}
        >
            <Alert severity={alertVariant} variant="filled" sx={{ width: '100%' }}>
                {alertText}
            </Alert>
        </Snackbar>
        {typeof eventData !== null ?
                <Dialog sx={{backdropFilter: "blur(2px)"}} open={open} >
                    <DialogTitle textAlign={'center'} color='primary.main'>{senderName} lädt dich ein!</DialogTitle>
                    <Divider></Divider>
                    <DialogContent>
                        <Stack gap={2}>

                            <Stack direction={'row'} gap={3} justifyContent={'end'}>
                                <Stack direction={'row'} gap={1}>
                                    <CalendarTodayIcon/>
                                    {/* <DialogContentText>{format(eventDate.toDate(), 'dd.MM.yyyy')}</DialogContentText> */}
                                    <DialogContentText>{dayjs(eventDate).format('DD.MM.YYYY')}</DialogContentText>

                                </Stack>
                                <Stack direction={'row'} gap={1}>
                                    <ScheduleIcon/>
                                    {/* <DialogContentText>{format(eventDate.toDate(), 'H:m')}</DialogContentText> */}
                                    <DialogContentText>{dayjs(eventDate).format('H:m')}</DialogContentText>{/* <DialogContentText>{dayjs(eventDate.toDate()).format('dd.MM.yyyy')}</DialogContentText> */}
                                </Stack>
                            </Stack>
                        
                            <DialogContentText fontStyle={'italic'}>
                                <FormatQuoteIcon/>
                                {inviteText}
                            </DialogContentText>

                            <Stack direction={'row'} justifyContent={'end'} gap={1}>
                                <Button sx={{':focus': {outline: 'none'}}} color='error' onClick={handleDenyInvite} >Ablehnen</Button>
                                <Button sx={{':focus': {outline: 'none'}}} onClick={acceptInvite}>Annehmen</Button>
                            </Stack>

                        </Stack>
                        

                    </DialogContent>
                </Dialog>
            :
            <Dialog sx={{backdropFilter: "blur(2px)"}} open={open} >
                <Box p={3} pb={2} >
                    <CircularProgress/>
                </Box>
            </Dialog>
        }
        
    </>
    )
}

export default EventPopup