import React from 'react'
import {Box, Button, Typography} from '@mui/material'

const PaywallRender = () => {

    
  return (
    <Box display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center"  sx={{zIndex: '1', height: '100vh', width: '100%',position: 'absolute', background: 'rgba(256, 256, 256, 0.7)', backdropFilter: "blur(4px)"}}>
        <Typography textAlign={'center'} color='black'>Gewinne Einsicht mit <br /> SmokeScore Premium</Typography>
        <br />
        <Button variant='contained'>Jetzt Upgraden</Button>
    </Box>
  )
}

export default PaywallRender