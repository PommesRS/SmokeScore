import React, { useState, useEffect } from 'react'
import { 
  Box, IconButton, List, DialogTitle, Dialog, Paper, Input, 
  InputAdornment, ListItem, ListItemText, ListItemButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SearchIcon from '@mui/icons-material/Search';
import { db } from '../firebase.js';
import { collection, where, getDocs, query, updateDoc, arrayUnion, doc, getDoc } from "@firebase/firestore";
import { useUserAuth } from '../context/userAuthConfig';


const Friends = () => {
  const [friends, setFriends] = useState([])
  const [openFAdd, setOpenFAdd] = useState(false);
  const [errorMessage, setErrorMessage] = useState('No User Found')
  const [searchResult, setSearchResult] = useState([])
  const [reload, setReload] = useState(false)
  const { user } = useUserAuth();
  const uID = user.uid;

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

  async function getFriendsIDs() {
    const uid = user.uid
    const docRef = doc(db, "Users", uid)
    return (await getDoc(docRef)).data().Friends
  }

  async function getFriendsFull(friendArr) {

    var cacheFriends = new Array();

    await Promise.all(friendArr.map(async (friend) => {
      const uid = friend
      const docRef = doc(db, "Users", uid)
      cacheFriends.push([friend, (await getDoc(docRef)).data().displayName])
    }))

    setFriends(cacheFriends)
    console.log()

    // friendArr.forEach(async (friend) => {
    //   const uid = friend
    //   const docRef = doc(db, "Users", uid)
    //   return (await getDoc(docRef)).data().Friends

    // })
  }

  useEffect(() => {
    setFriends([])
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

      <Box height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
      <TableContainer component={Paper} sx={{ backgroundColor: '#171726'}} elevation={2}>
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
      </Box>

    </>
)
}

export default Friends