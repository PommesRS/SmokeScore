import React, { useRef, useEffect, useState } from 'react'
import * as maptilersdk from '@maptiler/sdk';
import PropTypes from 'prop-types';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';
import { Box, SwipeableDrawer, Typography, Stack, IconButton } from '@mui/material';
import { useUserAuth } from '../context/userAuthConfig.jsx';
import { db } from '../firebase.js';
import { collection, getCountFromServer, doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "@firebase/firestore";
import { point, buffer, bbox } from '@turf/turf';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
  const map = useRef(null);
  const [drawerProps, setDrawerProps] = useState({})
  const { user } = useUserAuth();
  const falkensee = { lng: 13.091315, lat: 52.560042 };
  const zoom = 12;
  maptilersdk.config.apiKey = '4G5717HLSk8wemu4bJUR';

  useEffect(() => {
      if (map.current) return; // stops map from intializing more than once

      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: '59d38153-6ea3-464a-b3c9-2e869c449863',
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

  async function getMarkers() {
    const docRef = await doc(db, "Users", user.uid)
    const g = (await getDoc(docRef)).data().geoLocations
    

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

    //console.log(bbox2)

    
    // Draw Debug Bounding Box
    /*
    const o = point([52.547504, 13.071575])
    var buffer2 = buffer(o, 80, {units: 'meters'});
    var bbox2 = bbox(buffer2);
    new maptilersdk.Marker({color: "#FF"})
    .setLngLat([bbox2[1], bbox2[0]])
    .addTo(map.current);

    new maptilersdk.Marker({color: "#FFF"})
    .setLngLat([bbox2[3],bbox2[2]])
    .addTo(map.current); 
    */
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
  

      return (
        <>
            <Stack zIndex={'4'} top={15} left={0} right={0} position={'absolute'} direction={'row'} overflowX={'hidden'} textOverflow={'ellipsis'} gap={2} justifyContent={'center'} alignItems={'center'}>
              <IconButton onClick={() => {handleFriendSwitch('down')}} color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowBackIosIcon/></IconButton>
              <Typography height={'auto'} maxWidth={'40vw'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative', }}>{
              friends.length > 0 ? friends[friendIndex][1] : 'no friends'
              }</Typography>
              <IconButton onClick={() => {handleFriendSwitch('up')}}  color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowForwardIosIcon/></IconButton>
             </Stack>
            <Box sx={{zIndex: '3',left: '50%', transform: 'translate(-50%)', top: '-0%', height: '200px', width: '100%',position: 'absolute', background: 'linear-gradient(180deg, rgba(19, 8, 58, 01), rgba(170, 20, 240, 0))', filter: 'blur(00px)'}}></Box>
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
                  <Typography color='#fff'>{drawerProps.amount > 1 ? `${drawerProps.friend ? drawerProps.friend + ' hat' : 'Du hast'} an diesem Ort wurden bis jetzt ${drawerProps.amount} Zigaretten geraucht.` : `An diesem Ort wurde bis jetzt eine Zigarette geraucht.`}</Typography>
                </Stack>
                
              </StyledBox>
            </SwipeableDrawer>
        </>
      );
}

export default Map