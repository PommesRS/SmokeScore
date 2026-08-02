import React, {useEffect, useRef} from 'react'
import { 
  Box, IconButton, List, DialogTitle, Dialog, Paper, Input, 
  InputAdornment, ListItem, ListItemText, ListItemButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox,
  Typography, Stack, Snackbar, Alert, DialogActions, DialogContent, DialogContentText, Button,
  getFormControlLabelUtilityClasses, useTheme, LinearProgress, SwipeableDrawer, Popover, Divider
} from '@mui/material'
import { db, storage } from '../../firebase.js';
import { collection, where, getDocs, query, updateDoc, arrayUnion, doc, getDoc, arrayRemove, onSnapshot, deleteDoc, Timestamp } from "@firebase/firestore";
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { useUserAuth } from '../../context/userAuthConfig.jsx';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import WhatshotIcon from '@mui/icons-material/Whatshot';

export const CustomTag = ({value}) => {
  const theme = useTheme()
  return (
    <Typography flexGrow={1} textAlign={'center'} border={'2px solid' + theme.palette.secondary.main} position={'relative'} borderRadius={'53px'} px={3}>
      {value}
    </Typography>
  )
}

const FriendBadge = ({friends, friendIndex}) => {
    const theme = useTheme()
    const { user } = useUserAuth();
    const map = useRef(null)
    const mapContainer = useRef(null)

    useEffect(() => {
        if(typeof friends[friendIndex][3] !== 'undefined') { 
    
            const mapCoords = friends[friendIndex][3]
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
    }, [friendIndex])

  return (
    <Box height={'100%'} maxHeight={'200vh'} width={'inherit'} mb={9} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent={'center'}>
        <Box height={'75%'} width={'100%'} position={'relative'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent={'center'} sx={{
            background: theme.palette.background.gradient,
            borderRadius: '52px', 
            boxShadow: '5px 5px 10px 0px rgba(0, 0, 0, 1)',
            '&::before': {
              content : '" "',
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '30%',
              maxWidth: '200px',
              height: '15px',
              bgcolor: 'background.default',
              zIndex: '1',
              borderRadius: '25px',
            },
            '&::after': {
              content : '" "',
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '20px',
              maxWidth: '200px',
              height: '20px',
              bgcolor: 'background.default',
              zIndex: '1',
              borderRadius: '19px',
            }
          }}>
          <Stack spacing={5} paddingY={7} position={'relative'} height={'100%'} width={'inherit'} direction={'column'} textOverflow={'ellipsis'} justifyContent={'center'} alignItems={'center'} sx={{justifyContent: 'space-between'}}>
            <Stack useFlexGap spacing={2} direction={'row'} width={'90%'} justifyContent={''} alignItems={'center'} sx={{ flexWrap: 'wrap', pt: '30px'}}>
              {friends.length == 0 ? 'loading' : friends[friendIndex][5] ? 
                <>
                  <CustomTag value={friends[friendIndex][5].tobacco}></CustomTag>
                  <CustomTag value={friends[friendIndex][5].cigType}></CustomTag>
                </> : <></>
              }
            </Stack>

            <Stack direction={'column'} justifyContent={'center'} alignItems={'center'} sx={{justifyContent: 'space-between'}}>
              <Typography textAlign={'center'} fontWeight={800} lineHeight={'80%'} fontSize={'100pt'} sx={{textShadow: '6px 6px 4px rgba(0, 0, 0, 0.25)'}}>{friends.length != 0 ? friends[friendIndex][4] : 'loading'}</Typography>
              <Typography display={'flex'} textAlign={'center'}>Kippen insgesamt geraucht</Typography>
              {friends[friendIndex][8] && (
                <React.Fragment>
                  <Divider sx={{height: 20}}/>
                  <Stack direction={'row'} justifyContent={'center'} alignItems={'center'}>
                    <WhatshotIcon sx={{fontSize: '50pt', filter: 'drop-shadow(6px 6px 4px rgba(0, 0, 0, 0.25))'}}/>
                    <Typography textAlign={'center'} fontWeight={700} lineHeight={'80%'} fontSize={'50pt'} sx={{textShadow: '6px 6px 4px rgba(0, 0, 0, 0.25)', pr: 10/4}}>{friends.length != 0 ? friends[friendIndex][8] : 'loading'}</Typography>
                  </Stack>
                  <Typography display={'flex'} textAlign={'center'}>Aktuelle Streak</Typography>
                </React.Fragment>
              )}
            </Stack>
            
            <Box height={'10rem'} width= {'90%'} display={'flex'} position={'relative'} borderRadius={'27px'} alignItems="center" justifyContent="center" marginBottom={'20px'} sx={
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
                <Typography display={'flex'} alignItems={'center'}><PersonPinCircleIcon/>{friends.length != 0 ? typeof friends[friendIndex][3] !== 'undefined' ? friends[friendIndex][3].street : 'noch kein Ort gespeichert' : 'loading...'}</Typography>
                <Typography textAlign={'right'}>{friends.length != 0 ? typeof friends[friendIndex][3] !== 'undefined' ? friends[friendIndex][3].amount : '0' : 'loading...'}</Typography>
              </Stack>
            </Box>

          </Stack>
        </Box>
      </Box> 
  )
}

export default FriendBadge