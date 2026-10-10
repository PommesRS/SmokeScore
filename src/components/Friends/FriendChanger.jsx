import React, { useEffect, useState } from 'react'
import { Stack, IconButton, Typography,Badge } from '@mui/material'
import { SmokingRooms, ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material'
import { useFriendChat } from '../../context/friendChat'

const FriendChanger = ({friends, friendIndex, setFriendIndex}) => {
    const {newMessages} = useFriendChat()
    const [messageIndicies, setMessageIndicies] = useState([])
    const [shouldLeftBadge, setShouldLeftBadge] = useState(0)
    const [shouldRightBadge, setShouldRightBadge] = useState(0)

    useEffect(() => {
        setMessageIndicies([])
        newMessages.forEach((newMsg) => {
            const index = friends.findIndex(friend => friend[0] === newMsg.id)
            console.log(index)
            if(index !== -1){
                setMessageIndicies(prev => [...prev, index])
            }
        })

    }, [newMessages])

    useEffect(() => {
        getMessageIndicies()
    },[friendIndex, messageIndicies])

    const getMessageIndicies = () => {
        console.log(messageIndicies)

        setShouldRightBadge(0)
        setShouldLeftBadge(0)

        if(messageIndicies.findIndex((index) => index > friendIndex) != -1){
            setShouldRightBadge(1)
        }
        
        if(messageIndicies.findIndex((index) => index < friendIndex) != -1){
            setShouldLeftBadge(1)
        }
    }

    const handleFriendSwitch = (direction) => {
        if (direction == 'up') {
        if (friendIndex < friends.length - 1 ) {
            setFriendIndex(friendIndex + 1)

        }
        } else if (direction == 'down') {
        if (friendIndex > 0) {
            setFriendIndex(friendIndex - 1)

        }
        }
    }

  return (
    <Stack direction={'row'} width={'100%'} minWidth={0} gap={2} justifyContent={'center'} alignItems={'center'}>
        <Badge variant='dot' color='secondary' badgeContent={shouldLeftBadge} sx={{flexShrink: 0}}>
            <IconButton onClick={() => {handleFriendSwitch('down')}} disabled={friendIndex === 0} color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowBackIosNew/></IconButton>
        </Badge>
        <Stack justifyContent={'center'} minWidth={0} alignItems={'center'} position={'relative'} sx={{flexShrink: 1}}>
            {friends[friendIndex][4] >= 1000 && (
                <SmokingRooms className='glow-animate' fontSize='large' sx={{
                    position: 'absolute', 
                    top: -20, 
                    fontWeight: 'bold'}}/>
            )}
            {/* <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative'}}>{friends.length > 0 && friends[friendIndex][1]}</Typography> */}
            <Typography height={'auto'} width={'100%'} sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'}}>{friends.length > 0 && friends[friendIndex][1]}</Typography>
        </Stack>
        <Badge variant='dot' color='secondary' badgeContent={shouldRightBadge} sx={{flexShrink: 0}}>
            <IconButton onClick={() => {handleFriendSwitch('up')}} disabled={friendIndex >= friends.length - 1} color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowForwardIos/></IconButton>
        </Badge>
    </Stack>
  )
}

export default FriendChanger