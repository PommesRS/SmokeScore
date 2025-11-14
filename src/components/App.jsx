import { useEffect, useState } from 'react'
import { Counter, Stats, Login, SignUp, ProtectedRoute, Friends, Map, Settings, About, 
  Style, Paywall, PaywallStats, PaywallRender, EventPopup, Events } from './index.js';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import PaletteIcon from '@mui/icons-material/Palette';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import MenuIcon from '@mui/icons-material/Menu';
import {Container, Box, Button, Typography, Stack, ClickAwayListener, Divider } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Badge from '@mui/material/Badge';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import SettingsIcon from '@mui/icons-material/Settings';
import ListItemText from '@mui/material/ListItemText';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import PersonAdd from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import Logout from '@mui/icons-material/Logout';
import {Routes, Route, Navigate, useLocation, useNavigate} from 'react-router-dom';
import { useUserAuth } from '../context/userAuthConfig.jsx';
import { onMessage, getToken } from 'firebase/messaging';
import { db, messaging } from '../firebase.js';
import { collection, doc, getDoc, updateDoc, arrayRemove, arrayUnion, setDoc, onSnapshot } from "@firebase/firestore";
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { onBackgroundMessage } from 'firebase/messaging/sw';
import dayjs from 'dayjs';
import { TheaterComedy } from '@mui/icons-material';

export function ListItemCustom ({children, text}) {
  return(
    <>
      <ListItemIcon>
          {children}     
      </ListItemIcon>
      <ListItemText primary={text.text} />
    </>
  );
}

const mainColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--main-color")
      .trim();

