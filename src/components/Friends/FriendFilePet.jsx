import React from 'react'
import PetComponent from '../SmokePet/PetComponent'
import { Box, Typography } from '@mui/material'

const FriendFilePet = ({pet}) => {
  return (
    <Box className={'bgPet assetBg'} sx={{boxShadow: 'inset 0px 0px 40px 0px #0000006b'}}  width={'100%'} borderRadius={'27px'}>
      <Typography textAlign={'center'} pt={2} mb={-2} fontSize={20} fontWeight={'bold'}>{pet.name}</Typography>
      <Box className={'bounce'}>
        <PetComponent isBox={false} height={300} chain={pet.bluePrint.chain} eyes={pet.bluePrint.eyes} mouth={pet.bluePrint.mouth} glasses={pet.bluePrint.glasses} base={pet.bluePrint.base}/>
      </Box>
    </Box>

  )
}

export default FriendFilePet