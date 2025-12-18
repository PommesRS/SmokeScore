import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { 
  Box, IconButton, List, DialogTitle, Dialog, Paper, Input, 
  InputAdornment, ListItem, ListItemText, ListItemButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox,
  Typography, Stack, Snackbar, Alert, DialogActions, DialogContent, DialogContentText, Button,
  getFormControlLabelUtilityClasses, useTheme, LinearProgress, SwipeableDrawer, Popover, Divider
} from '@mui/material'
import './map.css';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { db, storage } from '../firebase.js';
import { collection, where, getDocs, query, updateDoc, arrayUnion, doc, getDoc, arrayRemove, onSnapshot, deleteDoc, Timestamp } from "@firebase/firestore";
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
import { startOfWeek, endOfWeek, format, getDay, set } from 'date-fns'
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import dayjs from 'dayjs';
import { CameraCapture } from './index.js';
import { deleteObject, ref } from 'firebase/storage';

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
      <>
        <ListItem disableGutters sx={{width: '100%'}} key={result[0]}>
          <Paper elevation={5} sx={{width: '100%', p: 2, whiteSpace: 'nowrap', overflow: 'hidden'}}>
            <ListItemText sx={{"& .MuiListItemText-primary": {color: 'inherit'}, m: 0}}>{result[1]}</ListItemText>
            <Typography sx={{color: 'gray', width: '100%', display: 'inline-block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>{result[0]}</Typography>
            <ListItemButton disableRipple={false} sx={{textAlign: 'left', p: 0, color: 'primary.light'}} data-uid={result[0]} onClick={handleRequestSend}>
              Anfragen
            </ListItemButton>
          </Paper>
        </ListItem>
      </>
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
      const currentPics = (await getDoc(docRef)).data().currentPics
      const isExcluded = (await getDoc(docRef)).data().excludeMoments?.includes(user.uid)
      const streakAmount = (await getDoc(docRef)).data().streak?.amount
      let street

      locations.sort((a,b) => {
        return b.amount - a.amount
      })

      if (typeof locations[0] !== 'undefined') {
        street = await maptilersdk.geocoding.reverse([locations[0].point._long, locations[0].point._lat]);
        locations[0].street = street.features[0].text
      }


      cacheFriends.push([friend, friendName, weekStats, locations[0], totalAmount, tags, currentPics, !isExcluded, streakAmount])
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

    if(typeof friends[friendIndex][3] !== 'undefined') { 

      const mapCoords = friends[friendIndex][3]
      if (map.current) {
        map.current.jumpTo({ center: [mapCoords.point._long, mapCoords.point._lat]})
      }
  
  
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: '59d38153-6ea3-464a-b3c9-2e869c449863',
        //style: mapStyle,
        center: [mapCoords.point._long, mapCoords.point._lat],
        zoom: 12,
        navigationControl: false
      });
    }else {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: '59d38153-6ea3-464a-b3c9-2e869c449863',
        //style: mapStyle,
        zoom: 0,
        navigationControl: false
      });
    }

  }, [friendIndex])

  const handleFriendSwitch = (direction) => {
    if (direction == 'up') {
      if (friendIndex < friends.length - 1 ) {
        setFriendIndex(friendIndex + 1)

      }
    } else if (direction == 'down') {
      if (friendIndex > 0) {
        setFriendIndex(friendIndex - 1)

      }
    }
  }

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
        console.log(doc.data().seenBy?.find(e => e.userId !== user.uid))
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

  function CustomProgressBar({imgIndex, selfIndex, callBack, arrLength, isPaused}) {
    
  const [progress, setProgress] = useState(0);
  const pauseRef = useRef(isPaused);
  const prevImgIndex = useRef(imgIndex);

  // Keep ref in sync.
  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (imgIndex === selfIndex && prevImgIndex.current !== imgIndex) {
      setProgress(0);
    }
    prevImgIndex.current = imgIndex;
  }, [imgIndex, selfIndex]);

  // Progress logic.
  useEffect(() => {
    // Before / after ordering
    if (imgIndex > selfIndex) {
      setProgress(100);
      return;
    }
    if (imgIndex < selfIndex) {
      setProgress(0);
      return;
    }

    const timer = setInterval(() => {
      //if (pauseRef.current) return; // why: avoid stale closure + skip when paused

      setProgress((prev) => {
        if (prev >= 100) {
          if (selfIndex === arrLength - 1) {
            handleStoryClose?.();
          } else {
            callBack?.();
          }
          return 0;
        }
        if (!pauseRef.current) {
          return prev + 1;
        }else {
          return prev
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [imgIndex, selfIndex, arrLength, callBack, handleStoryClose]);

  return (
    <Stack direction={"row"} spacing={1} sx={{ width: "100%" }}>
      <LinearProgress
        sx={{ width: "100%", borderRadius: 10 }}
        variant="determinate"
        value={progress}
      />
    </Stack>
  );
  }

  function StoryDialog({currentPics}) {
    if (openStory == false) {return}
    const [imgIndex, setImgIndex] = useState(0)
    const [openInsights, setOpenInsights] = useState(false)
    
    const [isPaused, setIsPaused] = useState(false)
    //currentPics = currentPics.sort((a,b) => a.createdAt.toMillis() - b.createdAt.toMillis());

    const sortedPics = useMemo(() => {
      return [...currentPics].sort((a, b) =>
        a.createdAt.toMillis() - b.createdAt.toMillis()
      );
    }, [currentPics]);

    console.log(sortedPics)

    const addToSeen = useCallback(async () => {
      if (sortedPics[imgIndex].seenBy?.some(e => e.userId === user.uid)) return
      if (sortedPics[0].userId === user.uid) return

      const seenBy = sortedPics[imgIndex].seenBy

      let momentId = ''
      const q = query(collection(db, 'smokeMoments'), where('imagePath', '==', sortedPics[imgIndex].imagePath))
      const querySnapshot = await getDocs(q)

      querySnapshot.forEach(doc => {
        momentId = doc.id
      });

      const momentRef = doc(db, 'smokeMoments', momentId)
      let updatedSeenBy = []
      if (seenBy) {
        updatedSeenBy = [...seenBy, {name: user.displayName, userId: user.uid, time: Timestamp.now()}]
      }else{
        updatedSeenBy = [{name: user.displayName, userId: user.uid, time: Timestamp.now()}]
      }

      await updateDoc(momentRef, {
        seenBy: updatedSeenBy
      })

      sortedPics[imgIndex].seenBy = [{name: user.displayName, userId: user.uid, time: Timestamp.now()}]
    }, [imgIndex])

    useEffect(() => {
      return () => addToSeen()
    }, [imgIndex, sortedPics])

    const handleNextImage = () => {

      if (imgIndex >= sortedPics.length - 1) {
      handleStoryClose()
      } else {
        setImgIndex(imgIndex + 1)
      }
    }

    const handlePrevImgage = () => {
      if (imgIndex == 0) { 
        return
      }
      setImgIndex(imgIndex - 1)


    }

    const tapTimer = useRef(null);
    const tapStart = useRef(0);

    const handlePressStart = (e, side) => {
      e.preventDefault();
      tapStart.current = Date.now();
      setIsPaused(true);

      tapTimer.current = setTimeout(() => {
        // long press → only pause
      }, 200);
    };

    const handlePressEnd = (e, side) => {
      e.preventDefault();
      setIsPaused(false);
      clearTimeout(tapTimer.current);

      const tapDuration = Date.now() - tapStart.current;

      if (tapDuration < 200) {
        // short tap
        if (side === 'left') {
          handlePrevImgage();
        } else {
          handleNextImage();
        }
      }
    };

    function InsightDialog() {
      return (
        <Dialog sx={{backdropFilter: 'blur(2px)'}}  open={openInsights} onClose={handleCloseInsights}>
          <DialogTitle>
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
              Optionen
              <IconButton sx={{':focus' : {outline: 'none'}}} onClick={handleCloseInsights}><CloseRoundedIcon fontSize='medium'/></IconButton>
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogTitle>Gesehen von</DialogTitle>
          <DialogContent>
            <List sx={{maxHeight: 300}}>
              {sortedPics[imgIndex].seenBy?.map((user) => (
                  <Paper key={user.userId} elevation={5} sx={{my: 2, p: 1}}>
                    <ListItem>
                      <Stack direction={'row'} justifyContent={'space-between'} sx={{width: '100%'}}>
                        <Typography>{user.name}</Typography>
                        <Typography fontWeight={200}>{dayjs(user.time.toDate()).format('HH:mm')}</Typography>
                      </Stack>
                    </ListItem>
                  </Paper>
              ))}
            </List>
          </DialogContent>
          <Divider />
          <DialogTitle>Bild Löschen</DialogTitle>
          <DialogContent>
            <Stack>
              <DialogContentText>Willst du dieses Bild wirklich aus deinen Smokementen löschen?</DialogContentText>
              <DialogContentText>Diese Aktion kann nicht rückgängig gemacht werden!</DialogContentText>
            </Stack>
            <DialogActions>
              <Button variant='contained' sx={{':focus': {outline: 'none'}}} color='error' onClick={() => {cleanUpExpiredMoments(sortedPics[imgIndex].imagePath), handleStoryClose()}}>Löschen</Button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      )
    }

    const handleOpenInsights = () => {
      setIsPaused(true);
      setOpenInsights(true)
    }

    const handleCloseInsights = () => {
      setIsPaused(false);
      setOpenInsights(false)
    }

    return (
      <>
      <InsightDialog></InsightDialog>
      <SwipeableDrawer
        anchor="bottom"
        ref={dialogRef}
        className='storyDialog'
        sx={{
          backdropFilter: "blur(2px)",
          height: '100vh',
        }}
        open={openStory}
        onClose={handleStoryClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        swipeAreaWidth={0}
        fullScreen
        >
        <Box sx={{height: '100vh', overflow: 'hidden'}} display={'flex'} alignItems="center" justifyContent="center">
          <Box sx={{position: 'absolute', zIndex: 10, top: 0, left: 0, width: '100%', height: '95%', boxShadow: 'inset 0px 60px 21px -7px rgba(0,0,0,0.51)', pb: 5}}>
            <Stack mx={1} pt={1}>
              <Stack direction={'row'} gap={1} sx={{width: '100%'}}>
                {sortedPics?.map((e, i) => (
                  <CustomProgressBar key={i} selfIndex={i} imgIndex={imgIndex} callBack={handleNextImage} isPaused={isPaused} arrLength={sortedPics.length}/>
                ))}
              </Stack>
              <Stack mx={1} mt={0.5} direction={'row'} sx={{position: 'relative'}} alignItems={'center'} justifyContent={'space-between'} gap={2}>
                <ArrowBackIosNewIcon onClick={handleStoryClose} sx={{':hover': {cursor: 'pointer'}}}/>
                <Typography fontSize={20} fontWeight={600} sx={{position: 'absolute', left: '50%', transform: 'translate(-50%)'}}>{sortedPics[0].name}</Typography>
                <Stack direction={'row'} gap={2} justifyContent={'center'} alignItems={'center'}>
                  <Typography fontSize={10} fontWeight={400}>{dayjs().diff(dayjs((sortedPics[imgIndex].createdAt).toDate()), 'hour') > 0 ? dayjs().diff(dayjs((sortedPics[imgIndex].createdAt).toDate()), 'hour') + ' Std.' : dayjs().diff(dayjs((sortedPics[imgIndex].createdAt).toDate()), 'minute') + ' Min'}</Typography>
                  {sortedPics[imgIndex].userId == user.uid ? 
                    <IconButton sx={{p: 1, ':focus' : {outline: 'none'}}} onClick={handleOpenInsights} ><MoreVertIcon fontSize='small' /></IconButton>
                  : 
                  <></>
                }
                </Stack>

              </Stack>
            </Stack>
            <Stack height={'100%'} direction={'row'} gap={4} justifyContent={'space-between'}>
              <Box width={'50%'}><Box onTouchStart={(e) => handlePressStart(e, 'left')} onTouchEnd={(e) => handlePressEnd(e, 'left')} onMouseDown={(e) => handlePressStart(e, 'left')} onMouseUp={(e) => handlePressEnd(e, 'left')} fullWidth sx={{height: '100%', ":focus": {outline: 'none'}, ':hover': {background: 'inherit'}}} disableRipple></Box></Box>
              <Box width={'50%'}><Box onTouchStart={(e) => handlePressStart(e, 'right')} onTouchEnd={(e) => handlePressEnd(e, 'right')} onMouseDown={(e) => handlePressStart(e, 'right')} onMouseUp={(e) => handlePressEnd(e, 'right')} fullWidth sx={{height: '100%', ":focus": {outline: 'none'}, ':hover': {background: 'inherit'}}} disableRipple></Box></Box>
            </Stack>
          </Box>
          <Box sx={{maxHeight: '100dvh', maxWidth: '546px', position: 'relative'}}>
            {sortedPics[imgIndex].overlay ? 
                    <div
                      style={{ color: "white", fontSize: 24, outline: "none", textAlign: 'center', textWrap: 'balance', wordBreak: 'break-all', maxWidth:'546px', mx: 50, touchAction: 'none', background: 'rgba(0,0,0,0.6)', position: 'absolute', width: '100%', top: `${sortedPics[imgIndex].overlay.positionY}%`,}}
                    >
                      {sortedPics[imgIndex].overlay.text}
                    </div>
              // <Typography variant='h6' sx={{background: 'rgba(0,0,0,0.6)', position: 'absolute', width: '100%', top: `${sortedPics[imgIndex].overlay.positionY}%`, textAlign:'center', textWrap: 'wrap', maxWidth:'100%'}}>{sortedPics[imgIndex].overlay.text}</Typography>
              :
              <></>
            }
            <img className='storyImg' 
              src={sortedPics ? sortedPics[imgIndex].imagePath : 'https://miro.medium.com/v2/resize:fit:1400/1*MXyMqcEJ6Se0SCWcYCKZTQ.jpeg'}
              alt="mainImg"
              />
          </Box>
        </Box>
      </SwipeableDrawer>
      </>
    )
  }

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
    
  return (
    <>
    <FAddDialog></FAddDialog>
    <FDeleteDialog></FDeleteDialog>
    <StoryDialog currentPics={currentPicsRef.current}></StoryDialog>
    <CameraDialog></CameraDialog>
    <ExcludeListPopover></ExcludeListPopover>

    <Box zIndex={5} position={'fixed'} bottom={80} right={20}>
      <Stack gap={2}>
        <IconButton onClick={fAddDialogOpen} size='large' sx={{":focus": {outline: 'none'}, backgroundColor: (theme) => theme.palette.primary.main}} bgcolor='primary' aria-label="addFriend">
          <PersonAddAlt1Icon fontSize='smalllarge'/>
        </IconButton>
        <IconButton onClick={fDelDialogOpen} size='large' sx={{":focus": {outline: 'none'}, backgroundColor: (theme) => theme.palette.error.dark}} bgcolor='primary' aria-label="removeFriend">
          <DeleteIcon fontSize='smalllarge'/>
        </IconButton>
      </Stack>
    </Box>
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
                    <Stack alignItems="center" justifyContent="center">
                      <Button key={i} onClick={() => handleStoryOpen(friend.moments)} sx={friend.shouldShowNew ? {":focus": {outline: 'none'}, padding: 0, minWidth: 'auto', background: theme.palette.background.gradient, borderRadius: 10} : {":focus": {outline: 'none'}, padding: 0, minWidth: 'auto', background: '#252525', borderRadius: 10}}>
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
          <Stack direction={'row'} width={'inherit'} overflowX={'hidden'} textOverflow={'ellipsis'} gap={2} justifyContent={'center'} alignItems={'center'}>
            <IconButton onClick={() => {handleFriendSwitch('down')}} color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowBackIosNewIcon/></IconButton>
            <Stack justifyContent={'center'} alignItems={'center'} position={'relative'}>
              {friends[friendIndex][4] >= 1000 ? 
              <React.Fragment>
                <SmokingRoomsIcon className='glow-animate' fontSize='large' sx={{
                  position: 'absolute', 
                  top: -20, 
                  fontWeight: 'bold'}}/>
                <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative'}}>{friends.length > 0 && friends[friendIndex][1]}</Typography>
              </React.Fragment>
              
              : <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative'}}>{friends.length > 0 && friends[friendIndex][1]}</Typography>
              }
            </Stack>
            <IconButton onClick={() => {handleFriendSwitch('up')}}  color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowForwardIosIcon/></IconButton>
          </Stack>
          {/* <Stack>
            <Stack direction={'row'} width={'inherit'} overflowX={'hidden'} textOverflow={'ellipsis'} justifyContent={'center'} alignItems={'center'}>
              <WhatshotIcon sx={{fontSize: '70pt'}}/>
              <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '90pt', position: 'relative', lineHeight: '1', textAlign: 'center'}}>NaN</Typography>
            </Stack>
            <Typography height={'auto'} noWrap sx={{fontWeight: 'light', fontSize: '20pt', position: 'relative', textAlign: 'center'}}>Streak</Typography>
          </Stack> */}
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
                },
                popper: {
                  placement: 'top'
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
      <Box height={'100%'} maxHeight={'200vh'} width={'inherit'} mb={9} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent={'center'}>
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
              {friends[friendIndex][8] && (
                <React.Fragment>
                  <Divider sx={{height: 20}}/>
                  <Stack direction={'row'} justifyContent={'center'} alignItems={'center'}>
                    <WhatshotIcon sx={{fontSize: '50pt', filter: 'drop-shadow(6px 6px 4px rgba(0, 0, 0, 0.25))'}}/>
                    <Typography textAlign={'center'} fontWeight={700} lineHeight={'80%'} fontSize={'50pt'} sx={{textShadow: '6px 6px 4px rgba(0, 0, 0, 0.25)'}}>{friends.length != 0 ? friends[friendIndex][8] : 'loading'}</Typography>
                  </Stack>
                  <Typography display={'flex'} textAlign={'center'}>Streak</Typography>
                </React.Fragment>
              )}
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
                <Typography display={'flex'} alignItems={'center'}><PersonPinCircleIcon/>{friends.length != 0 ? typeof friends[friendIndex][3] !== 'undefined' ? friends[friendIndex][3].street : 'noch kein Ort gespeichert' : 'loading...'}</Typography>
                <Typography textAlign={'right'}>{friends.length != 0 ? typeof friends[friendIndex][3] !== 'undefined' ? friends[friendIndex][3].amount : '0' : 'loading...'}</Typography>
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