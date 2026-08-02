import React, {useState} from 'react'
import {
    Box, List, ListItem, ListItemButton, Avatar, ListItemAvatar, ListItemText, Divider, Dialog, 
    DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Select, Container, Collapse, TextField,
    Alert, Snackbar, Switch, Stack, Typography, LinearProgress, useTheme, SwipeableDrawer
} from '@mui/material'
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CustomBadgeAvatar from './CustomBadgeAvatar';

const Badges = ({metaData}) => {
    const theme = useTheme()
    const [open, setOpen] = useState(false)
    const [listOpen, setListOpen] = useState(false)

    const Puller = styled('div')(({ theme }) => ({
        width: 40,
        height: 6,
        backgroundColor:  grey[500],
        borderRadius: 3,
        position: 'absolute',
        top: 8,
        zIndex: 2,
        left: 'calc(50% - 20px)',
        ...theme.applyStyles('dark', {
            backgroundColor: grey[600],
        }),
    }));

    const StyledBox = styled('div')(({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
    }));

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };



    if (metaData.level || metaData.progression > 0) {
        return (
            <>
                <SwipeableDrawer
                    anchor="bottom"
                    open={open}
                    onClose={toggleDrawer(false)}
                    onOpen={toggleDrawer(true)}
                    swipeAreaWidth={56}
                    disableSwipeToOpen={true}
                    minFlingVelocity={500}
                    keepMounted
                    PaperProps={{
                        sx: {
                        background: 'transparent'
                        }
                    }}
                    sx={{background: 'transparent'}}
                >
                
                <StyledBox sx={{ 
                    px: 2, 
                    pb: 2, 
                    height: '65vh', 
                    overflow: 'auto',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8, 
                    background: '',
                    overflowX: 'hidden',
                    }}>
                    <Puller />
                    <Box sx={{position: 'absolute', background: theme.palette.background.paper, height: '30px', overflow: 'hidden', width: '100%', left: 0, borderTopLeftRadius: 8, borderTopRightRadius: 8}}></Box>
                    <Stack gap={2} height={'100%'}>
                        <Stack paddingTop={3} gap={0} textAlign={'center'}>
                            <Typography fontSize={30}>{metaData.name}</Typography>
                            <Typography color={grey[500]}>{metaData.desc}</Typography>
                        </Stack>
                        <Divider></Divider>
                        <Stack sx={{minHeight: '20vh', p: 0}} gap={1} textAlign={'center'} display={'flex'} flexDirection={'column'} justifyContent={'space-around'}>
                            <Typography variant='h2' fontWeight={700} lineHeight={0.8}>{metaData.level}</Typography>
                            {metaData.type === "LEVEL" && (
                                <>
                                    <Typography variant='h7'>Abzeichen Level</Typography>
                                    <LinearProgress sx={{borderRadius: 50, width: '100%', height: 8}} variant='determinate' value={metaData.progression * 100}/>
                                    <Typography>{Math.round(metaData.progression * 100)}%</Typography>
                                </>
                            )}
                        </Stack>
                        <List>
                            <ListItemButton onClick={() => {setListOpen((prev) => !prev)}}>
                                <ListItemText primary={'Zusätliche Infos'}/>
                                {listOpen ? <ExpandLess/> : <ExpandMore/>}
                            </ListItemButton>
                            <Collapse in={listOpen}>
                                <List>
                                    {metaData.params?.map((param, i) => (
                                        <ListItem key={i}>{param}</ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </List>
                    </Stack>
                    
                </StyledBox>
                </SwipeableDrawer>
                    <ListItemButton  onClick={toggleDrawer(true)} sx={{ background: theme.palette.background.paper, borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 200, minWidth: 200, maxHeight: 110, overflow: 'hidden', ':hover': {background: theme.palette.background.paper}, p: 2, boxShadow: 5}}>
                        <ListItemText primary={metaData.name} sx={{mb: 2}} slotProps={{secondary: {sx: { width: '100%',color:'gray', display: 'inline-block', overflow: 'hidden', whiteSpace: 'wrap', textOverflow: 'ellipsis'}}}}></ListItemText>
                        
                        <Stack sx={{width: '100%'}} direction={'row'} gap={2} display={'flex'} alignItems="center" justifyContent="center">
                            {metaData.category === 'position' && (  
                                <CustomBadgeAvatar metaData={metaData} src='BadgeLocation48.png'/>
                            )}
                            {metaData.category === 'time' && (
                                <CustomBadgeAvatar metaData={metaData} src='BadgeTime48.png'/>
                            )}
                            {metaData.category === 'social' && (
                                <CustomBadgeAvatar metaData={metaData} src='BadgeSocial48.png'/>
                            )}

                            {metaData.progression && (
                                <Stack sx={{width: '100%', overflow: 'hidden'}} gap={0} display={'flex'} justifyContent={'center'}>
                                        <Stack gap={1} justifyContent={'space-between'} alignItems={'center'} display={'flex'}>
                                            <Typography>{Math.round(metaData.progression * 100)}%</Typography>
                                            <LinearProgress sx={{borderRadius: 2, width: '100%'}} variant='determinate' value={metaData.progression * 100}/> 
                                        </Stack>
                                </Stack>
                            )}
                        </Stack>
                    </ListItemButton>
            </>
        )
    }
    return (
        <></>
    )
}

export default Badges