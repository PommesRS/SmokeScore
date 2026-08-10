import React from 'react'
import { Typography } from '@mui/material'

const MapMarkerOwnershipIndicator = ({children, gradProps, loading}) => {
  return (
    <Typography sx={
        { position: 'relative', 
        ':before': { 
                zIndex: '100', 
                width: '20px', 
                height: '5px', 
                content: '" "', 
                background: `${gradProps}`, 
                backgroundSize: `${loading ? '200% 100%' : '100% 100%'}`, 
                position: 'absolute', 
                left: '-30px', 
                top:'50%', 
                transform: 'translate(0px, -50%)', 
                borderRadius: '100px',
                animation:  `${loading ? 'gradientLoading 1.5s linear infinite': 'none'}`
                }, 
            "@keyframes gradientLoading" : {
                '0%': {backgroundPosition: '200% 0'}, 
                '100%': {backgroundPosition: '-200% 0'}
                }
        }}>
        {children}
    </Typography>
  )
}

export default MapMarkerOwnershipIndicator