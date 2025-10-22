import { useEffect, useState } from 'react'
import { Counter, Stats, Login, SignUp, ProtectedRoute, Friends, Map, Settings, About, Paywall, PaywallStats, PaywallRender } from './index.js';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuIcon from '@mui/icons-material/Menu';
import {Container, Box, Button, Typography, Stack } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Badge from '@mui/material/Badge';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
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
import { db, messaging } from '../firebase.js';
import { onMessage, getToken } from 'firebase/messaging';
import { collection, doc, getDoc, updateDoc, arrayRemove, arrayUnion, setDoc } from "@firebase/firestore";
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

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

function App() {
  const [value, setValue] = useState('tracker');
  const [open, setOpen] = useState(false);
  const [topText, setTopText] = useState('Tracker');
  const [compIndex, setCompIndex] = useState(true);
  const [openFRequests, setOpenFRequests] = useState(false);
  const [fRequests, setFRequests] = useState(0);
  const [fRequestsNames, setfRequestsNames] = useState([]);
  const [getRequestNames, setGetRequestNames] = useState([true])
  const [subscriptionStatus, setSubscriptionStatus] = useState(false)
  const [reload, setReload] = useState(false)
  const navigate = useNavigate();
  const { user, logOut } = useUserAuth();
  let uID;

  const getFRequests = async () => {
    if (getRequestNames) {
      try {
        uID = await user.uid;
        const docRef = await doc(db, "Users", uID)
        //const snapshot = await getCountFromServer((await getDoc(docRef)).data().FriendRequests);
        setfRequestsNames((await getDoc(docRef)).data().FriendRequests)
        setFRequests((await getDoc(docRef)).data().FriendRequests.length)
        setGetRequestNames(false)
      } catch (error) {
        
      }
    }
  }

  const getSubscriptionStatus = async () => {
    const docRef = doc(db, "Users", user.uid)
    if ((await getDoc(docRef)).data().hasPremium) {
      setSubscriptionStatus(true)
    } 
  }

  useEffect(() => {
    onMessage( messaging, (payload) => {
      console.log(payload)
    })

    if (Capacitor.isPluginAvailable('PushNotifications')) {
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        } else {
          console.warn('Keine Berechtigung für Push-Benachrichtigungen');
        }
      });

      // Erfolgreich registriert
      PushNotifications.addListener('registration', token => {
        console.log('Registriert mit Token:', token.value);
        async () => {
          let uID = await user.uid

          if (!user) {
            console.warn("Kein eingeloggter Benutzer");
            return;
          }

          const tokenRef = doc(db, 'Users', uID);
            await updateDoc(tokenRef, {
            fcmToken: token.value
          });
        }
      });

      // Fehler bei der Registrierung
      PushNotifications.addListener('registrationError', err => {
        console.error('Registrierungsfehler:', err);
      });

      // Push empfangen (App im Vordergrund)
      PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push erhalten:', notification);
      });

      // Benutzer klickt auf Notification
      PushNotifications.addListener('pushNotificationActionPerformed', notification => {
        console.log('Benutzeraktion:', notification);
        // z. B. Navigation auslösen
      });
    }
    
    
  }, [])

  const saveFCMToken = async () => {
    const token = await getToken(messaging, {vapiKey: 'BP5WjUBgUmAI5Ec80vu-1BoaoUzooBFr0IIseivX6DYKdtE1b77hw3-WSAQ9NRP3KD1hG8N8pJ6H2JMfWoO8hKI'})

    try {
      uID = await user.uid
    } catch (error) {
      
    }

    if (!user) {
    console.warn("Kein eingeloggter Benutzer");
    return;
  }

  const tokenRef = doc(db, 'Users', uID);
  await updateDoc(tokenRef, {
    fcmToken: token
  });

  }

  useEffect(() => {
    navigate(`/tracker`)
    getFRequests()
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
      setfRequestsNames(null)
      fRequestDialogClose()
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
      const docRef = await doc(db, "Users", uID)
      //const snapshot = await getCountFromServer((await getDoc(docRef)).data().FriendRequests);
      await updateDoc(docRef, {
        Friends: arrayRemove(friend)
      })

      console.log(fRequestsNames.indexOf(friend))
      fRequestsNames.splice(fRequestsNames.indexOf(friend))

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
      <Dialog slotProps={{paper: {sx: {background: 'var(--bg-color)'}}}} sx={{backdropFilter: "blur(2px)"}} onClose={fRequestDialogClose} open={openFRequests}>
        <DialogTitle textAlign={'center'} color='#fff'>Freundschaftsanfragen</DialogTitle>
        <List sx={{ p: 0 }} justifyContent={'center'}>
          {fRequestsNames ? fRequestsNames.map((friend) => (
            <ListItem sx={{px: 4}} key={friend}>
              <Stack>
                <ListItemText sx={{"& .MuiListItemText-primary": {color: '#8979FF'}, textAlign: 'center'}} primary={friend}/>
                <Stack direction={'row'}>
                  <ListItemButton onClick={() => handleRequestAccept(friend)}>
                    <ListItemText slotProps={{'data-role': 'role'}} sx={{color: '#fff', textAlign:'center'}} primary='Annehmen'/>
                  </ListItemButton>
                  <ListItemButton display= {'flex'}  alignItems='center' onClick={() => handleRequestDeny(friend)}>
                    <ListItemText sx={{color: '#fff', textAlign:'center'}} primary='Ablehnen'/>
                  </ListItemButton>
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
    <Box sx={{width: 250, height: '100vh', bgcolor: 'var(--bg-color)', color: 'white' }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <ListItemButton onClick={() => {navigate(`/friends`); setValue('friends');}}><ListItemCustom text={{text: 'Freunde'}}><GroupIcon sx={{color: 'white'}} /></ListItemCustom></ListItemButton>
        <ListItemButton onClick={() => {navigate(`/tracker`); setValue('tracker');}}><ListItemCustom text={{text: 'Tracker'}}><HomeIcon sx={{color: 'white'}} /></ListItemCustom></ListItemButton>
        <ListItemButton onClick={() => {navigate(`/stats`); setValue('stats');}}><ListItemCustom text={{text: 'Statistiken'}}><BarChartIcon sx={{color: 'white'}} /></ListItemCustom></ListItemButton>
        <ListItemButton onClick={() => {navigate(`/map`); setValue('map');}}><ListItemCustom text={{text: 'Karte'}}><LocationOnIcon sx={{color: 'white'}} /></ListItemCustom></ListItemButton>
        <ListItemButton onClick={fRequestDialogOpen}><ListItemCustom text={{text: 'Freundschafts Anfragen'}}><Badge badgeContent={fRequests} color="primary"><PeopleIcon sx={{color: 'white'}} /></Badge></ListItemCustom></ListItemButton>
        
      </List>
      <Divider sx={{border: '1px solid rgba(255, 255, 255, 0.5)'}}/>
      <List>
        <ListItemButton onClick={() => {navigate(`/about`); setValue('about');}}><ListItemCustom text={{text: 'Karte'}}><AccountCircleIcon sx={{color: 'white'}} /></ListItemCustom></ListItemButton>
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

  return (
    <>

      <FRequestsDialog></FRequestsDialog>
      <Box sx={{zIndex: '-1',left: '50%', transform: 'translate(-50%)', top: '-0%', height: '200px', width: '100%',position: 'absolute', background: 'linear-gradient(180deg, rgba(19, 8, 58, 0.5), rgba(170, 20, 240, 0))', filter: 'blur(00px)'}}></Box>
      <Container sx={ value != 'map' ? {zIndex: '5000000'} : {p: '0'}}>

      {user ? 
      <Box sx={value == 'map' ? {zIndex: '4', background: 'var(--bg-color)', borderBottom: '1px solid gray'} : {zIndex: '4', backdropFilter: 'blur(15px)'}} position={'fixed'} left={0} right={0} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Button sx={{color:'white', px: 0 ,py: 3, ":focus": {outline: 'none'}, ":hover": {bgcolor: 'inherit'}}} onClick={toggleDrawer(true)}><Badge badgeContent={fRequests} color="primary"><MenuIcon/></Badge></Button>
        {/* <Typography variant='h4'>{topText}</Typography> */}
        <Drawer sx={{backdropFilter: "blur(2px)"}} open={open} onClose={toggleDrawer(false)}>
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
                  bgcolor: 'var(--bg-color)',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
                '& .MuiList-root': {
                  bgcolor: 'var(--bg-color)',
                  color: 'white'
                },
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >

          <MenuItem onClick={handleClose}>
            <Badge badgeContent={subscriptionStatus ? <SmokingRoomsIcon sx={{color: '#FFD700', position: 'absolute', left: '-50%', top:'-25%'}}/> : ''}><Avatar /></Badge> 
            {user ? user.displayName : 'Profile'}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>
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
          <Route path='/about' element={<ProtectedRoute><About/></ProtectedRoute>}/>
          <Route path='/settings' element={<ProtectedRoute><Settings/></ProtectedRoute>}/>

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
            sx={{background: 'var(--bg-color)', color: '#767676'}}
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