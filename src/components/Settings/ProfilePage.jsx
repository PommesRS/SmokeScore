import React, {useState} from 'react'
import { Box, Avatar, Typography, useTheme, Stack, Dialog, IconButton } from "@mui/material";
import {ArrowBackIosNew, ArrowForwardIos} from '@mui/icons-material'
import { useUserData } from '../../context/userData';
import { useUserAuth } from '../../context/userAuthConfig';
import FriendChart from '../Friends/FriendChart';
import FriendChanger from '../Friends/FriendChanger';
import FriendFileMap from '../Friends/FriendFileMap';
import { items } from '../Collectables/items';

const ProfilePage = () => {
  const [openPB, setOpenPB] = useState(false)
  const {userData} = useUserData()
  const {user} = useUserAuth()
  const theme = useTheme()

  const friends = [
    [ '', user.displayName, {days: [1, 3, 5, 8, 7, 8, 3] }]
  ]
  const ownStats = [6, 3, 4, 2, 6, 9, 4]

  return (
    <Box pt={12} mb={0}>
      <Stack mb={6} px={1}>
        <Typography fontSize={20} fontWeight={'bold'} textAlign={'center'}>Profil</Typography>
        <Typography fontSize={16} textAlign={'center'}>So wird dein Profil deinen Freunden angezeigt.</Typography>
      </Stack>
        <Dialog open={openPB} onClose={() => {setOpenPB(false)}} slotProps={{paper: {sx: {background: 'transparent', boxShadow: 'none', width: '100%', m: 0, overflow: 'visible'}}}} sx={{backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Avatar src={!user.photoURL ? './avatarPlaceholder.png' : user.photoURL} sx={{width: '80vw', height: '80vw', background: 'transparent', justifySelf: 'center'}}/>

        </Dialog>
        <Stack direction={'row'} width={'100%'} height={80} justifyContent={'space-around'} sx={{ position: "absolute"}}>
            <Box px={3} position={'relative'} display={'flex'} flexGrow={1} justifyContent={'center'} alignItems={'center'} sx={{background: 'transparent'}}>
                <Box bgcolor={theme.palette.background.default} position={'absolute'} top={0} right={0} width={'30px'} height={'30px'} sx={{mask: 'radial-gradient(30px at 0 100%,#0000 98%,#000)'}}/>
                <Avatar onClick={() => {setOpenPB(true)}} src={!user.photoURL ? './avatarPlaceholder.png' : user.photoURL} sx={{width: 56, height: 56}} />
                <img src={items.find((el) => el.id === userData?.equipSlots?.equippedFrame)?.assetPath || ''} width={96} style={{position: 'absolute', pointerEvents: 'none'}} />
            </Box>
            <Box display={'flex'} width={'100%'} minWidth={0} justifyContent={'center'} position={'relative'} alignItems={'center'} sx={{'&::before': {content: '""', position: 'absolute', width: '100%', overflow: 'hidden', height: '100%', borderRadius: '0 0 0 30px', background: theme.palette.background.default, top: 0, left: 0}, background: 'transparent'}}>
                <Stack direction={'row'} width={'100%'} minWidth={0} gap={2} justifyContent={'center'} alignItems={'center'}>
                    <IconButton disabled color='inherit' sx={{":focus": {outline: 'none'}, flexShrink: 0}}><ArrowBackIosNew/></IconButton>
                    <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative', minWidth: 0, flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis'}}>{user.displayName}</Typography>
                     <IconButton disabled color='inherit' sx={{":focus": {outline: 'none'}, flexShrink: 0}}><ArrowForwardIos/></IconButton>
                </Stack>
            </Box>
        </Stack>
        <Stack width={'100%'} className={`${userData?.equipSlots?.equippedBackground || ''} assetBg`} bgcolor={typeof userData?.equipSlots?.equippedBackground === 'undefined' ? theme.palette.background.paper : 'rgba(0, 0, 0, 0.7)'} p={3} py={15} gap={3}>
            <Stack direction={'row'} gap={2}>
                {Object.entries(userData.tags).map((tag) => (
                    <Typography key={tag[0]} flexGrow={1} textAlign={'center'} alignItems={'center'} justifyContent={'center'} display={'flex'} border={'2px solid' + theme.palette.secondary.main} position={'relative'} borderRadius={'53px'} px={3}>
                        {tag[1]}
                    </Typography>
                ))}
            </Stack>
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography>Kippen insgesamt</Typography>
                <Typography fontWeight={'bold'} fontSize={20}>{userData.counter}</Typography>
            </Stack>
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography>Aktuelle Streak</Typography>
                <Typography fontWeight={'bold'} fontSize={20}>{userData.streak.amount}</Typography>
            </Stack>
            <Box height={250}>
                <FriendChart ownStats={ownStats} friends={friends} friendIndex={0}/>
            </Box>

            <FriendFileMap friend={userData.geoLocations.reduce(function(prev, current) { return (prev && prev.amount > current.amount) ? prev : current})}/>

        </Stack>
        
    </Box>
  )
}

export default ProfilePage