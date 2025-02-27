import React, { useRef, useEffect } from 'react'
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';
import { Box } from '@mui/material';
import { useUserAuth } from '../context/userAuthConfig.jsx';
import { db } from '../firebase.js';
import { collection, getCountFromServer, doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "@firebase/firestore";

const Map = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const { user } = useUserAuth();
    const falkensee = { lng: 13.0689311, lat: 52.5463982 };
    const zoom = 14;
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
            new maptilersdk.Marker({color: "#FF0000"})
            .setLngLat([loc._long,loc._lat])
            .addTo(map.current);
        });

        
      }

      return (
        <>
            <Box sx={{zIndex: '3',left: '50%', transform: 'translate(-50%)', top: '-0%', height: '200px', width: '100%',position: 'absolute', background: 'linear-gradient(180deg, rgba(19, 8, 58, 01), rgba(170, 20, 240, 0))', filter: 'blur(00px)'}}></Box>
            <Box height={'100vh'} width={'100%'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">    
                <div ref={mapContainer} className="map-wrapper" />
            </Box>
        </>
      );
}

export default Map