import React from 'react'
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
    </Box>
  )
}

export default PaywallRender