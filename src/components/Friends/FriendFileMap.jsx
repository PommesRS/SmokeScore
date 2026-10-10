import React, {useRef, useEffect} from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { PersonPinCircle } from '@mui/icons-material'
import * as maptilersdk from '@maptiler/sdk';


const FriendFileMap = ({friend}) => {
    const mapContainer = useRef(null)
    const map = useRef(null)

    useEffect(() => {
        if(typeof friend !== 'undefined') { 
    
            const mapCoords = friend
            if (map.current) {
            map.current.jumpTo({ center: [mapCoords.point._long, mapCoords.point._lat]})
            }
        
        
            map.current = new maptilersdk.Map({
            container: mapContainer.current,
            style: '59d38153-6ea3-464a-b3c9-2e869c449863',
            //style: mapStyle,
            center: [mapCoords.point._long, mapCoords.point._lat],
            zoom: 12,
            navigationControl: false
            });
        }else {
            map.current = new maptilersdk.Map({
            container: mapContainer.current,
            style: '59d38153-6ea3-464a-b3c9-2e869c449863',
            //style: mapStyle,
            zoom: 0,
            navigationControl: false
            });
        }
    }, [friend])

  return (
    <Box height={'10rem'} display={'flex'} position={'relative'} borderRadius={'27px'} alignItems="center" justifyContent="center" marginBottom={'20px'} sx={
        { '&::after': {
            content : '" "',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '100%',
            boxShadow: 'inset 0px -60px 10.3px -6px rgba(137, 121, 255, 0.2)',
            zIndex: '1',
            borderRadius: '25px',
        }, '&::before': {
            content : '" Beliebteste Location "',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 'auto',
            zIndex: '1',
            transform: 'translateY(-50%) translateX(20px)',
            fontSize: '15pt',
            textShadow: '4px 4px 4px #000'
        },
        boxShadow: '4px 6px 4px rgba(0, 0, 0, 0.52)'
        }
    }>
        <div ref={mapContainer} className='map-wrapper' style={{borderRadius: '27px'}}/>
        <img src="pin.svg" width={20} alt="pin" style={{position: 'absolute', transform: 'translateY(-50%)'}}/>
        <Stack direction={'row'} position={'absolute'} width={'90%'} sx={{justifyContent: 'space-between'}} bottom={'12%'} zIndex={2}>
            <Typography display={'flex'} alignItems={'center'}>
                <PersonPinCircle/>
                {typeof friend !== 'undefined' ? friend.street : 'noch kein Ort gespeichert'}
            </Typography>

            <Typography textAlign={'right'}>
                {typeof friend !== 'undefined' ? friend.amount : '0'}
            </Typography>
        </Stack>
    </Box>
  )
}

export default FriendFileMap