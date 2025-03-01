import React, { useState, useEffect } from 'react'
import { 
  Box, IconButton, List, DialogTitle, Dialog, Paper, Input, 
  InputAdornment, ListItem, ListItemText, ListItemButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Stack
} from '@mui/material'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
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


const Friends = () => {
  const [friends, setFriends] = useState([])
  const [openFAdd, setOpenFAdd] = useState(false);
  const [errorMessage, setErrorMessage] = useState('No User Found')
  const [searchResult, setSearchResult] = useState([])
  const [reload, setReload] = useState(false)
  const [ownStats, setOwnSats] = useState([])
  const { user } = useUserAuth();
  const uID = user.uid;
  const [friendIndex, setFriendIndex] = useState(0)

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
          querySnapshot.forEach((doc) => {
            searchResult.push([doc.id, doc.data()])
            //console.log(searchResult)
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

  }
  
 function SearchResult() {

  if (!searchResult.length) {
    return(
      <ListItem key={'NoUserFound'}>
      <ListItemText sx={{"& .MuiListItemText-primary": {color: '#8979FF'}, px:2}} primary='No User Found'/>
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
            <ListItemButton disableRipple={false} sx={{textAlign: 'left', p: 0, paddingBottom: 2, color: '#8979FF'}} data-uid={result[0]} onClick={handleRequestSend}>
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
        <Paper sx={{background: '#0B0B12', color:'#fff', border: '1px solid #767676', p: 2}}>
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
    console.log(ownWeekStats.days)
    setOwnSats(ownWeekStats.days)
  }

  async function getFriendsIDs() {
    const uid = user.uid
    const docRef = doc(db, "Users", uid)
    return (await getDoc(docRef)).data().Friends
  }

  async function getFriendsFull(friendArr) {

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
      cacheFriends.push([friend, friendName, weekStats])
    }))

    setFriends(cacheFriends)
    console.log(cacheFriends)

    // friendArr.forEach(async (friend) => {
    //   const uid = friend
    //   const docRef = doc(db, "Users", uid)
    //   return (await getDoc(docRef)).data().Friends

    // })
  }

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

  /*
  / Table FirendList
  */
    
  return (
    <>
      <FAddDialog></FAddDialog>
      <Box position={'absolute'} bottom={80} right={20}>
          <IconButton onClick={fAddDialogOpen} size='large' sx={{":focus": {outline: 'none'}, backgroundColor: '#8979FF'}} color='inherit' aria-label="addFriend">
            <PersonAddAlt1Icon fontSize='large'/>
          </IconButton>
      </Box>

      {/* <Box height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
      <TableContainer component={Paper} sx={{ backgroundColor: '#171726'}} elevation={0}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow sx={{'& .MuiTableCell-root': {color: '#fff'}}}>
              <TableCell >BenutzerName</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {friends.map((friend, i) => (
              <TableRow
                key={i}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& .MuiTableCell-root': {color: '#fff'}}}
              >
                <TableCell component="th" scope="row">
                  {friend[1]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Box> */}
      
      <Box height={'100vh'} width={'inherit'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
        <Stack height={'70vh'} width={'inherit'} alignItems={'center'} justifyContent={'space-between'} gap={4}>
          <Stack direction={'row'} width={'inherit'} overflowX={'hidden'} textOverflow={'ellipsis'} gap={2} justifyContent={'center'} alignItems={'center'}>
            <IconButton onClick={() => {handleFriendSwitch('down')}} color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowBackIosIcon/></IconButton>
            <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative', }}>{friends.length > 0 && friends[friendIndex][1]}</Typography>
            <IconButton onClick={() => {handleFriendSwitch('up')}}  color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowForwardIosIcon/></IconButton>
          </Stack>
          <Stack>
            <Stack direction={'row'} width={'inherit'} overflowX={'hidden'} textOverflow={'ellipsis'} justifyContent={'center'} alignItems={'center'}>
              <WhatshotIcon sx={{fontSize: '90pt'}}/>
              <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '130pt', position: 'relative', lineHeight: '1', textAlign: 'center'}}>5</Typography>
            </Stack>
            <Typography height={'auto'} noWrap sx={{fontWeight: 'light', fontSize: '30pt', position: 'relative', textAlign: 'center'}}>Streak</Typography>
          </Stack>
          {friends.length > 0 ?
            <LineChart
              grid={{ horizontal: false }}
              series={[
                  {
                    id:'anus',
                    label: 'Du',
                    data: ownStats,
                    area: true,
                    color: '',
                  },
                  {
                    label: friends[friendIndex][1],
                    data: friends[friendIndex][2].days,
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
                      id: 'anus',
                      type: 'continuous',
                      min: 0,
                      max: 11,
                      color: ['rgba(137,121,255,0)', 'rgba(137,121,255,0.5)'],
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

                  borderRadius: 4,
                  py: 0,
                  //change left yAxis label styles
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
                      stroke: '#8979FF',
                      strokeWidth: 2,
                  },
                  [`& .${markElementClasses.root}`]: {
                  stroke: '#8979FF',
                  scale: '0.6',
                  fill: 'transparent',
                  strokeWidth: 2,
                  }
              }}
            />
          :
          'Loading'
        }
        </Stack>
      </Box>
    </>
)
}

export default Friends