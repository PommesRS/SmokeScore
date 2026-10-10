import React from 'react'
import { Box } from '@mui/material';

const SmokeEffect = ({isItem, color}) => {
  return (
      <Box sx={{position: 'absolute', left: 0, bottom: 0, overflow: 'hidden', mixBlendMode: 'screen', pointerEvents: 'none'}} width={'100%'} height={isItem ? '100%' :'150px'}>
        <Box sx={{boxShadow: 'inset 0px 20px 15px 0px #000', zIndex: 1, position: 'absolute'}} width={'inherit'} height={'100%'}/>
        <Box sx={{zIndex: 1, position: 'absolute', mixBlendMode: 'overlay', bottom: 0, left: '50%', transform: 'translate(-50%)', width: 'calc(100% - 10px)', height: 'calc(100% - 10px)'}} bgcolor={color}/>
        <img style={{position: 'absolute', width: '100%', top: 0, zIndex: 0, filter: 'hue-rotate(50deg)'}} src="/smoke02.gif" />
      </Box>
  )
}

export default SmokeEffect