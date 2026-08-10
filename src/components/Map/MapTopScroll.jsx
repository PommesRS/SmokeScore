import React from 'react'
import { Box, Stack, Typography, Switch, useTheme, ButtonBase } from '@mui/material'
import { SmokingRooms, NearMe } from '@mui/icons-material'
import MapMarkerOwnershipIndicator from './MapMarkerOwnershipIndicator'
import { useAppState } from '../../context/appState'


const MapTopScroll = ({ownMarkerLoading, friendMarkerLoading, friendName, handleJumpToFriend, canJumpToFriend}) => {
    const theme = useTheme()
    const appState = useAppState()
    
  return (

        <Stack className='hide-scrollbar' px={3/2} gap={2} alignItems={'center'} direction={'row'} position={'absolute'} top={85} maxWidth={'100%'} height={'40px'}>

            <Stack minWidth={'fit-content'} zIndex={'5'} direction={'row'} gap={6} minHeight={'100%'} sx={{background: theme.palette.background.paper, borderRadius: 10, overflow: 'hidden',  maxWidth: '90vw'}} pl={'40px'} pr={2} py={1} >
                <MapMarkerOwnershipIndicator loading={ownMarkerLoading} gradProps={'linear-gradient(90deg, rgb(136, 120, 251) 0%, rgb(120, 252, 215) 100%)'}>
                    <Typography component={'span'}>Du</Typography>
                </MapMarkerOwnershipIndicator>

                <MapMarkerOwnershipIndicator loading={friendMarkerLoading} gradProps={'linear-gradient(90deg, rgb(133, 3, 37) 0%, rgb(186, 204, 3) 100%)'}>
                    <Typography component={'span'} sx={{whiteSpace:'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%'}}>{friendName}</Typography>
                </MapMarkerOwnershipIndicator>
            </Stack>

            <Stack minWidth={'fit-content'} zIndex={'5'} direction={'row'} justifyContent={'center'} alignItems={'center'} px={3/2} minHeight={'100%'} sx={{ background: theme.palette.background.paper, borderRadius: 10, overflow: 'hidden'}} >
                <SmokingRooms fontSize='medium' />
                <Switch
                sx={{ alignSelf: 'center'}}
                checked={appState.counterVariant !== 1}
                onChange={() => {appState.counterVariant === 1 ? appState.setCounterVariantJoint() : appState.setCounterVariantCig() }}
                />
                <img src="./jointIcon.svg" alt="jointIcon" width={24} height={24} style={{ filter: 'invert(1)'}} />
            </Stack>
            {canJumpToFriend && (
                <ButtonBase component={Stack} onClick={handleJumpToFriend} disableRipple={false} gap={1} zIndex={'5'} direction={'row'} justifyContent={'center'} alignItems={'center'} sx={{px: 3/2, borderRadius: 100, minWidth: 'fit-content', height: '100%', overflow:'hidden', background: theme.palette.background.paper}}>
                    <NearMe fontSize='medium' />
                    <Typography>zu {friendName} springen</Typography>
                </ButtonBase>
            )}


        </Stack>
    
  )
}

export default MapTopScroll