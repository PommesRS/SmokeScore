import { useEffect, useState } from 'react'
import {Container, Box, Button, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination,
  List, Dialog, Input, FormControl, IconButton,
  MenuItem, DialogTitle, DialogContent, DialogContentText, InputLabel, Select, TextField, DialogActions, 
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
import Stack from '@mui/material/Stack';
import { useUserAuth } from '../context/userAuthConfig';
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc, increment, getDocs, query, where, arrayUnion, GeoPoint, Timestamp } from "@firebase/firestore";
import { db } from '../firebase';
import { AnimatedCounter } from  'react-animated-counter';
import '../index.css'
import Confetti from 'react-confetti-boom';
import { startOfWeek, endOfWeek, format, getDay, getYear, getMonth, toDate } from 'date-fns'
import { Geolocation } from '@capacitor/geolocation';
import { useGeolocated } from "react-geolocated";
import { point, buffer, bbox } from '@turf/turf';
import * as maptilersdk from '@maptiler/sdk';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: 'var(--color)',
  },
  [`&.${tableCellClasses.body}`]: {
    color: 'var(--color)'
  },
}));

export function TextGradient({children}) {
    return (

      <Typography 
        sx={{fontSize: '40pt', 
            fontWeight: 'bold', 
            backgroundImage: 'var(--text-gradient)',
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
  const [nearbyStreet, setNearbyStreet] = useState([])
  const [bGetCoords, setBGetCoords] = useState(true)
  const [loading, setLoading] = useState(true)
  const [doesLatestCigExist, setDoesLatestCigExist] = useState(true)
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
  const [anus, setAnus] = useState(1);


  maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_apiKey;

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

    if (latestCigsLocal.length > 0) {
      setDoesLatestCigExist(true)
    } else {
      setDoesLatestCigExist(false)
    }
  }

  async function location() {
    try {
      const results = await maptilersdk.geocoding.reverse([coords.longitude, coords.latitude]);
      setNearbyStreet(results.features[0].text)
      setLocation([coords.latitude, coords.longitude,])
      setLoading(false)
      setBGetCoords(false)
    } catch (error) {
      
    }
  }


  initiateCounter();
  getLatestCigs()
  //console.log(latestCigs)
  
  useEffect(() => {
    location()
    
  }, [coords])

  useEffect(() => {
    getSpendingHistory()
  }, [])

  const incrementCounter = async () => {
    const docRef = doc(db, "Users", uID)
    const geopoint = new GeoPoint(geolocation[0], geolocation[1])
    //console.log(Timestamp.fromDate(new Date()))
    const o = point(geolocation)
    var buffer2 = buffer(o, 80, {units: 'meters'});
    var bbox2 = bbox(buffer2);
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
        console.log('new')
        incrementAndNewGeopoint()
        bCreateNew = false
      }
    }
    
    
    const friendsRef = doc(db, "Users", uID)
    const friendIDArr = (await getDoc(friendsRef)).data().Friends
    friendIDArr.map(async (friendId) => {
      const FriendFCMRef = doc(db, 'Users', friendId)
      const Token = (await getDoc(FriendFCMRef)).data().fcmToken
      fetch('https://sendpushtotoken-wcqbnpknwa-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: Token,
            title: 'Neue Kippe 🚬',
            body: user ? user.displayName + ' hat soeben eine neue Kippe eingetragen. Ziehe schnell nach!' : ''
        }),
        })
        .then(res => res.json())
        .then(console.log)
        .catch(console.error);
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

    async function addToHistory(cigID) {
      const history = (await getDoc(docRef)).data().latestCigs
      console.log(history.length)

      if (history.length == 5) {
          history.pop()
          const newHistory = [{
            geoLocation : geopoint,
            id: cigID,
            timestamp: Timestamp.fromDate(new Date())}].concat(history)
          console.log(newHistory)
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

      console.log(newHistory)
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

    console.log(latestCigsLocal[0])
    

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

    console.log(latestCigsLocal)

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
    history.forEach(row => {
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
      <Dialog open={openPAdd} onClose={pAddDialogClose} sx={{backdropFilter: "blur(2px)", '& .MuiDialog-paper': { width: '80%', maxHeight: 435, background: '#0B0B12', borderRadius: '5px' }}}>
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
    console.log(price, product);

    const docRef = doc(db, "Users", uID)
    historyArr.unshift({name: product, price: price, date: Timestamp.fromDate(new Date())})
    console.log(historyArr)

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
    console.log(event.target.value)
  }

  return (
    <>
      <AddPurchase></AddPurchase>
      <Box height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
        <Stack height={'70vh'} alignItems={'center'} justifyContent={'space-between'}>
          <TextGradient>SmokeScore</TextGradient>
          <Stack fontWeight={700}  alignItems={'center'} justifyContent={'center'}>
              <AnimatedCounter digitStyles={{textAlign: 'center'}} includeDecimals={false} value={count} color='inherit' fontSize="100pt"/>
              <Typography display={'flex'} alignItems={'center'}> <PersonPinCircleIcon/>{nearbyStreet ? 'Nahe ' + nearbyStreet : 'Keine Straße in der Nähe gefunden'}</Typography>
              {isExploding ? <Confetti/> : <></>}
              {/* <Typography lineHeight={'80%'} sx={{fontWeight: 'bold', fontSize: '100pt'}}>{count}</Typography> */}
          </Stack>
          <Stack gap={2} direction={'row'} sx={{width: '70vw'}}>
            <Button loading={loading} sx={{ border: 'none', height: '6vh', width: '60vw', borderRadius: '10px', ":focus": {outline: 'none'}, background: 'var(--button-gradient)'}} variant='contained' onClick={() => {incrementCounter(); setCount(count + 1)}}><AddIcon fontSize='large'/></Button>
            <Button disabled={!doesLatestCigExist} sx={{ border: 'none', height: '6vh', width: '10vw', borderRadius: '10px', ":focus": {outline: 'none'}, background: 'var(--button-gradient)'}} variant='contained' onClick={() => {handleUndoCig()}}><UndoIcon fontSize='large'/></Button>
          </Stack>
        </Stack>
      </Box>

      {/* Ausgabentracker */}

      <Box height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center" >
        <Typography variant='h2' fontWeight={500}>Kaufhistorie</Typography>
        <br />
        { historyArr.length > 0 ? 

        
        <TableContainer component={Paper} elevation={5} sx={{ background: 'linear-gradient(180deg, rgba(19, 8, 58, 0.5), rgba(170, 20, 240, 0))', filter: 'blur(0px)', border: 0, marginBottom: 10, color: 'var(--color)'}}>
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
                <TableCell key={'addRow'} align='center' colSpan={4}><Button sx={{ border: 'none', height: '6vh', width: '100%', borderRadius: '10px', ":focus": {outline: 'none'}, background: 'var(--button-gradient)'}} variant='contained' onClick={pAddDialogOpen}><AddIcon fontSize='large'/></Button></TableCell>
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
        
        <TableContainer component={Paper} elevation={5} sx={{background: 'linear-gradient(180deg, rgba(19, 8, 58, 0.5), rgba(170, 20, 240, 0))', filter: 'blur(0px)', border: 0}}>
          <Table aria-label="simple table">
            <TableBody>
              <TableRow>
                <TableCell align='center' colSpan={3}><Button sx={{ border: 'none', height: '6vh', width: '100%', borderRadius: '10px', ":focus": {outline: 'none'}, background: 'var(--button-gradient)'}} variant='contained' onClick={pAddDialogOpen}><AddIcon fontSize='large'/></Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{borderBottom: 'none'}}></TableCell>
                <TableCell sx={{borderBottom: 'none'}}></TableCell>
                <TableCell sx={{borderBottom: 'none'}}></TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} sx={{borderBottom: 'none'}} align='center'>Du hast noch keine Kaufhistorie. Erstelle noch heute deinen ersten eintrag!</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={0} // alle Einträge
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
              0 €
            </Typography>
          </Box>
        </TableContainer> 
}   
      </Box>
      
    </>
  )
}

export default Counter