import React from 'react'
import {
  LinePlot,
  MarkPlot,
  lineElementClasses,
  markElementClasses,
  AreaPlot,
  MarkElement
} from '@mui/x-charts/LineChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { 
  Box, IconButton, List, DialogTitle, Dialog, Paper, Input, 
  InputAdornment, ListItem, ListItemText, ListItemButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox,
  Typography, Stack, Snackbar, Alert, DialogActions, DialogContent, DialogContentText, Button,
  getFormControlLabelUtilityClasses, useTheme, LinearProgress, SwipeableDrawer, Popover, Divider
} from '@mui/material'

const FriendChart = ({ownStats, friends, friendIndex}) => {
    const theme = useTheme()
    
  return (
    <>
    {friends.length > 0 ?
        <LineChart
            series={[
                {
                id:'main',
                label: 'Du',
                data: ownStats,
                area: true,
                showMark: false,
                yAxisId: 'main',
                color: theme.palette.primary.main
                },
                {
                id: 'friend',
                label: friends[friendIndex][1],
                data: friends[friendIndex][2] ? friends[friendIndex][2].days : [0,0,0,0,0,0,0],
                area: true,
                showMark: false,
                yAxisId: 'friend',
                color: theme.palette.secondary.main
                }
                ]}
            margin={{
                top: 10,
                bottom: 20,
                left: -20,
                right: 0
                }}
            yAxis={[
            // {
            //     // colorMap:
            //     // {
            //     //   type: 'continuous',
            //     //   min: 0,
            //     //   max: friends[friendIndex][2] ? Math.max(...friends[friendIndex][2].days) > Math.max(...ownStats) ? Math.max(...friends[friendIndex][2].days) : Math.max(...ownStats) : 5,
            //     //   color: [theme.palette.primary.transparent02, theme.palette.primary.transparent05],
            //     // }
            // },
            {
                id: 'main',
                colorMap: {
                type: 'continuous',
                min: 0,
                max: friends[friendIndex][2] ? Math.max(...friends[friendIndex][2].days) > Math.max(...ownStats) ? Math.max(...friends[friendIndex][2].days) : Math.max(...ownStats) : 5,
                color: [theme.palette.primary.transparent02, theme.palette.primary.transparent05],
                },
            },
            {
                id: 'friend',
                colorMap: {
                type: 'continuous',
                min: 0,
                max: 1,
                color:  [theme.palette.secondary.transparent02, theme.palette.secondary.transparent05],
                },
            },
            ]}
            xAxis={[
                {
                    dataKey: 'date',
                    zoom: true,
                    scaleType: 'point',
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

                pointerEvents: 'all',
                borderRadius: 4,
                py: 0,
                width: '100%',
                //change left yAxis label styles


                // change all labels fontFamily shown on both xAxis and yAxis

                // change bottom label styles

                // bottomAxis Line Styles

                // leftAxis Line Styles

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

                "& .MuiChartsAxisHighlight-root": {
                    stroke: '#fff',
                },
                "& .MuiLineElement-series-main": {
                    stroke: theme.palette.primary.main,
                },
                "& .MuiLineElement-series-friend": {
                    stroke: theme.palette.secondary.main,
                },
                [`& .${lineElementClasses.series.main}`]: {
                    stroke: theme.palette.primary.main,
                    strokeWidth: 2,
                },
            }}
        />
        :
        'Loading'
        }
    </>
  )
}

export default FriendChart