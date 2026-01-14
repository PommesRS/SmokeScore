import React, { useRef, useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom';
import * as maptilersdk from '@maptiler/sdk';
import PropTypes from 'prop-types';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';
import { Box, SwipeableDrawer, Typography, Stack, IconButton, useTheme, Paper, Button, Divider, Snackbar} from '@mui/material';
import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
import AdjustIcon from '@mui/icons-material/Adjust';
import CheckIcon from '@mui/icons-material/Check';
import { useUserAuth } from '../context/userAuthConfig.jsx';
import { db } from '../firebase.js';
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

var friendMarkers = []

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
  const [badgeOpen, setBadgeOpen] = useState(false)
  const [badgeMessage, setBadgeMessage] = useState('Neues Abzeichen Freigeschaltet!')
  const navigate = useNavigate();
  

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
      
      try{
        locMarker.current = new maptilersdk.Marker({element: ownMarker})
        .setLngLat([coords?.longitude, coords?.latitude])
        .addTo(map.current)

      }catch (err) {

      }
      

    }else {

          /* other Markers */

    const docRef = await doc(db, "Users", user.uid)
    const g = (await getDoc(docRef)).data().geoLocations
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

    if (friends.length > 0) {
      const docRefFriend = doc(db, "Users", friends[i][0])
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
    async function updateBadge(progress, level, badgeId, levelCap) {
      await runTransaction(db, async(tx) => {
        const docRef = doc(db, 'Users', user.uid, 'Badges', badgeId)
        const badge = (await tx.get(docRef)).data()

        if (typeof badge !== 'undefined') {
          if (badge.level == 0 && level > 0) {
            setBadgeOpen(true)
            setBadgeMessage('Neues Abzeichen Freigeschaltet!')
            console.log('new badge unlocked: ', badgeId)
          }
          else if(badge.level < level){
            setBadgeOpen(true)
            setBadgeMessage('Neues Abzeichen Level Freigeschaltet!')
            console.log('new level on badge unlocked: ', badgeId)

          }
        }else {

        }

        tx.set(docRef, {
          level: level,
          progress: progress,
          id: badgeId,
          levelCap: levelCap
        })
        setBadgeCalcLoading(false)
        setBadgeCalcError('Punkt wurde erfolgreich zu der Statistik hinzugefügt!')
      })
    }

    await runTransaction(db, async (tx) => {
      const docRef = doc(db, "Users", user.uid, 'Stats', 'main')
      const stats = (await tx.get(docRef)).data()
      const smokeMetaData = await maptilersdk.geocoding.reverse([o.lng, o.lat])
      const height = await maptilersdk.elevation.at([o.lng, o.lat])

      var city
      if (smokeMetaData.features.find(el => el.place_type[0] === 'municipality')) {
        city = smokeMetaData.features.find(el => el.place_type[0] === 'municipality').text
      }else if (smokeMetaData.features.find(el => el.place_type[0] === 'county')) {
        city = smokeMetaData.features.find(el => el.place_type[0] === 'county').text
      }else if (smokeMetaData.features.find(el => el.place_type[0] === 'region')) {
        city = smokeMetaData.features.find(el => el.place_type[0] === 'region').text
      }

      //const city = smokeMetaData.features.filter(el => {return el.place_type[0] === 'city'})[0].text
      const country = smokeMetaData.features.filter(el => {return el.place_type[0] === 'country'})[0].text
      
      const isNewHeight = height[2] >= 150
      const isNewCity = !stats?.visitedCities?.includes(city)
      const isNewCountry = !stats?.visitedCountries?.includes(country)
      const isNightCig = dayjs().format('HH') > 16 || dayjs().format('HH') < 5
      console.log(stats)

      if (typeof stats === 'undefined') {
        tx.set(docRef, {
          visitedCities: isNewCity ? [city] : [],
          visitedCountries: isNewCountry ? [country] : [],
          nightCigs: isNightCig ? 1 : 0,
          withFriend: {friends: [], amount: 0},
          over150M: 0,
        })

        // tx.set(docRef, {
        //   visitedCities: isNewCity ? arrayUnion(city) : stats?.visitedCities,
        //   visitedCountries: isNewCountry ? arrayUnion(country) : stats?.visitedCountries,
        //   nightCigs: isNightCig ? stats?.nightCigs + 1 : stats?.nightCigs
        // })
      }else{
        tx.update(docRef, {
          visitedCities: isNewCity ? [...stats?.visitedCities, city] : stats?.visitedCities,
          visitedCountries: isNewCountry ? [...stats?.visitedCountries, country] : stats?.visitedCountries,
          over150M: typeof stats?.over150M !== 'undefined' ? isNewHeight ? stats?.over150M + 1 : stats?.over150M : isNewHeight ? 1 : 0,
        })
      }

      
    })

    await runTransaction(db, async (tx) => {
      const docRef = doc(db, "Users", user.uid, 'Stats', 'main')
      const statsNew = (await tx.get(docRef)).data()

      const badgeSnap = await getDocs(collection(db, "Badges"))
      
      badgeSnap.forEach((doc) => {
        const badge = doc.data()
        const criteriaField = badge.criteriaField
        //if(badge.id != 'nightowl') return

        let criteriaFieldValue 
        if (criteriaField.includes('.')) {
          const criteriaFieldPath = criteriaField.split('.')
          criteriaFieldValue = typeof statsNew[criteriaFieldPath[0]][criteriaFieldPath[1]] === 'number' ? statsNew[criteriaFieldPath[0]][criteriaFieldPath[1]] : statsNew[criteriaFieldPath[0]][criteriaFieldPath[1]].length
        }else{

          criteriaFieldValue = typeof statsNew[criteriaField] === 'number' ? statsNew[criteriaField] : statsNew[criteriaField].length 
        }
        let newBadgeLevel = 0

        badge.levels.forEach((level) => {
          if (criteriaFieldValue >= level.value) {
            newBadgeLevel = level.level
          }
        })
        //console.log(criteriaFieldValue - badge.levels[newBadgeLevel > 0 ? newBadgeLevel - 1 : 0 ].value )

          if (criteriaFieldValue - badge.levels[newBadgeLevel > 0 ? newBadgeLevel - 1 : 0 ].value >= 0 && criteriaFieldValue < badge.levels[badge.levels.length - 1].value) {
            const progressSinceLevelUp = criteriaFieldValue - badge.levels[newBadgeLevel > 0 ? newBadgeLevel - 1 : 0 ].value
            const progressNeededForLevelUp = badge.levels[newBadgeLevel > 0 ? newBadgeLevel : 0].value - badge.levels[newBadgeLevel > 0 ? newBadgeLevel - 1 : 0 ].value
            const progress = Math.round((progressSinceLevelUp / progressNeededForLevelUp) * 100)
            const badgeLevel = newBadgeLevel
            updateBadge(progress, badgeLevel, badge.id, progressNeededForLevelUp)
          }else if (!newBadgeLevel){
            const progressSinceLevelUp = criteriaFieldValue
            const progressNeededForLevelUp = badge.levels[newBadgeLevel].value
            const progress = Math.round((progressSinceLevelUp / progressNeededForLevelUp) * 100)
            const badgeLevel = newBadgeLevel

            updateBadge(progress, badgeLevel, badge.id, progressNeededForLevelUp)
          }else if(criteriaFieldValue - badge.levels[newBadgeLevel > 0 ? newBadgeLevel - 1 : 0 ].value >= 0 && criteriaFieldValue >= badge.levels[badge.levels.length - 1].value) {
            const progress = 0
            const badgeLevel = newBadgeLevel
            const progressNeededForLevelUp = 0
            updateBadge(progress, badgeLevel, badge.id, progressNeededForLevelUp)
          }
      })
    })
  }
  
  const handleBadgeAlertClose = () => {
    setBadgeOpen(false)
  }        


      return (
        <>
          <Snackbar
            open={badgeOpen}
            onClose={handleBadgeAlertClose}
            message={
              <Stack gap={1} direction={'row'} display={'flex'} alignItems={'center'} justifyContent={'space-between'} sx={{width: '100%'}}>
                <Stack gap={1} direction={'row'} display={'flex'} alignItems={'center'} sx={{color: theme.palette.text.primary}}>
                  <MilitaryTechIcon /> {badgeMessage}
                </Stack>
                <Button variant='contained' sx={{color: theme.palette.text.primary, ':focus': {outline: 'none'}}} onClick={() => {navigate('/stats'); callback()}}>ansehen</Button>
              </Stack>
            }
            autoHideDuration={5000}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            sx={{color: 'red', '& .MuiPaper-root': {background: theme.palette.background.gradient, width: '100%'}, '& .MuiSnackbarContent-message': {width: '100%'}}}
            />
          <Stack zIndex={'4'} top={15} left={0} right={0} position={'absolute'} direction={'row'} overflowX={'hidden'} textOverflow={'ellipsis'} gap={2} justifyContent={'center'} alignItems={'center'} sx={{pointerEvents: 'none'}}>
            <IconButton onClick={() => {handleFriendSwitch('down')}} color='inherit' sx={{":focus": {outline: 'none'}, pointerEvents: 'all'}}><ArrowBackIosIcon/></IconButton>
            <Typography height={'auto'} maxWidth={'40vw'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative', }}>{
            friends.length > 0 ? friends[friendIndex][1] : 'no friends'
            }</Typography>
            <IconButton onClick={() => {handleFriendSwitch('up')}}  color='inherit' sx={{":focus": {outline: 'none'}, pointerEvents: 'all'}}><ArrowForwardIosIcon/></IconButton>
          </Stack>
            <Stack zIndex={'5'} position={'absolute'} top={80} left={20} sx={{pointerEvents: 'none', background: theme.palette.background.paper, borderRadius: 1, overflow: 'hidden',  maxWidth: '90vw'}}  pl={'40px'} pr={2} py={1} >
              <Typography sx={{ position: 'relative', ':before': { zIndex: '100', width: '20px', height: '5px', content: '" "', background: 'linear-gradient(90deg, rgb(136, 120, 251) 0%, rgb(120, 252, 215) 100%)', position: 'absolute', left: '-30px', top:'50%', transform: 'translate(0px, -50%)', borderRadius: '100px' }}}>Du</Typography>
              <Typography sx={{ position: 'relative',  ':before': { zIndex: '10', width: '20px', height: '5px', content: '" "', background: 'linear-gradient(90deg, rgb(133, 3, 37) 0%, rgb(186, 204, 3) 100%)', position: 'absolute', left: '-30px', top:'50%', transform: 'translate(0px, -50%)', borderRadius: '100px' }}}>
                  
                  <Typography component={'span'} sx={{whiteSpace:'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%'}}>{friends.length > 0 ? friends[friendIndex][1]: 'Loading...'}</Typography>
              </Typography>
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
                height: '50vh', 
                overflow: 'auto',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8, 
                background: ''
                }}>
                <Puller />
                <Stack paddingTop={3} gap={2}>
                  
                  <Typography color='#fff'>{drawerProps.lat} // {drawerProps.lng}</Typography>
                  <Typography color='#fff'>{drawerProps.amount > 1 ? `${drawerProps.friend ? drawerProps.friend + ' hat' : 'Du hast'} an diesem Ort bis jetzt ${drawerProps.amount} Zigaretten geraucht.` : `An diesem Ort wurde bis jetzt eine Zigarette geraucht.`}</Typography>
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
                </Stack>
                
              </StyledBox>
            </SwipeableDrawer>
        </>
      );
}

export default Map