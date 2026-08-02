import React, {useState, useMemo, useCallback, useEffect, useRef} from 'react'
import { 
  Box, IconButton, List, DialogTitle, Dialog, Paper, Input, 
  InputAdornment, ListItem, ListItemText, ListItemButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox,
  Typography, Stack, Snackbar, Alert, DialogActions, DialogContent, DialogContentText, Button,
  getFormControlLabelUtilityClasses, useTheme, LinearProgress, SwipeableDrawer, Popover, Divider
} from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import dayjs from 'dayjs';
import { useUserAuth } from '../../context/userAuthConfig';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

function CustomProgressBar({imgIndex, selfIndex, callBack, arrLength, isPaused, handleStoryClose}) {
    const { user } = useUserAuth();
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

const StoryDialog = ({currentPics, openStory, dialogRef, handleStoryClose}) => {

    if (openStory == false) return
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

    const {user} = useUserAuth();

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
                  <CustomProgressBar handleStoryClose={handleStoryClose} key={i} selfIndex={i} imgIndex={imgIndex} callBack={handleNextImage} isPaused={isPaused} arrLength={sortedPics.length}/>
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

export default StoryDialog