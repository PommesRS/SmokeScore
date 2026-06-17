import { useEffect, useState, useRef } from 'react'
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
import { useUserAuth } from '../context/userAuthConfig';
import { useAppState } from '../context/appState';
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc, increment, getDocs, query, onSnapshot, arrayUnion, GeoPoint, Timestamp, runTransaction } from "@firebase/firestore";
import { db } from '../firebase';
import { AnimatedCounter } from  'react-animated-counter';
import '../index.css'
import Confetti from 'react-confetti-boom';
import { startOfWeek, endOfWeek, format, getDay, getYear, getMonth, toDate, set, constructNow } from 'date-fns'
import { Geolocation } from '@capacitor/geolocation';
import { useGeolocated } from "react-geolocated";
import { point, buffer, bbox } from '@turf/turf';
import * as maptilersdk from '@maptiler/sdk';
import { styled } from '@mui/material/styles';
import { Navigate } from 'react-router-dom';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';

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
  const [count, setCount] = useState(0)
  const [jointCount, setJointCount] = useState(null)
  const [streak, setStreak] = useState(0)
  const [isExploding, setIsExploding] = useState(0)
  const [geolocation, setLocation] = useState([])
  const [nearbyStreet, setNearbyStreet] = useState([])
  const [bGetCoords, setBGetCoords] = useState(true)
  const [loading, setLoading] = useState(true)
  const [doesLatestCigExist, setDoesLatestCigExist] = useState(true)
  const [badgeOpen, setBadgeOpen] = useState(false)
  const [badgeMessage, setBadgeMessage] = useState('Neues Abzeichen Freigeschaltet!')
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


  maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_apiKey;

  var latestCigsLocal = []

  const { user } = useUserAuth();

  const uID = user.uid;


  const initiateCounter = async () => {
    if(!user) return
    const docRef = doc(db, "Users", uID)
    const isCounter = (await getDoc(docRef)).exists()

    if (!(await getDoc(docRef)).exists()) {
      await setDoc(docRef, {
        counter: 0
      }, {merge: true})
    }else{
      setCount((await getDoc(docRef)).data().counter)
    }

    if((await getDoc(docRef)).data().jointCounter > 0) {
      let localJointCount = (await getDoc(docRef)).data().jointCounter
      setJointCount(localJointCount)
    }


    const locDate = (await getDoc(docRef)).data().streak.lastIncrement

    const today = dayjs();
    const preYesterday = today.subtract(2, "day");
    const date1 = dayjs(locDate.toDate())
    if (date1.isSame(preYesterday, 'day')) {
      await updateDoc(docRef, {
        streak: {
          amount: 0,
          lastIncrement: Timestamp.fromDate(new Date(dayjs().subtract(1, 'day')))
        }
      })
    }
  }

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
      //const results = await maptilersdk.geocoding.reverse(['13.1431325', '52.5956696']);
      // if (results.features.find(el => el.place_type[0] === 'municipality')) {
      //   console.log(results.features.find(el => el.place_type[0] === 'municipality').text)
        
      // }else if (results.features.find(el => el.place_type[0] === 'county')) {
      //   console.log(results.features.find(el => el.place_type[0] === 'county').text)
      // }else if (results.features.find(el => el.place_type[0] === 'region')) {
      //   console.log(results.features.find(el => el.place_type[0] === 'region').text)
      // }
      
      //console.log(results.features.find(el => el.place_type[0] === 'region' ))
      setNearbyStreet(results.features[0].text)
      setLocation([coords.latitude, coords.longitude,])
      setLoading(false)
      setBGetCoords(false)
    } catch (error) {
      
    }
  }





  //console.log(latestCigs)
  
  useEffect(() => {
    location()
  }, [coords])

  useEffect(() => {
    getSpendingHistory()
    getLatestCigs()
    
    const ref = doc(db, 'Users', user.uid)
    
    const unsubscribe = onSnapshot(ref, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().streak
        const count = snapshot.data().counter
        const jointCount = snapshot.data().jointCount
        setStreak(data)
        setCount(count)
        setJointCount(jointCount)
      }
    });
    
    initiateCounter();
    return () => unsubscribe();

  }, [])

  const handleAddCig = async () => {
    if (loading) return;

    setLoading(true)
    await incrementCounter()
    //setCount(prev => prev + 1)
    setTimeout(() => setLoading(false), 500) 
  }

  const handleAddJoint = async () => {
    if (loading) return
    setLoading(true)

    const docRef = doc(db, "Users", user.uid)
    console.log((await getDoc(docRef)).data().jointCount)
    if(jointCount < 1 || !jointCount) {
      await setDoc(docRef, {
        jointCount: 1
      }, {merge: true})
    } else {
      await setDoc(docRef, {
        jointCount: jointCount + 1
      }, {merge: true})
    }

    setLoading(false)
  }

  const handleBadgeAlertClose = () => {
    setBadgeOpen(false)
  }

  const incrementCounter = async () => {
    const docRef = doc(db, "Users", user.uid)
    const geopoint = new GeoPoint(geolocation[0], geolocation[1])
    //console.log(Timestamp.fromDate(new Date()))
    const o = point(geolocation)
    var buffer2 = buffer(o, 150, {units: 'meters'});
    var bbox2 = bbox(buffer2);
    var bufferForFriendSmoke = buffer(o, 30, {units: 'meters'});
    var bboxForFriendSmoke = bbox(bufferForFriendSmoke);
    var cigUID = generateUUID()

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
        incrementAndNewGeopoint()
        bCreateNew = false
      }
    }

    if (streak) {
      const today = dayjs();
      const yesterday = today.subtract(1, "day");
      const date = dayjs(streak.lastIncrement.toDate())
      
      if (date.isSame(yesterday, 'day')) {
          await updateDoc(docRef, {
            streak: {
              amount: streak.amount + 1,
              lastIncrement: Timestamp.now()
            }
          })
          streakRef.current.classList.add('glow-animate-streak')
          setTimeout(() => {
            streakRef.current.classList.remove('glow-animate-streak')
          }, 800);
      }else if(date.isSame(today, 'day')) {
        await updateDoc(docRef, {
            streak: {
              amount: streak.amount,
              lastIncrement: Timestamp.now()
            }
          })
      }

    }else{
      await updateDoc(docRef, {
        streak: {
          amount: 1,
          lastIncrement: Timestamp.now()
        }
      })
      streakRef.current.classList.add('glow-animate-streak')
      setTimeout(() => {
        streakRef.current.classList.remove('glow-animate-streak')
      }, 800);
    }
    

    const friendsRef = doc(db, "Users", uID)
    const friendIDArr = (await getDoc(friendsRef)).data().Friends
    friendIDArr.map(async (friendId) => {
      const FriendFCMRef = doc(db, 'Users', friendId)
      const friendCanNotifications = (await getDoc(FriendFCMRef)).data().canGetNotifications
      if(friendCanNotifications != false){
        const Token = (await getDoc(FriendFCMRef)).data().fcmToken
        fetch('https://sendpushtotoken-wcqbnpknwa-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              token: Token,
              title: 'Neue Kippe 🚬',
              body: user ? user.displayName + ' hat soeben eine neue Kippe eingetragen. Ziehe schnell nach!' : '',
              msgType: 'notification',
              eventDate: '-', 
              senderName: '-'
          }),
          })
          .then(res => res.json())
          .catch(console.error);
      }
    })
    

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


    async function badgeFlow(o) {
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
        })
      }

      await runTransaction(db, async (tx) => {

        const statRef = doc(db, "Users", user.uid, 'Stats', 'main')
        const userRef = doc(db, "Users", user.uid)
        const stats = (await tx.get(statRef)).data()
        const friends = (await tx.get(userRef)).data().Friends
        const latestCigs = (await tx.get(userRef)).data().latestCigs
        
        const height = await maptilersdk.elevation.at([o.geometry.coordinates[1], o.geometry.coordinates[0]])
        const smokeMetaData = await maptilersdk.geocoding.reverse([o.geometry.coordinates[1], o.geometry.coordinates[0]])
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

        let isNewFriendStat = false;
        let friendStatArr = [];
        let friendName;

        for (const friend of friends) {
          const friendData = (await tx.get(doc(db, "Users", friend))).data();
          const friendStats = (await tx.get(doc(db, "Users", friend, 'Stats', 'main'))).data();
          const friendLastPos = friendData.lastKnownPos;
          friendName = friend;

          console.log(friendLastPos)
          if(typeof friendLastPos !== 'undefined'){
            const lat = friendLastPos._lat;
            const lng = friendLastPos._long;


            const isInBBox =
              bbox2[2] > lat &&
              lat > bbox2[0] &&
              bbox2[3] > lng &&
              lng > bbox2[1];

            if (isInBBox) {
              isNewFriendStat = true;

              if (!friendStatArr.includes(friendName)) {
                friendStatArr.push(friendName);
              }
            }
          }


        }

        console.log(isNewFriendStat, friendStatArr)

        if (typeof stats === 'undefined') {
          tx.set(statRef, {
            visitedCities: isNewCity ? [city] : [],
            visitedCountries: isNewCountry ? [country] : [],
            nightCigs: isNightCig ? 1 : 0,
            withFriend: isNewFriendStat ? {friends: [...friendStatArr], amount: 1} : {friends: [], amount: 0},
            over150M: isNewHeight ? 1 : 0 
          })
        }else{
          tx.set(statRef, {
            visitedCities: isNewCity ? [...stats?.visitedCities, city] : stats?.visitedCities,
            visitedCountries: isNewCountry ? [...stats?.visitedCountries, country] : stats?.visitedCountries,
            nightCigs: isNightCig ? stats?.nightCigs + 1 : stats?.nightCigs,
            withFriend: typeof stats?.withFriend !== 'undefined' ? isNewFriendStat ? {friends: !stats?.withFriend?.friends?.includes(friendName) ? [...stats?.withFriend?.friends, friendName] : stats?.withFriend?.friends, amount: stats?.withFriend?.amount + 1} : stats?.withFriend : isNewFriendStat ? {friends: [...friendStatArr], amount: 1} : {friends: [], amount: 0},
            over150M: typeof stats?.over150M !== 'undefined' ? isNewHeight ? stats?.over150M + 1 : stats?.over150M : isNewHeight ? 1 : 0
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
          console.log(criteriaFieldValue - badge.levels[newBadgeLevel > 0 ? newBadgeLevel - 1 : 0 ].value )

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


    

    async function addToHistory(cigID) {
      const history = (await getDoc(docRef)).data().latestCigs

      if (history.length == 5) {
          history.pop()
          const newHistory = [{
            geoLocation : geopoint,
            id: cigID,
            timestamp: Timestamp.fromDate(new Date())}].concat(history)
          await updateDoc(docRef, {
            latestCigs: newHistory
          })
      }else if (history.length == 0) {
        
        const newHistory = [{
        geoLocation : geopoint,
        id: cigID,
        timestamp: Timestamp.fromDate(new Date())}]
        await updateDoc(docRef, {
          latestCigs: newHistory
        })
      }

      const newHistory = [{
        geoLocation : geopoint,
        id: cigID,
        timestamp: Timestamp.fromDate(new Date())}].concat(history)

      await updateDoc(docRef, {
        // latestCigs: arrayUnion({
        //                 geoLocation : geopoint,
        //                 id: cigID,
        //                 timestamp: Timestamp.fromDate(new Date())
        //               })
        latestCigs: newHistory
      })
    }

    

    async function incrementAndNewGeopoint(params) {
      await updateDoc(docRef, {
        counter: count + 1,
        geoLocations: arrayUnion({
                        amount: 1,
                        point : geopoint,
                        id: cigUID
                      })
      })
      addToHistory(cigUID)
      incrementMonthStat()
      badgeFlow(o)
    }

    async function incrementAndUpdateGeopoint(index) {
      geoLocationsSnapshot[index].amount += 1
      
      await updateDoc(docRef, {
        counter: count + 1,
        geoLocations: geoLocationsSnapshot
      })
      addToHistory(geoLocationsSnapshot[index].id)
      incrementMonthStat()
      badgeFlow(o)
    }

    async function incrementMonthStat(params) {

      var year = getYear(new Date())
      const monthDocRef = doc(db, "Users", uID, 'monthly', `${year}`)
      const monthsData = (await getDoc(monthDocRef)).data()
      
      if(!monthsData){
        var monthArray = [0,0,0,0,0,0,0,0,0,0,0,0]
        monthArray[getMonth(new Date())] += 1

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
      daysArr[getDay(new Date()) == 0 ? 6 : getDay(new Date()) - 1] += 1
      //console.log(getDay(new Date()) == 0 ? 6 : getDay(new Date()) - 1)
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

    if(geoLocationsSnapshot[geoLocIndex].amount > 1) {
      geoLocationsSnapshot[geoLocIndex].amount += -1
    }else if (geoLocationsSnapshot[geoLocIndex].amount == 1) {
      geoLocationsSnapshot.splice(geoLocIndex, 1)
    }

    var year = getYear(Date(latestCigsLocal[0].timestamp))
    const monthDocRef = doc(db, "Users", uID, 'monthly', `${year}`)
    const monthsData = (await getDoc(monthDocRef)).data().months
    const month = getMonth(Date(latestCigsLocal[0].timestamp))
    monthsData[month] = monthsData[month] - 1
    //console.log(monthsData)
    await updateDoc(monthDocRef, {
      months: monthsData
    })

    var startOfCurrentWeek = startOfWeek(Date(latestCigsLocal[0].timestamp), {weekStartsOn: 1})
    startOfCurrentWeek = format(startOfCurrentWeek, 'dd.MM.yy')
    var endOfCurrentWeek = endOfWeek(Date(latestCigsLocal[0].timestamp), {weekStartsOn: 1})
    endOfCurrentWeek = format(endOfCurrentWeek, 'dd.MM.yy')

    const weeklydocRef = doc(db, 'Users', uID, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek)
    const weeklyDoc = await getDoc(weeklydocRef)
    const daysArr = weeklyDoc.data().days
    daysArr[getDay(new Date()) == 0 ? 6 : getDay(new Date()) - 1] -= 1
    await setDoc(doc(db, 'Users', uID, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek), {
        days : daysArr
    })



    setCount(count - 1)
    await updateDoc(docRef, {
      counter: increment(-1),
      geoLocations: geoLocationsSnapshot
    })
    
    latestCigsLocal.shift()
    if (latestCigsLocal.length > 0) {
      setDoesLatestCigExist(true)
    } else {
      setDoesLatestCigExist(false)
    }
    
    await updateDoc(docRef, {
      latestCigs: latestCigsLocal
    })

  }

  /* Ausgaben */

  function calculateTotalSpendAmount(price) {
    // var sum = 0
    // historyArr.forEach(row => {
    //   sum += row.price
    // })

    setTotalAmountSpend((Math.floor(( totalAmountSpend + price )*1000))/1000)
  }

  const getSpendingHistory = async () => {
    const historyRef = doc(db, 'Users', uID)
    const historyDoc = await getDoc(historyRef)
    const history = historyDoc.data().spendingHistory
    
    setHistoryArr(history)

    var sum = 0;
    history?.forEach(row => {
      sum += row.price
    })

    setTotalAmountSpend(sum)

  }

  // const addToSpendingHistory = () => {
  //   //var newArr = historyArr.push({name: 'anus', price: 1.55, date: {seconds: 12345, nanoseconds: 12345}})
  //   setHistoryArr([...historyArr, {name: 'anus', price: 1.5, date: Timestamp.fromDate(new Date())}])
  //   calculateTotalSpendAmount(1.55)
  // }

    const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function AddPurchase({children}) {
    return (
      <Dialog open={openPAdd} onClose={pAddDialogClose} sx={{backdropFilter: "blur(2px)", '& .MuiDialog-paper': { width: '80%', maxHeight: 435, borderRadius: '5px' }}}>
        <DialogTitle>Kauf eintragen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wähle unten die Art des Produktes aus für das du den Preis eintragen möchtest. Trage anschleßend den Preis ein und drücke auf 'Eintragen'.
          </DialogContentText>
          <br />
          <form noValidate onSubmit={handleSubmit} id="subscription-form">
            <FormControl 
              fullWidth
              sx={{marginBottom: 3}}
            >
              <InputLabel id="name">Produktart</InputLabel>
              <Select
                labelId="name"
                id="name"
                value={product}
                label="Produktart"
                sx={{color: 'white'}}
                onChange={handleChange}
                name="product"
              >
                <MenuItem value={'Tabak'}>Tabak</MenuItem>
                <MenuItem value={'Filter'}>Filter</MenuItem>
                <MenuItem value={'Papes'}>Papes</MenuItem>
                <MenuItem value={'Schachtel'}>Schachtel</MenuItem>
              </Select>

            </FormControl>
            <FormControl fullWidth >

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateField
                  label="Preis"
                  format="YY,YY€"
                  defaultValue={dayjs('2000-01-01')}
                  id="name"
                  name="email"
                  error={false}
                /> 
              </LocalizationProvider>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={pAddDialogClose}>Abbrechen</Button>
          <Button type="submit" form="subscription-form">
            Eintragen
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const pAddDialogOpen = () => {
    setOpenPAdd(true);
  };

  const pAddDialogClose = () => {
    setOpenPAdd(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const price = Number(formJson.email.slice(0,5).replace(',', '.'));
    const product = formJson.product;


    const docRef = doc(db, "Users", uID)
    historyArr.unshift({name: product, price: price, date: Timestamp.fromDate(new Date())})


    calculateTotalSpendAmount(price)
    appendToHistory(docRef)

    async function appendToHistory(docRef) {
      await updateDoc(docRef, {
        spendingHistory: historyArr,
      })
    }

    pAddDialogClose();
  };

  const deleteEntry = (index) => {
    historyArr.splice(page * 5 + index, 1)
    //setAnus(anus + 1)

    const docRef = doc(db, "Users", uID)
    appendToHistory(docRef)
    async function appendToHistory(docRef) {
      await updateDoc(docRef, {
        spendingHistory: historyArr,
      })
    }

    var sum = 0;
    historyArr.forEach(row => {
      sum += row.price
    })

    setTotalAmountSpend(sum)

  }

  const handleChange = (event) => {
    setProduct(event.target.value || '');

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
            <Button variant='contained' sx={{color: theme.palette.text.primary, ':focus': {outline: 'none'}}} onClick={() => {navigate('/stats'); callback()}}>ansehen</Button>
          </Stack>
        }
        autoHideDuration={5000}
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        sx={{color: 'red', '& .MuiPaper-root': {background: theme.palette.background.gradient, width: '100%'}, '& .MuiSnackbarContent-message': {width: '100%'}}}
        />
        

      <AddPurchase></AddPurchase>
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

          <Stack direction={'row'} alignItems={'center'} height={6}>
            <WhatshotIcon ref={streakRef} sx={{fontSize: '50pt', filter: 'drop-shadow(6px 6px 10px rgba(0, 0, 0, 0.7))'}}/>
            <Typography fontSize={40} sx={{fontFamily: "'Poppins'", fontWeight: '700', textShadow: '6px 6px 10px rgba(0, 0, 0, 0.7)'}}>{streak?.amount > 0 ? streak?.amount : 0}</Typography>
          </Stack>
          
          <Stack alignItems={'center'} justifyContent={'center'}>
              <img src={counterVariant === 1 ? "./smokeTop.png" : "./weedTop.png"} style={{padding: 0, margin: 0, opacity: 0.2, left: 0, position: 'absolute', top: 0, width: '100%'}}/>
              <AnimatedCounter digitStyles={{textAlign: 'center', fontFamily: "'Poppins'", fontWeight: '800', textShadow: '6px 6px 10px rgba(0, 0, 0, 0.7)'}} includeDecimals={false} value={counterVariant === 1 ? count : jointCount ? jointCount : 0} color='inherit' fontSize="100pt"/>
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

      <Box height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center" >
        <Typography variant='h3' fontWeight={500}>Kaufhistorie</Typography>
        <br />
        { historyArr?.length > 0 ? 

        
        <TableContainer sx={{ background: theme.palette.background.gradient, border: 0, marginBottom: 10, color: 'var(--color)', boxShadow: '4px 4px 28px 8px rgba(0,0,0,0.41)'}}>
          <Table sx={{ Width: 650}} aria-label="simple table">
            <TableHead>
              <TableRow >
                <StyledTableCell >Produkt</StyledTableCell>
                <StyledTableCell align="right">Datum</StyledTableCell>
                <StyledTableCell align="right">Preis</StyledTableCell>
                <StyledTableCell align="right"></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell key={'addRow'} align='center' colSpan={4}><Button sx={{ border: 'none', height: '6vh', width: '100%', borderRadius: '10px', ":focus": {outline: 'none'}, background: theme.palette.background.gradient}} variant='contained' onClick={pAddDialogOpen}><AddIcon fontSize='large'/></Button></TableCell>
              </TableRow>
                {historyArr?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index} >
                    <StyledTableCell component="th" scope="row">
                      {row.name}
                    </StyledTableCell>
                    <StyledTableCell align="right">{row.date?.toDate().toLocaleDateString("de-DE")}</StyledTableCell>
                    <StyledTableCell align="right">{row.price}&nbsp;€</StyledTableCell>
                    <StyledTableCell align="right"><IconButton onClick={() => {deleteEntry(index)}} sx={{color: 'var(--color)'}}><DeleteIcon/></IconButton></StyledTableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            sx={{color: 'var(--color)'}}
            rowsPerPageOptions={[5, 10]}
            component="div"
            count={historyArr.length} // alle Einträge
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite"
          />

           <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 2,
              background: "rgba(0,0,0,0.1)",
              borderTop: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Insgesamt Ausgeben:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {totalAmountSpend} €
            </Typography>
          </Box>
        </TableContainer> 
        : 
        
        <TableContainer component={Paper} elevation={5} sx={{background: theme.palette.background.chartGradient, filter: 'blur(0px)', border: 0}}>
          <Table aria-label="simple table">
            <TableBody>
              <TableRow>
                <TableCell align='center'><Button sx={{ border: 'none', height: '6vh', width: '100%', borderRadius: '10px', ":focus": {outline: 'none'}, background: theme.palette.background.gradient}} variant='contained' onClick={pAddDialogOpen}><AddIcon fontSize='large'/></Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell  sx={{borderBottom: 'none', height: 120}} align='center'>Du hast noch keine Kaufhistorie. <br /> Erstelle oben deinen ersten Eintrag!</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer> 
}   
      </Box>
      
    </>
  )
}

export default Counter