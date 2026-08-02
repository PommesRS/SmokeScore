import React, {useEffect, useState} from 'react'
import { useUserData } from '../../context/userData'
import { Dialog, DialogTitle, Typography, Stack, Button, DialogContent, DialogContentText, DialogActions, Divider, Zoom,
Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {ExpandMore } from '@mui/icons-material';
import patchNotes from "./patchNotes.json"
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc, increment, getDocs, query, onSnapshot, arrayUnion, GeoPoint, Timestamp, runTransaction } from "@firebase/firestore";
import { db } from "../../firebase";
import { useUserAuth } from '../../context/userAuthConfig';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

const WhatsNew = () => {
    const { userData } = useUserData();
    const { user } = useUserAuth()
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if(!userData) return

        console.log(typeof userData?.currentAppVersion === 'undefined')

        if(typeof userData?.currentAppVersion === 'undefined'){
            console.log('schwanz')
            setOpen(true)
            updateAppVersion()
        }else if(userData?.currentAppVersion < Number(patchNotes.version)){
            setOpen(true)
        }

    }, [userData])

    const updateAppVersion = async () => {
        const docRef = doc(db, "Users", user.uid)

        await updateDoc(docRef, {
            currentAppVersion: patchNotes.version,
        })
    }

    const handleConfirmPopup = () => {
        setOpen(false);
        updateAppVersion()
    }

  return (
    <Dialog scroll='paper' fullWidth slots={{transition: Transition}} sx={{backdropFilter: "blur(2px)"}} open={open}>
        <DialogTitle sx={{pb: 0, pt: 2}}>Was gibts neues?</DialogTitle>
        <DialogContent sx={{pb: 2, pt: 0, overflow: 'hidden'}}>
            <DialogContentText>Version {patchNotes.version}</DialogContentText>
        </DialogContent>
        <Divider></Divider>

        <DialogContent>
            {patchNotes.notes.map(element => (
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore/>} sx={{':focus': {outline: 'none'}}}>
                        <Typography component='span'>{element.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <DialogContentText>
                            {element.body}
                        </DialogContentText>
                        {Object.hasOwn(element, "imgPath") && (
                            <>  
                                <Divider sx={{my: 2}}/>
                                <img src={element.imgPath} alt="exampleScreen" width={'100%'} />
                            </>
                        )}
                    </AccordionDetails>
                </Accordion>
                
            ))}

        </DialogContent>
        <DialogActions sx={{px: 3}}>
            <Button sx={{':focus': {outline: 'none'}, pr: 0}} onClick={handleConfirmPopup}>Verstanden</Button>

        </DialogActions>


    </Dialog>
  )
}

export default WhatsNew