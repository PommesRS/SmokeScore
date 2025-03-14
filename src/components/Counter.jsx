import { useEffect, useState } from 'react'
import {Container, Box, Button, Typography} from '@mui/material'
import Stack from '@mui/material/Stack';
import { useUserAuth } from '../context/userAuthConfig';
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc, increment, getDocs, query, where, arrayUnion, GeoPoint } from "@firebase/firestore";
import { db } from '../firebase';
import { AnimatedCounter } from  'react-animated-counter';
import '../index.css'
import Confetti from 'react-confetti-boom';
import { startOfWeek, endOfWeek, format, getDay, getYear, getMonth } from 'date-fns'
import { Geolocation } from '@capacitor/geolocation';
import { useGeolocated } from "react-geolocated";
import { point, buffer, bbox } from '@turf/turf';

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
  const [loading, setLoading] = useState(true)
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
      setLoading(false)
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
    const docRef = doc(db, "Users", uID)
    const geopoint = new GeoPoint(geolocation[0], geolocation[1])

    const o = point(geolocation)
    var buffer2 = buffer(o, 80, {units: 'meters'});
    var bbox2 = bbox(buffer2);
    console.log(bbox2)

    const geoLocationsSnapshot = (await getDoc(docRef)).data().geoLocations
    console.log(geoLocationsSnapshot)
    if (geoLocationsSnapshot.length < 1) {
      incrementAndNewGeopoint()
    } else {
      var bCreateNew = true
      geoLocationsSnapshot.forEach((element, i) => {
        const lat = element.point._lat
        const lng = element.point._long
        console.log(i, lat, lng)
        if (bbox2[2] > lat && lat > bbox2[0] && bbox2[3] > lng && lng > bbox2[1]) {
          incrementAndUpdateGeopoint(i)
          console.log('within')
          bCreateNew = false
          return
        }
      });
      if (bCreateNew) {
        console.log('new')
        incrementAndNewGeopoint()
        bCreateNew = false
      }
    }

    async function incrementAndNewGeopoint(params) {
      await updateDoc(docRef, {
        counter: increment(1),
        geoLocations: arrayUnion({
                        amount: 1,
                        point : geopoint
                      })
      })
      incrementMonthStat()
    }

    async function incrementAndUpdateGeopoint(index) {
      geoLocationsSnapshot[index].amount += 1
      console.log(geoLocationsSnapshot)
      await updateDoc(docRef, {
        counter: increment(1),
        geoLocations: geoLocationsSnapshot
      })
      incrementMonthStat()
    }

    async function incrementMonthStat(params) {

      var year = getYear(new Date())
      const monthDocRef = doc(db, "Users", uID, 'monthly', `${year}`)
      const monthsData = (await getDoc(monthDocRef)).data()
      
      if(!monthsData){
        var monthArray = [0,0,0,0,0,0,0,0,0,0,0,0]
        monthArray[getMonth(new Date())] += 1
        console.log(monthArray)

        await setDoc(monthDocRef, {
          months: monthArray
        })
      }else{
        var localMonthArray = monthsData.months
        localMonthArray[getMonth(new Date())] += 1
        await updateDoc(monthDocRef, {
          months: localMonthArray
        })
      }
    }


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

    }else{
      var daysArr2 = [0,0,0,0,0,0,0]
      daysArr2[getDay(new Date())] += 1
      await setDoc(doc(db, 'Users', uID, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek), {
        days : daysArr2
      })
    }


    

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
          <Button loading={loading} sx={{ fontWeight: '6 00', fontSize: '40pt', border: 'none', height: '6vh', width: '50vw', borderRadius: '10px', ":focus": {outline: 'none'}, background: 'linear-gradient(180deg, rgba(137,121,255,1) 0%, rgba(126,111,234,1) 20%, rgba(0,0,0,0) 90%)'}} variant='contained' onClick={() => {incrementCounter(); setCount(count + 1)}}>+</Button>
        </Stack>
      </Box>
      
    </>
  )
}

export default Counter