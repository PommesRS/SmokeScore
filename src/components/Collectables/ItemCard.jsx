import React, { useEffect, useState } from 'react'
import { SwipeableDrawer, useTheme, Box, Stack, Typography, DialogActions, Button, Slide, Snackbar } from '@mui/material'
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { useUserCollectables } from '../../context/userCollectables';
import { useUserInventory } from '../../context/userInventory';
import { useFlashMessage } from '../../context/flashMessage';
import { replace, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { useUserData } from '../../context/userData';

export const Puller = styled('div')(({ theme }) => ({
    width: 50,
    height: 6,
    backgroundColor: grey[500],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 25px)'
}));

const ItemCard = ({open, toggleDrawer, item, currentAmount, isShop, setSnackMessage, setSnackOpen, openMysteryBox}) => {
    const [ownedItems, setOwnedItems] = useState(null)
    const theme = useTheme()
    const { decreaseAmount } = useUserCollectables()
    const inventory = useUserInventory()
    const flashMessage = useFlashMessage()
    const navigate = useNavigate()
    const { userData } = useUserData()

    useEffect(() => {
        if(!inventory.getItems()) return
        const items = inventory.getItems().map((item) => {
            return {id: item.id, amount: item.data().amount}
        })

        setOwnedItems(items)
    }, [inventory.inventory])

    const handleCheckout = async (id, maxAmountOfItem) => {
        console.log(maxAmountOfItem)
        if (item.amountNeeded <= currentAmount ) {
            const matchingItem = ownedItems?.find(x => x.id === id)
            if(typeof matchingItem !== 'undefined'){
                if(matchingItem.amount < maxAmountOfItem){
                    console.log('bought')
                    await decreaseAmount(item.amountNeeded)
                    inventory.addItem(id, matchingItem.amount + 1)
                    flashMessage.showFlashMessage(
                        'Item erfolgreich gekauft!', 
                        'success',
                        <Button variant='contained' sx={{':focus': {outline: 'none'}}} onClick={() => {navigate('./inventory')}}>ansehen</Button>
                    )
                } else {
                    flashMessage.showFlashMessage(`Du hast davon bereits ${maxAmountOfItem} Stück.`, 'warning')
                }
            }else {
                await decreaseAmount(item.amountNeeded)
                inventory.addItem(id, 1)
                flashMessage.showFlashMessage('Item erfolgreich gekauft!', 'success')
            }

            toggleDrawer()
        }
    }

    const handleEquip = async (id, slot) => {
        const equipMessage = await inventory.equipItem(id, slot)
        const route = id.includes('Smoke') ? '/tracker' : '/profile'
        flashMessage.showFlashMessage(
            equipMessage.text, 
            equipMessage.severity,
            equipMessage.severity === 'success' ? 
                <Button variant='contained' sx={{':focus': {outline: 'none'}}} onClick={() => {navigate(route)}}>ansehen</Button> : 
                null
        )
        toggleDrawer()
    }

    const handleUnequip = async (id, slot) => {
        const unequipMessage = await inventory.unequipItem(id, slot)
        const route = id.includes('Smoke') ? '/tracker' : '/profile'
        flashMessage.showFlashMessage(
            unequipMessage.text, 
            unequipMessage.severity,
            unequipMessage.severity === 'success' ? 
                <Button variant='contained' sx={{':focus': {outline: 'none'}}} onClick={() => {navigate(route)}}>ansehen</Button> : 
                null
        )
        toggleDrawer()
    }

  return (
    <>
        <SwipeableDrawer
            anchor="bottom"
            open={open}
            onClose={() => {toggleDrawer()}}
            swipeAreaWidth={10}
            disableSwipeToOpen={true}
            PaperProps={{
            sx: {
                background: 'transparent'
            }
            }}
            sx={{background: 'transparent'}}
            >
            <Box px={2} pb={2} overflow={'auto'} borderRadius={'20px 20px 0 0'} bgcolor={theme.palette.background.paper}>
                <Puller />
                <Stack pt={4} gap={2} height={'100%'} >
                    <item.icon size={'150px'} iconAnim={'bounce'} isItem={true}/>
                    <Typography fontSize={20}>{item.title}</Typography>
                    <Typography fontSize={16} color={grey[500]}>{item.desc}</Typography>
                    <Stack>
                        {item.additionalInfo.map((info) => (
                            <Typography fontSize={16} color={'error'}>{info}</Typography>
                        ))}
                    </Stack>
                    
                </Stack>
                {isShop && (
                    <DialogActions>
                        <Button variant='contained' onClick={() => {handleCheckout(item.id, item.maxAmountInInv)}} disabled={item.amountNeeded > currentAmount} sx={{':focus': {outline: 'none'}}}>
                            <Stack direction={'row'} alignItems={'center'}>
                                <img src="./currencyIcon.svg" width={'30px'} style={{opacity: item.amountNeeded > currentAmount ? '30%' : '100%'}} />
                                <Typography pr={1}>{item.amountNeeded}</Typography>
                            </Stack>
                        </Button>
                    </DialogActions>
                )}
                {item.equippable && !isShop && (
                    <DialogActions>
                        {item.id === userData.equipSlots?.[item.slot] && (
                            <Button variant='contained' onClick={() => {handleUnequip(item.id, item.slot)}} sx={{':focus': {outline: 'none'}}}>
                                <Stack direction={'row'} alignItems={'center'}>
                                    <Typography>Ablegen</Typography>
                                </Stack>
                            </Button>
                        )}
                        <Button variant='contained' onClick={() => {handleEquip(item.id, item.slot)}} sx={{':focus': {outline: 'none'}}}>
                            <Stack direction={'row'} alignItems={'center'}>
                                <Typography>Ausrüsten</Typography>
                            </Stack>
                        </Button>
                    </DialogActions>
                )}
                {item.id === 'mysteryBox' && !isShop && (
                    <DialogActions>
                        <Button variant='contained' onClick={openMysteryBox} sx={{':focus': {outline: 'none'}}}>
                            <Stack direction={'row'} alignItems={'center'}>
                                <Typography>Öffnen</Typography>
                            </Stack>
                        </Button>
                    </DialogActions>
                )}
            </Box>
        </SwipeableDrawer>
    </>
  )
}

export default ItemCard