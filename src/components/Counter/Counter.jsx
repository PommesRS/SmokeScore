import React,{ useEffect, useState, useRef, useContext } from 'react'
import {useNavigate} from 'react-router-dom';
import {Container, Box, Button, Typography, Table, TableBody, 
  TableCell, CircularProgress,
  useTheme, Stack, Snackbar, Switch, Divider, Collapse
} from '@mui/material'
import ModeSwitcher from './ModeSwitcher.jsx';
import { tableCellClasses } from '@mui/material/TableCell';
import { ArrowForwardIos, PersonPinCircle } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { useUserAuth } from '../../context/userAuthConfig';
import { useAppState } from '../../context/appState';
import { useCounter } from '../../context/counterContext.jsx';
import { useUserBadges } from '../../context/userBadges.jsx';
import { useStreak } from '../../context/userStreak.jsx';
import { useNotification } from '../../context/notificationContext';
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc, increment, getDocs, query, onSnapshot, arrayUnion, GeoPoint, Timestamp, runTransaction } from "@firebase/firestore";
import { db } from '../../firebase';
import { AnimatedCounter } from  'react-animated-counter';
import '../../index.css'
import Confetti from 'react-confetti-boom';
//import { startOfWeek, endOfWeek, format, getDay, getYear, getMonth, toDate, set, constructNow } from 'date-fns'
import { Geolocation } from '@capacitor/geolocation';
import { useGeolocated } from "react-geolocated";
//import { point, buffer, bbox } from '@turf/turf';
import * as maptilersdk from '@maptiler/sdk';
import { styled } from '@mui/material/styles';
import { Navigate } from 'react-router-dom';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import {SpendingHistory, AdSense} from '../index.js'
import { useUserCollectables } from '../../context/userCollectables.jsx';
import SmokeEffect from './smokeEffect.jsx';
import { useUserInventory } from '../../context/userInventory.jsx';
import { useUserData } from '../../context/userData.jsx';
import { items } from '../Collectables/items.jsx';
import PetComponent from '../SmokePet/PetComponent.jsx';
import { quests } from '../Badge/questsDetails.jsx';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: 'var(--color)',
  },
  [`&.${tableCellClasses.body}`]: {
    color: 'var(--color)'
  },
}));

  

export function TextGradient({children}) {
    const theme = useTheme()
    return (
      
      <Typography 
        sx={{fontSize: '40pt', 
            fontWeight: 'bold', 
            background: theme.palette.background.gradient,
            backgroundSize: "100%",
            backgroundRepeat: "repeat",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            }}>
        {children}
      </Typography>
    );
  }

