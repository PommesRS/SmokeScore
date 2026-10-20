import React, { useEffect, useState } from 'react'
import { Box, Typography, List, ListItem, useTheme, Stack, Skeleton, Chip } from '@mui/material'
import { ArrowForwardIos, Check, Sort} from '@mui/icons-material'
import { quests, placeholderQuest, getGoldenHour } from './questsDetails.jsx'
import { db } from '../../firebase.js'
import { collection, query, runTransaction, where } from 'firebase/firestore'
import { useUserQuests } from '../../context/userQuests.jsx'
import { useAppState } from '../../context/appState.jsx'
import QuestModal from './QuestModal.jsx'

const Quests = ({callback}) => {
    const theme = useTheme()
    const [p, setP] = useState(false)
    const questSystem = useUserQuests()
    const appState = useAppState()
    const [sortedList, setSortedList] = useState(null)
    const [hideCompleted, setHideCompleted] = useState(false)
    const [rewardSort, setRewardSort] = useState(null)
    const [openDetailsDrawer, setOpenDetailsDrawer] = useState(false)
    const [activeQuest, setActiveQuest] = useState(null)
    const [desc, setDesc] = useState('')

    useEffect(() => {
        if(questSystem.loading) return
        setSortedList(quests)
    }, [questSystem.loading])

    useEffect(() => {
        callback('quests')
    }, [])

    const sortList = () => {
        const nextList = [...sortedList]
        if (!rewardSort || rewardSort == null) {
            nextList.sort((a,b) => b.reward.smokeDollars - a.reward.smokeDollars)
            setRewardSort(true)
            setSortedList(nextList)
        }else{
            nextList.sort((a,b) => a.reward.smokeDollars - b.reward.smokeDollars)
            setRewardSort(false)
            setSortedList(nextList) 
        }
    }

    const handleToggleDrawer = () => {
        setOpenDetailsDrawer((prev) => !prev)
    }

    const [goldenHour, setGoldenHour] = useState(null)
    
    useEffect(() => {
        if (activeQuest === null) return

        if (activeQuest.id !== 'golden_hour_smokeMent') {
            setDesc(activeQuest.desc)
        } else {
            getGoldenHour().then(r => setDesc(`Nimm ein Smokement zur Goldenen Stunde auf und teile ihn mit deinen Freunden. Die Goldene Stunde beginnt zurzeit um ${r[0]}:${r[1]} Uhr. Ab diese Zeitpunkt hast du zwei Stunden um die Quet zu erledigen.`) );
        }


    }, [activeQuest])


  return (
    <Box mx={2} py={10} gap={3} minHeight={'100vh'}>
        <Typography textAlign={'center'} fontWeight={'bold'} fontSize={26}>
            SmokeQuests
        </Typography>
        <Typography textAlign={'center'} fontSize={15} mb={4}>
            Hier kannst du Optionale Quests einsehen. Quests werden passiv gelevelt. Die Smokedollar rechts werden nach Abschluss gutgeschrieben.
        </Typography>

        <Stack className='hide-scrollbar' gap={1} mb={1} alignItems={'center'} direction={'row'} maxWidth={'100%'}>
            <Chip icon={rewardSort != null && <Sort sx={{transform: `scaleY(${rewardSort ? 1 : -1})`}}/>} variant={rewardSort != null ? 'filled' : 'outlined'} label='Belohnung' color='primary' onClick={() => {sortList('reward')}}/>
            <Chip label='Abgeschlossene verstecken' color='primary' variant={hideCompleted ? 'filled' : 'outlined'} onClick={() => {setHideCompleted((prev) => !prev)}}/>
        </Stack>

        <List>
            {sortedList ? sortedList.map((quest, i) => {
                var isCompleted = questSystem.completedQuest.includes(quest.id)
                if (hideCompleted && isCompleted) return
                return (
                <ListItem key={i} sx={{border: '0.5px solid rgba(217, 217, 217, 0.2)', borderRadius: '10px', p: 1, mb: 2,display: 'flex', gap: 1, background: isCompleted ? '#28583e' : 'transparent'}} onClick={() => {handleToggleDrawer(true); setActiveQuest(quest)}}>
                    <Box p={1.5} bgcolor={isCompleted ? '#4aa473' : theme.palette.background.paper} display={'flex'} borderRadius={'5px'}>
                        {isCompleted ? <Check/> : quest.icon}
                    </Box>

                    <Stack overflow={'hidden'}>
                        <Typography fontWeight={'bold'}>{quest.title}</Typography>
                        <Typography fontSize={13} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} maxWidth={'90%'}>{quest.desc}</Typography>
                    </Stack>


                    <Stack direction={'row'} alignItems={'center'} gap={1/3} ml={'auto'} color={isCompleted ? '#72ffb1' : 'inherit'}>
                        <Typography>
                            {quest.reward.smokeDollars}
                        </Typography>
                        <img src="./currencyIcon.svg" alt="smokedollar" class={isCompleted ? 'filter_green' : ''}/>
                        
                    </Stack>

                </ListItem>
            )}) : Array.from(Array(6)).map((index) => (
                <Skeleton key={index} sx={{mb: 2}} variant='rounded' width={"100%"} height={'75px'}/>
            ))
            }
        </List>
        <QuestModal open={openDetailsDrawer} onClose={handleToggleDrawer} desc={desc} quest={activeQuest || placeholderQuest}/>
    </Box>
  )
}

export default Quests