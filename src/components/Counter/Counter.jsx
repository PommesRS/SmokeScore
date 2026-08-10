import { useEffect, useState, useRef, useContext } from 'react'
import {useNavigate} from 'react-router-dom';
import {Container, Box, Button, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination,
  List, Dialog, Input, FormControl, IconButton,
  MenuItem, DialogTitle, DialogContent, DialogContentText, InputLabel, Select, TextField, DialogActions, CircularProgress,
  useTheme, Stack, Snackbar, Switch
} from '@mui/material'
import { tableCellClasses } from '@mui/material/TableCell';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateField } from '@mui/x-date-pickers/DateField';
import UndoIcon from '@mui/icons-material/Undo';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
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
import {SpendingHistory} from '../index.js'

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
  const [nearbyStreet, setNearbyStreet] = useState([])
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
  const [confettiType, setConfettiType] = useState('boom')
  const navigate = useNavigate();
  const streakRef = useRef(null)
  const { counterVariant, setCounterVariantCig, setCounterVariantJoint } = useAppState()
  const { sendNotification } = useNotification()

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

  const handleAddCig = async () => {
    if (loading) return;

    setLoading(true)
    //await incrementCounter()
    await counterContext.incrementCounter(geolocation, false);
    const isStreakIncrement = await streakContext.calculateStreak();
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
    setLoading(false)
  }

  const checkForAnimations = async (count) => {
    if ((count + 1) % 10 === 0) {
      if ((count + 1) % 1000 !== 0) {
        setConfettiType('boom')
        setIsExploding(true)
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
        

      <Box height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
        <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} zIndex={100}>
          <SmokingRoomsIcon fontSize='large' />
          <Switch
            sx={{ alignSelf: 'center'}}
            checked={counterVariant !== 1}
            onChange={() => {counterVariant === 1 ? setCounterVariantJoint() : setCounterVariantCig() }}
          />
          <img src="./jointIcon.svg" alt="jointIcon" width={35} height={35} style={{ filter: 'invert(1)'}} />

        </Stack>
        <Stack height={'70vh'} alignItems={'center'} justifyContent={'space-between'}>
          
          <TextGradient>{counterVariant === 1 ? 'SmokeScore' : 'JointScore'}</TextGradient>

          {counterVariant === 1 && ( <Stack direction={'row'} alignItems={'center'} height={6}>
            <WhatshotIcon ref={streakRef} sx={{fontSize: '50pt', filter: 'drop-shadow(6px 6px 10px rgba(0, 0, 0, 0.7))'}}/>
            <Typography fontSize={40} sx={{fontFamily: "'Poppins'", fontWeight: '700', textShadow: '6px 6px 10px rgba(0, 0, 0, 0.7)'}}>{streakContext.streak ? streakContext.streak.amount : 0}</Typography>
          </Stack>)}
          
          <Stack alignItems={'center'} justifyContent={'center'}>
              <img src={counterVariant === 1 ? "./smokeTop.png" : "./weedTop.png"} style={{padding: 0, margin: 0, opacity: 0.2, left: 0, position: 'absolute', top: 0, width: '100%'}}/>
              <AnimatedCounter digitStyles={{textAlign: 'center', fontFamily: "'Poppins'", fontWeight: '800', textShadow: '6px 6px 10px rgba(0, 0, 0, 0.7)'}} includeDecimals={false} value={counterVariant === 1 ? counterContext.counter : counterContext.jointCount ? counterContext.jointCount : 0} color='inherit' fontSize="100pt"/>
              <Typography display={'flex'} alignItems={'center'}> <PersonPinCircleIcon/>{nearbyStreet ? 'Nahe ' + nearbyStreet : 'Keine Straße in der Nähe gefunden'}</Typography>
                {isExploding ? <Confetti style={{overflow: 'hidden'}} fadeOutHeight={1} mode={confettiType}/> : <></>}
              <Box position={'absolute'} overflow={'hidden'} width={'100%'} height={'100%'}>
                <Typography  className='animation-boom' display={displayWoo} variant='h6' fontWeight={1000} fontSize={100} color='primary' sx={{position: 'absolute', translate: '-50%', zIndex: 1000000}} left={'50%'} top={'25%'}>Woooh!</Typography>
              </Box>
          </Stack>
          <Stack gap={2} direction={'row'} sx={{width: '80vw'}}>
            <Button disabled={loading}  sx={{ border: 'none', height: '6vh', width: '100%', borderRadius: '10px', ":focus": {outline: 'none'}, background: theme.palette.background.gradient}} variant='contained' onClick={() => {counterVariant === 1 ? handleAddCig() : handleAddJoint()}}>
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
            {/*<Button disabled={!doesLatestCigExist} sx={{ border: 'none', height: '6vh', width: '10vw', borderRadius: '10px', ":focus": {outline: 'none'}, background: theme.palette.background.gradient}} variant='contained' onClick={() => {handleUndoCig()}}><UndoIcon fontSize='large'/></Button>*/}
          </Stack>
          
        </Stack>
      </Box>

      {/* Ausgabentracker */}
      <SpendingHistory></SpendingHistory>
      
    </>
  )
}

export default Counter