function Counter({callback}) {



  const [isExploding, setIsExploding] = useState(0)
  const [geolocation, setLocation] = useState([])
  const [nearbyStreet, setNearbyStreet] = useState(null)
  const [bGetCoords, setBGetCoords] = useState(true)
  const [loading, setLoading] = useState(true)
  const [doesLatestCigExist, setDoesLatestCigExist] = useState(true)
  const { badgeOpen, handleBadgeAlertClose } = useUserBadges()
  const [badgeMessage, setBadgeMessage] = useState('Neues Abzeichen Freigeschaltet!')
  const badgesContext = useUserBadges();
  const counterContext = useCounter();
  const streakContext = useStreak();
  //const [latestCigs, setLatestCigs] = useState([])
  const {coords, isGeolocationAvailable, isGeolocationEnabled } =
  useGeolocated({
      positionOptions: {
          enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
  });
  const [totalAmountSpend, setTotalAmountSpend] = useState(0)
  const [historyArr, setHistoryArr] = useState([])
  const [page, setPage] = useState(0); // aktuelle Seite
  const [rowsPerPage, setRowsPerPage] = useState(5); // Einträge pro Seite
  const [openPAdd, setOpenPAdd] = useState(false);
  const [product, setProduct] = useState('Tabak');
  const theme = useTheme()
  const [displayWoo, setDisplayWoo] = useState('none')
  const [confettiType, setConfettiType] = useState('fall')
  const navigate = useNavigate();
  const streakRef = useRef(null)
  const { counterVariant, setCounterVariantCig, setCounterVariantJoint } = useAppState()
  const { sendNotification } = useNotification()
  const collectables = useUserCollectables()
  const [snackOpen, setSnackOpen] = useState(false)
  const inventory = useUserInventory()
  const {userData} = useUserData()

  maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_apiKey;

  var latestCigsLocal = []

  const { user } = useUserAuth();

  const uID = user.uid;

  const getLatestCigs = async () => {
    const docRef = doc(db, "Users", uID)
    latestCigsLocal = (await getDoc(docRef)).data().latestCigs

    if (latestCigsLocal?.length > 0) {
      setDoesLatestCigExist(true)
    } else {
      setDoesLatestCigExist(false)
    }
  }

  async function location() {
    try {
      const results = await maptilersdk.geocoding.reverse([coords.longitude, coords.latitude]);
      const height = await maptilersdk.elevation.at([coords.longitude, coords.latitude])

      setNearbyStreet(results.features[0].text)
      setLocation([coords.latitude, coords.longitude,])
      setLoading(false)
      setBGetCoords(false)
    } catch (error) {
      
    }
  }
  
  useEffect(() => {
    location()
  }, [coords])

  useEffect(() => {
    callback('tracker')
  }, [])

  const handleAddCig = async () => {
    if (loading) return;

    setLoading(true)
    //await incrementCounter()
    await counterContext.incrementCounter(geolocation, false);
    const isStreakIncrement = await streakContext.calculateStreak();
    streakContext.increasePetXP(5)
    animateStreak(isStreakIncrement)
    badgesContext.updateStats(geolocation, await isStreakIncrement)
    checkForAnimations(counterContext.counter)
    setTimeout(() => setLoading(false), 500) 
  }

  const animateStreak = (shouldAnimate) => {
    if(!shouldAnimate) return;

    streakRef.current.classList.add('glow-animate-streak')

    setTimeout(() => {
      streakRef.current.classList.remove('glow-animate-streak')
    }, 800);
  }

  const handleAddJoint = async () => {
    if (loading) return
    setLoading(true)
    await counterContext.incrementCounter(geolocation, true);
    streakContext.increasePetXP(7)
    setLoading(false)
  }

  const checkForAnimations = async (count) => {
    if ((count + 1) % 10 === 0) {
      if ((count + 1) % 1000 !== 0) {
        setConfettiType('boom')
        setIsExploding(true)
        collectables.increaseAmount(1)
        setSnackOpen(true)
        setTimeout(() => {
          setIsExploding(false)
        }, 5000);
      }
    }

    if ((count + 1) % 1000 === 0) {
      setIsExploding(true)
      setDisplayWoo('block')
      setConfettiType('fall')
      setTimeout(() => {
        setIsExploding(false)
        setDisplayWoo('none')
      }, 10000);
    }

  }

  const handleSnackClose = () => {
    setSnackOpen(false)
  }

  return (
    <>
      <Snackbar
        open={badgeOpen}
        onClose={handleBadgeAlertClose}
        message={
          <Stack gap={1} direction={'row'} display={'flex'} alignItems={'center'} justifyContent={'space-between'} sx={{width: '100%'}}>
            <Stack gap={1} direction={'row'} display={'flex'} alignItems={'center'} sx={{color: theme.palette.text.primary}}>
              <MilitaryTechIcon/>  {badgeMessage}
            </Stack>
            <Button variant='contained' sx={{color: theme.palette.text.primary, ':focus': {outline: 'none'}}} onClick={() => {navigate('/stats'); callback('stats')}}>ansehen</Button>
          </Stack>
        }
        autoHideDuration={5000}
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        sx={{color: 'red', '& .MuiPaper-root': {background: theme.palette.background.gradient, width: '100%'}, '& .MuiSnackbarContent-message': {width: '100%'}}}
      />

      <Snackbar 
        open={snackOpen}
        onClose={handleSnackClose}
        message={
          <Stack gap={1} direction={'row'} display={'flex'} alignItems={'center'} justifyContent={'space-between'} sx={{width: '100%'}}>
            <Stack gap={1} direction={'row'} display={'flex'} alignItems={'center'} sx={{color: theme.palette.text.primary}}>
              <SmokingRoomsIcon/>  Neue Kippe verdient!
            </Stack>
            <Button variant='contained' sx={{color: theme.palette.text.primary, ':focus': {outline: 'none'}}} onClick={() => {navigate('/collectables')}}>ansehen</Button>
          </Stack>
        }
        autoHideDuration={5000}
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        sx={{color: 'red', '& .MuiPaper-root': {background: theme.palette.background.gradient, width: '100%'}, '& .MuiSnackbarContent-message': {width: '100%'}}}
      />

      <Box px={3} gap={2} display={'flex'} flexDirection={'column'} sx={{transition: 'all 0.25s'}} alignItems="center" justifyContent={'space-evenly'} py={10}>
        <Stack width={'100%'} justifyContent={'space-between'} gap={1}>
          <Stack>
            <Typography fontSize={20}>Bock auf nen {counterVariant === 1 ? 'Kippchen' : 'Joint'},</Typography>
            <Typography fontWeight={'bold'} fontSize={20}>{user.displayName}?</Typography>
          </Stack>

          <Typography display={'flex'} alignItems={'center'} fontSize={'small'}> <PersonPinCircle/>{nearbyStreet ? 'Nahe ' + nearbyStreet : 'Loading...'}</Typography>
        </Stack>
        
        {/* Streak / Mode Switcher Kachel */}
        <Stack direction={'row'} alignItems={'stretch'} justifyContent={'center'} width={'100%'} gap={2}>
          <Collapse in={counterVariant === 1} orientation='horizontal' timeout={300} unmountOnExit sx={{ display: 'flex', alignItems: 'stretch', "& .MuiCollapse-wrapper": {display:'flex', alignItems: 'flex'}, "& .MuiCollapse-wrapperInner": {display: 'flex', alignItems: 'stretch'}}}>
            <Stack direction={'row'} alignItems={'center'} px={2} justifyContent={'center'} bgcolor={theme.palette.background.paper} borderRadius={'10px'} border={'0.5px solid rgba(217, 217, 217, 0.2)'} >
              <WhatshotIcon ref={streakRef} sx={{fontSize: '33pt'}}/>
              <Typography fontSize={20} sx={{fontFamily: "'Poppins'", fontWeight: '700'}} whiteSpace={'nowrap'}>{streakContext.streak ? streakContext.streak.amount : 0} Tage</Typography>
            </Stack> 
          </Collapse>
          <ModeSwitcher />
        </Stack>

        {/* Main Counter Kachel */}
        <Stack direction={'column'} alignItems={'center'} justifyContent={'center'} bgcolor={theme.palette.background.paper} position={'relative'} height={'100%'} width={'100%'} borderRadius={'10px'} border={'0.5px solid rgba(217, 217, 217, 0.2)'} py={3} px={1} gap={2}>
          <AnimatedCounter containerStyles={{overflowX: 'visible'}} digitStyles={{textAlign: 'center', fontFamily: "'Poppins'", fontWeight: '800'}} includeDecimals={false} value={counterVariant === 1 ? counterContext.counter : counterContext.jointCount ? counterContext.jointCount : 0} color='inherit' fontSize="70pt"/>
          {isExploding ? <Confetti fadeOutHeight={1} mode={confettiType}/> : <></>}
          <Stack gap={2} direction={'row'} width={'100%'} position={'relative'}>
            <Button disabled={loading} sx={{ border: 'none', zIndex: 2, height: '6vh', width: '100%', borderRadius: '10px', ":focus": {outline: 'none'}, background: theme.palette.background.gradient}} variant='contained' onClick={() => {counterVariant === 1 ? handleAddCig() : handleAddJoint()}}>
            
              <AddIcon fontSize='large'/>
              {loading && (
                <CircularProgress 
                color='#fff'
                sx={{
                  p: 0.4,
                  width: '80%',
                  height: '80%',
                  position: 'absolute',
                }}/>
              )}
            </Button> 
          </Stack>
          
            {typeof userData?.equipSlots?.equippedSmoke !== 'undefined' && (
              <SmokeEffect color={items.find(el => el.id === userData?.equipSlots?.equippedSmoke)?.assetPath}/>
            )}
        </Stack>
            {/* <Box position={'absolute'} overflow={'hidden'} width={'100%'} height={'100%'}>
              <Typography className='animation-boom' display={displayWoo} variant='h6' fontWeight={1000} fontSize={100} color='primary' sx={{position: 'absolute', translate: '-50%', zIndex: 1000000}} left={'50%'} top={'25%'}>Woooh!</Typography>
            </Box> */}
          
        {/* SmokePet Kachel */}
        {(streakContext?.streak?.amount >= 3 || typeof userData?.pet !== 'undefined') && (
          
            <Stack direction={'row'} borderRadius={'10px'} px={2} overflow={'hidden'} position={'relative'} border={'0.5px solid rgba(217, 217, 217, 0.2)'} width={'100%'} alignItems={'center'} justifyContent={'space-between'} bgcolor={theme.palette.background.paper} onClick={() => {callback('pet'); navigate('/pet')}}>
              <Stack zIndex={2} maxWidth={'70%'} >
                <Typography fontWeight={'bold'} textOverflow={'ellipsis'} overflow={'hidden'} whiteSpace={'wrap'}>
                  {userData?.pet?.name}
                </Typography>
                <Typography>
                  Level {userData?.pet?.level} | {userData?.pet?.xpPoints} XP
                </Typography>
              </Stack>
              <Box>
                  <Box zIndex={2} width={'auto'} position={'relative'}>
                    <PetComponent isBox={!streakContext.pet} height={150} base={userData?.pet?.bluePrint.base} chain={userData?.pet?.bluePrint.chain} glasses={userData?.pet?.bluePrint.glasses} eyes={userData?.pet?.bluePrint.eyes} mouth={userData?.pet?.bluePrint.mouth}/>
                  </Box>
                  <Box width={'100px'} height={'100px'} borderRadius={10000} zIndex={1} top={'50%'} position={'absolute'} sx={{filter: 'blur(70px)', transform: 'translate(-50%) translateY(-50%)'}} bgcolor={theme.palette.primary.main} />
              </Box>
              
              <ArrowForwardIos sx={{opacity: '50%'}} fontSize={'10px'}/>

            </Stack> 
               
        )}
        {/* Quests Kachel */}
        <Stack direction={'column'} borderRadius={'10px'} p={2} gap={2} overflow={'hidden'} position={'relative'} border={'0.5px solid rgba(217, 217, 217, 0.2)'} width={'100%'} bgcolor={theme.palette.background.paper} onClick={() => {callback('quests'); navigate('/quests')}}>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Stack>
              <Typography fontSize={20}>Quests</Typography>
              <Typography fontSize={15}>{0} von {quests.length} abgeschlossen.</Typography>
            </Stack>
            <Stack direction={'row'} alignItems={'center'} >
              <ArrowForwardIos sx={{opacity: '50%'}} fontSize={'10px'}/>
            </Stack>
          </Stack>
        </Stack>

      </Box>

      {/* Ausgabentracker */}
      <Box mx={2}>
        <SpendingHistory/>

      </Box>
      
    </>
  )
}

export default Counter