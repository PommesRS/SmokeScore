import React, { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import {Container, Box, Button, Typography, List, Tabs, Tab, Stack, Paper} from '@mui/material';
import {TabContext, TabPanel, TabList} from '@mui/lab'
import { ResponsiveChartContainer } from '@mui/x-charts';
import {
    lineElementClasses,
    markElementClasses,
  } from '@mui/x-charts/LineChart';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs } from "@firebase/firestore";
import { useUserAuth } from '../context/userAuthConfig';
import { startOfWeek, endOfWeek, format, getYear } from 'date-fns'
import { Badges } from './index.js'
import { grey } from '@mui/material/colors';

const chartBottomColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--chart-bottom")
      .trim();

const chartTopColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--chart-top")
      .trim();

const Stats = () => {
    const [weeklyData, setWeeklyData] = useState([])
    const [monthlyData, setMonthlyData] = useState([])
    const [initiate, setInitiate] = useState(true)
    const [initiateMonth, setInitiateMonth] = useState(true)
    const [badges, setBadges] = useState(null)
    const [tabValue, setTabValue] = useState('1')

    const { user } = useUserAuth()
    const theme = useTheme()

    //const weeklyData = [2, 0, 12, 11, 6, 4, 5]
    async function getWeeklyData() {
        const uid = user.uid
        setInitiate(false)

        var startOfCurrentWeek = startOfWeek(new Date(), {weekStartsOn: 1})
        startOfCurrentWeek = format(startOfCurrentWeek, 'dd.MM.yy')
        var endOfCurrentWeek = endOfWeek(new Date(), {weekStartsOn: 1})
        endOfCurrentWeek = format(endOfCurrentWeek, 'dd.MM.yy')
        
        try {
            const docRef = doc(db, "Users", uid, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek)
            setWeeklyData((await getDoc(docRef)).data().days)            
        } catch (error) {
            console.log(error)

            return
        }
        
    }

    async function getMonthlyData() {
        const uid = user.uid
        setInitiateMonth(false)

        var year = getYear(new Date())
        
        try {
            const docRef = doc(db, "Users", uid, 'monthly', `${year}`)
            setMonthlyData((await getDoc(docRef)).data().months)
        } catch (error) {
            return
        }

    }

    async function getBadges() {
        const colRef = collection(db, "Users", user.uid, 'Badges')
        const querySnapshot = await getDocs(colRef)
        const statsRef = doc(db, "Users", user.uid, 'Stats', 'main')
        const stats = (await getDoc(statsRef)).data()

        const badges = await Promise.all(
            querySnapshot.docs.map(async (badge) => {
                const docRef = doc(db, "Badges", badge.id);
                const docSnap = await getDoc(docRef);
                const docData = docSnap.data();
                let params = null
                if(badge.id === 'globetrotter'){
                    params = stats.visitedCountries
                }else if(badge.id === 'urbanexplorer'){
                    params = stats.visitedCities
                }else if(badge.id === 'notalone'){
                    params = stats.withFriend.friends
                }

                return {
                    ...badge.data(),
                    name: docData?.name,
                    desc: docData?.desc,
                    params: params
                }
            })
        )

        badges.sort((a, b) => b.level - a.level);
        setBadges(badges);
    }

    useEffect(() => {
        getWeeklyData()
        getMonthlyData()
        getBadges()
    }, [user])

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    const timeBadges = badges?.filter(
        badge => badge.level > 0 && badge.id === 'nightowl'
    );

    const postitionBadges = badges?.filter(
        badge => badge.level > 0 && (badge.id === 'globetrotter' || badge.id === 'urbanexplorer')
    );

    const socialBadges = badges?.filter(
        badge => badge.level > 0 && (badge.id === 'notalone')
    );

  return (
     <>
        <Box height={'100%'} pt={8} mb={10} width={'inherit'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
            <Typography sx={{fontWeight: 'Bold', fontSize: '30pt', position: 'relative', ":after": {width: '100px', height: '3px', bgcolor: 'var(--color)', position: 'absolute', content: '" "', bottom: 5, left: '50%', translate: '-50%', borderRadius: '10px'}}}>Abzeichen</Typography>
            <Typography color={grey[500]} variant='h10' textAlign={'center'}>Hier werden gesammelte abzeichen angezeigt!</Typography>

                <TabContext value={tabValue}>
                    <TabList variant='scrollable' scrollButtons allowScrollButtonsMobile sx={{width: '100%'}} onChange={handleTabChange}>
                        <Tab sx={{':focus': {outline: 'none'}}} label='Positions abhängig' value='1'/>
                        <Tab sx={{':focus': {outline: 'none'}}} label='Zeit abhängig' value='2'/>
                        <Tab sx={{':focus': {outline: 'none'}}} label='Mit Freunden' value='3'/>
                    </TabList>

                    <TabPanel sx={{width: '100%', p: 0}} value='1'>
                        <Stack direction={'row'} gap={3} sx={{py: 2, overflowX: 'scroll'}}>
                            {console.log(socialBadges)}
                            {postitionBadges && postitionBadges.length > 0 ?
                                postitionBadges?.map((badge) => {
                                    return <Badges key={badge.id} metaData={{level: badge.level, progression: badge.progress, id: badge.id, name: badge.name, desc: badge.desc, params: badge.params, levelCap: badge.levelCap }}/>   
                            }) : (
                                <Typography component={Paper} elevation={3} sx={{background: theme.palette.background.paper}} p={2} textAlign={'center'}>Du hast noch keine Abzeichen für diese Kategorie gesammelt</Typography>

                            )
                            }
                        </Stack>
                    </TabPanel>
                    <TabPanel sx={{width: '100%', p: 0}} value='2'>
                        <Stack direction={'row'} gap={3} sx={{py: 2, overflowX: 'scroll'}}>
                            {timeBadges && timeBadges.length > 0 ?
                                timeBadges?.map((badge) => {
                                    return  <Badges key={badge.id} metaData={{level: badge.level, progression: badge.progress, id: badge.id, name: badge.name, desc: badge.desc, params: badge.params, levelCap: badge.levelCap }}/>   
                            }) : (
                                <Typography component={Paper} elevation={3} sx={{background: theme.palette.background.paper}} p={2} textAlign={'center'}>Du hast noch keine Abzeichen für diese Kategorie gesammelt</Typography>
                            )
                            }
                        </Stack>
                    </TabPanel>
                    <TabPanel sx={{width: '100%', p: 0}} value='3'>
                        <Stack direction={'row'} gap={3} sx={{py: 2, overflowX: 'scroll'}}>
                            {socialBadges && socialBadges.length > 0 ?
                                socialBadges?.map((badge) => {
                                    return  <Badges key={badge.id} metaData={{level: badge.level, progression: badge.progress, id: badge.id, name: badge.name, desc: badge.desc, params: badge.params, levelCap: badge.levelCap }}/>   
                            }) : (
                                <Typography component={Paper} elevation={3} sx={{background: theme.palette.background.paper}} p={2} textAlign={'center'}>Du hast noch keine Abzeichen für diese Kategorie gesammelt</Typography>
                            )
                            }
                        </Stack>
                    </TabPanel>
                </TabContext>
                    


            <Stack height={'80vh'} width={'inherit'} px={2} alignItems={'center'} justifyContent={'space-between'} gap={'5vh'}>
            <Typography sx={{fontWeight: 'Bold', fontSize: '30pt', position: 'relative', ":after": {width: '100px', height: '3px', bgcolor: 'var(--color)', position: 'absolute', content: '" "', bottom: '-0', left: '50%', translate: '-50%', borderRadius: '10px'}}}>Monatlich</Typography>

                <LineChart
                    grid={{ horizontal: false }}
                    series={[{
                        data: monthlyData,
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
                        },
                        popper: {
                            placement: 'top'
                        }
                    }}
                    yAxis={[
                        {
                            colorMap:
                            {
                                type: 'continuous',
                                min: 0,
                                max: Math.max(...monthlyData),
                                color: [theme.palette.primary.transparent02, theme.palette.primary.transparent05],
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
 
            <Typography sx={{fontWeight: 'Bold', fontSize: '30pt', position: 'relative', ":after": {width: '100px', height: '3px', bgcolor: 'var(--color)', position: 'absolute', content: '" "', bottom: '-0', left: '50%', translate: '-50%', borderRadius: '10px'}}}>Wöchentlich</Typography>
            <LineChart
                grid={{ horizontal: false }}
                series={[
                    {
                        data: weeklyData,
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
                    },
                    popper: {
                        placement: 'top'
                    }
                }}
                yAxis={[
                    {
                        colorMap:
                        {
                            type: 'continuous',
                            min: 0,
                            max: Math.max(...weeklyData),
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

            </Stack>
        </Box>
    </>
  )
}

export default Stats