import React, {useEffect, useState} from 'react'
import { Fab, IconButton, Box, Stack, Zoom, Badge } from '@mui/material'
import {Delete, PersonAddAlt1, Add, Forum, KeyboardArrowUp} from '@mui/icons-material';
import { useFriendChat } from '../../context/friendChat';

const FriendFab = ({openAdd, openDelete, openChat, friendId}) => {
    const [open, setOpen] = useState(false)
    const [shouldBadge, setShouldBadge] = useState(0)
    const friendChat = useFriendChat()

    const getBadge = () => {
        if(friendChat.newMessages.some((el) => el.id === friendId)) {
            setShouldBadge(friendChat.newMessages)
        }else {
            setShouldBadge(0)
        }
    }

    useEffect(() => {
        getBadge()
    },[friendId, friendChat.newMessages])

  return (
        <Stack gap={2} alignItems={'center'} zIndex={5} position={'fixed'} bottom={80} right={20}>
            <Zoom in={open}>
                <Badge invisible={!open} variant='dot' badgeContent={shouldBadge} color='secondary'>
                    <Fab onClick={openChat} size='medium' sx={{":focus": {outline: 'none'}}} color='primary' aria-label="addFriend">
                        <Forum sx={{color: '#fff'}}/>
                    </Fab>

                </Badge>
            </Zoom>

            <Zoom in={open}>
                <Fab onClick={openAdd} size='medium' sx={{":focus": {outline: 'none'}}} color='primary' aria-label="addFriend">
                    <PersonAddAlt1 sx={{color: '#fff'}}/>
                </Fab>
            </Zoom>

            <Zoom in={open}>
                <Fab onClick={openDelete} size='medium' sx={{":focus": {outline: 'none'}}} color='error' aria-label="removeFriend">
                    <Delete sx={{color: '#fff'}}/>
                </Fab>
            </Zoom>

            <Badge invisible={open} variant='dot' badgeContent={shouldBadge} color='secondary'>
                <Fab size='large' color='primary' onClick={() => {setOpen((prev) => !prev)}} sx={{":focus": {outline: 'none'}}} >
                    <KeyboardArrowUp sx={{transform: open ? "rotate(180deg)" : "rotate(0deg)",transition: "0.2s", color: '#fff'}}/>
                </Fab>
            </Badge>
        </Stack>
  )
}

export default FriendFab