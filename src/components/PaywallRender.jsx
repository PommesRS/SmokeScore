import React from 'react'
<<<<<<< HEAD
import {Box, Paper, Typography, Button} from '@mui/material'

const PaywallRender = ({user}) => {

  console.log(user.uid)
  const uid = user.uid
    
  return (
    <Box display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center"  sx={{zIndex: '1', height: '100%', width: '100%', position: 'absolute', background: 'rgba(256, 256, 256, 0.7)', backdropFilter: "blur(4px)"}}>
          {/* <Typography variant='h5'>SmokeScore Premium</Typography>
          <br />
          <Typography variant='h5'>7 Tage Kostenlos</Typography>
          <Typography variant='subtitle2'>Dann 7€ pro Monat</Typography>
          <br />
          <Button variant='contained' sx={{textTransform: 'inherit', ":focus": {outline: 'none'}, ':active': {background: 'rgba(118, 14, 168, 1)'}}} >
            <Typography fontFamily={'Roboto'} fontWeight={500} fontSize={20}>Testzeitraum starten</Typography>
          </Button> */}

          <stripe-buy-button
            buy-button-id="buy_btn_1RTjT7BNmgSWwkDyFZLkeQzc"
            publishable-key="pk_test_51RQ5OQBNmgSWwkDy4z1WgXySZitF0EpTSqppxDk88j7LomaaibnAum9Av2LnRAdARvEJzvwZ1xcTNfDjuk7AmFgD00RYSKJXkE"
            customer-email={user.email}
            client-reference-id={uid}
          ></stripe-buy-button>
=======
import {Box, Button, Typography} from '@mui/material'

const PaywallRender = () => {

    
  return (
    <Box display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center"  sx={{zIndex: '1', height: '100vh', width: '100%',position: 'absolute', background: 'rgba(256, 256, 256, 0.7)', backdropFilter: "blur(4px)"}}>
        <Typography textAlign={'center'} color='black'>Gewinne Einsicht mit <br /> SmokeScore Premium</Typography>
        <br />
        <Button variant='contained'>Jetzt Upgraden</Button>
>>>>>>> b38927722a79c6504459df6df3ee11d1bf3d2d5c
    </Box>
  )
}

export default PaywallRender