import { Dialog, Button, DialogActions, DialogTitle, useTheme, Stack } from '@mui/material'
import React, {useRef, useState} from 'react'
import { CircleStencil, Cropper } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import { useUserAuth } from '../../context/userAuthConfig'
import { setDoc, doc } from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { db, storage } from '../../firebase.js';
import { updateProfile } from 'firebase/auth'


const ProfilePicture = ({open, image, onClose}) => {
  const [croppedImage, setCroppedImage] = useState(null)
  const [crop, setCrop] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [uploading, setUploading] = useState(false)
  const cropperRef = useRef(null);
  const {user} = useUserAuth()
  const theme = useTheme()

  const onCrop = () => {
    setCroppedImage(cropperRef.current.getCanvas()?.toDataURL());
    setCrop(cropperRef.current.getCoordinates())
    setImageData(cropperRef.current.getCanvas())
  }

  const cropToBlob = (dataURL) => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        img,
        0,
        0,
        crop.width,
        crop.height,
        0,
        0,
        512,
        512
      );

      canvas.toBlob(
        (blob) => resolve(blob),
        "image/webp",
        0.85
      );
    };

    img.src = dataURL;
    });
  };


  const uploadImage = async () => {
    if(!setImageData) return;
    if(uploading) return;
    setUploading(true)

    const momentId = user.uid
    const path = `profilePictures/${momentId}.webp`
    const storageRef = ref(storage, path)


    await uploadBytes(storageRef, await cropToBlob(croppedImage));
    const photoURL = await (getDownloadURL(ref(storage, path))).then((url) => {return url})
    await updateProfile(user, {
      photoURL: photoURL
    })

    const docRef = doc(db, 'Users', user.uid)

    await setDoc(docRef, {
      pbURL: photoURL
    }, {merge:true})
    
    setUploading(false)
    onClose(true)

    }

  return (
    <Dialog open={open} fullScreen>
      <DialogTitle zIndex={10} bgcolor={theme.palette.background.paper} overflow={'hidden'} width={'100%'} textAlign={'center'}>Neues Profilbild</DialogTitle>
      <Stack alignItems={'center'} justifyContent={'center'} height={'100%'}>
        {croppedImage ? (
          <img width={'90%'} src={croppedImage} style={{background: '#000', borderRadius: 1000}}/>
        ) : (
          <Cropper
            ref={cropperRef}
            src={image}
            className='cropper'
            style={{width: '100%' }}
            stencilComponent={CircleStencil}
            stencilProps={{grid: true, aspectRatio: 1/1,}}
          />
        )}
      </Stack>
      <DialogActions sx={{position: 'fixed', bottom: 0, right: 0, background: theme.palette.background.paper, width: '100%'}}>
        {imageData ? (
          <>
            <Button onClick={() => {onClose(false)}} disabled={uploading}>Verwerfen</Button>
            <Button variant='contained' loading={uploading} sx={{':focus': {outline: 'none'}}} onClick={uploadImage}>Profilbild festlegen</Button>
          
          </>
        ) : (
          <>
            <Button onClick={() => {onClose(false)}}>Verwerfen</Button>
            <Button variant='contained' sx={{':focus': {outline: 'none'}}} onClick={onCrop}>Zuschneiden</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ProfilePicture