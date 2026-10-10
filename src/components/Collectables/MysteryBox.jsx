import React, { useEffect, useState } from 'react'
import { Dialog, Box, Button, Stack, useTheme, Typography } from '@mui/material'
import { mysteryLoot } from './mysteryLoot'
import { items } from './items'
import { useUserInventory } from '../../context/userInventory'
import { useUserCollectables } from '../../context/userCollectables'

const MysteryBox = ({open, close}) => {

    const [boxState, setBoxState] = useState(false)
    const [isOpening, setIsOpening] = useState(false)
    const [boxAnim, setBoxAnim] = useState('bounce')
    const [lootAnim, setLootAnim] = useState('mysteryBoxLootAnim')
    const [finalLoot, setFinalLoot] = useState(null)
    const [loading, setLoading] = useState(false)

    const theme = useTheme()
    const inventory = useUserInventory()
    const collectables = useUserCollectables()
    const cumulativeWeights = [10, 14, 16, 17]
    const itemPool = mysteryLoot
    const rarityColors = ['#969696', '#047804', '#EFBF04', '#53277E']

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    var preDeterminedItem 

    useEffect(() => {
        if(!items) return
        
        setLoading(false)
    }, [items])

    function getRandomItem() {
        const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1]
        const randomNumber = maxCumulativeWeight * Math.random();
        //const randomNumber = 17
        const lootType = Math.random() > 0.5 ? 'smokeDollar' : 'items'

        for (let index = 0; index < cumulativeWeights.length; index++) {
            if (cumulativeWeights[index] >= randomNumber) {

                const schwanz = itemPool[index][lootType]
                const rand = Math.floor(schwanz.length * Math.random())

                if(lootType === 'items') {
                    if (typeof inventory.getItemById(items[schwanz[rand]].id) !== 'undefined') {
                        if(inventory.getItemById(items[schwanz[rand]].id).data().amount >= items[schwanz[rand]].maxAmountInInv){
    
                            return{
                                item: itemPool[index]['smokeDollar'][Math.floor(itemPool[index]['smokeDollar'].length * Math.random())], 
                                index: index, 
                                lootType: 'smokeDollar'}
                        }
                    }
                }

                return {
                        item: lootType === 'items' ? items[schwanz[rand]] : schwanz[rand],
                        index: index,
                        lootType: lootType
                    };
            
            

            }
        }
    }

    const handleClick = async () => {

        if (finalLoot != null) {
            if (finalLoot.lootType === 'items') {
                //console.log(inventory.getItemById(finalLoot.item.id).data().amount)
                inventory.addItem(finalLoot.item.id, inventory.getItemById(finalLoot.item.id)?.data().amount + 1 || 1)
            }else {
                collectables.increaseAmount(finalLoot.item)
            }
            close()
            return
        }

        
        const item = getRandomItem()
        console.log(item)

        setIsOpening(true)
        setBoxAnim('mysteryBoxAnim')
        await timeout(1500)
        setFinalLoot(item)
        setBoxState(prev => !prev )
        await timeout(500)
        setBoxAnim('')
        setLootAnim('bounce')
        setIsOpening(false)

    }

  return (
    <Dialog open={open} fullScreen> 
        <Stack height={'100vh'} gap={5} width={'100%'} direction={'column'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <Typography fontSize={30} fontWeight={'bold'}>Mystery Box Öffnen</Typography>
            {finalLoot?.lootType === 'items' && (
                <Stack className={lootAnim} zIndex={10} justifyContent={'center'} alignItems={'center'} display={'flex'}>
                    {finalLoot.index === 0 && (<Typography>Gewöhnliches Item</Typography>)}
                    {finalLoot.index === 1 && (<Typography>Seltenes Item</Typography>)}
                    {finalLoot.index === 2 && (<Typography>Legendäres Item</Typography>)}
                    {finalLoot.index === 3 && (<Typography>Mythisches Item</Typography>)}
                    <Box justifyContent={'center'} alignItems={'center'} display={'flex'} overflow={'hidden'} sx={{background: rarityColors[finalLoot.index], p: 2, maxWidth: '96px', minWidth: '96px', maxHeight: '96px', minHeight: '96px', border: `1px solid ${theme.palette.background.default}`, borderRadius: 2, boxShadow: 'inset 0px 0px 34px 0px rgba(0,0,0,0.65)'}}>
                        <finalLoot.item.icon size={'76px'} isItem={true}/>
                    </Box>
                    <Typography fontWeight={'bold'}>{finalLoot.item.title}</Typography>
                </Stack>
            )}
            {finalLoot?.lootType === 'smokeDollar' && (
                <Stack className={lootAnim} zIndex={10} justifyContent={'center'} alignItems={'center'} display={'flex'}>
                    <Box justifyContent={'center'} alignItems={'center'} display={'flex'} sx={{background: rarityColors[finalLoot.index], p: 2, maxWidth: '96px', minWidth: '96px', maxHeight: '96px', minHeight: '96px', border: `1px solid ${theme.palette.background.default}`, borderRadius: 2, boxShadow: 'inset 0px 0px 34px 0px rgba(0,0,0,0.25)'}}>
                        <img src="./currencyIcon.svg" alt="restore" width={'46px'} />
                        <Typography fontSize={25} fontWeight={'bold'}>{finalLoot.item}</Typography>
                    </Box>

                </Stack>
            )}
            <Box position={'relative'} display={'flex'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'}>
                <img className={boxAnim} src={!boxState ? './mysteryBoxClosed.png' : './mysteryBoxOpen.png'} width={200} height={200} alt="mysteryBox" />
                <Button sx={{':focus' : {outline: 'none'}}} disabled={isOpening} variant='contained' loading={loading} onClick={handleClick}>{!isOpening && boxState ? 'Einsammeln' : 'Öffnen'}</Button>
            </Box>
        </Stack>
        
    </Dialog>
  )
}

export default MysteryBox