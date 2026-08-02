import React from 'react'
import { Avatar, Typography } from '@mui/material'

const CustomBadgeAvatar = ({metaData, src}) => {
    if(metaData.type === "LEVEL") {
        return (
              <Avatar sx={{position: 'relative', '::after': {position: 'absolute', content: `"${metaData.level}"`, bottom: -5, right: 0, fontSize: '20pt', fontWeight: 800, transform: 'rotate(10deg)'}, overflow: 'visible'}} display={'flex'} alignItems="center" justifyContent="center" src={src}/>
          )
    }else if (metaData.type === "COUNTER"){
        return (
              <Typography sx={{ position: 'absolute', bottom: 5, content: `"${metaData.level}"`, fontSize: '30pt', fontWeight: 800, transform: 'rotate(10deg)'}} display={'flex'} alignItems="center" justifyContent="center">{metaData.level}</Typography>
          )
    }
}

export default CustomBadgeAvatar