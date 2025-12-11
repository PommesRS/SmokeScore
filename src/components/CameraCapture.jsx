import React, { useCallback, useRef, useState, useEffect } from "react";
import { ImageEditor } from './index.js'
import { Button, Card, Dialog, Typography, Box, Stack, useTheme, IconButton, DialogActions, DialogTitle, DialogContentText, DialogContent } from "@mui/material";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirestore, doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // für eindeutige Moment-IDs
import Webcam from 'react-webcam'
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import FlipCameraIosOutlinedIcon from '@mui/icons-material/FlipCameraIosOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { db, storage } from '../firebase.js';
import { useUserAuth } from "../context/userAuthConfig";


export default function CameraCapture({ onClose }) {
    const camera = useRef(null);
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const [image, setImage] = useState(null);
    const [imageB64, setImageB64] = useState(null)
    const [showImage, setShowImage] = useState(false)
    const [torchToggled, setTorchToggled] = useState(false)
    const [shouldRotate, setShouldRotate] = useState(null);
    const [facingMode, setFacingMode] = useState("user");
    const [deviceId, setDeviceId] = useState({});
    const [devices, setDevices] = useState([]);
    const [openConfirmDel, setOpenConfirmDel] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { user } = useUserAuth()
    const theme = useTheme()
    const [text, setText] = useState("");
    const [position, setPosition] = useState({ x: 0, y: 200 });

    const handleDevices = useCallback((mediaDevices) =>
            //console.log(mediaDevices.filter(({ kind }) => kind === "videoinput")),
            setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
        [setDevices]
    );

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(handleDevices);
    },[handleDevices]);

      useEffect(() => {
        const interval = setInterval(() => {
        const video = camera.current?.video;
        if (!video) return;

        const stream = video?.srcObject;
        if(stream) {
            const track = stream.getVideoTracks()[0];
            // Check if torch is supported
            const capabilities = track.getCapabilities();
            console.log(capabilities.focusMode)
            if (!capabilities.torch) {
                setTorchSupported(false)
            }else {
                setTorchSupported(true)
            }
        }
        // echte Videoauflösung auslesen
        const { videoWidth, videoHeight } = video;

        if (videoWidth && videoHeight) {
            // Entscheide automatisch:
            setShouldRotate(videoWidth > videoHeight); // landscape → drehen
            clearInterval(interval);
        }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const rotationStyle =
    shouldRotate === null
      ? {} // noch nicht geladen
      : shouldRotate
      ? { 
        transform: "translate(-50%, -50%) rotate(90deg)",
        width: window.innerHeight,
        height: window.innerWidth
    }
      : { 
        transform: "translate(-50%, -50%) rotate(0deg)" ,
        width: window.innerWidth,
        height: window.innerHeight
    };

    const videoConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode,
        deviceId: deviceId
    }

    function dataURLtoBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    const capture = useCallback( async () => {
        const dataUrl = camera.current.getScreenshot({
            width: 564,
            height: 1000,
            
        });
        
        const blob = dataURLtoBlob(dataUrl)

        //setImageB64(url)
        setImageB64(dataUrl)
        setImage(blob)
        setShowImage(true)
    },[camera])


    const toggleTorch = () => {
        const video = camera.current?.video;
        const stream = video?.srcObject;
        const track = stream.getVideoTracks()[0];

        const capabilities = track.getCapabilities();
        setTorchSupported(capabilities.torch)

        if(torchToggled){
            if (!stream) return;
        
            const track = stream.getVideoTracks()[0];
            setTorchToggled(false)
            track.applyConstraints({
                advanced: [{ torch: false }]
            });
        }else{
            
            if (!stream) return;
            if (!capabilities.torch) {
                setTorchToggled(true)
                return
            }else{

                setTorchToggled(true)
                track.applyConstraints({
                    advanced: [{ torch: true }]
                });
            }
            
            
        }
    }

    function ConfirmDeleteDialog() {

        return (
            <React.Fragment>
                <Dialog
                    sx={{
                        backdropFilter: "blur(2px)",
                        position: 'absolute',
                        top: 0
                    }}
                    open={openConfirmDel}
                    onClose={closeConfirmDel}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Smokement verwerfen</DialogTitle>
                    <DialogContent>
                        <Stack direction={'row'} flex={'true'} alignItems={'center'}>
                            <Stack>
                                <DialogContentText fontSize={15}>Willst du diesen Smokement wirklich verwerfen?</DialogContentText>
                            </Stack>
                        </Stack>
                        
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{':focus': {outline: 'none'}}} onClick={closeConfirmDel}>Abbrechen</Button>
                        <Button variant='contained' sx={{background: theme.palette.error.dark, ':focus': {outline: 'none'}}} onClick={clearImg}>Verwerfen</Button>
                    </DialogActions> 
                </Dialog>
            </React.Fragment>
        )
    }

    const closeConfirmDel = () => {
        setOpenConfirmDel(false)
    }

    const handleOpenClearImg = () => {
        setOpenConfirmDel(true)
    }

    const clearImg = () => {
        setImageB64(null)
        setImage(null)
        setShowImage(false)
        closeConfirmDel()
    }

    const uploadImage = async () => {
        if(!image) return;
        if(uploading) return;
        setUploading(true)

        //console.log(Math.round((position.y / imgRef.current.offsetHeight) * 100))

        const momentId = uuidv4()
        const path = `smokeMoments/${user.uid}/${momentId}.webp`
        const storageRef = ref(storage, path)

        await uploadBytes(storageRef, image);
        //console.log(await (getDownloadURL(ref(storage, 'smokeMoments/pflyg0G66heJeBD3Ld6Q48SqpDB3/ff17818a-72f3-4df1-b340-2a14ddec7601.webp'))))

        const now = Timestamp.now()
        //console.log(text !== 'Mein Text' && (Boolean(text.trim()) && text !== 'Mein Text'))
        if (text !== 'Mein Text' && (Boolean(text.trim()) && text !== 'Mein Text')) {
            await setDoc(doc(db, 'smokeMoments', momentId), {
                userId: user.uid,
                name: user.displayName,
                imagePath: await (getDownloadURL(ref(storage, path))).then((url) => {return url}),
                createdAt: now,
                expiresAt: Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000),
                overlay: {
                    text: text,
                    positionY: Math.round((position.y / imgRef.current.offsetHeight) * 100)
                }
            })
        }else{
            await setDoc(doc(db, 'smokeMoments', momentId), {
                userId: user.uid,
                name: user.displayName,
                imagePath: await (getDownloadURL(ref(storage, path))).then((url) => {return url}),
                createdAt: now,
                expiresAt: Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000),
            })
        }

        setUploading(false)
        // setImage(null)
        // setImageB64(null)


        const friendsRef = doc(db, "Users", user.uid)
        const friendData = (await getDoc(friendsRef)).data()
        const friendIDArr = friendData?.Friends

        friendIDArr.map(async (friendId) => {
            const FriendFCMRef = doc(db, 'Users', friendId)
            const friendCanNotifications = (await getDoc(FriendFCMRef)).data().canGetNotifications
            const friendExcludeList = (await getDoc(FriendFCMRef)).data().excludeMoments
            if(friendCanNotifications != false && !friendExcludeList.includes(user.uid)){
            const Token = (await getDoc(FriendFCMRef)).data().fcmToken
            fetch('https://sendpushtotoken-wcqbnpknwa-uc.a.run.app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: Token,
                    title: 'Neuer Smokement 📷',
                    body: user ? user.displayName + ' hat ein Smokement mit dir geteilt. Schau ihn dir schnell an bevor es zu spät ist!' : '',
                    msgType: 'notification',
                    eventDate: '-', 
                    senderName: '-'
                }),
                })
                .then(res => res.json())
                .then((res) => {console.log(res)})
                .catch(console.error);
            }
        })
        onClose()
    }

    const [shouldEditor, setShouldEditor] = useState(false)

  return (
    <Box>
        <ConfirmDeleteDialog></ConfirmDeleteDialog>
        {showImage ?
            shouldEditor ? 
                <Box sx={{width: '100dvw', height: '100dvh', zIndex: 100, position: 'absolute', overflow: 'hidden'}} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <ImageEditor             
                        text={text}
                        setText={setText}
                        position={position}
                        setPosition={setPosition} 
                        imageUrl={imageB64}
                        imgRef={imgRef}
                        onDelete={() => setShouldEditor(false)}
                        ></ImageEditor>
                </Box>
            
            :
                <Box onClick={() => setShouldEditor(true)} sx={{width: '100%', height: '100%', zIndex: 100, position: 'absolute', backgroundImage: `url(${imageB64})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}}>
                </Box>
        :
            
            <Box sx={{position: 'fixed', inset: 1, overflow: 'hidden', background: 'black'}}>
                <Webcam
                    ref={camera}
                    videoConstraints={videoConstraints}
                    screenshotFormat="image/webp"
                    screenshotQuality={0.85}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "100vh",
                        height: "100vw",
                        objectFit: "cover",
                        ...rotationStyle,
                    }}
                    mirrored={facingMode === 'user' ? true : false}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    // errorMessages={{
                    //     noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
                    //     permissionDenied: 'Permission denied. Please refresh and give camera permission.',
                    //     switchCamera:
                    //     'It is not possible to switch camera to different one because there is only one video device accessible.',
                    //     canvas: 'Canvas is not supported.',
                    // }}
                />
                {console.log(torchSupported)}
                {!torchSupported && torchToggled ? 
                    <Box sx={{position: 'absolute', inset: 0, overflow: 'hidden', boxShadow: 'inset 0px 0px 35px 70px #FFFFFF'}}/>
                : 
                    <></>
                }
                
            </Box>
        }

        <IconButton
            disableRipple 
            sx={{":focus": {outline: 'none'} , zIndex: 102, width: '100%', py: 2 }} 
            onClick={onClose}
        >
            <Typography><KeyboardArrowDownRoundedIcon sx={{position: 'absolute', top: 0, fill: 'black', zIndex: 0, filter: 'blur(2px)'}} fontSize="large" /><KeyboardArrowDownRoundedIcon fontSize="large" sx={{position: 'absolute', zIndex: 10, top: 0 }}/></Typography>
        </IconButton>

        {!showImage ? 
            <Stack gap={2} sx={{position: 'absolute', right: 0, top: 0, zIndex: 100}}>
                <IconButton
                    disableRipple 
                    sx={{":focus": {outline: 'none'}, m:2, padding: 0, minWidth: 'auto'}} 
                    onClick={toggleTorch}
                >
                    {!torchToggled ? 

                        <Typography sx={{position: 'relative'}}><FlashOffIcon sx={{position: 'absolute', right: 0, fill: 'black', zIndex: 0, filter: 'blur(2px)'}} fontSize="large" /><FlashOffIcon fontSize="large" sx={{position: 'absolute', zIndex: 10, right: 0}}/></Typography>
                    :
                        <Typography sx={{position: 'relative'}}><FlashOnIcon sx={{position: 'absolute', right: 0, fill: 'black', zIndex: 0, filter: 'blur(2px)'}} fontSize="large" /><FlashOnIcon fontSize="large" sx={{position: 'absolute', zIndex: 10, right: 0}}/></Typography>
                    }
                </IconButton>
                <IconButton
                    disableRipple 
                    sx={{":focus": {outline: 'none'}, m:2, padding: 0, minWidth: 'auto'}} 
                    onClick={() => {
                        if (camera.current) {
                            setFacingMode(prev => prev === "user" ? "environment" : "user");
                        }
                    }}
                >
                <Typography sx={{position: 'relative'}}><FlipCameraIosOutlinedIcon sx={{position: 'absolute', right: 0, fill: 'black', zIndex: 0, filter: 'blur(2px)'}} fontSize="large" /><FlipCameraIosOutlinedIcon fontSize="large" sx={{position: 'absolute', zIndex: 10, right: 0}}/></Typography>
            </IconButton>
            </Stack>
        :
            <IconButton
                disableRipple 
                sx={{":focus": {outline: 'none'}, p: 2, minWidth: 'auto', borderRadius: '50%', zIndex: 101}} 
                color="white" 
                // onClick={() => {
                //     if (camera.current) {
                //         const photo = camera.current.takePhoto()
                //         console.log(photo)
                //         setImage(photo)
                //         setShowImage(true)
                //     }
                // }}
                onClick={handleOpenClearImg}
            >
                <Typography sx={{position: 'relative'}}><CloseRoundedIcon sx={{fill: 'black', filter: 'blur(2px)', position: 'absolute'}} fontSize="large" /><CloseRoundedIcon fontSize="large" sx={{ position: 'absolute'}}/></Typography>
            </IconButton>
        }
                
        <Stack direction={'row'} sx={{ position: 'fixed', bottom: 0, width: '100%', minWidth: '130px', 
            minHeight: '130px', height: '20%', background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))', zIndex: 101, alignItems: 'center', justifyContent:'center', pointerEvents:'none'}}>
            {!showImage ? 
                <Button 
                    disableRipple 
                    sx={{":focus": {outline: 'none'}, ':hover': {border: '5px solid'}, padding: 4, minWidth: 'auto', borderRadius: '50%', border: '5px solid', pointerEvents: 'all'}} 
                    color="white" 
                    // onClick={() => {
                    //     if (camera.current) {
                    //         const photo = camera.current.takePhoto()
                    //         console.log(photo)
                    //         setImage(photo)
                    //         setShowImage(true)
                    //     }
                    // }}
                    onClick={capture}
                ></Button>
            :
                <IconButton
                    disabled={uploading}
                    disableRipple
                    sx={{":focus": {outline: 'none'}, minWidth: 'auto', borderRadius: '100px', background: theme.palette.background.gradient, pointerEvents: 'all'}} 
                    color="white" 
                    onClick={uploadImage}
                >
                    <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} gap={2}>
                        <Typography fontSize={20} fontWeight={400}>Senden</Typography> 
                        <SendRoundedIcon/>
                    </Stack>
                </IconButton>
            }

        </Stack>
    </Box>
  );
}
