import React, { useRef, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {useNavigate} from 'react-router-dom';
import * as maptilersdk from '@maptiler/sdk';
import PropTypes from 'prop-types';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';
import { PersonPinCircle } from '@mui/icons-material';
import { Box, SwipeableDrawer, Typography, Stack, IconButton, useTheme, Paper, Button, Divider, Snackbar, Switch, CircularProgress} from '@mui/material';
import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
import AdjustIcon from '@mui/icons-material/Adjust';
import CheckIcon from '@mui/icons-material/Check';
import { useUserAuth } from '../../context/userAuthConfig.jsx';
import { db } from '../../firebase.js';
import { collection, getCountFromServer, doc, getDoc, getDocs, runTransaction} from "@firebase/firestore";
import { point, buffer, bbox } from '@turf/turf';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { useGeolocated } from "react-geolocated";
import dayjs from 'dayjs';
import { useUserBadges } from '../../context/userBadges.jsx';
import { useAppState } from '../../context/appState.jsx';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import { useUserData } from '../../context/userData.jsx';
import MapMarkerOwnershipIndicator from './MapMarkerOwnershipIndicator.jsx';
import MapTopScroll from './MapTopScroll.jsx';

var friendMarkers = []
var ownMarkers = []
var friendLocationMarker

export const drawerBleeding = 56;

export const Puller = styled('div')(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: grey[300],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
  ...theme.applyStyles('dark', {
    backgroundColor: grey[900],
  }),
}));

export const StyledBox = styled('div')(({ theme }) => ({
  backgroundColor: '#0B0B12',
}));

const Root = styled('div')(({ theme }) => ({
  height: '100%',
  backgroundColor: grey[100],
  ...theme.applyStyles('dark', {
    backgroundColor: theme.palette.background.default,
  }),
}));

