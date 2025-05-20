import React from 'react'
import { LineChart } from '@mui/x-charts/LineChart';
import {Box, Button, Typography} from '@mui/material'
import Stack from '@mui/material/Stack';
import { lineElementClasses, markElementClasses,} from '@mui/x-charts/LineChart';
import { PaywallRender } from './index.js'



const PaywallStats = () => {

  return (
     <>
        <Box height={'100vh'} width={'inherit'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
            <PaywallRender />
            <Stack height={'70vh'} width={'inherit'} px={2} alignItems={'center'} justifyContent={'space-between'} gap={'5vh'}>
            <Typography sx={{fontWeight: 'Bold', fontSize: '30pt', position: 'relative', ":after": {width: '100px', height: '5px', bgcolor: 'white', position: 'absolute', content: '" "', bottom: '-0', left: '50%', translate: '-50%', borderRadius: '10px'}}}>Monatlich</Typography>

                <LineChart
                    grid={{ horizontal: false }}
                    series={[{
                        data: [15,50,20,48,65,87,85,18,56,54,78,67],
                        area: true,
                        color: '#fff',
                        }
                    ]}
                    margin={{
                        top: 10,
                        bottom: 20,
                        }}
                    slotProps={{
                        noDataOverlay: {
                            sx: {
                                fill: '#fff'
                            }
                        }
                    }}
                    yAxis={[
                        {
                            colorMap:
                            {
                                type: 'continuous',
                                min: 0,
                                max: 30,
                                color: ['rgba(137,121,255,0)', 'rgba(137,121,255,0.5)'],
                            }
                        },
                        ]}
                    xAxis={[
                        {
                            scaleType: 'band',
                            data: [
                                'Jan',
                                'Feb',
                                'Mär',
                                'Apr',
                                'Mai',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Okt',
                                'Nov',
                                'Dez',
                            ]
                        },
                    ]}
                    sx={[{
                        background: '#171726',
                        borderRadius: 4,
                        //change left yAxis label styles
                        "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel":{
                            strokeWidth:"0.4",
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
                        stroke:"#fff",
                        strokeWidth:0.0
                        },
                        "& .MuiChartsAxis-bottom .MuiChartsAxis-tick":{
                        stroke:"#ffff",
                        strokeWidth:0
                        },
                        "& .MuiChartsAxis-left .MuiChartsAxis-tick":{
                        stroke:"#ffff",
                        strokeWidth:0
                        },
                        ".MuiChartsAxis-root .MuiChartsAxis-line": {
                            stroke: '#222',
                        },
                        ".MuiChartsAxisHighlight-root": {
                            stroke: '#fff',
                        },
                        ".MuiChartsToolTip-root": {
                            fill: '#ff',
                        },
                        ".noDataOverlay": {
                            fill: '#fff'
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
                    }]}
                />
 
            <Typography sx={{fontWeight: 'Bold', fontSize: '30pt', position: 'relative', ":after": {width: '100px', height: '5px', bgcolor: 'white', position: 'absolute', content: '" "', bottom: '-0', left: '50%', translate: '-50%', borderRadius: '10px'}}}>Wöchentlich</Typography>
            <LineChart
                grid={{ horizontal: false }}
                series={[
                    {
                        data: [5,6,7,1,9,5,6],
                        area: true,
                        color: '#fff',
                    },
                    ]}
                margin={{
                    top: 10,
                    bottom: 20,
                    }}
                slotProps={{
                    noDataOverlay: {
                        sx: {
                            fill: '#fff'
                        }
                    }
                }}
                yAxis={[
                    {
                        colorMap:
                        {
                            type: 'continuous',
                            min: 0,
                            max: 10,
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
                    background: '#171726',
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
                    },
                }}
            />

            </Stack>
        </Box>
    </>
  )
}

export default PaywallStats