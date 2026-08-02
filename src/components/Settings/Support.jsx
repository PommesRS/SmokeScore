import React, { useEffect, useState } from 'react'
import {
    Box, List, ListItem, ListItemButton, Avatar, ListItemAvatar, ListItemText, Divider, Dialog, 
    DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Select, FormControl, InputLabel, TextField,
    Alert, Snackbar, Switch, Stack, Typography
} from '@mui/material'

const Support = () => {
  return (
    <Box paddingTop={0} width={'100%'} height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center">
        <Button variant='contained' sx={{':focus': {outline: 'none'}, ':hover': {color: 'inherit'}}} href='mailto:contact@smokescore.de'>Email an den Support senden</Button>
    </Box>
  )
}

export default Support