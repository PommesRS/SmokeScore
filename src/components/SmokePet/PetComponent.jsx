import React from 'react'
import { Box } from '@mui/material'

const PetComponent = ({base, eyes, mouth, chain, glasses, height, isBox}) => {
    if(!isBox) {
        return (
            <Box height={height + 'px'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <img src={`./pet/${base}.png`} width={(height * 0.4) + 'px'} style={{position: 'absolute'}} />
                {eyes != null && (
                    <img src={`./pet/${eyes}.png`} width={height * 0.4} style={{position: 'absolute'}} />
                )}
                {mouth != null && (
                    <img src={`./pet/${mouth}.png`} width={height * 0.4} style={{position: 'absolute'}} />
                )}
                {chain != null && chain !== 'none' && (
                    <img src={`./pet/${chain}.png`} width={height * 0.4} style={{position: 'absolute'}} />
                )}
                {glasses != null && glasses !== 'none' && (
                    <img src={`./pet/${glasses}.png`} width={height * 0.4} style={{position: 'absolute'}} />
                )}
            </Box>
        )
    } else {
        return(
            <Box height={height/1.2 + 'px'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <img src={'./smokePetBox.svg'} width={(height * 0.4) + 'px'} style={{position: 'absolute'}} />
            </Box>
        )
  }
}

export default PetComponent