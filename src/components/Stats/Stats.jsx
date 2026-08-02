import React, { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import {Container, Box, IconButton, Typography, List, Tabs, Tab, Stack, Paper} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import {TabContext, TabPanel, TabList} from '@mui/lab'
import {
    lineElementClasses,
    markElementClasses,
  } from '@mui/x-charts/LineChart';
import { db } from '../../firebase.js';
import { collection, doc, getDoc, getDocs } from "@firebase/firestore";
import { useUserAuth } from '../../context/userAuthConfig.jsx';
import { startOfWeek, endOfWeek, format, getYear, subDays, min, set } from 'date-fns'
import { Badges } from '../index.js'
import { grey } from '@mui/material/colors';
import dayjs from 'dayjs';

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
    const [data, setData] = useState(weeklyData)
    const [dataType, setDataType] = useState('loading')
    const [changePercent, setChangePercent] = useState('0')
    const [weeklyTotal, setWeeklyTotal] = useState(null)
    const [prevWeeklyTotal, setPrevWeeklyTotal] = useState(null)
    const [hoveredPoint, setHoveredPoint] = useState(null)
    let hoveredPointCache = null
    
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
        
        var startOfPrevWeek = startOfWeek(subDays(new Date(), 7), {weekStartsOn: 1})
        startOfPrevWeek = format(startOfPrevWeek, 'dd.MM.yy')
        var endOfPrevWeek = endOfWeek(subDays(new Date(), 7), {weekStartsOn: 1})
        endOfPrevWeek = format(endOfPrevWeek, 'dd.MM.yy')

        const prevWeek = startOfPrevWeek + '-' + endOfPrevWeek

        try {
            const docRef = doc(db, "Users", uid, 'weekly', startOfCurrentWeek + '-' + endOfCurrentWeek)
            const prevWeekDocRef = doc(db, "Users", uid, 'weekly', prevWeek)
            const weeklyData = (await getDoc(docRef)).data().days
            
            const weeklyTotal = weeklyData?.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
            setWeeklyTotal(weeklyTotal)
            setWeeklyData(weeklyData)   
            setData((await getDoc(docRef)).data().days)
            if(!prevWeekDocRef) return
            const prevWeekData = (await getDoc(prevWeekDocRef)).data().days 
            const prevWeekTotal = prevWeekData?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) 
            setPrevWeeklyTotal(prevWeekTotal) 
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
            setData(monthlyData)
            setDataType('Wöchentlich')
        } catch (error) {
            return
        }

    }

    function calcChangePercent(params) {
        let prevDataPoint
        let currentDataPoint
        if (dataType === 'Wöchentlich') {
            const currentDay = dayjs().day()
            console.log(prevWeeklyTotal)
            if (prevWeeklyTotal) {
                setChangePercent(Math.round(((weeklyTotal - prevWeeklyTotal) / prevWeeklyTotal) * 100))
            }
            setData(weeklyData)
        }else {
            const currentMonth = dayjs().month()
            prevDataPoint = !hoveredPoint ? monthlyData[currentMonth - 1] == 0 ? 1 : monthlyData[currentMonth - 1] : monthlyData[hoveredPoint[0].dataIndex - 1]
            currentDataPoint = monthlyData[currentMonth - 1] == 0 ? monthlyData[currentMonth] + 1 : monthlyData[currentMonth]
            console.log(currentDataPoint)
            setChangePercent(Math.round(((currentDataPoint - prevDataPoint) / prevDataPoint) * 100))
            setData(monthlyData)
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
                }else if (badge.id === 'highestStreak'){
                    params = ["Letzter Tag der Streak: " + dayjs(stats.streak.lastIncrement.toDate()).format('DD.MM.YYYY')]
                }

                return {
                    ...badge.data(),
                    name: docData?.name,
                    desc: docData?.desc,
                    type: docData?.type,
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

    useEffect(() => {
        calcChangePercent()
    }, [dataType, prevWeeklyTotal, hoveredPoint])

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    const timeBadges = badges?.filter(
        badge => badge.level > 0 && (badge.id === 'nightowl' || badge.id === 'highestStreak')
    );

    const postitionBadges = badges?.filter(
        badge => badge.level > 0 && (badge.id === 'globetrotter' || badge.id === 'urbanexplorer')
    );

    const socialBadges = badges?.filter(
        badge => badge.level > 0 && (badge.id === 'notalone')
    );

    const handleChartChange = (newValue) => {
        console.log('huso')
        setDataType(newValue)
        if (newValue === 'Monatlich') {
            setData(monthlyData)
        }else {
            setData(weeklyData)
        }
    }

  return (
     <>
        <Box height={'100%'} pt={8} mb={5} width={'inherit'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">

            <Stack height={'60vh'} width={'100%'} mt={2} alignItems={'center'} justifyContent={'space-between'} gap={1} >

                <Stack alignItems={'center'}>
                    <Typography color={grey[500]}>{dataType === 'Wöchentlich' ? 'Wochensumme' : 'Monatssumme'}</Typography>
                    <Stack direction={'row'} gap={1} position={'relative'}>
                        <Typography color={theme.palette.background.default} fontWeight={500}>Kippen</Typography>
                        <Typography sx={{fontWeight: 500, fontSize: '30pt', position: 'relative', lineHeight: 1}}>{dataType === 'Wöchentlich' ? weeklyTotal : hoveredPoint ? monthlyData[hoveredPoint[0].dataIndex] : monthlyData[dayjs().month()]}</Typography>
                        <Typography alignSelf={'flex-end'} color={grey[500]} fontWeight={500}>Kippen</Typography>
                    </Stack>
                </Stack>

                <Stack display={'flex'} alignItems={'center'}>
                    <Typography color={grey[500]}>{dataType === 'Wöchentlich' ? 'Vergleich zu letzte Woche' : hoveredPoint ? 'Vergleich zu ausgewähltem Monat' : 'Vergleich zu letztem Monat'}</Typography>
                    <Paper sx={{px: 1, py: 0.5, display: 'flex', gap: 1, }}>
                        {changePercent >= 0 ? 
                            (
                                <TrendingUpIcon sx={{color: 'green'}} color='green' />
                            ) 
                        : 
                            (
                                <TrendingDownIcon sx={{color: 'red'}} color='red'/>
                            )
                        }
                        <Typography sx={{color: changePercent >= 0 ? 'green' : 'red'}}>{changePercent}%</Typography>                    
                    </Paper>

                </Stack>

                <LineChart
                    series={[
                        {
                            data: data,
                            area: true,
                            showMark: false,
                        }
                    ]}
                    margin={{
                        top: 10,
                        bottom: 0,
                        right: 20,
                        left: 0
                        }}
                    yAxis={[
                        {
                            colorMap:
                            {
                                type: 'continuous',
                                min: 0,
                                max: dataType === 'Wöchentlich' ? Math.max(...weeklyData) : Math.max(...monthlyData),
                                color: [theme.palette.primary.transparent02, theme.palette.primary.transparent05],
                            }
                        },
                        ]}
                    xAxis={[
                        {
                            zoom: true,
                            scaleType: 'point',
                            data: dataType !== 'Wöchentlich' ? 
                            [
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
                            : 
                            [
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
                        borderRadius: 0,
                        py: 0,
                        width: '100%',
                        "& .MuiChartsAxis-bottom .MuiChartsAxis-tick":{
                        stroke:"#ffff",
                        strokeWidth: 0
                        },
                        "& .MuiChartsAxis-left .MuiChartsAxis-tick":{
                        strokeWidth: 0
                        },
                        "& .MuiChartsAxis-root .MuiChartsAxis-line": {
                            strokeWidth: 0
                        },
                        [`& .${lineElementClasses.root}`]: {
                            stroke: theme.palette.primary.main,
                            strokeWidth: 2,
                        },
                    }}
                />

                <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} sx={{mt: -3}}>
                    <IconButton disabled={dataType === 'Wöchentlich'} sx={{':focus': {outline: 'none'}}} onClick={() => {handleChartChange('Wöchentlich')}}>
                        <ArrowBackIosNewIcon />
                    </IconButton>
                    <Typography sx={{fontWeight: 'Bold', fontSize: '25pt', position: 'relative'}}>{dataType}</Typography>
                    <IconButton disabled={dataType === 'Monatlich'} sx={{':focus': {outline: 'none'}}} onClick={() => {handleChartChange('Monatlich')}}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Stack>

            </Stack>
            <Box height={'100%'} width={'100%'} p={2} pb={5} alignItems="center" justifyContent="center" display={'flex'} flexDirection={'column'} mt={3} sx={{borderTopLeftRadius: 10, borderTopRightRadius: 10, boxShadow: '0px -4px 15px 5px rgba(0,0,0,0.3)'}}>
                <Typography sx={{fontWeight: 'Bold', fontSize: '30pt', position: 'relative', ":after": {width: '100px', height: '3px', bgcolor: 'var(--color)', position: 'absolute', content: '" "', bottom: 5, left: '50%', translate: '-50%', borderRadius: '10px'}}}>Abzeichen</Typography>
                <Typography color={grey[500]} variant='h10' textAlign={'center'}>Hier werden gesammelte abzeichen angezeigt</Typography>

                <TabContext value={tabValue}>
                    <TabList variant='scrollable' scrollButtons allowScrollButtonsMobile sx={{width: '100%'}} onChange={handleTabChange}>
                        <Tab sx={{':focus': {outline: 'none'}}} label='Positions abhängig' value='1'/>
                        <Tab sx={{':focus': {outline: 'none'}}} label='Zeit abhängig' value='2'/>
                        {/* <Tab sx={{':focus': {outline: 'none'}}} label='Mit Freunden' value='3'/> */}
                    </TabList>

                    <TabPanel sx={{width: '100%', p: 0}} value='1'>
                        <Stack direction={'row'} gap={3} sx={{py: 2, overflowX: 'scroll'}}>
                            {postitionBadges && postitionBadges.length > 0 ?
                                postitionBadges?.map((badge) => {
                                    return <Badges key={badge.id} metaData={{level: badge.level, progression: badge.progress, id: badge.id, name: badge.name, desc: badge.desc, params: badge.params, type: badge.type, category: 'position' }}/>   
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
                                    return  <Badges key={badge.id} metaData={{level: badge.level, progression: badge.progress, id: badge.id, name: badge.name, desc: badge.desc, params: badge.params, type: badge.type, category: 'time' }}/>   
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
                                    return  <Badges key={badge.id} metaData={{level: badge.level, progression: badge.progress, id: badge.id, name: badge.name, desc: badge.desc, params: badge.params, type: badge.type, category: 'social' }}/>   
                            }) : (
                                <Typography component={Paper} elevation={3} sx={{background: theme.palette.background.paper}} p={2} textAlign={'center'}>Du hast noch keine Abzeichen für diese Kategorie gesammelt</Typography>
                            )
                            }
                        </Stack>
                    </TabPanel>
                </TabContext>
            </Box> 
        </Box>
    </>
  )
}

export default Stats