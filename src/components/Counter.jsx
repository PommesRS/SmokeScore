import { useEffect, useState } from 'react'
import {Container, Box, Button, Typography} from '@mui/material'
import UndoIcon from '@mui/icons-material/Undo';
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import { useUserAuth } from '../context/userAuthConfig';
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc, increment, getDocs, query, where, arrayUnion, GeoPoint, Timestamp } from "@firebase/firestore";
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
  const [doesLatestCigExist, setDoesLatestCigExist] = useState(true)
  //const [latestCigs, setLatestCigs] = useState([])
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
  useGeolocated({
      positionOptions: {
          enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
  });

  var latestCigsLocal = []

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

  const getLatestCigs = async () => {
    const docRef = doc(db, "Users", uID)
    latestCigsLocal = (await getDoc(docRef)).data().latestCigs

    console.log(latestCigsLocal)

    if (latestCigsLocal.length > 0) {
      setDoesLatestCigExist(true)
    } else {
      setDoesLatestCigExist(false)
    }
  }

  function location() {
    try {
      setLocation([coords.latitude, coords.longitude])
      setLoading(false)
      setBGetCoords(false)
    } catch (error) {
      console.log(error)
    }
  }


  initiateCounter();
  getLatestCigs()
  //console.log(latestCigs)
  
  useEffect(() => {
    location()
    
  }, [coords])

  const incrementCounter = async () => {
    const docRef = doc(db, "Users", uID)
    const geopoint = new GeoPoint(geolocation[0], geolocation[1])
    console.log(Timestamp.fromDate(new Date()))
    const o = point(geolocation)
    var buffer2 = buffer(o, 80, {units: 'meters'});
    var bbox2 = bbox(buffer2);
    const cigUID = generateUUID()

    const geoLocationsSnapshot = (await getDoc(docRef)).data().geoLocations
    if (geoLocationsSnapshot.length < 1) {
      incrementAndNewGeopoint()
    } else {
      var bCreateNew = true
      geoLocationsSnapshot.forEach((element, i) => {
        const lat = element.point._lat
        const lng = element.point._long
        if (bbox2[2] > lat && lat > bbox2[0] && bbox2[3] > lng && lng > bbox2[1]) {
          incrementAndUpdateGeopoint(i)
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
    

    function generateUUID() { // Public Domain/MIT
      var d = new Date().getTime();//Timestamp
      var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
      return 'xxxxxxxx-xxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16;//random number between 0 and 16
          if(d > 0){//Use timestamp until depleted
              r = (d + r)%16 | 0;
              d = Math.floor(d/16);
          } else {//Use microseconds since page-load if supported
              r = (d2 + r)%16 | 0;
              d2 = Math.floor(d2/16);
          }
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }

    async function addToHistory(cigID) {
      await updateDoc(docRef, {
        latestCigs: arrayUnion({
                        geoLocation : geopoint,
                        id: cigID,
                        timestamp: Timestamp.fromDate(new Date())
                      })
      })
    }

    

    async function incrementAndNewGeopoint(params) {
      await updateDoc(docRef, {
        counter: increment(1),
        geoLocations: arrayUnion({
                        amount: 1,
                        point : geopoint,
                        id: cigUID
                      })
      })
      addToHistory(cigUID)
      incrementMonthStat()
    }

    async function incrementAndUpdateGeopoint(index) {
      geoLocationsSnapshot[index].amount += 1
      console.log(geoLocationsSnapshot)
      await updateDoc(docRef, {
        counter: increment(1),
        geoLocations: geoLocationsSnapshot
      })
      addToHistory(geoLocationsSnapshot[index].id)
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

    const weeklydocRef = doc(db, 'Users', uID, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek)
    const weeklyDoc = await getDoc(weeklydocRef)
    
    if(weeklyDoc.exists()){
      const daysDoc = await getDoc(doc(db, 'Users', uID, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek))
      var daysArr = await daysDoc.data().days
      console.log(daysArr)
      daysArr[getDay(new Date()) == 0 ? 6 : getDay(new Date()) - 1] += 1
      console.log(getDay(new Date()) == 0 ? 6 : getDay(new Date()) - 1)
      await setDoc(doc(db, 'Users', uID, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek), {
        days : daysArr
      })

    }else{
      var daysArr2 = [0,0,0,0,0,0,0]
      daysArr2[getDay(new Date()) == 0 ? 6 : getDay(new Date()) - 1] += 1
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
    getLatestCigs()
  }

  const handleUndoCig = async () => {
    const docRef = doc(db, "Users", uID)

    const geoLocationsSnapshot = (await getDoc(docRef)).data().geoLocations
    var geoLocIndex = null
    geoLocationsSnapshot.forEach((element, i) => {
      if (latestCigsLocal[0].id === element.id){
        geoLocIndex = i
      }
    })

    geoLocationsSnapshot[geoLocIndex].amount += -1
    setCount(count - 1)
    await updateDoc(docRef, {
      counter: increment(-1),
      geoLocations: geoLocationsSnapshot
    })
    console.log(latestCigsLocal)
    latestCigsLocal.shift()
    console.log(latestCigsLocal)
    await updateDoc(docRef, {
      latestCigs: latestCigsLocal
    })
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
          <Stack gap={2} direction={'row'} sx={{width: '70vw'}}>
            <Button loading={loading} sx={{ border: 'none', height: '6vh', width: '60vw', borderRadius: '10px', ":focus": {outline: 'none'}, background: 'linear-gradient(180deg, rgba(137,121,255,1) 0%, rgba(126,111,234,1) 20%, rgba(0,0,0,0) 90%)'}} variant='contained' onClick={() => {incrementCounter(); setCount(count + 1)}}><AddIcon fontSize='large'/></Button>
            <Button disabled={!doesLatestCigExist} sx={{ border: 'none', height: '6vh', width: '10vw', borderRadius: '10px', ":focus": {outline: 'none'}, background: 'linear-gradient(180deg, rgba(137,121,255,1) 0%, rgba(126,111,234,1) 20%, rgba(0,0,0,0) 90%)'}} variant='contained' onClick={() => {handleUndoCig()}}><UndoIcon fontSize='large'/></Button>
          </Stack>
        </Stack>
      </Box>
      
    </>
  )
}

export default Counter