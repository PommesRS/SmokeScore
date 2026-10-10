import React, {useState} from 'react'
import { Box, Avatar, Typography, useTheme, Stack, Dialog } from "@mui/material";
import FriendChanger from './FriendChanger';
import FriendChart from './FriendChart';
import FriendFileMap from './FriendFileMap'
import FriendFilePet from './FriendFilePet';
import { items } from '../Collectables/items';

const FriendFile = ({friends, friendIndex, setFriendIndex, ownStats}) => {
    const [openPB, setOpenPB] = useState(false)
    const theme = useTheme()

  return (
    <Box mt={5}>
        <Dialog open={openPB} onClose={() => {setOpenPB(false)}} slotProps={{paper: {sx: {background: 'transparent', boxShadow: 'none'}}}} sx={{backdropFilter: 'blur(10px)'}}>
            <Avatar src={typeof friends[friendIndex][11] === 'undefined' ? './avatarPlaceholder.png' : friends[friendIndex][11]} sx={{width: 300, height: 300, background: 'transparent'}}/>
        </Dialog>
        <Stack direction={'row'} position={'absolute'} width={'100%'} height={80} justifyContent={'space-around'}>
            <Box px={3} position={'relative'} display={'flex'} justifyContent={'center'} alignItems={'center'}  borderRadius={'0px 30px 0 0'} bgcolor={'transparent'}>
                <Box bgcolor={theme.palette.background.default} position={'absolute'} top={0} right={0} width={'30px'} height={'30px'} sx={{mask: 'radial-gradient(30px at 0 100%,#0000 98%,#000)'}}/>
                <Avatar onClick={() => {setOpenPB(true)}} src={typeof friends[friendIndex][11] === 'undefined' ? './avatarPlaceholder.png' : friends[friendIndex][11]} sx={{width: 56, height: 56}} />
                <img src={items.find((el) => el.id === friends[friendIndex][12]?.equippedFrame)?.assetPath || ''} width={96} style={{position: 'absolute', pointerEvents: 'none'}} />
            </Box>
            <Box display={'flex'} justifyContent={'center'} width={'100%'} minWidth={0} position={'relative'} alignItems={'center'} bgcolor={'transparent'}  sx={{
                '&::before': {content: '""', position: 'absolute', width: '100%', height: '100%', overflow:'hidden', borderRadius: '0 0 0 30px', background: theme.palette.background.default, top: 0, left: 0}
            }}>
                <FriendChanger friends={friends} friendIndex={friendIndex} setFriendIndex={setFriendIndex}/>
            </Box>
        </Stack>
        <Stack className={`${friends[friendIndex][12]?.equippedBackground} assetBg`} bgcolor={typeof friends[friendIndex][12]?.equippedBackground === 'undefined' ? theme.palette.background.paper : 'rgba(0, 0, 0, 0.7)'} p={3} py={15} gap={3}>
            <Stack direction={'row'} gap={2}>
                {Object.entries(friends[friendIndex][5]).map((tag) => (
                    <Typography key={tag[0]} flexGrow={1} textAlign={'center'} alignItems={'center'} justifyContent={'center'} display={'flex'} border={'2px solid' + theme.palette.secondary.main} position={'relative'} borderRadius={'53px'} px={3}>
                        {tag[1]}
                    </Typography>
                ))}
            </Stack>
            {typeof friends[friendIndex][13] !== 'undefined' && (
                <FriendFilePet pet={friends[friendIndex][13]} />
            )}
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography>Kippen insgesamt</Typography>
                <Typography fontWeight={'bold'} fontSize={20}>{friends[friendIndex][4]}</Typography>
            </Stack>
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography>Aktuelle Streak</Typography>
                <Typography fontWeight={'bold'} fontSize={20}>{friends[friendIndex][8]}</Typography>
            </Stack>
            <Box height={250}>
                <FriendChart ownStats={ownStats} friends={friends} friendIndex={friendIndex}/>
            </Box>

            <FriendFileMap friend={friends[friendIndex][3]}/>

        </Stack>
        
    </Box>
  )
}

export default FriendFile