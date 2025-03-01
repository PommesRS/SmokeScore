import React, { useRef, useEffect, useState } from 'react'
import * as maptilersdk from '@maptiler/sdk';
import PropTypes from 'prop-types';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';
import { Box, SwipeableDrawer, Typography, Stack } from '@mui/material';
import { useUserAuth } from '../context/userAuthConfig.jsx';
import { db } from '../firebase.js';
import { collection, getCountFromServer, doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "@firebase/firestore";
import { point, buffer, bbox } from '@turf/turf';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';


const drawerBleeding = 56;

const Puller = styled('div')(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: grey[300],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
  ...theme.applyStyles('dark', {
    backgroundColor: grey[900],
  }),
}));

const Root = styled('div')(({ theme }) => ({
  height: '100%',
  backgroundColor: grey[100],
  ...theme.applyStyles('dark', {
    backgroundColor: theme.palette.background.default,
  }),
}));

const StyledBox = styled('div')(({ theme }) => ({
  backgroundColor: '#0B0B12',
}));

const Map = (props) => {
  const { window } = props;
  const [open, setOpen] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [drawerProps, setDrawerProps] = useState({})
  const { user } = useUserAuth();
  const falkensee = { lng: 13.091315, lat: 52.560042 };
  const zoom = 12;
  maptilersdk.config.apiKey = '4G5717HLSk8wemu4bJUR';

  useEffect(() => {
      if (map.current) return; // stops map from intializing more than once

      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: '59d38153-6ea3-464a-b3c9-2e869c449863',
        center: [falkensee.lng, falkensee.lat],
        zoom: zoom,
        navigationControl: false
      });

      getMarkers()

  }, [falkensee.lng, falkensee.lat, zoom]);

  async function getMarkers() {
    const docRef = await doc(db, "Users", user.uid)
    const g = (await getDoc(docRef)).data().geoLocations
    g.forEach(loc => {
      console.log(loc.amount)

      var elDiv = document.createElement('div');
      elDiv.style.boxShadow = '0px 50px 27px -20px rgba(255, 255, 255, 0.87);';
      elDiv.style.textAlign = 'center'
      elDiv.style.display = 'flex'
      elDiv.style.flexDirection= 'column'
      elDiv.style.gap = '3.5em'

      var el = document.createElement('img');
      elDiv.appendChild(el)
      el.className = 'marker';
      el.src = 'pin.svg';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.translate= '0px -50%'
      el.style.boxShadow = '0px 50px 27px -20px rgba(255, 255, 255, 0.87);';

      el.addEventListener('click', function () {
          setOpen(true)
          setDrawerProps({
            lat: loc.point._lat,
            lng: loc.point._long,
            amount: loc.amount
          })

          // if (loc.amount < 2) {
          //   window.alert(`An diesem Ort wurde eine Kippe geraucht. lat: ${loc.point._lat} lng: ${loc.point._long}`);
          // }else{
          //   window.alert(`An diesem Ort wurden ${loc.amount} Kippen geraucht.`);
          // }
      });

      new maptilersdk.Marker({element: elDiv})
      .setLngLat([loc.point._long,loc.point._lat])
      .addTo(map.current);
    });


    //console.log(bbox2)

    
    // Draw Debug Bounding Box
    /*
    const o = point([52.547504, 13.071575])
    var buffer2 = buffer(o, 80, {units: 'meters'});
    var bbox2 = bbox(buffer2);
    new maptilersdk.Marker({color: "#FF"})
    .setLngLat([bbox2[1], bbox2[0]])
    .addTo(map.current);

    new maptilersdk.Marker({color: "#FFF"})
    .setLngLat([bbox2[3],bbox2[2]])
    .addTo(map.current); 
    */
  }
    
  /*
  // Bottom Drawer
  */
  const container = window !== undefined ? () => window().document.body : undefined;
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  

      return (
        <>
            <Box sx={{zIndex: '3',left: '50%', transform: 'translate(-50%)', top: '-0%', height: '200px', width: '100%',position: 'absolute', background: 'linear-gradient(180deg, rgba(19, 8, 58, 01), rgba(170, 20, 240, 0))', filter: 'blur(00px)'}}></Box>
            <Box height={'100vh'} width={'100%'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
                <div ref={mapContainer} className="map-wrapper" />
            </Box>
            <SwipeableDrawer
              anchor="bottom"
              open={open}
              onClose={toggleDrawer(false)}
              onOpen={toggleDrawer(true)}
              swipeAreaWidth={drawerBleeding}
              disableSwipeToOpen={true}
              keepMounted
              PaperProps={{
                sx: {
                  background: 'transparent'
                }
              }}
              sx={{background: 'transparent'}}
            >
              
              <StyledBox sx={{ 
                px: 2, 
                pb: 2, 
                height: '40vh', 
                overflow: 'auto',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8, 
                background: ''
                }}>
                <Puller />
                <Stack paddingTop={3} gap={2}>
                  
                  <Typography color='#fff'>{drawerProps.lat} // {drawerProps.lng}</Typography>
                  <Typography color='#fff'>{drawerProps.amount > 1 ? `An diesem Ort wurden bis jetzt ${drawerProps.amount} Zigaretten geraucht.` : `An diesem Ort wurde bis jetzt eine Zigarette geraucht.`}</Typography>
                </Stack>
                
              </StyledBox>
            </SwipeableDrawer>
        </>
      );
}

export default Map