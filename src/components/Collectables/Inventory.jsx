import React, { useEffect, useState } from 'react'
import { useUserInventory } from '../../context/userInventory'
import { items } from './items'
import { Box, Stack, Grid, useTheme, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material'
import ItemCard from './ItemCard'
import { useNavigate } from 'react-router-dom'
import MysteryBox from './MysteryBox'

export const ItemHolder = ({children, id}) => {
    const theme = useTheme()

    return (
        <Grid size={4} justifyContent={'center'} alignItems={'center'} overflow={'hidden'} display={'flex'} sx={{background: theme.palette.background.paper, p: 2, maxWidth: '96px', minWidth: '96px', maxHeight: '96px', minHeight: '96px', border: `1px solid ${theme.palette.background.default}`, borderRadius: 2, boxShadow: 'inset 0px 0px 34px 0px rgba(0,0,0,0.25)'}}>
            {children}
        </Grid>
    )
}

const Inventory = () => {
    const inventory = useUserInventory()
    const theme = useTheme()
    const [item, setItem] = useState(null)
    const [open, setOpen] = useState()
    const [openMysteryBox, setOpenMysteryBox] = useState(false)
    const [sumOfItems, setSumOfItems] = useState(0)
    const [ownedItems, setOwnedItems] = useState([])
    const navigate = useNavigate()
    

    useEffect(() => {
        if(!inventory.getItems()) return
        var counterVar = 0
        setOwnedItems(inventory.getItems().map((item) => {
            counterVar = counterVar + item.data().amount
            return [item.id, item.data().amount]
        }))
    
        setSumOfItems(counterVar)

    }, [inventory.inventory])

    const closeDrawer = () => {
        setOpen(false)
    }

    const handleOpenMysteryBox = () => {
        setOpenMysteryBox(true)
    }

    const handleCloseMysteryBox = () => {
        setOpenMysteryBox(false)
        inventory.addItem('mysteryBox', inventory.getItemById('mysteryBox').data().amount - 1)
        closeDrawer()
    }


  return (
    <>
        {open && inventory.getItemById('mysteryBox')?.data().amount > 0 && (
            <MysteryBox open={openMysteryBox} close={handleCloseMysteryBox}/>
        )}
        <Box  pt={15} mb={10} display={'flex'} flexDirection={'column'} alignItems={'center'} gap={5} px={3}>
            <ToggleButtonGroup value={'smokeventar'} fullWidth>
                <ToggleButton value={'smokeshop'} onClick={()=> {navigate('/collectables')}} sx={{':focus': {outline: 'initial', }, ':hover': {border: '1px solid rgba(255, 255, 255, 0.12)'}}}>
                    <Typography>SmokeShop</Typography>
                </ToggleButton>
                <ToggleButton value={'smokeventar'}  sx={{':focus': {outline: 'initial'}, ':hover': {border: '1px solid rgba(255, 255, 255, 0.12)'}}}>
                    <Typography>Smokeventar</Typography>
                </ToggleButton>
            </ToggleButtonGroup>
            <Box bgcolor={theme.palette.background.paper} p={1} borderRadius={2}>
                <Grid container justifyContent={'space-evenly'} spacing={1} >
                    {ownedItems.map((ownedItem) => {
                        const item = items.find(x => x.id === ownedItem[0])

                        var itemsOfAKind = []

                        for (let index = 0; index < ownedItem[1]; index++) {
                            itemsOfAKind.push(
                                <React.Fragment key={index}>
                                    <label htmlFor={ownedItem[0]}>
                                        <ItemHolder key={index}>
                                            <item.icon size={'80px'} isItem={true}/>
                                        </ItemHolder>
                                    </label>
                                    <button id={ownedItem[0]} style={{display: 'none'}} onClick={()=> {setItem(item); setOpen(true)}}/>
                                </React.Fragment>
                            )
                            
                        }
                        return itemsOfAKind
                    })}
                    {Array.from(Array(10 - (sumOfItems > 10 ? 10 : sumOfItems))).map((_, index) => (
                        <ItemHolder/>
                    ))}
                </Grid>

            </Box>
        </Box>
        {open && (
            <ItemCard isShop={false} currentAmount={0} item={item} open={open} toggleDrawer={closeDrawer} openMysteryBox={handleOpenMysteryBox}/>           
        )}
    </>

  )
}

export default Inventory