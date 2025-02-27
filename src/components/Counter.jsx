import { useEffect, useState } from 'react'
import {Container, Box, Button, Typography} from '@mui/material'
import Stack from '@mui/material/Stack';
import { useUserAuth } from '../context/userAuthConfig';
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc, increment, getDocs, query, where, arrayUnion, GeoPoint } from "@firebase/firestore";
import { db } from '../firebase';
import { AnimatedCounter } from  'react-animated-counter';
import '../index.css'
import Confetti from 'react-confetti-boom';
import { startOfWeek, endOfWeek, format, getDay } from 'date-fns'
import { Geolocation } from '@capacitor/geolocation';
import { useGeolocated } from "react-geolocated";

export function TextGradient({children}) {
    return (
      <Typography 
        sx={{fontSize: '40pt', 
            fontWeight: 'bold', 
            backgroundImage: `linear-gradient( 180deg, #8979FF, #79FFD9)`,
            backgroundSize: "100%",
            backgroundRepeat: "repeat",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"}}>
        {children}
      </Typography>
    );
  }
  

function Counter() {
  const [count, setCount] = useState(0)
  const [isExploding, setIsExploding] = useState(0)
  const [geolocation, setLocation] = useState([])
  const [bGetCoords, setBGetCoords] = useState(true)
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
  useGeolocated({
      positionOptions: {
          enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
  });


  const { user } = useUserAuth();

  const uID = user.uid;
  

  const initiateCounter = async () => {
    const docRef = await doc(db, "Users", uID)
    
    if (!(await getDoc(docRef)).data()) {
      await setDoc(doc(db, 'Users', uID), {
        counter: 0
      })
    }else{
      setCount((await getDoc(docRef)).data().counter)
    }
  }

  function location() {
    try {
      setLocation([coords.latitude, coords.longitude])
      console.log(geolocation)
      setBGetCoords(false)
    } catch (error) {
      console.log(error)
    }
  }


  initiateCounter();
  
  useEffect(() => {
    location()
  }, [coords])

  const incrementCounter = async () => {
    const docRef = await doc(db, "Users", uID)

    const geopoint = new GeoPoint(geolocation[0], geolocation[1])

    await updateDoc(docRef, {
      counter: increment(1),
      geoLocations: arrayUnion(await geopoint)
    })

    

    var startOfCurrentWeek = startOfWeek(new Date(), {weekStartsOn: 1})
    startOfCurrentWeek = format(startOfCurrentWeek, 'dd.MM.yy')
    var endOfCurrentWeek = endOfWeek(new Date(), {weekStartsOn: 1})
    endOfCurrentWeek = format(endOfCurrentWeek, 'dd.MM.yy')
    console.log(startOfCurrentWeek + '-' + endOfCurrentWeek)

    const weeklydocRef = doc(db, 'Users', uID, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek)
    const weeklyDoc = await getDoc(weeklydocRef)
    
    if(weeklyDoc.exists()){
      const daysDoc = await getDoc(doc(db, 'Users', uID, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek))
      var daysArr = await daysDoc.data().days
      daysArr[getDay(new Date()) - 1] = daysArr[getDay(new Date()) - 1] + 1
      await setDoc(doc(db, 'Users', uID, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek), {
        days : daysArr
      })

    }else(
      await setDoc(doc(db, 'Users', uID, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek), {
        days : [0,0,0,0,0,0,0]
      })
    )


    

    if ((count + 1) % 10 === 0) {
      setIsExploding(true)
      //setIsExploding(false)
      setTimeout(() => {
        setIsExploding(false)
      }, 5000);
    }
    
  }
  

  return (
    <>

      <Box height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
        <Stack height={'70vh'} alignItems={'center'} justifyContent={'space-between'}>
            <TextGradient>SmokeScore</TextGradient>
            <Stack  alignItems={'center'} justifyContent={'center'}>
                <AnimatedCounter digitStyles={{textAlign: 'center'}} includeDecimals={false} value={count} color="white" fontSize="100pt"/>
                <Typography>{geolocation ? geolocation : 'anus'}</Typography>
                {isExploding ? <Confetti/> : <></>}
                {/* <Typography lineHeight={'80%'} sx={{fontWeight: 'bold', fontSize: '100pt'}}>{count}</Typography> */}
                <Typography sx={{fontWeight: 'light', fontSize: '15pt'}}>insgesamt</Typography>
            </Stack>
          <Button sx={{ fontWeight: '6 00', fontSize: '40pt', border: 'none', height: '6vh', width: '50vw', borderRadius: '10px', ":focus": {outline: 'none'}, background: 'linear-gradient(180deg, rgba(137,121,255,1) 0%, rgba(126,111,234,1) 20%, rgba(0,0,0,0) 90%)'}} variant='contained' onClick={() => {incrementCounter(); setCount(count + 1)}}>+</Button>
        </Stack>
      </Box>
      
    </>
  )
}

export default Counter