import React, { useState } from 'react'
import { Box, Stack, Button, Typography, Link, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import GoogleButton from 'react-google-button';
import Divider from '@mui/material/Divider';
import { useUserAuth } from '../context/userAuthConfig';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { logIn } = useUserAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await logIn(email, password)
            navigate("/tracker")
        } catch (error) {
            setError(error.message)
        }

    }

  return (
    <Box gap={4} height={'100dvh'} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>

        <Box p={2} border={1} width={'80vw'} height={'50vh'} flexDirection={'column'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
            <Stack textAlign={'center'} width={'100%'} gap={2}>
                <Typography variant='h4'>Anmelden</Typography>
                <Alert sx={!error ? {display: 'none'} : {display: 'flex'}} severity='error'>{error}</Alert>
                <form onSubmit={handleSubmit} style={{width: '100%'}}>
                    <Stack gap={2}>
                        <TextField onChange={(e) => setEmail(e.target.value)} fullWidth={true} sx={{ "& .MuiFormLabel-root": {color: 'white'}, "& .css-1ll44ll-MuiOutlinedInput-notchedOutline": {border: '1px solid rgba(255, 255, 255, 0.5)'}, ":focus": {border: 'none'}, "& .css-16wblaj-MuiInputBase-input-MuiOutlinedInput-input": {color: 'white'}, "& .MuiInputBase-input": {color: 'white'}}} required type='email' id='outlined-required' label={'Email Adresse'}></TextField>
                        <TextField onChange={(e) => setPassword(e.target.value)} fullWidth={true} sx={{ "& .MuiFormLabel-root": {color: 'white'}, "& .css-1ll44ll-MuiOutlinedInput-notchedOutline": {border: '1px solid rgba(255, 255, 255, 0.5)'}, "& .css-16wblaj-MuiInputBase-input-MuiOutlinedInput-input": {color: 'white'}, "& .MuiInputBase-input": {color: 'white'}}} required type='password' id='outlined-required' label={'Passwort'}></TextField>
                        <Button variant='contained' color='primary' type='submit'>Anmelden</Button>
                    </Stack>
                </form>
                <Divider sx={{border: '1px solid rgba(255, 255, 255, 0.5)'}}/>
                <Divider sx={{height: '2vh'}}/>
                <GoogleButton style={{width: '100%', ":focus": {outline: 'none'}}}/>
            </Stack>
        </Box>
        <Box p={2} border={1} width={'80vw'} height={'5vh'} flexDirection={'column'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
            <Typography>Noch keinen Account? <Link href='#/signup'>Registrieren</Link></Typography>
        </Box>
    </Box>
  )
}

export default Login