const Map = (props) => {
  const { window, callback } = props;
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState([])
  const [friendIndex, setFriendIndex] = useState(0)
  const mapContainer = useRef(null);
  const locMarker = useRef(null);
  const map = useRef(null);
  const [drawerProps, setDrawerProps] = useState({})
  const { user } = useUserAuth();
  const { userData } = useUserData();
  const theme = useTheme()
  const falkensee = { lng: 13.091315, lat: 52.560042 };
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
  useGeolocated({
      positionOptions: {
          enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
  });
  const zoom = 12;
  maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_apiKey;
  var mapStyle = '59d38153-6ea3-464a-b3c9-2e869c449863'
  const [badgeCalcLoading, setBadgeCalcLoading] = useState(false)
  const [badgeCalcError, setBadgeCalcError] = useState('')
  const badgeContext = useUserBadges();
  const navigate = useNavigate();
  const { counterVariant, setCounterVariantCig, setCounterVariantJoint } = useAppState()
  const [friendMarkerLoading, setFriendMarkerLoading] = useState(true)
  const [ownMarkerLoading, setOwnMarkerLoading] = useState(true)

  useEffect(() => {
      if (map.current) return; // stops map from intializing more than once

      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        //style: '59d38153-6ea3-464a-b3c9-2e869c449863',
        style: mapStyle,
        center: [falkensee.lng, falkensee.lat],
        zoom: zoom,
        navigationControl: false
      });

  }, [falkensee.lng, falkensee.lat, zoom]);

  useEffect(() => {
    getMarkers()
  }, [])

  useEffect(() => {
    getMarkers()
  },[counterVariant])

  useEffect(() => {
    setFriends([])
    getFriendsIDs().then((result) => {
      getFriendsFull(result)
    })
  }, [user])

  useEffect(() => {
    
    getMarkers(true)
  }, [coords])

  async function getFriendsIDs() {
      const uid = user.uid
      const docRef = doc(db, "Users", uid)
      return (await getDoc(docRef)).data().Friends
  }
  
  async function getFriendsFull(friendArr) {

    var cacheFriends = new Array();

    await Promise.all(friendArr.map(async (friend) => {
      const uid = friend
      const docRef = doc(db, "Users", uid)
      const friendData = (await getDoc(docRef)).data()

      const friendName = friendData.displayName
      const friendPos = friendData.lastKnownPos
      const friendSharesPos = typeof friendData.sharesPostion === 'undefined' ? true : friendData.sharesPostion
      cacheFriends.push([friend, friendName, friendPos, friendSharesPos])
    }))

    setFriends(cacheFriends)
  }

  const handleFriendSwitch = (direction) => {
    if (direction == 'up') {
      if (friendIndex < friends.length - 1 ) {
        console.log(friendIndex)
        setFriendIndex(friendIndex + 1)
      }
    } else if (direction == 'down') {
      if (friendIndex > 0) {
        setFriendIndex(friendIndex - 1)
      }
    }
  }

  async function getMarkers(isOwnMarker) {
    setOwnMarkerLoading(true)

    /* Intialize position marker */
    
    if(isOwnMarker){
      if (locMarker.current) {
        locMarker.current.remove()
      }

      var ownMarkerDiv = document.createElement('div');

      var ownMarker = document.createElement('img');
      ownMarkerDiv.appendChild(ownMarker)
      ownMarker.src = 'ownPosition.svg';
      ownMarker.style.width = '20px';
      ownMarker.style.height = '20px';
      
      try{
        locMarker.current = new maptilersdk.Marker({element: ownMarker})
        .setLngLat([coords?.longitude, coords?.latitude])
        .addTo(map.current)

      }catch (err) {

      }
      

    }else {

    /* other Markers */
    
    ownMarkers.forEach(marker => {
      try {
        marker.remove()
      } catch (error) {
        console.log(error)
      }
    })
    
    const g = counterVariant === 1 ? userData?.geoLocations  : userData?.jointLocations
    
    if(typeof g === 'undefined') {
      setOwnMarkerLoading(false)
      return
    }

    g.sort((a,b) => {
      return b.amount - a.amount
    })

    g.forEach((loc, index) => {

      var elDiv = document.createElement('div');

      var el = document.createElement('img');
      elDiv.appendChild(el)
      el.src = 'pin.svg';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.translate= '0px -50%'

      el.addEventListener('click', function () {
          setOpen(true)
          setDrawerProps({
            lat: loc.point._lat,
            lng: loc.point._long,
            amount: loc.amount
          })
      });

      ownMarkers.push(new maptilersdk.Marker({element: el})
      .setLngLat([loc.point._long,loc.point._lat])
      .addTo(map.current))
    });
    }
    setOwnMarkerLoading(false)
  }

  useEffect(() => {
    getFriendMarkers(friendIndex)
  }, [friendIndex, friends, counterVariant])

  async function getFriendMarkers(i) {
    setFriendMarkerLoading(true)
    friendMarkers.forEach(marker => {
      try {
        marker.remove()
      } catch (error) {
        console.log(error)
      }
    })

    if (friends.length > 0) {
      const docRefFriend = doc(db, "Users", friends[i][0])
      const t = counterVariant === 1 ? (await getDoc(docRefFriend)).data().geoLocations : (await getDoc(docRefFriend)).data().jointLocations
      
      if(typeof t === 'undefined') {
      setFriendMarkerLoading(false)
      return
    }

      if (t.length > 0) {
        falkensee.lng = 13.091314 
        t.forEach(loc => {
          var elDiv = document.createElement('div');
    
          var el = document.createElement('img');
          elDiv.appendChild(el)
          el.src = 'pinFriend.svg';
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.translate= '0px -50%'
          el.style.filter = 'invert(100%)'
    
          el.addEventListener('click', function () {
              setOpen(true)
              setDrawerProps({
                friend: friends[i][1],
                lat: loc.point._lat,
                lng: loc.point._long,
                amount: loc.amount
              })
          });
    
          friendMarkers.push(new maptilersdk.Marker({element: el}).setLngLat([loc.point._long,loc.point._lat]).addTo(map.current))

        });
      }
    }

    setFriendMarkerLoading(false)
  }
    
  /*
  // Bottom Drawer
  */
  const container = window !== undefined ? () => window().document.body : undefined;
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
    setBadgeCalcError('')
  };

  const handleMapStyleSwitch = () => {
    if (mapStyle === '59d38153-6ea3-464a-b3c9-2e869c449863') {
      map.current.setStyle(maptilersdk.MapStyle.SATELLITE)
      mapStyle = 'satellite'
    } else {
      map.current.setStyle('59d38153-6ea3-464a-b3c9-2e869c449863')
      mapStyle = '59d38153-6ea3-464a-b3c9-2e869c449863'
      
    }
  }

  const jumpToLoc = () => {
    getMarkers(true)
    if (map.current) {
      map.current.flyTo({ center: [coords.longitude, coords.latitude], zoom: 16, speed: 2})
    }
  }

  async function badgeFlow(o) {
    setBadgeCalcLoading(true)
    await badgeContext.updateStats([o?.lat, o?.lng])
    setBadgeCalcLoading(false)
    setBadgeCalcError('Punkt wurde erfolgreich zu der Statistik hinzugefügt!')
  }
  
  const handleBadgeAlertClose = () => {
    setBadgeOpen(false)
  }
  
  const handleJumpToFriend = () => {
    console.log('sack')

    var elDiv = document.createElement('div');
    
    createRoot(elDiv).render(
      <>
        <Stack justifyContent={'center'} alignItems={'center'} sx={{transform: 'translateY(-50%)'}}>
          <Typography>{friends[friendIndex][1]}</Typography>
          <PersonPinCircle fontSize='large'/>
        </Stack>
      
      </>
    )

    var time = "Fehler beim Laden der Zeit";

    if(typeof friends[friendIndex][2].timestamp !== 'undefined'){
      const isToday = dayjs(friends[friendIndex][2].timestamp.toDate()).get('date') == dayjs().get('date')
      const isYesterday = dayjs(friends[friendIndex][2].timestamp.toDate()).get('date') == dayjs().subtract(1, 'day').get('date')
      //dayjs(friends[friendIndex][2].timestamp.toDate())
  
      
      if(isToday){
        time = "Zuletzt heute um " + dayjs(friends[friendIndex][2].timestamp.toDate()).format('HH:mm')  + " aktualisiert."
      }else if(isYesterday){
        time = "Zuletzt gestern um " + dayjs(friends[friendIndex][2].timestamp.toDate()).format('HH:mm')  + " aktualisiert."
      } else {
        time = "Zuletzt am " + dayjs(friends[friendIndex][2].timestamp.toDate()).format('DD.MM.') + " um " + dayjs(friends[friendIndex][2].timestamp.toDate()).format('HH:mm')  + " aktualisiert."
      }
    }

    elDiv.addEventListener('click', function () {
      setOpen(true)
      setDrawerProps({
        friend: friends[friendIndex][1],
        lat: friends[friendIndex][2].point?._lat || friends[friendIndex][2]._lat,
        lng: friends[friendIndex][2].point?._long || friends[friendIndex][2]._long,
        amount: 1,
        additionalInfo: {
          time: time
        }
      })
    })

    if(friendLocationMarker){
      friendLocationMarker.remove()
    }

    if (map.current) {
      map.current.flyTo({ center: [friends[friendIndex][2].point?._long || friends[friendIndex][2]._long, friends[friendIndex][2].point?._lat || friends[friendIndex][2]._lat], zoom: 16, speed: 2})
      friendLocationMarker = new maptilersdk.Marker({element: elDiv}).setLngLat([friends[friendIndex][2].point?._long || friends[friendIndex][2]._long, friends[friendIndex][2].point?._lat || friends[friendIndex][2]._lat]).addTo(map.current)
    }
  }


      return (
        <>
          <Snackbar
            open={badgeContext.badgeOpen}
            onClose={badgeContext.handleBadgeAlertClose}
            message={
              <Stack gap={1} direction={'row'} display={'flex'} alignItems={'center'} justifyContent={'space-between'} sx={{width: '100%'}}>
                <Stack gap={1} direction={'row'} display={'flex'} alignItems={'center'} sx={{color: theme.palette.text.primary}}>
                  <MilitaryTechIcon /> {badgeContext.badgeMessage}
                </Stack>
                <Button variant='contained' sx={{color: theme.palette.text.primary, ':focus': {outline: 'none'}}} onClick={() => {navigate('/stats'); callback('stats')}}>ansehen</Button>
              </Stack>
            }
            autoHideDuration={5000}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            sx={{color: 'red', '& .MuiPaper-root': {background: theme.palette.background.gradient, width: '100%'}, '& .MuiSnackbarContent-message': {width: '100%'}}}
            />
          <Stack zIndex={'4'} top={15} left={0} right={0} position={'absolute'} direction={'row'} textOverflow={'ellipsis'} gap={2} justifyContent={'center'} alignItems={'center'} sx={{pointerEvents: 'none'}}>
            <IconButton onClick={() => {handleFriendSwitch('down')}} color='inherit' sx={{":focus": {outline: 'none'}, pointerEvents: 'all'}}><ArrowBackIosIcon/></IconButton>
            <Typography height={'auto'} maxWidth={'40vw'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative', }}>{
            friends.length > 0 ? friends[friendIndex][1] : 'no friends'
            }</Typography>
            <IconButton onClick={() => {handleFriendSwitch('up')}}  color='inherit' sx={{":focus": {outline: 'none'}, pointerEvents: 'all'}}><ArrowForwardIosIcon/></IconButton>
          </Stack>

          <MapTopScroll ownMarkerLoading={ownMarkerLoading} handleJumpToFriend={handleJumpToFriend} friendMarkerLoading={friendMarkerLoading} friendName={friends.length > 0 ? friends[friendIndex][1]: 'Loading...'} canJumpToFriend={friends.length > 0 ? friends[friendIndex][3] : true}/>

          <Box zIndex={'5'} position={'absolute'} bottom={80} right={20}>
            <Stack gap={2}>
                <IconButton loading={!coords} onClick={jumpToLoc} size='large' sx={{":hover": {backgroundColor: (theme) => theme.palette.primary.main} ,":focus": {outline: 'none'}, backgroundColor: (theme) => theme.palette.primary.main}} color='white' aria-label="addFriend">
                  <AdjustIcon  fontSize='large'/>
                </IconButton>
                <IconButton onClick={handleMapStyleSwitch} size='large' sx={{":hover": {backgroundColor: (theme) => theme.palette.primary.main} ,":focus": {outline: 'none'}, backgroundColor: (theme) => theme.palette.primary.main}} color='white' aria-label="addFriend">
                  <ModeOfTravelIcon  fontSize='large'/>
                </IconButton>
            </Stack>
          </Box>
            <Box sx={{pointerEvents: 'none' ,zIndex: '3',left: '50%', transform: 'translate(-50%)', top: '-0%', height: '200px', width: '100%', position: 'absolute', background: theme.palette.background.transparentGradient}}></Box>
            <Box height={'100vh'} width={'100%'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
                <div ref={mapContainer} className="map-wrapper" />
            </Box>
            <SwipeableDrawer
              anchor="bottom"
              open={open}
              onClose={toggleDrawer(false)}
              onOpen={toggleDrawer(true)}
              swipeAreaWidth={drawerBleeding}
              disableSwipeToOpen={true}
              keepMounted
              PaperProps={{
                sx: {
                  background: 'transparent'
                }
              }}
              sx={{background: 'transparent'}}
            >
              
              <StyledBox sx={{ 
                px: 2, 
                pb: 2, 
                height: '50vh', 
                overflow: 'auto',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8, 
                background: ''
                }}>
                <Puller />
                <Stack paddingTop={3} gap={2}>
                  
                  <Typography color='#fff'>{drawerProps.lat} // {drawerProps.lng}</Typography>
                  {typeof drawerProps?.additionalInfo === 'undefined' ? 
                    (
                      <>
                        <Typography color='#fff'>{drawerProps.amount > 1 ? `${drawerProps.friend ? drawerProps.friend + ' hat' : 'Du hast'} an diesem Ort bis jetzt ${drawerProps.amount} Zigaretten geraucht.` : `An diesem Ort wurde bis jetzt eine Zigarette geraucht.`}</Typography>
                      </>
                    ) : (
                      <>
                      <Typography color='#fff'>An diesem Ort hat {drawerProps.friend} zuletzt Smokescore benutzt.</Typography>
                      </>
                    )
                  }
                  <Divider></Divider>
                  {!drawerProps.friend && (
                    <>
                      <Typography textAlign={'center'} color={grey[500]}>Abzeichenstatistik mit diesem Punkt neu berechnen</Typography>
                      <Button loading={badgeCalcLoading} onClick={() => badgeFlow(drawerProps)} variant='contained' sx={{':focus': {outline:'none'}}}>neu berechnen</Button>
                      {badgeCalcError.trim() && (
                        <Stack direction={'row'} gap={0.5} display={'felx'} alignItems={'center'} justifyContent={'center'}>
                          <CheckIcon color='success'/>
                          <Typography color={'success'}>{badgeCalcError}</Typography>
                        </Stack>
                      )}
                    </>
                  )}
                  {typeof drawerProps?.additionalInfo !== 'undefined' && (
                    <>
                      <Typography textAlign={'center'} color={grey[500]}>{drawerProps.additionalInfo?.time}</Typography>
                    </>
                  )}
                </Stack>
                
              </StyledBox>
            </SwipeableDrawer>
        </>
      );
}

export default Map