import { Box, useTheme, Button, Stack, IconButton, Typography, Input, InputAdornment, DialogActions, LinearProgress, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { ChevronLeft, ChevronRight, Edit } from '@mui/icons-material'
import React, { useEffect, useState } from 'react'
import { useUserData } from '../../context/userData'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useUserAuth } from '../../context/userAuthConfig'
import PetComponent from './PetComponent'
import { useStreak } from '../../context/userStreak' 
import { set } from 'date-fns'
import { useFlashMessage } from '../../context/flashMessage'

const PetCustomization = () => {
    const theme = useTheme()
    const { userData } = useUserData()
    const { user } = useUserAuth()
    const [canCustomize, setCanCustomize] = useState(true)
    const [base, setBase] = useState("basePet0")
    const [mouth, setMouth] = useState(null)
    const [eyes, setEyes] = useState(null)
    const [chain, setChain] = useState(null)
    const [glasses, setGlasses] = useState(null)
    const [name, setName] = useState(null)
    const [xp, setXP] = useState(null)
    const [loading, setLoading] = useState(false)
    const [customizeSlot, setCustomizeSlot] = useState('mouth')
    const [buttonDown, setButtonDown] = useState(false)
    const [buttonUp, setButtonUp] = useState(false)
    const { pet } = useStreak()
    const {showFlashMessage} = useFlashMessage()

    const increaseFormula = Math.floor(50 * Math.pow(userData.pet?.level + 1, 1.2))

    const eyesArray = ['eyes_normal', 'eyes_highSleepy','eyes_high', 'eyes_sleepy', 'eyes_angry', 'eyes_baby', 'eyes_cigs', 'eyes_sideEye', 'eyes_sideEyes2']
    const mouthArray = ['mouth_cheekSmile', 'mouth_grin', 'mouth_sad', 'mouth_shook', 'mouth_smile', 'mouth_whistle', 'mouth_yawn']
    const chainArray = ['none', 'chain_basicSilver', 'chain_cigarette', 'chain_joint', 'chain_logo', 'chain_smokeDollar']
    const glasArray = ['none', 'glasses_sun', 'glasses_flyWings', 'glasses_disguise', 'glasses_thickColor', 'glasses_thugLife']

    const cock = {
        mouth: mouth,
        eyes: eyes,
        chain: chain,
        glasses: glasses
    }

    const buildPetFromDatabase = () => {
        if(!userData) return

        setCanCustomize(userData.pet?.level < 1 || false)
        setXP(userData.pet?.xpPoints || 0)
        setName(userData.pet?.name || 'SmokePet')
        setBase(userData.pet?.bluePrint.base || 'basePet1')
        if (userData.pet?.level < 1) {
            setMouth(null)
            setEyes(null)
            setChain(null)
        }else{
            const mouthIndex = mouthArray.indexOf(userData.pet?.bluePrint.mouth)
            if(mouthIndex === mouthArray.length - 1) setButtonUp(true)
            if(mouthIndex === 0) setButtonDown(true)
            setMouth(mouthIndex == -1 ? 0 : mouthIndex)

            const eyesIndex = eyesArray.indexOf(userData.pet?.bluePrint.eyes)
            setEyes(eyesIndex == -1 ? 0 : eyesIndex)

            const chainIndex = chainArray.indexOf(userData.pet?.bluePrint.chain)
            setChain(chainIndex == -1 ? 0 : chainIndex)

            const glassesIndex = glasArray.indexOf(userData.pet?.bluePrint.glasses)
            setGlasses(glassesIndex == -1 ? 0 : glassesIndex)


        }
    }

    const handleUpdatePet = async () => {
        setLoading(true)
        const docRef = doc(db, 'Users', user.uid)
        await setDoc(docRef, {
            pet: {
                bluePrint: {
                    base: base,
                    eyes: eyesArray[eyes] || null,
                    mouth: mouthArray[mouth] || null,
                    chain: chainArray[chain] || null,
                    glasses: glasArray[glasses] || null
                },
                level: userData.pet.level,
                name: name
            }
        }, {merge: true})

        showFlashMessage(
          `${name} wurde erfolgreich gespeichert!`, 
          'success',
        )
        setLoading(false)
    }

    const handleItemChange = (id, isUp, amountToChange) => {
        if(id === 'mouth') {
            if (isUp) {
                if (mouth >= mouthArray.length - 1) return
                checkIfButtonShouldDisable(mouth + 1, 'mouth')
                setMouth(prev => prev + 1)
            }else{
                if (mouth < 1) return 
                checkIfButtonShouldDisable(mouth - 1, 'mouth')
                setMouth(prev => prev - 1)
            }
        } else if (id === 'eyes') {
            if(isUp){
                if (eyes >= eyesArray.length - 1) return
                checkIfButtonShouldDisable(eyes + 1, 'eyes')
                setEyes(eyes + 1)
            }else {
                if (eyes < 1) return
                checkIfButtonShouldDisable(eyes - 1, 'eyes')
                setEyes(eyes - 1)
            }

        } else if (id === 'chain'){
            if(isUp){
                if (chain >= chainArray.length - 1) return
                checkIfButtonShouldDisable(chain + 1, 'chain')
                setChain(chain + 1)
            }else {
                if (chain < 1) return
                checkIfButtonShouldDisable(chain - 1, 'chain')
                setChain(chain - 1)
            }
        } else if (id === 'glasses'){
            if(isUp){
                if (glasses >= glasArray.length - 1) return
                checkIfButtonShouldDisable(glasses + 1, 'glasses')
                setGlasses(glasses + 1)
            }else {
                if (glasses < 1) return
                checkIfButtonShouldDisable(glasses - 1, 'glasses')
                setGlasses(glasses - 1)
            }
        }
    }

    const checkIfButtonShouldDisable = (newIndex, slot) => {
        var array
        if (slot === 'eyes') {
            array = eyesArray
        }else if (slot === 'mouth'){
            array = mouthArray
        }else if (slot === 'chain'){
            array = chainArray
        }else if (slot === 'glasses'){
            array = glasArray
        }

        if (newIndex === array.length - 1){
            setButtonUp(true)
        } else {
            setButtonUp(false)
        }

        if(newIndex === 0) {
            setButtonDown(true)
        } else {
            setButtonDown(false)
        }

    }

    const handleOpenPetBox = async () => {
        setLoading(true)
        const docRef = doc(db, 'Users', user.uid)
        await setDoc(docRef, {
            pet: {
                bluePrint: {
                    base: 'basePet0',
                    eyes: null,
                    mouth: null,
                    chain: null,
                    glasses: null
                },
                level: 0,
                name: 'SmokePet',
                xpPoints: 0
            }
        }, {merge: true})
        setCustomizeSlot(null)
        setBase('basePet0')
        setName('SmokePet')
        setChain(null)
        setEyes(null)
        setMouth(null)
        setLoading(false)
    }

    useEffect(() => {
        buildPetFromDatabase()
    }, [])

    // useEffect(() => {
    //     checkIfButtonShouldDisable(customizeSlot === 'eyes' ? eyes : mouth )
    // }, [customizeSlot])

    useEffect(() => {
        if(!userData) return

        setXP(userData.pet?.xpPoints || 0)
    }, [userData])

  return (
    <Stack mx={3} py={10} gap={3} minHeight={'100vh'}>
        <Box>
            <Typography textAlign={'center'} fontSize={'26px'} fontWeight={'bold'}>SmokePet</Typography>
        </Box>
        {pet ? (
            <>
                <Stack> 
                    <Typography textAlign={'center'} fontSize={'26px'} fontWeight={'bold'} >{userData.pet?.level}</Typography>
                    <Box px={2} position={'relative'} >
                        <LinearProgress className='petProgressBar' sx={{height: 20, borderRadius: 1000,
                            '.MuiLinearProgress-bar1': {
                                backgroundImage:'linear-gradient(120deg, rgba(255, 255, 255, 0) 41%, rgba(55, 55, 55, 0.7) 42%, rgba(55, 55, 55, 0.7) 60%, rgba(255, 255, 255, 0) 61%)',
                                backgroundSize: '25px 20px',
                            }
                        }} variant='determinate' value={(xp / (increaseFormula)) * 100} />
                        <Typography position={'absolute'} top={0} sx={{transform: 'translate(-50%)'}} fontSize={'15px'} left={'50%'} fontWeight={'bold'} >{xp}/{(increaseFormula)}</Typography>
                        <Typography fontSize={'small'} textAlign={'center'} color={theme.palette.text.gray}>Das Level von {name} bestimmt welche Anpassungsmöglichkeiten du hast.</Typography>
                    </Box>
                </Stack>
                <ToggleButtonGroup value={customizeSlot} onChange={(e) => {
                    setCustomizeSlot(e.target.value)
                    console.log(e.target.value)
                    checkIfButtonShouldDisable(cock[e.target.value], e.target.value)
                }} fullWidth sx={{overflow: 'scroll'}}>
                    <ToggleButton sx={{':focus': {outline: 'initial'}, ':hover': {border: '1px solid rgba(255, 255, 255, 0.12)'}}} disabled={userData.pet.level < 1} value='mouth'>Mund</ToggleButton>
                    <ToggleButton sx={{':focus': {outline: 'initial'}, ':hover': {border: '1px solid rgba(255, 255, 255, 0.12)'}}} disabled={userData.pet.level < 2} value='eyes'>Augen</ToggleButton>
                    <ToggleButton sx={{':focus': {outline: 'initial'}, ':hover': {border: '1px solid rgba(255, 255, 255, 0.12)'}}} disabled={userData.pet.level < 3} value='glasses'>Brille</ToggleButton>
                    <ToggleButton sx={{':focus': {outline: 'initial'}, ':hover': {border: '1px solid rgba(255, 255, 255, 0.12)'}}} disabled={userData.pet.level < 4} value='chain'>Kette</ToggleButton>
                </ToggleButtonGroup>
            </>
            ) : (
                <Box px={0} position={'relative'} >
                    <Typography fontSize={'15px'} textAlign={'center'} color={theme.palette.text.gray}>Du hast eine streak von mindestens drei erreicht und somit ein SmokePet freigeschaltet. </Typography>
                </Box>
            )}
        <Box position={'relative'} bgcolor={theme.palette.primary.dark} overflow={'hidden'} borderRadius={5}>
            {pet && (
                <Input
                    disabled={loading}
                    sx={{width: '100%', px: 2, mt:2}}
                    value={name}
                    onChange={(e) => {e.target.value.length <= 20 && (setName(e.target.value))}}
                    endAdornment={<InputAdornment><Edit /></InputAdornment>}
                />
            )}
            <Box position={'relative'}>
                {pet ? (
                    <>
                        {userData.pet.level > 0 && (
                            <Stack position={'absolute'} top={'50%'} sx={{transform: 'translateY(-50%)'}} direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
                                <IconButton disabled={buttonDown || loading} sx={{':focus': {outline: 'none'}}} onClick={() => {handleItemChange(customizeSlot, false)}}><ChevronLeft fontSize='large'/></IconButton>
                                <IconButton disabled={buttonUp || loading} sx={{':focus': {outline: 'none'}}} onClick={() => {handleItemChange(customizeSlot, true)}}><ChevronRight fontSize='large'/></IconButton>
                            </Stack>
                        )}
                        
                        <PetComponent isBox={false} height={425} chain={chainArray[chain]} eyes={eyesArray[eyes]} mouth={mouthArray[mouth]} glasses={glasArray[glasses]} base={base}/>
                    </>
                ) : (
                    <PetComponent isBox={!pet} height={425} eyes={null} mouth={null} base={null}/>
                )}

            </Box>
            {pet ? (
                <DialogActions sx={{backgroundColor: theme.palette.background.paper}}>
                        <Button variant='outlined' disabled={loading} sx={{':focus': {outline: 'none'}}} onClick={() => {buildPetFromDatabase()}}>Zurücksetzen</Button>
                        <Button variant='contained' loading={loading} sx={{':focus': {outline: 'none'}}} onClick={() => {handleUpdatePet()}}>Speichern</Button>
                </DialogActions>       

            ) : (
                <DialogActions sx={{backgroundColor: theme.palette.background.paper}}>
                        <Button variant='contained' loading={loading} sx={{':focus': {outline: 'none'}}} onClick={() => {handleOpenPetBox()}}>Schachtel Öffnen</Button>
                </DialogActions>      
            )}


        </Box>
    </Stack>
  )
}

export default PetCustomization