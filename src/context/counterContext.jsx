import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { Button } from "@mui/material";
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc, increment, getDocs, query, onSnapshot, arrayUnion, GeoPoint, Timestamp, runTransaction } from "@firebase/firestore";
import { useUserAuth } from './userAuthConfig';
import { useUserData } from "./userData";
import { useNotification } from '../context/notificationContext';
import { startOfWeek, endOfWeek, format, getDay, getYear, getMonth, toDate, set, constructNow } from 'date-fns'
import { useGeolocated } from "react-geolocated";
import { point, buffer, bbox } from '@turf/turf';
import { useUserInventory } from "./userInventory";
import { useFlashMessage } from "./flashMessage";
import { useNavigate } from "react-router-dom";
import { useUserQuests } from "./userQuests";

const counterContext = createContext();

export function CounterContextProvider({ children }) {
    const [counter, setCounter] = useState(null);
    const [jointCount, setJointCount] = useState(null)
    const { userData } = useUserData();
    const { user } = useUserAuth();
    const { sendNotification } = useNotification()
    const { showFlashMessage } = useFlashMessage()
    const inventory = useUserInventory()
    const navigate = useNavigate()
    const questSystem = useUserQuests()

  const incrementCounter = async (geolocation, isJoint) => {
    const docRef = doc(db, "Users", user.uid)
    const geopoint = new GeoPoint(geolocation[0], geolocation[1])
    //console.log(Timestamp.fromDate(new Date()))
    const o = point(geolocation)
    var buffer2 = buffer(o, 150, {units: 'meters'});
    var bbox2 = bbox(buffer2);
    var bufferForFriendSmoke = buffer(o, 30, {units: 'meters'});
    var bboxForFriendSmoke = bbox(bufferForFriendSmoke);
    var cigUID = generateUUID()

    const geoLocationsSnapshot = userData.geoLocations
    const jointLocationsSnapshot = userData.jointLocations
    
    const locationsArrayToCheck = !isJoint ? geoLocationsSnapshot : jointLocationsSnapshot

    if (locationsArrayToCheck?.length < 1 || typeof locationsArrayToCheck === 'undefined') {
      await incrementAndNewGeopoint()
    } else {
      var bCreateNew = true
      for (let i = 0; i < locationsArrayToCheck.length; i++) {
        const lat = locationsArrayToCheck[i].point._lat
        const lng = locationsArrayToCheck[i].point._long
        if (bbox2[2] > lat && lat > bbox2[0] && bbox2[3] > lng && lng > bbox2[1]) {
          incrementAndUpdateGeopoint(i)
          bCreateNew = false
          break;
        }
      };
      if (bCreateNew) {
        await incrementAndNewGeopoint()
        bCreateNew = false
      }
    }


    sendNotification(user, isJoint)
    questSystem.checkForPlaceQuests(o)

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
      const history = userData.latestCigs;

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
      }else {
        const newHistory = [{
          geoLocation : geopoint,
          id: cigID,
          timestamp: Timestamp.fromDate(new Date())}].concat(history)
  
        await updateDoc(docRef, {
          latestCigs: newHistory
        })
      }

    }

    async function incrementAndNewGeopoint(params) {

      if(!isJoint){
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
      }else{
        await setDoc(docRef, {
          jointCount: increment(1),
          jointLocations: arrayUnion({
                          amount: 1,
                          point : geopoint,
                          id: cigUID
                        })
        }, {merge:true})
      }
    }

    async function incrementAndUpdateGeopoint(index) {
      if (!isJoint) {
        geoLocationsSnapshot[index].amount += 1
        await updateDoc(docRef, {
          counter: increment(1),
          geoLocations: geoLocationsSnapshot
        })
        addToHistory(geoLocationsSnapshot[index].id)
        incrementMonthStat()
      } else{
        jointLocationsSnapshot[index].amount += 1
        await setDoc(docRef, {
          jointCount: increment(1),
          jointLocations: jointLocationsSnapshot
        }, {merge: true})
      }
    }

    if(Math.floor(Math.random() * 20) === 6){
      inventory.addItemV2('mysteryBox')
      showFlashMessage(
          'Du hast eine Mystery Box erhalten!', 
          'success',
          <Button variant='contained' sx={{':focus': {outline: 'none'}}} onClick={() => {navigate('/inventory')}}>ansehen</Button>
      )
    }

    if(isJoint) return;

    async function incrementMonthStat(params) {

      var year = getYear(new Date())
      const monthDocRef = doc(db, "Users", user.uid, 'monthly', `${year}`)
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

    const weeklydocRef = doc(db, 'Users', user.uid, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek)
    const weeklyDoc = await getDoc(weeklydocRef)
    
    if(weeklyDoc.exists()){
      const daysDoc = await getDoc(doc(db, 'Users', user.uid, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek))
      var daysArr = await daysDoc.data().days
      daysArr[getDay(new Date()) == 0 ? 6 : getDay(new Date()) - 1] += 1
      //console.log(getDay(new Date()) == 0 ? 6 : getDay(new Date()) - 1)
      await setDoc(doc(db, 'Users', user.uid, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek), {
        days : daysArr
      })

    }else{
      var daysArr2 = [0,0,0,0,0,0,0]
      daysArr2[getDay(new Date()) == 0 ? 6 : getDay(new Date()) - 1] += 1
      await setDoc(doc(db, 'Users', user.uid, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek), {
        days : daysArr2
      })
    }

  }

  const incrementJoint = async (geolocation) => {
    const docRef = doc(db, "Users", user.uid)
    console.log(userData.jointCount)
    if(userData.jointCount < 1 || !userData.jointCount) {
        await updateDoc(docRef, {
        jointCount: 1,
      })
    } else {
      await updateDoc(docRef, {
        jointCount: increment(1),
      })
    }
  }

    useEffect(() => {
        if (!user) return;
        const ref = doc(db, 'Users', user.uid)

        const unsubscribe = onSnapshot(ref, async (snapshot) => {
        if (snapshot.exists()) {
            const count = snapshot.data().counter
            const jointCount = snapshot.data().jointCount
            setCounter(count)
            setJointCount(jointCount)
        }
        });

        return () => {
            unsubscribe();
        };
    }, [user]);

  return (
    <counterContext.Provider value={{ counter, jointCount, incrementCounter }}>
      {children}
    </counterContext.Provider>
  );
}

export function useCounter() {
  return useContext(counterContext);
}