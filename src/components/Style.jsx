import React, { useState } from 'react'
import { Box, Stack, Typography, Button, Grid2, useTheme, Divider } from '@mui/material'
//import CheckIcon from '@mui/icons-material/Check';
import { Check, Add } from '@mui/icons-material'
import { useAppTheme } from './ThemeProviderCustom';
import { LineChart } from '@mui/x-charts/LineChart';
import {
    lineElementClasses,
    markElementClasses,
  } from '@mui/x-charts/LineChart';

export function ColorButton({ color, onClick, size = 70, selected = false, index, uID }) {
    const { themeName, setThemeName } = useAppTheme();

    return (
        <Button
            onClick={onClick}
            variant="contained"
            disableElevation
            sx={{
                width: size,
                height: size,
                minWidth: 0, // wichtig, sonst wird der Button zu breit
                borderRadius: 2,
                backgroundColor: color,
                border: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: color,
                    opacity: 0.8,
                },
                ':focus': {
                    outline: 'none'
                }
            }}
        >
            {themeName === uID ? 
                <Check fontSize='large' />
                :
                ''
            }
        </Button>
    );
}

const Style = () => {
    
    const [selectionIndex, setSelectionIndex] = useState(localStorage.getItem('themeName') || 'blue')
    const { themeName, setThemeName } = useAppTheme();
    const theme = useTheme()

    return (
        <Box gap={5} width={'100%'} height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
            <Typography align='center' variant='h4'>Farbstil</Typography>
                <Grid2 container spacing={5} justifyContent={'center'}>
                    <Grid2 item>
                        <ColorButton onClick={() => setThemeName('blue')} uID="blue" color="#53b0ee" />
                    </Grid2>
                    <Grid2 item>
                        <ColorButton index={selectionIndex} onClick={() => {setThemeName('green')}} uID={'green'} color='#187'/>
                    </Grid2>
                    <Grid2 item>
                        <ColorButton index={selectionIndex} onClick={() => {setThemeName('sunset')}} uID={'sunset'} color='#C7784A'/>
                    </Grid2>
                    <Grid2 item>
                        <ColorButton index={selectionIndex} onClick={() => {setThemeName('purple')}} uID={'purple'} color='#aa14f0'/>
                    </Grid2>
                </Grid2>

                <Box border={1} borderRadius={'10px'} p={2} pb={0} position={'relative'} height={'50vh'} width={'inherit'} sx={{
                    '&::before': {
                        content: '"Vorschau"',
                        position: 'absolute',
                        top: '0',
                        transform: 'translateY(-50%)',
                        bgcolor: 'background.default',
                        p: '0 10px'
                    }
                }} >

                    <Stack gap={5} height={'100%'} width={'100%'}>
                        <Button sx={{ border: 'none', height: '50px', width: '100%', borderRadius: '10px', ":focus": {outline: 'none'}, background: theme.palette.background.gradient}} variant='contained' > 
                            <Add fontSize='large'/> 
                        </Button>

                        <Box flex={1} minHeight={0}>
                            <LineChart
                                grid={{ horizontal: false }}
                                series={[
                                    {
                                        data: [5,2,3,4,9,2,6],
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
                                            max: 9,
                                            color: [theme.palette.primary.transparent02, theme.palette.primary.transparent05],
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
                                    background: 'transparent',
                                    borderRadius: 4,
                                    py: 0,
                                    //change left yAxis label styles
                                    "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel":{
                                        fill:"var(--color)"
                                    },
                                    // change all labels fontFamily shown on both xAxis and yAxis
                                    "& .MuiChartsAxis-tickContainer .MuiChartsAxis-tickLabel":{
                                    fontFamily: "Roboto",
                                    },
                                    // change bottom label styles
                                    "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel":{
                                        strokeWidth: 0,
                                        fill:"var(--color)",
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
                                        stroke: theme.palette.primary.main,
                                        strokeWidth: 2,
                                    },
                                    [`& .${markElementClasses.root}`]: {
                                        stroke: theme.palette.primary.main,
                                        scale: '0.6',
                                        fill: 'transparent',
                                        strokeWidth: 0,
                                    }
                                }}
                            />
                        </Box>
                        <Divider/>
                    </Stack>
                </Box>
        </Box>
    )
}

export default Style