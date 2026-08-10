import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { 
  Box, IconButton, List, DialogTitle, Dialog, Paper, Input, 
  InputAdornment, ListItem, ListItemText, ListItemButton, Badge,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox,
  Typography, Stack, Snackbar, Alert, DialogActions, DialogContent, DialogContentText, Button,
  getFormControlLabelUtilityClasses, useTheme, LinearProgress, SwipeableDrawer, Popover, Divider
} from '@mui/material'
import '../Map/map.css';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { db, storage } from '../../firebase.js';
import { collection, where, getDocs, query, updateDoc, arrayUnion, doc, getDoc, arrayRemove, onSnapshot, deleteDoc, Timestamp, or } from "@firebase/firestore";
import { useUserAuth } from '../../context/userAuthConfig.jsx';
import {
  LinePlot,
  MarkPlot,
  lineElementClasses,
  markElementClasses,
  AreaPlot,
  MarkElement
} from '@mui/x-charts/LineChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { startOfWeek, endOfWeek, format, getDay, set } from 'date-fns'
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import dayjs from 'dayjs';
import { CameraCapture } from '../index.js';
import { deleteObject, ref } from 'firebase/storage';
import FriendBadge from './FriendBadge.jsx';
import FriendChart from './FriendChart.jsx';
import StoryDialog from './StoryDialog.jsx';
import FriendFab from './FriendFab.jsx';
import FriendChat from './Chat/FriendChat.jsx';
import FriendChanger from './FriendChanger.jsx';

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
  const [openFDel, setOpenFDel] = useState(false);
  const [openFChat, setOpenFChat] = useState(false);
  const [openStory, setOpenStory] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);
  const [alertState, setAlertState] = useState(false)
  const [alertText, setAlertText] = useState('')
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
  const dialogRef = useRef(null);
  const currentPicsRef = useRef(null);
  const [friendsMoments, setFriendsMoments] = useState([])
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [imgIndexGlobal, setImgIndexGlobal] = useState(0)


  async function initUserList() {
    const colRef = collection(db, 'Users')
    //const queryResult = query(colRef, where('displayName', '==', searchInput))
    const querySnapshot = await getDocs(colRef);
    // querySnapshot.forEach((doc) => {
    //     console.log(doc.id, '=>', doc.data())
    //   })

    try {

      setErrorMessage('User Found')
      setSearchResult([])
      querySnapshot.forEach((doc) => {
        if(doc.data().displayName === 'undefined'){
          setSearchResult(oldArray => [...oldArray, [doc.id, 'Kein Name']])
        }else{
          setSearchResult(oldArray => [...oldArray, [doc.id, doc.data().displayName]])
        }
      })
      setReload(true)

      //setErrorMessage('No User Found')
      
      
    } catch (error) {
      
    }
  }

  

  const handleRequestSend = async (e) => {
    const idForRequest = e.target.getAttribute('data-uid')
    const docRef = doc(db, "Users", idForRequest)

    await updateDoc(docRef, {
      FriendRequests: arrayUnion(uID)
    })

    fAddDialogClose()
    setAlertText('Freund erfolgreich Angefragt!')
    setAlertState(true)
  }
  
  const handleCloseAlert = () => {
    setAlertState(false)
  }
  
 function SearchResult({records}) {


  if (!searchResult.length) {
    return(
      <ListItem key={'NoUserFound'}>
      <ListItemText sx={{color: 'primary.light', px:2}} color='primary.main' primary='No User Found'/>
    </ListItem>
    )
  }
  return (
    <>
    {records.map((result, i) => (
      //console.log(i, result[1].displayName)
      <React.Fragment key={i}>
        <ListItem disableGutters sx={{width: '100%'}} key={result[0]}>
          <Paper elevation={5} sx={{width: '100%', p: 2, whiteSpace: 'nowrap', overflow: 'hidden'}}>
            <ListItemText sx={{"& .MuiListItemText-primary": {color: 'inherit'}, m: 0}}>{result[1]}</ListItemText>
            <Typography sx={{color: 'gray', width: '100%', display: 'inline-block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>{result[0]}</Typography>
            <ListItemButton disableRipple={false} sx={{textAlign: 'left', p: 0, color: 'primary.light'}} data-uid={result[0]} onClick={handleRequestSend}>
              Anfragen
            </ListItemButton>
          </Paper>
        </ListItem>
      </React.Fragment>
    )) }
    </>
  )
 }


  function FAddDialog ({children}) {

    const [records, setRecords] = useState(searchResult)

    const handleSearch = async (e) => {
      setRecords(searchResult.filter(f => f[1].toLowerCase().includes(e.target.value.toLowerCase())))
    }

    return (
      <Dialog fullWidth sx={{backdropFilter: "blur(2px)", width: '100%'}} onClose={fAddDialogClose} open={openFAdd}>
        <Paper sx={{color:'#fff', p: 0, position: 'relative', width: '100%'}}>
          <Box sx={{position:'absolute', left: 0, width: '100%'}}>
            <Input fullWidth={true} onChange={handleSearch} sx={{color:'#fff', position: 'absolute', background: theme.palette.background.paper, zIndex: 2, p: 2, width: '100%'}} placeholder="Benutzername" startAdornment={
              <InputAdornment sx={{color: 'inherit'}} position='start'>
                <SearchIcon />
              </InputAdornment>
            }/>
          </Box>
          <List sx={{height: '50vh', overflowY: 'scroll', mt: 9, px: 2}}>
            <SearchResult records={records}/>
          </List>
        </Paper>
      </Dialog>
    );
  }

  function FDeleteDialog ({children}) {
    return (
      <Dialog
          sx={
              {backdropFilter: "blur(2px)"}
          }
          open={openFDel}
          onClose={fDelDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
      >
          <DialogTitle id="alert-dialog-title">{friends.length > 0 && friends[friendIndex][1]} als Freund entfernen.</DialogTitle>
          <DialogContent>
              <Stack direction={'row'} flex={'true'} alignItems={'center'}>
                  <Stack>
                      <DialogContentText fontSize={15}>Du wirst nicht mehr mit {friends.length > 0 && friends[friendIndex][1]} befreundet sein.</DialogContentText>
                      <DialogContentText fontSize={15}>Diese Aktion kann nicht Rückgängig gemacht werden!</DialogContentText>
                  </Stack>
              </Stack>
              
          </DialogContent>
          <DialogActions>
              <Button sx={{':focus': {outline: 'none'}}} onClick={fDelDialogClose}>Abbrechen</Button>
              <Button variant='contained' sx={{background: theme.palette.error.dark, ':focus': {outline: 'none'}}} onClick={fDelFriend}>Entfernen</Button>
          </DialogActions> 
      </Dialog>
    );
  }

  const fDelFriend = async () => {
    const uid = user.uid
    const friendToDelete = friends[friendIndex][0]
    console.log(friendToDelete)
    const userDocRef = doc(db, "Users", uid)
    const friendDocRef = doc(db, "Users", friendToDelete)
    await updateDoc(userDocRef, {
      Friends: friends.filter((friend) => friend[0] !== friendToDelete).map((friend) => friend[0])
    })
    await updateDoc(friendDocRef, {
      Friends: arrayRemove(user.uid)
    })
    setFriendIndex(0)
    setFriends(friends.filter((friend) => friend[0] !== friendToDelete).map((friend) => friend))
    console.log(friends)
    fDelDialogClose()
    setAlertText('Freund erfolgreich entfernt!')
    setAlertState(true)
  }
  
  const fAddDialogOpen = () => {
    setOpenFAdd(true);
  };
  
  const fAddDialogClose = () => {
    setOpenFAdd(false);
    initUserList()
  };

  const fDelDialogOpen = () => {
    setOpenFDel(true);
  };

  const fDelDialogClose = () => {
    setOpenFDel(false);
  };

  const fChatOpen = () => {
    setOpenFChat(true);
  };

  const fChatClose = () => {
    setOpenFChat(false);
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
      const friendData = (await getDoc(docRef)).data()
      const weekStatsRef = doc(db, "Users", uid, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek)

      const friendName = friendData.displayName
      const weekStats = (await getDoc(weekStatsRef)).data()
      const totalAmount = friendData.counter
      const tags = friendData.tags
      const locations = friendData.geoLocations
      const currentPics = friendData.currentPics
      const isExcluded = friendData.excludeMoments?.includes(user.uid)
      const streakAmount = friendData.streak?.amount
      const fcmToken = friendData.fcmToken
      let street

      locations.sort((a,b) => {
        return b.amount - a.amount
      })

      if (typeof locations[0] !== 'undefined') {
        street = await maptilersdk.geocoding.reverse([locations[0].point._long, locations[0].point._lat]);
        locations[0].street = street.features[0].text
      }

      const q = query(collection(db, "Chats"),
            where("participants", "array-contains", doc(db, "Users", friend)),
      );
      const chatsSnap = await getDocs(q)
      
      var chatId
      if(!chatsSnap.empty){
        chatId = chatsSnap.docs.find(doc =>
          doc.data().participants.some(ref => ref.id === user.uid)
        )?.id
      }else {
        chatId = null
      }

      console.log(chatId)

      cacheFriends.push([friend, friendName, weekStats, locations[0], totalAmount, tags, currentPics, !isExcluded, streakAmount, fcmToken, chatId])
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

  }, [friendIndex])

  const getMoments = async () => {
    const docRef = doc(db, 'Users', user.uid)
    const blackList = (await getDoc(docRef)).data().excludeMoments

    let localfreindsArr
    localfreindsArr = [...friends]
    localfreindsArr.unshift([user.uid, 'Deine'])
    const filtered = localfreindsArr.filter(sub => 
      !sub.some(value => blackList?.includes(value))
    );
    const promises = filtered.map(async (friend) => {
      const q = query(collection(db, 'smokeMoments'), where('userId', 'in', [friend[0]]));
      const querySnapshot = await getDocs(q);

      let friendArr = [];
      let isSmthNew = false 
      querySnapshot.forEach((doc) => {
        friendArr.push(doc.data())
        //console.log(doc.data().seenBy?.find(e => e.userId !== user.uid))
        if (!doc.data().seenBy?.some((e) => e.userId === user.uid) || !doc.data().seenBy || doc.data().seenBy?.length < 1) {
          isSmthNew = true
        }
      });

      if (friendArr.length > 0) {
        return { moments: friendArr, name: friend[1], shouldShowNew: isSmthNew};
      } else {
        return null;
      }
    });

    const results = [...await Promise.all(promises)];

    setFriendsMoments(results.filter(item => item !== null));
  };

  const cleanUpExpiredMoments = async (imagePath) => {

    const now = Timestamp.now()

    if (!imagePath) {
      const q = query(collection(db, 'smokeMoments'), where('expiresAt', '<', now))
  
      const expiredMoments = await getDocs(q)
  
      for (const moment of expiredMoments.docs) {
        const data = moment.data();

  
        if(data.imagePath){
          const substr = (data.imagePath.split('/')[7].split('%2F'))
          const substr2 = substr[2].split('?')
          const imageUrl = `${substr[0]}/${substr[1]}/${substr2[0]}`
          const imgRef = ref(storage, imageUrl);
          await deleteObject(imgRef).catch(() => null)
        }
  
        await deleteDoc(moment.ref)
      }
    }else{
      const q = query(collection(db, 'smokeMoments'), where('imagePath', '==', imagePath))
  
      const expiredMoments = await getDocs(q)
  
      for (const moment of expiredMoments.docs) {
        const data = moment.data();

  
        if(data.imagePath){
          const substr = (data.imagePath.split('/')[7].split('%2F'))
          const substr2 = substr[2].split('?')
          const imageUrl = `${substr[0]}/${substr[1]}/${substr2[0]}`
          const imgRef = ref(storage, imageUrl);
          await deleteObject(imgRef).catch(() => null)
        }
  
        await deleteDoc(moment.ref)
      }
    }
  }

  useEffect(() => {
    getMoments()


    const momentsRef = collection(db, "smokeMoments");
    const userRef = doc(db, 'Users', user.uid)

    const unsubscribe = onSnapshot(momentsRef, () => {
      getMoments()
    });

    const unsubscribe2 = onSnapshot(userRef, () => {
      getMoments()
    })

    return () => {unsubscribe(), unsubscribe2()};

  }, [friends])
  
  useEffect(() => {
    setFriends([])
    getOwnStats()
    getFriendsIDs().then((result) => {
      getFriendsFull(result)
    })
    initUserList()
  
  }, [user])

  useEffect(() => {
    setFriendIndex(1)
    cleanUpExpiredMoments()
  }, [])

  /* Story Feature */



  const handleStoryOpen = (currentPics) => {
    currentPicsRef.current = currentPics
    setOpenStory(true)
  }

  const handleStoryClose = () => {
    dialogRef.current.classList.add('closed')
    setTimeout(() => {
      setOpenStory(false)
      dialogRef.current.classList.remove('closed')
    }, 200);
    setImgIndexGlobal(0)
  }

  const handleOpenCamera = () => {
    setOpenCamera(true)
  }

  const handleCamClose = () => {
    setOpenCamera(false)
  }

  function CameraDialog({callback}) {

    return (
      <Dialog
        fullScreen
        sx={{backdropFilter: "blur(2px)", p:0, overflow: 'hidden'}}
        onClose={handleCamClose}
        open={openCamera}
      >
        <CameraCapture onClose={handleCamClose}></CameraCapture>
      </Dialog>
    )
  }

  const handleOpenExcludeList = (event) => {
    setAnchorEl(event.currentTarget);
  } 

  const handleCloseExcludeList = () => {
    setAnchorEl(null);
  }

  const openExcludeList = Boolean(anchorEl)
  const excludeListId = openExcludeList ? 'excludeList-popover' : undefined;

  function ExcludeListPopover() {
    const [friendsList, setFriendsList] = useState([])

    useEffect(() => {
      getFriendExcludeInfo()
    }, [friends])

    const getFriendExcludeInfo = async () => {

      if(!friends) return
        const promises = friends.map(async (friend) => {
          const docRef = doc(db, 'Users', friend[0])
          const isExcluded = (await getDoc(docRef)).data().excludeMoments?.includes(user.uid)
          return [friend[1], isExcluded, friend[0]]
        });

        const friendListCache = await Promise.all(promises)
        setFriendsList(friendListCache);
    }

    const handleCheckboxChange = async (i) => {
      const newState = [ ...friendsList]
      const docRef = doc(db, 'Users', newState[i][2])
      if (newState[i][1]) {

        newState[i][1] = false
        await updateDoc(docRef, {
          excludeMoments: arrayRemove(user.uid)
        })
      }else {
        newState[i][1] = true
        await updateDoc(docRef, {
          excludeMoments: arrayUnion(user.uid)
        })
      }

      setFriendsList(newState)
    }

    return(

      <Popover
        id={excludeListId}
        open={openExcludeList}
        anchorEl={anchorEl}
        onClose={handleCloseExcludeList}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Typography sx={{ p: 2 }}>Wer darf meine Smokemente sehen?</Typography>
        <Divider></Divider>
        {friendsList.map((friend, i) => (
          <Stack key={i} p={2} direction={'row'} gap={2} alignItems={'center'}>
            <Typography>{friend[0]}</Typography>
            <Checkbox checked={!friend[1]} onChange={(e) => handleCheckboxChange(i)}/>
          </Stack>
        ))}
      </Popover>
    )
  }

  const updateFriend = (chatId, friendIndex) => {
    const nextFriendList = [...friends]

    const friend = nextFriendList.find(el => el[0] === friendIndex)
    friend[10] = chatId
    setFriends(nextFriendList)
  }
    
  return (
    <>
    <FAddDialog></FAddDialog>
    <FDeleteDialog></FDeleteDialog>
    <CameraDialog></CameraDialog>
    <ExcludeListPopover></ExcludeListPopover>

    {friends.length > 0 && (
      <>
        <StoryDialog handleStoryClose={handleStoryClose} openStory={openStory} dialogRef={dialogRef} currentPics={currentPicsRef.current} friends={friends} updateFriend={updateFriend} chatId={friends[friendIndex][10]}></StoryDialog>
        <FriendChat friendIndex={friendIndex} updateFriend={updateFriend} chatID={friends[friendIndex][10]} friend={friends[friendIndex]} open={openFChat} onClose={fChatClose} />
        <FriendFab friendId={friends[friendIndex][0]}  openAdd={fAddDialogOpen} openDelete={fDelDialogOpen} openChat={fChatOpen}/>
      </>

    )}

    <Snackbar
      anchorOrigin={{vertical: 'top', horizontal:'center'}}
      autoHideDuration={3000}
      open={alertState}
      onClose={handleCloseAlert}
    >
      <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
        {alertText}
      </Alert>
    </Snackbar>
    {
      friends.length > 0 ? 
    
      <>
      <Box height={'100vh'} width={'inherit'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center" >
        <Stack height={'80vh'} width={'inherit'} alignItems={'center'} justifyContent={'space-between'} gap={5}>
          <Stack width={'inherit'} gap={1}>
            <Stack direction={'row'} gap={1} alignItems="center" justifyContent="flex-start">
              <Typography alignSelf={'flex-start'} fontSize={20} fontWeight={500}>Smokemente</Typography>
              <IconButton sx={{":focus": {outline: 'none'}, p:0}} onClick={handleOpenExcludeList}><MoreVertIcon fontSize='medium'/></IconButton>
            </Stack>
            <Box width={'100%'} sx={{overflow: 'scroll'}} display={'flex'} alignItems={'flex-start'}>
                <Stack direction={'row'} gap={2} overflow={'auto'}>
                  <Stack alignItems="center" justifyContent="center">
                      <Button onClick={handleOpenCamera} sx={{":focus": {outline: 'none'}, padding: 0, minWidth: 'auto', background: theme.palette.background.gradient, borderRadius: 10}}>
                        <Box sx={{background: theme.palette.background.default, borderRadius: 10, overflow: 'hidden', width: '67px', height: '67px', m: '3px'}} display={'flex'} alignItems="center" justifyContent="center" >
                          <Box sx={{borderRadius: 10, overflow: 'hidden', width: '60px', height: '60px'}} display={'flex'} alignItems="center" justifyContent="center" >
                            <Typography variant='h4'>+</Typography>
                          </Box>
                        </Box>
                      </Button> 
                      <Typography fontSize={13}>neu</Typography>
                    </Stack>
                  {friendsMoments?.map((friend, i) => (
                    friendsMoments?.length > 0 ?
                    <Stack key={i} alignItems="center" justifyContent="center">
                      <Button onClick={() => handleStoryOpen(friend.moments)} sx={friend.shouldShowNew ? {":focus": {outline: 'none'}, padding: 0, minWidth: 'auto', background: theme.palette.background.gradient, borderRadius: 10} : {":focus": {outline: 'none'}, padding: 0, minWidth: 'auto', background: '#252525', borderRadius: 10}}>
                        <Box sx={{background: theme.palette.background.default, borderRadius: 10, overflow: 'hidden', width: '67px', height: '67px', m: '3px'}} display={'flex'} alignItems="center" justifyContent="center" >
                          <Box sx={{borderRadius: 10, overflow: 'hidden', width: '60px', height: '60px'}} display={'flex'} alignItems="center" justifyContent="center" >
                            <img src={friend.moments[0].imagePath} alt="thumb" width={'60px'} />
                          </Box>
                        </Box>
                      </Button> 
                      <Typography fontSize={13}>{friend.name}</Typography>
                    </Stack> : <></>
                    ))
                  }
                  
                </Stack>
              </Box>
          </Stack>

          <FriendChanger friends={friends} friendIndex={friendIndex} setFriendIndex={setFriendIndex}/>
          <FriendChart ownStats={ownStats} friends={friends} friendIndex={friendIndex}/>
        </Stack>

      </Box>
      <FriendBadge friends={friends} friendIndex={friendIndex}/>
      </> :
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