import React, { useRef, useEffect, useState } from 'react'
import * as maptilersdk from '@maptiler/sdk';
import PropTypes from 'prop-types';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';
import { Box, SwipeableDrawer, Typography, Stack, IconButton, useTheme } from '@mui/material';
import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
import AdjustIcon from '@mui/icons-material/Adjust';
import { useUserAuth } from '../context/userAuthConfig.jsx';
import { db } from '../firebase.js';
import { collection, getCountFromServer, doc, getDoc, orderBy} from "@firebase/firestore";
import { point, buffer, bbox } from '@turf/turf';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useGeolocated } from "react-geolocated";

var friendMarkers = []

const drawerBleeding = 56;

const Puller = styled('div')(({ theme }) => ({
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

const Root = styled('div')(({ theme }) => ({
  height: '100%',
  backgroundColor: grey[100],
  ...theme.applyStyles('dark', {
    backgroundColor: theme.palette.background.default,
  }),
}));

const StyledBox = styled('div')(({ theme }) => ({
  backgroundColor: '#0B0B12',
}));

const Map = (props) => {
  const { window } = props;
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState([])
  const [friendIndex, setFriendIndex] = useState(0)
  const mapContainer = useRef(null);
  const locMarker = useRef(null);
  const map = useRef(null);
  const [drawerProps, setDrawerProps] = useState({})
  const { user } = useUserAuth();
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

      getMarkers()

  }, [falkensee.lng, falkensee.lat, zoom]);

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

      const friendName = (await getDoc(docRef)).data().displayName
      cacheFriends.push([friend, friendName])
    }))

    setFriends(cacheFriends)
    console.log(cacheFriends)
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
      
      locMarker.current = new maptilersdk.Marker({element: ownMarker, draggable:true})
      .setLngLat([coords.longitude, coords.latitude])
      .addTo(map.current)

    }else {

          /* other Markers */

    const docRef = await doc(db, "Users", user.uid)
    const g = (await getDoc(docRef)).data().geoLocations
    console.log(g)
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

      new maptilersdk.Marker({element: el})
      .setLngLat([loc.point._long,loc.point._lat])
      .addTo(map.current)

    });

    }

  }

  useEffect(() => {
    getFriendMarkers(friendIndex)
  }, [friendIndex, friends])

  async function getFriendMarkers(i) {
    friendMarkers.forEach(marker => {
      try {
        marker.remove()
      } catch (error) {
        console.log(error)
      }
    })
    console.log(friends[i][0])
    const docRefFriend = await doc(db, "Users", friends[i][0])
    const t = (await getDoc(docRefFriend)).data().geoLocations

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
  
        friendMarkers.push(new maptilersdk.Marker({element: el})
        .setLngLat([loc.point._long,loc.point._lat])
        .addTo(map.current))
      });
    }

  }
    
  /*
  // Bottom Drawer
  */
  const container = window !== undefined ? () => window().document.body : undefined;
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
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

      return (
        <>
            <Stack zIndex={'4'} top={15} left={0} right={0} position={'absolute'} direction={'row'} overflowX={'hidden'} textOverflow={'ellipsis'} gap={2} justifyContent={'center'} alignItems={'center'} sx={{pointerEvents: 'none'}}>
              <IconButton onClick={() => {handleFriendSwitch('down')}} color='inherit' sx={{":focus": {outline: 'none'}, pointerEvents: 'all'}}><ArrowBackIosIcon/></IconButton>
              <Typography height={'auto'} maxWidth={'40vw'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative', }}>{
              friends.length > 0 ? friends[friendIndex][1] : 'no friends'
              }</Typography>
              <IconButton onClick={() => {handleFriendSwitch('up')}}  color='inherit' sx={{":focus": {outline: 'none'}, pointerEvents: 'all'}}><ArrowForwardIosIcon/></IconButton>
             </Stack>
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
                height: '40vh', 
                overflow: 'auto',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8, 
                background: ''
                }}>
                <Puller />
                <Stack paddingTop={3} gap={2}>
                  
                  <Typography color='#fff'>{drawerProps.lat} // {drawerProps.lng}</Typography>
                  <Typography color='#fff'>{drawerProps.amount > 1 ? `${drawerProps.friend ? drawerProps.friend + ' hat' : 'Du hast'} an diesem Ort bis jetzt ${drawerProps.amount} Zigaretten geraucht.` : `An diesem Ort wurde bis jetzt eine Zigarette geraucht.`}</Typography>
                </Stack>
                
              </StyledBox>
            </SwipeableDrawer>
        </>
      );
}

export default Map