import React from 'react'
import { 
  Box, IconButton, Typography, Stack,
} from '@mui/material'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PaywallRender from './PaywallRender.jsx';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import WhatshotIcon from '@mui/icons-material/Whatshot';

import {

  lineElementClasses,
  markElementClasses,

} from '@mui/x-charts/LineChart';
import { LineChart } from '@mui/x-charts/LineChart';



const PaywallFriends = ({user}) => {
  return (
    <>
    
      <Box position={'absolute'} bottom={80} right={20}>
          <IconButton size='large' sx={{":focus": {outline: 'none'}, backgroundColor: '#8979FF'}} color='inherit' aria-label="addFriend">
            <PersonAddAlt1Icon fontSize='large'/>
          </IconButton>
      </Box>

      
      <Box height={'100vh'} width={'inherit'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
        <PaywallRender user={user}/>
        <Stack height={'70vh'} width={'inherit'} alignItems={'center'} justifyContent={'space-between'} gap={4}>
          <Stack direction={'row'} width={'inherit'} overflowX={'hidden'} textOverflow={'ellipsis'} gap={2} justifyContent={'center'} alignItems={'center'}>
            <IconButton onClick={() => {}} color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowBackIosIcon/></IconButton>
            <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '20pt', position: 'relative', }}>Freund</Typography>
            <IconButton onClick={() => {}}  color='inherit' sx={{":focus": {outline: 'none'}}}><ArrowForwardIosIcon/></IconButton>
          </Stack>
          <Stack>
            <Stack direction={'row'} width={'inherit'} overflowX={'hidden'} textOverflow={'ellipsis'} justifyContent={'center'} alignItems={'center'}>
              <WhatshotIcon sx={{fontSize: '70pt'}}/>
              <Typography height={'auto'} noWrap sx={{fontWeight: 'Bold', fontSize: '90pt', position: 'relative', lineHeight: '1', textAlign: 'center'}}>50</Typography>
            </Stack>
            <Typography height={'auto'} noWrap sx={{fontWeight: 'light', fontSize: '20pt', position: 'relative', textAlign: 'center'}}>Streak</Typography>
          </Stack>
            <LineChart
              grid={{ horizontal: false }}
              series={[
                  {
                    id:'anus',
                    label: 'Du',
                    data: [5,6,7,1,9,5,6],
                    area: true,
                    color: '',
                  },
                  {
                    label: 'Freund',
                    data: [5,6,8,6,3,1,8],
                    area: true,
                  }
                  ]}
              slotProps={{
                legend: {
                  hidden: 'true'
                }
              }}
              margin={{
                  top: 10,
                  bottom: 20,
                  }}
              yAxis={[
                {
                    colorMap:
                    {
                      id: 'anus',
                      type: 'continuous',
                      min: 0,
                      max: 11,
                      color: ['rgba(137,121,255,0)', 'rgba(137,121,255,0.5)'],
                    }
                },
              ]}
              xAxis={[
                  {
                      scaleType: 'band',
                      data: [
                          'Mo',
                          'Di',
                          'Mi',
                          'Do',
                          'Fr',
                          'Sa',
                          'So'
                      ]
                  },
              ]}
              sx={{

                  borderRadius: 4,
                  py: 0,
                  //change left yAxis label styles
                  "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel":{
                      strokeWidth: 0.4,
                      fill:"#ffff"
                  },
                  // change all labels fontFamily shown on both xAxis and yAxis
                  "& .MuiChartsAxis-tickContainer .MuiChartsAxis-tickLabel":{
                  fontFamily: "Roboto",
                  },
                  // change bottom label styles
                  "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel":{
                      strokeWidth:"0.5",
                      fill:"#ffff",
                  },
                  // bottomAxis Line Styles
                  "& .MuiChartsAxis-bottom .MuiChartsAxis-line":{
                  stroke:"#ffff",
                  strokeWidth:0
                  },
                  // leftAxis Line Styles
                  "& .MuiChartsAxis-left .MuiChartsAxis-line":{
                  stroke:"#22",
                  strokeWidth: 0
                  },
                  "& .MuiChartsAxis-bottom .MuiChartsAxis-tick":{
                  stroke:"#ffff",
                  strokeWidth: 0
                  },
                  "& .MuiChartsAxis-left .MuiChartsAxis-tick":{
                  stroke:"#ffff",
                  strokeWidth: 0
                  },
                  "& .MuiChartsAxis-root .MuiChartsAxis-line": {
                      stroke: '#222',
                      strokeWidth: 0
                  },
                  "& .MuiChartsAxis-directionX": {
                      stroke: '#fff',
                      strokeWidth: 1
                  },
                  "& .MuiChartsAxisHighlight-root": {
                      stroke: '#fff',
                  },
                  [`& .${lineElementClasses.root}`]: {
                      stroke: '#8979FF',
                      strokeWidth: 2,
                  },
                  [`& .${markElementClasses.root}`]: {
                  stroke: '#8979FF',
                  scale: '0.6',
                  fill: 'transparent',
                  strokeWidth: 2,
                  }
              }}
            />
        </Stack>
      </Box>
    </>
)
}

export default PaywallFriends