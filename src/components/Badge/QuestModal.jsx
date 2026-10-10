import React from 'react'
import { SwipeableDrawer, useTheme, Box, Stack, Typography } from '@mui/material'
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';

export const Puller = styled('div')(({ theme }) => ({
    width: 50,
    height: 6,
    backgroundColor: grey[500],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 25px)'
}));

const QuestModal = ({onClose, open, quest, desc}) => {
    const theme = useTheme()
  return (
    <SwipeableDrawer 
        open={open} 
        anchor='bottom' 
        onClose={onClose} 
        keepMounted
        slotProps={{
            paper: {
                sx: {
                    background: 'transparent'
                }
            }
        }}
        sx={{background: 'transparent'}}>
        <Box px={2} pb={2} overflow={'auto'} borderRadius={'20px 20px 0 0'} bgcolor={theme.palette.background.paper}>
            <Puller />
            <Stack pt={4} gap={2} height={'100%'} >
                <Typography fontSize={20}>{quest.title}</Typography>
                <Typography fontSize={16} color={grey[500]}>{desc}</Typography>
                <Typography fontSize={16}>Belohnung: {quest.reward.smokeDollars} SmokeDollar</Typography>

            </Stack>
        </Box>
    </SwipeableDrawer>
  )
}

export default QuestModal