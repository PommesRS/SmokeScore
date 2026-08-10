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
    <Stack direction={'row'} width={'inherit'} textOverflow={'ellipsis'} gap={2} justifyContent={'center'} alignItems={'center'}>
        <Badge variant='dot' color='secondary' badgeContent={shouldLeftBadge}>
            <IconButton onClick={() => {handleFriendSwitch('down')}} color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowBackIosNew/></IconButton>
        </Badge>
        <Stack justifyContent={'center'} alignItems={'center'} position={'relative'}>
            {friends[friendIndex][4] >= 1000 ? 
            <React.Fragment>
            <SmokingRooms className='glow-animate' fontSize='large' sx={{
                position: 'absolute', 
                top: -20, 
                fontWeight: 'bold'}}/>
            <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative'}}>{friends.length > 0 && friends[friendIndex][1]}</Typography>
            </React.Fragment>
            
            : <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative'}}>{friends.length > 0 && friends[friendIndex][1]}</Typography>
            }
        </Stack>
        <Badge variant='dot' color='secondary' badgeContent={shouldRightBadge}>
            <IconButton onClick={() => {handleFriendSwitch('up')}}  color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowForwardIos/></IconButton>
        </Badge>
    </Stack>
  )
}

export default FriendChanger