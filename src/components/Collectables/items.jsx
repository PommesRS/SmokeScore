import { Box } from '@mui/material'
import SmokeEffect from '../Counter/smokeEffect'

export const items = [
        {
            id: 'freezeStreak',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./freezeStreakIcon.svg" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 10,
            title: 'Streak Einfrieren',
            desc: 'Wenn du dieses Item im Inventar hast, ist deine Streak für einen Tag geschützt.',
            additionalInfo: ['Item wird automatisch verbraucht.', 'Item kann maximal zweimal im Inventar vorhanden sein.'],
            maxAmountInInv: 2,
            equippable: false,
            shoppable: true,
        },
        {
            id: 'bgCubes',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./bgAsset1.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 7,
            title: 'Würfel Tapete',
            desc: 'Wenn du diese Tapete im Inventar ausgerüstet hast, wird er deinen Freunden auf der Freunde Seite als Profil-Hintergrund angezeigt.',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedBackground'
        },
        {
            id: 'bgStars',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./bgAsset2.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 7,
            title: 'Stern Tapete',
            desc: 'Wenn du diese Tapete im Inventar ausgerüstet hast, wird er deinen Freunden auf der Freunde Seite als Profil-Hintergrund angezeigt.',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedBackground'
        },
        {
            id: 'bgSlate',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./bgAsset3.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 9,
            title: 'Schiefer Tapete',
            desc: 'Wenn du diese Tapete im Inventar ausgerüstet hast, wird er deinen Freunden auf der Freunde Seite als Profil-Hintergrund angezeigt.',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedBackground'
        },
        {
            id: 'bgCigcrossOrange',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./bgAsset4.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 5,
            title: 'Orange Zigaretten Tapete',
            desc: 'Wenn du diese Tapete im Inventar ausgerüstet hast, wird er deinen Freunden auf der Freunde Seite als Profil-Hintergrund angezeigt.',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedBackground'
        },
        {
            id: 'avatarFrameOrange',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./avatarFrame4.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 5,
            title: 'Oranger Zigaretten Rahmen',
            desc: 'Wenn du diesen Rahmen im Inventar ausgerüstet hast, wird er deinen Freunden auf der Freunde Seite als Profilbild-Rahmen angezeigt.',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedFrame',
            assetPath: './avatarFrame4.png'
        },
        {
            id: 'bgCigcrossGreen',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./bgAsset5.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 5,
            title: 'Grüne Zigaretten Tapete',
            desc: 'Wenn du diese Tapete im Inventar ausgerüstet hast, wird er deinen Freunden auf der Freunde Seite als Profil-Hintergrund angezeigt.',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedBackground'
        },
        {
            id: 'avatarFrameGreen',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./avatarFrame5.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 5,
            title: 'Grüner Zigaretten Rahmen',
            desc: 'Wenn du diesen Rahmen im Inventar ausgerüstet hast, wird er deinen Freunden auf der Freunde Seite als Profilbild-Rahmen angezeigt.',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedFrame',
            assetPath: './avatarFrame5.png'
        },
        {
            id: 'bgCigcrossBlue',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./bgAsset6.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 5,
            title: 'Blaue Zigaretten Tapete',
            desc: 'Wenn du diese Tapete im Inventar ausgerüstet hast, wird er deinen Freunden auf der Freunde Seite als Profil-Hintergrund angezeigt.',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedBackground'
        },
        {
            id: 'avatarFrameBlue',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./avatarFrame6.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 5,
            title: 'Blauer Zigaretten Rahmen',
            desc: 'Wenn du diesen Rahmen im Inventar ausgerüstet hast, wird er deinen Freunden auf der Freunde Seite als Profilbild-Rahmen angezeigt.',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedFrame',
            assetPath: './avatarFrame6.png'
        },
        {
            id: 'bgCigcrossRed',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./bgAsset7.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 5,
            title: 'Rote Zigaretten Tapete',
            desc: 'Wenn du diese Tapete im Inventar ausgerüstet hast, wird er deinen Freunden auf der Freunde Seite als Profil-Hintergrund angezeigt.',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedBackground'
        },
        {
            id: 'avatarFrameRed',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./avatarFrame7.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 5,
            title: 'Roter Zigaretten Rahmen',
            desc: 'Wenn du diesen Rahmen im Inventar ausgerüstet hast, wird er deinen Freunden auf der Freunde Seite als Profilbild-Rahmen angezeigt.',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedFrame',
            assetPath: './avatarFrame7.png'
        },
        {
            id: 'mysteryBox',
            icon: ({size, iconStyle, iconAnim}) => (
                <Box position={'relative'} height={size} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <img className={iconAnim} src="./mysteryBoxAsset.png" alt="restore" width={size} style={{position: 'absolute', ...iconStyle}} />
                </Box>
            ),
            amountNeeded: 5,
            title: 'Mystery Box',
            desc: 'Eine Mystery Box kann ein zufälliges Item auf dem Smokeshop enthalten oder SmokeDollar.',
            additionalInfo: ['Item wird nach Öffnung verbraucht.'],
            maxAmountInInv: 1,
            equippable: false,
            shoppable: false,
            slot: 'equippedFrame',
            assetPath: './mysteryBoxAsset.png'
        },
        {
            id: 'purpleSmoke',
            icon: ({size, iconStyle, iconAnim, isItem}) => (
                <Box position={'relative'} height={size} width={'100%'} id={'pimmel'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <SmokeEffect isItem={isItem} color={'rgba(192, 104, 180, 1)'}/>
                </Box>
            ),
            amountNeeded: 15,
            title: 'Lila Rauch',
            desc: 'Wenn du diesen Rauf Effekt im Inventar ausgerüstet hast, wird er dir an deinem Counter angezeigt',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedSmoke',
            assetPath: 'rgba(192, 104, 180, 0.25)'
        },
        {
            id: 'blueSmoke',
            icon: ({size, iconStyle, iconAnim, isItem}) => (
                <Box position={'relative'} height={size} width={'100%'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <SmokeEffect isItem={isItem} color={'rgba(78, 164, 222, 1)'}/>
                </Box>
            ),
            amountNeeded: 15,
            title: 'Blauer Rauch',
            desc: 'Wenn du diesen Rauf Effekt im Inventar ausgerüstet hast, wird er dir an deinem Counter angezeigt',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedSmoke',
            assetPath: 'rgba(78, 164, 222, 0.25)'
        },
        {
            id: 'greenSmoke',
            icon: ({size, iconStyle, iconAnim, isItem}) => (
                <Box position={'relative'} height={size} width={'100%'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <SmokeEffect isItem={isItem} color={'rgba(97, 183, 62, 1)'}/>
                </Box>
            ),
            amountNeeded: 15,
            title: 'Grüner Rauch',
            desc: 'Wenn du diesen Rauf Effekt im Inventar ausgerüstet hast, wird er dir an deinem Counter angezeigt',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedSmoke',
            assetPath: 'rgba(97, 183, 62, 0.25)'
        },
        {
            id: 'redSmoke',
            icon: ({size, iconStyle, iconAnim, isItem}) => (
                <Box position={'relative'} height={size} width={'100%'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <SmokeEffect isItem={isItem} color={'rgba(183, 61, 61, 1)'}/>
                </Box>
            ),
            amountNeeded: 15,
            title: 'Roter Rauch',
            desc: 'Wenn du diesen Rauf Effekt im Inventar ausgerüstet hast, wird er dir an deinem Counter angezeigt',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedSmoke',
            assetPath: 'rgba(183, 61, 61, 0.25)'
        },
        {
            id: 'goldSmoke',
            icon: ({size, iconStyle, iconAnim, isItem}) => (
                <Box position={'relative'} height={size} width={'100%'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    <SmokeEffect isItem={isItem} color={'rgba(239,191,4, 1)'}/>
                </Box>
            ),
            amountNeeded: 30,
            title: 'Gold Rauch',
            desc: 'Wenn du diesen Rauf Effekt im Inventar ausgerüstet hast, wird er dir an deinem Counter angezeigt',
            additionalInfo: ['Item kann maximal einmal im Inventar vorhanden sein.'],
            maxAmountInInv: 1,
            equippable: true,
            shoppable: true,
            slot: 'equippedSmoke',
            assetPath: 'rgba(239,191,4, 0.55)'
        },

    ]