function App() {
  const [value, setValue] = useState('tracker');
  const [open, setOpen] = useState(false);
  const [topText, setTopText] = useState('Tracker');
  const [compIndex, setCompIndex] = useState(true);
  const [openFRequests, setOpenFRequests] = useState(false);
  const [fRequests, setFRequests] = useState(0);
  const [newInvites, setNewInvites] = useState(0);
  const [fRequestsNames, setfRequestsNames] = useState([]);
  const [getRequestNames, setGetRequestNames] = useState([true])
  const [subscriptionStatus, setSubscriptionStatus] = useState(false)
  const [reload, setReload] = useState(false)
  const navigate = useNavigate();
  const { user, logOut } = useUserAuth();
  const [openEventPopup, setOpenEventPopup] = useState(false)
  const [eventId, setEventId] = useState(null)
  const [eventText, setEventText] = useState(null)
  const [eventDate, setEventDate] = useState(null)
  const [eventSenderName, setEventSenderName] = useState(null)
  let uID;

  const getSubscriptionStatus = async () => {
    const docRef = doc(db, "Users", user.uid)
    if ((await getDoc(docRef)).data().hasPremium) {
      setSubscriptionStatus(true)
    } 
  }

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log(event.data.data.msgType)
      if (event.data.data.msgType === 'invite') {
        console.log("Message from SW:", event.data.data);
        setEventId(event.data.data.title)
        setEventText(event.data.data.body)
        setEventDate(event.data.data.eventDate)
        setEventSenderName(event.data.data.senderName)
        setOpenEventPopup(true);
      }else {
        console.log('anus')
      }
    })
    
  }, [])

  useEffect(() => {
    if (!user?.uid) return; 
    const ref = doc(db, "Users", user.uid);
    const refEvents = collection(db, "Events");

    const unsubscribe = onSnapshot(ref, async (snapshot) => {
    if (snapshot.exists()) {
        console.log("Current data: ", snapshot.data());
        const data = snapshot.data()
        console.log(data.events)
        let i = 0
        let fRequestsNamesLocal = []
        let fRequestLocal = 0

        await Promise.all(
            (data.events).map(async (event) => {
              const eventDocRef = doc(db, "Events", event)
              const eventData = (await getDoc(eventDocRef)).data()
              console.log(await eventData)
              if (eventData.status === 'pending' && eventData.sender !== user.uid) {
                i++
              }
              if (eventData.newMsg === true && eventData.lastMsgSender !== user.uid){
                i++
              }
            })
        )

        await Promise.all(
          (data.FriendRequests).map(async (friend) => {
            const friendDocRef = doc(db, "Users", friend)
            const friendData = (await getDoc(friendDocRef)).data()
            fRequestsNamesLocal.push({displayName: friendData.displayName, uid: friend})
            console.log(fRequestsNamesLocal)
            fRequestLocal++
          })
        )

        setNewInvites(i)
        setfRequestsNames(fRequestsNamesLocal)
        setFRequests(fRequestLocal)
    }
    });


    return () => {unsubscribe()}; // wichtig: Listener beim Unmount entfernen
  }, [user?.uid])

  const saveFCMToken = async () => {
    const token = await getToken(messaging, {vapiKey: 'BP5WjUBgUmAI5Ec80vu-1BoaoUzooBFr0IIseivX6DYKdtE1b77hw3-WSAQ9NRP3KD1hG8N8pJ6H2JMfWoO8hK'})

    try {
      uID = await user.uid
    } catch (error) {

    }

    if (!user) {
    console.warn("Kein eingeloggter Benutzer");
    return;
    }


    try {
      const tokenRef = doc(db, 'Users', uID);
      await updateDoc(tokenRef, {
        fcmToken: token
      });
    } catch (error) {
      console.log(error)
    }

  }

  useEffect(() => {
    navigate(`/tracker`)
    saveFCMToken()
    getSubscriptionStatus()
  }, [user])

  const fRequestDialogOpen = () => {
    setOpenFRequests(true);
  };
  
  const fRequestDialogClose = () => {
    setOpenFRequests(false);
  };

  const handleRequestAccept = async (friend) => {
    try {
      uID = await user.uid;
      const docRef = await doc(db, "Users", uID)
      //const snapshot = await getCountFromServer((await getDoc(docRef)).data().FriendRequests);
      await updateDoc(docRef, {
        Friends: arrayUnion(friend)
      })
      await updateDoc(docRef, {
        FriendRequests: arrayRemove(friend)
      })
      console.log(fRequestsNames.indexOf(friend))
      fRequestsNames.splice(fRequestsNames.indexOf(friend))
      setfRequestsNames(fRequestsNames.splice(fRequestsNames.indexOf(friend)))
      setFRequests(fRequests - 1)
      setReload(true)
    } catch (error) {
      console.log(error)
    }
    
    try {
      const docRef = await doc(db, "Users", friend)
      //const snapshot = await getCountFromServer((await getDoc(docRef)).data().FriendRequests);
      await updateDoc(docRef, {
        Friends: arrayUnion(uID)
      })
    } catch (error) {
      console.log(error)
    }
  }
  
  const handleRequestDeny = async (friend) => {
    try {
      uID = await user.uid;
      const docRef = doc(db, "Users", uID)
      //const snapshot = await getCountFromServer((await getDoc(docRef)).data().FriendRequests);
      await updateDoc(docRef, {
        FriendRequests: arrayRemove(friend)
      })

      console.log(fRequestsNames.indexOf(friend))
      fRequestsNames.splice(fRequestsNames.indexOf(friend))

      console.log(fRequestsNames)

      setFRequests(fRequests - 1)
      setReload(true)
    } catch (error) {
      console.log(error)
    }
    
    try {
      const docRef = await doc(db, "Users", friend)
      //const snapshot = await getCountFromServer((await getDoc(docRef)).data().FriendRequests);
      await updateDoc(docRef, {
        Friends: arrayUnion(uID)
      })
    } catch (error) {
      console.log(error)
    }
  }


  function FRequestsDialog ({children}) {
  if (user) {
    return (
      <Dialog sx={{backdropFilter: "blur(2px)"}} onClose={fRequestDialogClose} open={openFRequests}>
        <DialogTitle textAlign={'center'} color='#fff' sx={{textShadow: '4px 4px 3px rgba(0, 0, 0, 0.25)'}}>Freundschaftsanfragen</DialogTitle>
        <List sx={{ p: 0 }}>
          {fRequestsNames ? fRequestsNames.map((friend) => (
            <ListItem sx={{px: 1}} key={friend.uid} >
              <Stack gap={1} p={1} sx={{ borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', width: '100%' }}>
                <Typography sx={{textAlign: 'center'}}>
                  <Typography component='span' color='primary.light'>{friend.displayName}</Typography>&nbsp;möchte mit dir befreundet sein</Typography>
                <Stack direction={'row'} gap={2} justifyContent='space-around'>
                  <Button variant='outlined' display= {'flex'} alignItems='center' onClick={() => handleRequestDeny(friend.uid)}>Ablehnen</Button>
                  <Button variant='contained' onClick={() => handleRequestAccept(friend.uid)}>Annehmen</Button>
                </Stack>
              </Stack>
            </ListItem>
          )) : <></>}
        </List>
      </Dialog>
    );
  }else {
    return
  }
    
  }

  
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setTopText(newValue);
    console.log(newValue)
    navigate(`/${newValue}`)
  };



  const DrawerList = (
    <Box sx={{width: 250, height: '100vh', color: 'white' }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <ListItemButton onClick={() => {navigate(`/friends`); setValue('friends');}}><ListItemCustom text={{text: 'Freunde'}}><GroupIcon sx={{color: 'white'}} /></ListItemCustom></ListItemButton>
        <ListItemButton onClick={() => {navigate(`/tracker`); setValue('tracker');}}><ListItemCustom text={{text: 'Tracker'}}><HomeIcon sx={{color: 'white'}} /></ListItemCustom></ListItemButton>
        <ListItemButton onClick={() => {navigate(`/stats`); setValue('stats');}}><ListItemCustom text={{text: 'Statistiken'}}><BarChartIcon sx={{color: 'white'}} /></ListItemCustom></ListItemButton>
        <ListItemButton onClick={() => {navigate(`/map`); setValue('map');}}><ListItemCustom text={{text: 'Karte'}}><LocationOnIcon sx={{color: 'white'}} /></ListItemCustom></ListItemButton>
        <ListItemButton onClick={fRequestDialogOpen}><ListItemCustom text={{text: 'Freundschafts Anfragen'}}><Badge badgeContent={fRequests} color='primary'><PeopleIcon sx={{color: 'white'}} /></Badge></ListItemCustom></ListItemButton>
        <ListItemButton onClick={() => {navigate(`/events`); setValue('events');}}><ListItemCustom text={{text: 'Einladungen'}}><Badge badgeContent={newInvites} color='primary'><Diversity3Icon sx={{color: 'white'}} /></Badge></ListItemCustom></ListItemButton>
        
      </List>
      <Divider sx={{border: '1px solid rgba(255, 255, 255, 0.5)'}}/>
      <List>
        <ListItemButton onClick={() => {navigate(`/style`); setValue('style');}}><ListItemCustom text={{text: 'Farbstil ändern'}}><PaletteIcon sx={{color: 'white'}} /></ListItemCustom></ListItemButton>
        <ListItemButton onClick={() => {navigate(`/settings`); setValue('settings');}}><ListItemCustom text={{text: 'Einstellungen'}}><SettingsIcon sx={{color: 'white'}} /></ListItemCustom></ListItemButton>
      </List>
    </Box>
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const open2 = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (e) => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logOut()
    } catch (error) {
      console.log(error.message)
    }
  }

  function handleNavigate(to){
    return <Navigate to='/tracker'/>
  }

  const handlePopupClose = () => {
    setOpenEventPopup(false)
  }

  const handleOpenEventPopup = () => {
    setOpenEventPopup(true)
    console.log(openEventPopup)
  }

  return (
    <>

      <FRequestsDialog></FRequestsDialog>

      {/* <ClickAwayListener onClickAway={handlePopupClose}>
          <EventPopup open={openEventPopup} onTrigger={() => setOpenEventPopup(false)} senderName={eventSenderName} eventDate={eventDate} inviteText={eventText} eventId={eventId != null ? eventId : '4NMD0tUW93XjV9ITOYYZ' }>{openEventPopup}</EventPopup>
      </ClickAwayListener> */}

      {/*   */}
      <Container sx={ value != 'map' ? {zIndex: '5000000'} : {p: '0'}}>  

      {user ? 
      <Box sx={value == 'map' ? {zIndex: '4', borderBottom: '1px solid gray', bgcolor: 'background.paper'} : {zIndex: '4', backdropFilter: 'blur(15px)'}} position={'fixed'} left={0} right={0} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Button sx={{color:'white', px: 0 ,py: 3, ":focus": {outline: 'none'}, ":hover": {bgcolor: 'inherit'}}} onClick={toggleDrawer(true)}><Badge badgeContent={fRequests + newInvites} color="primary"><MenuIcon/></Badge></Button>
        {/* <Typography variant='h4'>{topText}</Typography> */}
        <Drawer sx={{backdropFilter: "blur(2px)"}} elevation={0} open={open} onClose={toggleDrawer(false)}>
          {DrawerList}
        </Drawer>
        <Button onClick={handleClick} sx={user ? { zIndex: '10',color:'white', px: 0 ,py: 3, ":focus": {outline: 'none'}, ":hover": {bgcolor: 'inherit'}} : {display: 'none'}}> <AccountCircleIcon/> </Button>
        
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open2}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
                '& .MuiList-root': {
                  color: 'white'
                },
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >

          <MenuItem>
            <Badge badgeContent={subscriptionStatus ? <SmokingRoomsIcon sx={{color: '#FFD700', position: 'absolute', left: '-50%', top:'-25%'}}/> : ''}><Avatar /></Badge> 
            {user ? user.displayName : 'Profile'}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleOpenEventPopup}>
            <ListItemIcon>
              <PersonAdd sx={{color: 'white'}} fontSize="small" />
            </ListItemIcon>
            Add another account
          </MenuItem>
          <MenuItem onClick={() => {navigate(`/settings`); setValue('settings')}}>
            <ListItemIcon>
              <SettingsIcon sx={{color: 'white'}} fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout sx={{color: 'white'}} fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box> :
      <></>}

        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/signup' element={<SignUp/>}/>

          
          {/* Einkommentieren um Paywall zu aktivieren // folgenden Block auskommentieren!
          <Route path='/tracker' element={<ProtectedRoute><Counter/></ProtectedRoute>}/>
          <Route path='/stats' element={<ProtectedRoute><Paywall><Stats displayName={'Stats'}/></Paywall></ProtectedRoute>}/>
          <Route path='/friends' element={<ProtectedRoute><Paywall><Friends displayName={'Friends'}/></Paywall></ProtectedRoute>}/>
          <Route path='/map' element={<ProtectedRoute><Paywall><Map displayName={'Map'}/></Paywall></ProtectedRoute>}/>
          <Route path='/about' element={<ProtectedRoute><About/></ProtectedRoute>}/>
          <Route path='/settings' element={<ProtectedRoute><Settings/></ProtectedRoute>}/> */}

          <Route path='/tracker' element={<ProtectedRoute><Counter/></ProtectedRoute>}/>
          <Route path='/stats' element={<ProtectedRoute><Stats displayName={'Stats'}/></ProtectedRoute>}/>
          <Route path='/friends' element={<ProtectedRoute><Friends displayName={'Friends'}/></ProtectedRoute>}/>
          <Route path='/map' element={<ProtectedRoute><Map displayName={'Map'}/></ProtectedRoute>}/>
          <Route path='/style' element={<ProtectedRoute><Style/></ProtectedRoute>}/>
          <Route path='/settings' element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
          <Route path='/events' element={<ProtectedRoute><Events/></ProtectedRoute>}/>

          {/* 404 Fallback Route */}
          <Route path="*" element={
            <Box height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
              <Typography variant='h3' textAlign={'center'}>404 <br/> Seite nicht Gefunden</Typography>
            </Box>
            }/>
        </Routes>

        {user ? 
        <Box sx={{position:'fixed', bottom: '0', left: '0', right: '0', borderTop: '1px solid rgba(155,155,155,0.5)', zIndex: '2'}}>
          <BottomNavigation
            sx={{color: '#767676'}}
            value={value}
            onChange={handleChange}
            display={'flex'} justify-content={'space-between'}>
            <BottomNavigationAction sx={{color: '#767676', ":focus": {outline: 'none'}}} value={'friends'} label={'Freunde'} icon={<GroupIcon />} />
            <BottomNavigationAction sx={{color: '#767676', ":focus": {outline: 'none'}}} value={'tracker'} label={'Tracker'} icon={<HomeIcon />} />
            <BottomNavigationAction sx={{color: '#767676', ":focus": {outline: 'none'}}} value={'stats'} label={'Stats'} icon={<BarChartIcon />} />
            <BottomNavigationAction sx={{color: '#767676', ":focus": {outline: 'none'}}} value={'map'} label={'Karte'} icon={<LocationOnIcon />} />
          </BottomNavigation> 
        </Box> :
        <></>}
      </Container>
      
    </>
  )
}

export default App;