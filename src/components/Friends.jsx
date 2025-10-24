import React, { useState, useEffect, useRef } from 'react'
import { 
  Box, IconButton, List, DialogTitle, Dialog, Paper, Input, 
  InputAdornment, ListItem, ListItemText, ListItemButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Stack, Snackbar, Alert,
  getFormControlLabelUtilityClasses, useTheme
} from '@mui/material'
import './map.css';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { db } from '../firebase.js';
import { collection, where, getDocs, query, updateDoc, arrayUnion, doc, getDoc } from "@firebase/firestore";
import { useUserAuth } from '../context/userAuthConfig';
import {
  LinePlot,
  MarkPlot,
  lineElementClasses,
  markElementClasses,
  AreaPlot,
  MarkElement
} from '@mui/x-charts/LineChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { startOfWeek, endOfWeek, format, getDay } from 'date-fns'
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

export const CustomTag = ({value}) => {
  const theme = useTheme()
  return (
    <Typography flexGrow={1} textAlign={'center'} border={'2px solid' + theme.palette.secondary.main} position={'relative'} borderRadius={'53px'} px={3}>
      {value}
    </Typography>
  )
}

const chartBottomColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--chart-bottom")
      .trim();

const chartTopColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--chart-top")
      .trim();

const Friends = () => {
  const [friends, setFriends] = useState([])
  const [openFAdd, setOpenFAdd] = useState(false);
  const [alertState, setAlertState] = useState(false)
  const [errorMessage, setErrorMessage] = useState('No User Found')
  const [searchResult, setSearchResult] = useState([])
  const [reload, setReload] = useState(false)
  const [ownStats, setOwnSats] = useState([])
  const [arsch, setArsch] = useState([])
  const { user } = useUserAuth();
  const theme = useTheme()
  const uID = user.uid;
  const [friendIndex, setFriendIndex] = useState(0)
  const map = useRef(null)
  const mapContainer = useRef(null)
  maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_apiKey;

  const handleSearch = async (e) => {
    var searchInput = e.target.value
    
    if (searchInput) {
      const colRef = collection(db, 'Users')
      const queryResult = query(colRef, where('displayName', '==', searchInput))
      const querySnapshot = await getDocs(queryResult);
      console.log(querySnapshot)
      querySnapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data())
      })
      try {
        if (querySnapshot.empty) {
          return
        }else{
          setErrorMessage('User Found')
          setSearchResult([])
          querySnapshot.forEach((doc) => {
            setSearchResult(oldArray => [...oldArray, [doc.id, doc.data()]])
            //searchResult.push([doc.id, doc.data()])
            console.log(searchResult)
          })
          setReload(true)

          //setErrorMessage('No User Found')
        }
        
      } catch (error) {
        console.log(error)
      }

    }
  }

  const handleRequestSend = async (e) => {
    const idForRequest = e.target.getAttribute('data-uid')
    const docRef = await doc(db, "Users", idForRequest)

    await updateDoc(docRef, {
      FriendRequests: arrayUnion(uID)
    })
    fAddDialogClose()
    setAlertState(true)
  }
  
  const handleCloseAlert = () => {
    setAlertState(false)
  }
  
 function SearchResult() {

  if (!searchResult.length) {
    return(
      <ListItem key={'NoUserFound'}>
      <ListItemText sx={{color: 'primary.light', px:2}} color='primary.main' primary='No User Found'/>
    </ListItem>
    )
  }
  return (
    <>
    {searchResult.map((result, i) => (
      //console.log(i, result[1].displayName)
      <>
        <ListItem disablePadding key={i}>
          <Box>
            <ListItemText sx={{"& .MuiListItemText-primary": {color: 'inherit'}}}>{result[1].displayName}</ListItemText>
            <ListItemText sx={{"& .MuiListItemText-primary": {color: 'gray'}}}>{result[0]}</ListItemText>
            <ListItemButton disableRipple={false} sx={{textAlign: 'left', p: 0, paddingBottom: 2, color: 'primary.light'}} data-uid={result[0]} onClick={handleRequestSend}>
              Anfragen
            </ListItemButton>
          </Box>
        </ListItem>
      </>
    )) }
    </>
  )
 }


  function FAddDialog ({children}) {
    return (
      <Dialog sx={{backdropFilter: "blur(2px)"}} onClose={fAddDialogClose} open={openFAdd}>
        <Paper sx={{color:'#fff', border: '1px solid #767676', p: 2}}>
          <Input fullWidth={true} onChange={handleSearch} sx={{color:'#fff'}} placeholder="Benutzername" startAdornment={
            <InputAdornment sx={{color: 'inherit'}} position='start'>
              <SearchIcon />
            </InputAdornment>
          }/>
          <List disablePadding>
            <SearchResult />
          </List>
        </Paper>
      </Dialog>
    );
  }
  
  const fAddDialogOpen = () => {
    setOpenFAdd(true);
  };
  
  const fAddDialogClose = () => {
    setOpenFAdd(false);
    setSearchResult([])
  };

  async function getOwnStats() {
    var startOfCurrentWeek = startOfWeek(new Date(), {weekStartsOn: 1})
    startOfCurrentWeek = format(startOfCurrentWeek, 'dd.MM.yy')
    var endOfCurrentWeek = endOfWeek(new Date(), {weekStartsOn: 1})
    endOfCurrentWeek = format(endOfCurrentWeek, 'dd.MM.yy')

    const uid = user.uid
    const docRef = doc(db, 'Users', uid, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek)
    const ownWeekStats = (await getDoc(docRef)).data()
    setOwnSats(ownWeekStats.days)
  }

  async function getFriendsIDs() {
    const uid = user.uid
    const docRef = doc(db, "Users", uid)
    return (await getDoc(docRef)).data().Friends
  }

  async function getFriendsFull(friendArr) {
    if (friendArr.length == 0 ) {
      return
    }

    var cacheFriends = new Array();

    await Promise.all(friendArr.map(async (friend) => {
      var startOfCurrentWeek = startOfWeek(new Date(), {weekStartsOn: 1})
      startOfCurrentWeek = format(startOfCurrentWeek, 'dd.MM.yy')
      var endOfCurrentWeek = endOfWeek(new Date(), {weekStartsOn: 1})
      endOfCurrentWeek = format(endOfCurrentWeek, 'dd.MM.yy')
      //console.log(startOfCurrentWeek + '-' + endOfCurrentWeek)
      
      const uid = friend
      const docRef = doc(db, "Users", uid)
      const weekStatsRef = doc(db, "Users", uid, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek)

      const friendName = (await getDoc(docRef)).data().displayName
      const weekStats = (await getDoc(weekStatsRef)).data()
      const totalAmount = (await getDoc(docRef)).data().counter
      const tags = (await getDoc(docRef)).data().tags
      const locations = (await getDoc(docRef)).data().geoLocations
      locations.sort((a,b) => {
        return b.amount - a.amount
      })

      const street =  await maptilersdk.geocoding.reverse([locations[0].point._long, locations[0].point._lat]);
      console.log(street)
      locations[0].street = street.features[0].text

      cacheFriends.push([friend, friendName, weekStats, locations[0], totalAmount, tags])
    }))

    setFriends(cacheFriends)
    setFriendIndex(0)

  
    const mapCoords = cacheFriends[friendIndex][3]

    // friendArr.forEach(async (friend) => {
    //   const uid = friend
    //   const docRef = doc(db, "Users", uid)
    //   return (await getDoc(docRef)).data().Friends

    // })
  }

  useEffect(() => {

    if (friends.length == 0) {
      return
    }

    const mapCoords = friends[friendIndex][3]
    console.log(map.current)
    if (map.current) {
      map.current.jumpTo({ center: [mapCoords.point._long, mapCoords.point._lat]})
    }

    console.log(friendIndex)

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: '59d38153-6ea3-464a-b3c9-2e869c449863',
      //style: mapStyle,
      center: [mapCoords.point._long, mapCoords.point._lat],
      zoom: 12,
      navigationControl: false
    });

  }, [friendIndex])

  const handleFriendSwitch = (direction) => {
    if (direction == 'up') {
      if (friendIndex < friends.length - 1 ) {
        setFriendIndex(friendIndex + 1)
        console.log(friendIndex)
      }
    } else if (direction == 'down') {
      if (friendIndex > 0) {
        setFriendIndex(friendIndex - 1)
        console.log(friendIndex)
      }
    }
  }

  
  useEffect(() => {
    setFriends([])
    getOwnStats()
    getFriendsIDs().then((result) => {
      getFriendsFull(result)
    })
  
  }, [user])

  useEffect(() => {
    setFriendIndex(1)
  },[])

  /*
  / Table FirendList
  */
    
  return (
    <>
    <FAddDialog></FAddDialog>
          <Box zIndex={5} position={'fixed'} bottom={80} right={20}>
          <IconButton onClick={fAddDialogOpen} size='large' sx={{":focus": {outline: 'none'}, backgroundColor: (theme) => theme.palette.primary.main}} bgcolor='primary' aria-label="addFriend">
            <PersonAddAlt1Icon fontSize='large'/>
          </IconButton>
      </Box>
      <Snackbar
        anchorOrigin={{vertical: 'top', horizontal:'center'}}
        autoHideDuration={3000}
        open={alertState}
        onClose={handleCloseAlert}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          Freund erfolgreich Angefragt!
        </Alert>
      </Snackbar>
    {
      friends.length > 0 ? 
    
      <>
      <Box height={'100vh'} width={'inherit'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center" >
        <Stack height={'70vh'} width={'inherit'} alignItems={'center'} justifyContent={'space-between'} gap={4}>
          <Stack direction={'row'} width={'inherit'} overflowX={'hidden'} textOverflow={'ellipsis'} gap={2} justifyContent={'center'} alignItems={'center'}>
            <IconButton onClick={() => {handleFriendSwitch('down')}} color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowBackIosIcon/></IconButton>
            <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative', }}>{friends.length > 0 && friends[friendIndex][1]}</Typography>
            <IconButton onClick={() => {handleFriendSwitch('up')}}  color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowForwardIosIcon/></IconButton>
          </Stack>
          <Stack>
            <Stack direction={'row'} width={'inherit'} overflowX={'hidden'} textOverflow={'ellipsis'} justifyContent={'center'} alignItems={'center'}>
              <WhatshotIcon sx={{fontSize: '70pt'}}/>
              <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '90pt', position: 'relative', lineHeight: '1', textAlign: 'center'}}>NaN</Typography>
            </Stack>
            <Typography height={'auto'} noWrap sx={{fontWeight: 'light', fontSize: '20pt', position: 'relative', textAlign: 'center'}}>Streak</Typography>
          </Stack>
          {friends.length > 0 ?
            <LineChart
              grid={{ horizontal: false }}
              series={[
                  {
                    id:'',
                    label: 'Du',
                    data: ownStats,
                    area: true,
                  },
                  {
                    label: friends[friendIndex][1],
                    data: friends[friendIndex][2] ? friends[friendIndex][2].days : [0,0,0,0,0,0,0],
                    area: true,
                  }
                  ]}
              slotProps={{
                legend: {
                  hidden: 'true'
                }
              }}
              margin={{
                  top: 10,
                  bottom: 20,
                  }}
              yAxis={[
                {
                    colorMap:
                    {
                      id: '',
                      type: 'continuous',
                      min: 0,
                      max: friends[friendIndex][2] ? Math.max(...friends[friendIndex][2].days) > Math.max(...ownStats) ? Math.max(...friends[friendIndex][2].days) : Math.max(...ownStats) : 5,
                      color: [theme.palette.primary.transparent02, theme.palette.primary.transparent05],
                    }
                },
              ]}
              xAxis={[
                  {
                      scaleType: 'band',
                      data: [
                          'Mo',
                          'Di',
                          'Mi',
                          'Do',
                          'Fr',
                          'Sa',
                          'So'
                      ]
                  },
              ]}
              sx={{

                  pointerEvents: 'all',
                  borderRadius: 4,
                  py: 0,
                  //change left yAxis label styles
                  "& .MuiAreaElement-root":{
                      pointerEvents: 'all'
                  },
                  "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel":{
                      strokeWidth: 0.4,
                      fill:"#ffff"
                  },
                  // change all labels fontFamily shown on both xAxis and yAxis
                  "& .MuiChartsAxis-tickContainer .MuiChartsAxis-tickLabel":{
                  fontFamily: "Roboto",
                  },
                  // change bottom label styles
                  "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel":{
                      strokeWidth:"0.5",
                      fill:"#ffff",
                  },
                  // bottomAxis Line Styles
                  "& .MuiChartsAxis-bottom .MuiChartsAxis-line":{
                  stroke:"#ffff",
                  strokeWidth:0
                  },
                  // leftAxis Line Styles
                  "& .MuiChartsAxis-left .MuiChartsAxis-line":{
                  stroke:"#22",
                  strokeWidth: 0
                  },
                  "& .MuiChartsAxis-bottom .MuiChartsAxis-tick":{
                  stroke:"#ffff",
                  strokeWidth: 0
                  },
                  "& .MuiChartsAxis-left .MuiChartsAxis-tick":{
                  stroke:"#ffff",
                  strokeWidth: 0
                  },
                  "& .MuiChartsAxis-root .MuiChartsAxis-line": {
                      stroke: '#222',
                      strokeWidth: 0
                  },
                  "& .MuiChartsAxis-directionX": {
                      stroke: '#fff',
                      strokeWidth: 1
                  },
                  "& .MuiChartsAxisHighlight-root": {
                      stroke: '#fff',
                  },
                  [`& .${lineElementClasses.root}`]: {
                      stroke: theme.palette.primary.main,
                      strokeWidth: 2,
                  },
                  [`& .${markElementClasses.root}`]: {
                      stroke: theme.palette.primary.main,
                      scale: '0.6',
                      fill: 'transparent',
                      strokeWidth: 0,
                  }
              }}
            />
          :
          'Loading'
        }
        </Stack>

      </Box>
      <Box height={'100vh'} width={'inherit'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent={'center'}>
        <Box height={'75%'} width={'100%'} position={'relative'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent={'center'} sx={{
            background: theme.palette.background.gradient,
            borderRadius: '52px', 
            boxShadow: '5px 5px 10px 0px rgba(0, 0, 0, 1)',
            '&::before': {
              content : '" "',
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '30%',
              maxWidth: '200px',
              height: '15px',
              bgcolor: 'background.default',
              zIndex: '1',
              borderRadius: '25px',
            },
            '&::after': {
              content : '" "',
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '20px',
              maxWidth: '200px',
              height: '20px',
              bgcolor: 'background.default',
              zIndex: '1',
              borderRadius: '19px',
            }
          }}>
          <Stack spacing={5} paddingY={7} position={'relative'} height={'100%'} width={'inherit'} direction={'column'} textOverflow={'ellipsis'} justifyContent={'center'} alignItems={'center'} sx={{justifyContent: 'space-between'}}>
            <Stack useFlexGap spacing={2} direction={'row'} width={'90%'} justifyContent={'center'} alignItems={'center'} sx={{ flexWrap: 'wrap', pt: '30px'}}>
              {friends.length == 0 ? 'loading' : friends[friendIndex][5] ? 
                <>
                  <CustomTag value={friends[friendIndex][5].tobacco}></CustomTag>
                  <CustomTag value={friends[friendIndex][5].cigType}></CustomTag>
                </> : <></>
              }
            </Stack>

            <Stack direction={'column'} justifyContent={'center'} alignItems={'center'} sx={{justifyContent: 'space-between'}}>
              <Typography textAlign={'center'} fontWeight={800} lineHeight={'80%'} fontSize={'100pt'} sx={{textShadow: '6px 6px 4px rgba(0, 0, 0, 0.25)'}}>{friends.length != 0 ? friends[friendIndex][4] : 'loading'}</Typography>
              <Typography display={'flex'} textAlign={'center'}>Kippen insgesamt geraucht</Typography>
            </Stack>
            
            <Box height={'10rem'} width= {'90%'} display={'flex'} position={'relative'} borderRadius={'27px'} alignItems="center" justifyContent="center" marginBottom={'20px'} sx={
              { '&::after': {
                content : '" "',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '100%',
                boxShadow: 'inset 0px -60px 10.3px -6px rgba(137, 121, 255, 0.2)',
                zIndex: '1',
                borderRadius: '25px',
              }, '&::before': {
                content : '" Beliebteste Location "',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: 'auto',
                zIndex: '1',
                transform: 'translateY(-50%) translateX(20px)',
                fontSize: '15pt',
                textShadow: '4px 4px 4px #000'
              },
              boxShadow: '4px 6px 4px rgba(0, 0, 0, 0.52)'
            }
              }>
              <div ref={mapContainer} className='map-wrapper' style={{borderRadius: '27px'}}/>
              <img src="pin.svg" width={20} alt="pin" style={{position: 'absolute', transform: 'translateY(-50%)'}}/>
              <Stack direction={'row'} position={'absolute'} width={'90%'} sx={{justifyContent: 'space-between'}} bottom={'12%'} zIndex={2}>
                <Typography display={'flex'} alignItems={'center'}><PersonPinCircleIcon/>{friends.length != 0 ? friends[friendIndex][3].street : 'loading...'}</Typography>
                <Typography textAlign={'right'}>{friends.length != 0 ? friends[friendIndex][3].amount : 'loading...'}</Typography>
              </Stack>
            </Box>

          </Stack>
        </Box>
      </Box> </> :
      <>
        <Box height={'100vh'} width={'inherit'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent={'center'}>
              Noch hast du keine Freunde, tippe unten rechts auf den Button um welche hinzuzufügen.
        </Box>
      </>
      }
    </>
)
}

export default Friends