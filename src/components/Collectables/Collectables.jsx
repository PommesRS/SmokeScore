import React, { useState } from 'react'
import { Box, Grid, Paper, Typography, Stack, Button, Icon, useTheme, Tooltip, Skeleton, Snackbar, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { SmokingRooms, Whatshot } from '@mui/icons-material'
import { useUserCollectables } from '../../context/userCollectables'
import { db } from '../../firebase'
import { doc, setDoc, query, collection, getDoc, onSnapshot, Timestamp } from "@firebase/firestore";
import { useUserAuth } from '../../context/userAuthConfig';
import ItemCard from './ItemCard'
import { items } from './items'
import { useNavigate } from 'react-router-dom'

const Collectables = () => {
    const [open, setOpen] = useState()
    const [item, setItem] = useState()
    const [snackOpen, setSnackOpen] = useState(false)
    const [snackMessage, setSnackMessage] = useState({severity: 'warning', text: 'penis'})
    const theme = useTheme()
    const collectables = useUserCollectables()
    const { user } = useUserAuth()
    const navigate = useNavigate()

    const freezeStreak = async () => {
        const docRef = doc(db, 'Users', user.uid, 'Stats', 'main')
        const streak = await (await getDoc(docRef)).data().streak.amount

        const userRef = doc(db, 'Users', user.uid)
        await setDoc(userRef, {
            streak: {
                amount: streak,
                lastIncrement: Timestamp.now()
            }
        }, {merge: true})
        collectables.decreaseAmount(10)
    }

    const toggleDrawer = (newValue) => () => {
        console.log(newValue)
        setOpen(newValue);
    };

    const closeDrawer = () => {
        setOpen(false)
    }
    
    const handleSnackClose = () => {
        setSnackOpen(false)
    }

  return (
    
    <Box pt={15} mb={10} display={'flex'} flexDirection={'column'} alignItems={'center'} gap={5} px={3}>
        <ToggleButtonGroup value={'smokeshop'} fullWidth>
            <ToggleButton value={'smokeshop'} sx={{':focus': {outline: 'initial', }, ':hover': {border: '1px solid rgba(255, 255, 255, 0.12)'}}}>
                <Typography>SmokeShop</Typography>
            </ToggleButton>
            <ToggleButton value={'smokeventar'} onClick={()=> {navigate('/inventory')}} sx={{':focus': {outline: 'initial'}, ':hover': {border: '1px solid rgba(255, 255, 255, 0.12)'}}}>
                <Typography>Smokeventar</Typography>
            </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip enterTouchDelay={0} leaveTouchDelay={100000} describeChild title='Alle zehn Kippen wird ein SmokeDollar verdient' arrow>
            <Paper sx={{borderRadius: 1000, boxShadow: '5px 5px 15px -3px rgba(0,0,0,0.15)'}} >
                <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} px={3}>
                    <img src="./currencyIcon.svg" width={'30px'}/>
                    <Typography alignSelf={'flex-start'} fontSize={'30px'} pr={1} fontWeight={'bold'}>{collectables.amount}</Typography>
                </Stack>
            </Paper>
        </Tooltip>
        <Box display={'flex'} gap={2} flexWrap={'wrap'}>
            {items.map((entry, i) => {
                if(entry.shoppable){
                    return(
                        <Paper key={entry.id} sx={{borderRadius: '10px', flexGrow: 1, minwidth: '40%', boxShadow: '5px 5px 15px -3px rgba(0,0,0,0.15)', overflow: 'hidden'}}>
                            <Box p={2}>
                                <Stack gap={1} justifyContent={'center'} alignItems={'center'}>
                                    <Box zIndex={1}>
                                        {entry.title.split(' ').map((string, i) => (
                                            <Typography key={i} textAlign={'center'} sx={{textWrap: 'wrap'}} >{string}</Typography>
                                        ))}
                                    </Box>
                                    <entry.icon size={'56px'} isItem={true}/>
                                    <Button variant='contained' onClick={() => {setItem(entry), setOpen(true)}} fullWidth sx={{':focus': {outline: 'none'}}}>
                                        ansehen
                                    </Button>
                                </Stack>
                            </Box>
                        </Paper>
                    )
                }

            })}
        </Box>
        {open && (
            <ItemCard setSnackMessage={setSnackMessage} setSnackOpen={setSnackOpen} isShop={true} currentAmount={collectables.amount} item={item} open={open} toggleDrawer={closeDrawer}/>
        )}
    </Box>
  )
}

export default Collectables