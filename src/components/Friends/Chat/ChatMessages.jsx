import React, {useEffect} from "react";
import { useTheme, Box, Stack, Typography, Paper, Button, Icon } from "@mui/material";
import { useUserAuth } from "../../../context/userAuthConfig";
import dayjs from "dayjs";
import { grey } from "@mui/material/colors";
import { DoneAll, SubdirectoryArrowRight, Mail, Schedule, Check, CropSquareSharp, Close } from "@mui/icons-material";
import { db } from "../../../firebase";
import { setDoc, doc, runTransaction } from "firebase/firestore";
import { useFriendChat } from "../../../context/friendChat";

export function Message({callback, message, chatId, friendName}) {
    const { user } = useUserAuth()
    const theme = useTheme()
    const friendChat = useFriendChat()

    useEffect(() => {
      callback()
      setMsgSeen()
    }, [])

    const setMsgSeen = async () => {
        
        if(!message.seen && message.senderID != user.uid) {
            await setDoc(doc(db, 'Chats', chatId, 'Messages', message.id), {
                seen: true
            }, {merge: true})

            await setDoc(doc(db, 'Chats', chatId), {
                newMsg: false
            }, {merge: true})

            // console.log(message.senderID, friendChat.newMessages)
            // const index = friendChat.newMessages.findIndex(el => el.id === message.senderID)
            // console.log(index)
            // if(index !== -1) {
                friendChat.setMessages(friendChat.newMessages.filter(function(el) {return el.id !== message.senderID}))
                //friendChat.newMessages.splice(index, 1)
            //}
                    
        }
    }

    const handleInvite = async (status) => {
        await runTransaction(db, async (transaction) => {
            transaction.set(doc(db, 'Chats', chatId, 'Messages', message.id), {
                coop: {
                    status: status
                }
            }, {merge: true})

            transaction.set(doc(db, 'Users', message.senderID, 'QuestProgress', message.coop.questId), {
                progress: 0,
                completed : false,
                updatedAt: new Date(),
                partner: user.uid
            }, {merge: true})

            transaction.set(doc(db, 'Users', user.uid, 'QuestProgress', message.coop.questId), {
                progress: 0,
                completed : false,
                updatedAt: new Date(),
                partner: message.senderID
            }, {merge: true})

        })

        
    }
    

    return (
        <React.Fragment>
            <Paper elevation={0} key={message.id} sx={message.senderID !== user.uid ? 
                {position: 'relative',color:'#fff', p: 2,  alignSelf: 'start', maxWidth: '70%', ':before': {content: '""', position: 'absolute', width: '10px', height: '10px', left: -6, top: 0, background: `linear-gradient(225deg, ${theme.palette.background.paper} 50%, rgba(0,0,0,0) 50%)`, filter: 'opacity(1)'}} 
                : 
                {position: 'relative',color:'#fff', p: 2,  alignSelf: 'end', maxWidth: '70%', ':before': {content: '""', position: 'absolute', width: '10px', height: '10px', right: -6, top: 0, background: `linear-gradient(135deg, ${theme.palette.background.paper} 50%, rgba(0,0,0,0) 50%)`, filter: 'opacity(1)'}}}>
                <Stack position={'relative'} gap={1} mr={1/2}>
                    {typeof message.isReaction !== 'undefined' && (
                        <Stack direction={'row'} alignItems={'center'}>
                            <SubdirectoryArrowRight fontSize="samll"/>
                            <Typography fontSize={12} top={-15} textAlign={'right'} >{message.senderID === user.uid ? 'Du hast' : friendName + ' hat'} reagiert</Typography>
                        </Stack>
                    )}
                    {typeof message.coop !== 'undefined' && (

                        <Stack direction={'row'} alignItems={'center'} gap={1/2}>
                            <Mail fontSize="samll"/>
                            <Typography fontSize={12} top={-15} textAlign={'right'} >{message.senderID === user.uid ? 'Du hast' : friendName + ' hat dich'} zur Quest eingeladen</Typography>
                        </Stack>

                    )}
                    <Typography fontSize={17} pr={5} maxWidth={'100%'}  sx={{wordWrap: 'break-word'}}>{message.text}</Typography>
                    {typeof message.coop !== 'undefined' && (message.senderID !== user.uid ? (
                        message.coop.status === 'pending' ?
                        <Stack direction={'row'} alignItems={'center'} mb={1/2} gap={1/2}>
                            <Button sx={{':focus' : {outline: 'none'}}} onClick={() => {handleInvite('denied')}}>Ablehnen</Button>
                            <Button sx={{':focus' : {outline: 'none'}}} onClick={() => {handleInvite('accepted')}} variant="contained">Annehmen</Button>
                        </Stack>
                        : message.coop.status === 'accepted' ?
                            <Stack direction='row' gap={1/2} alignItems={'center'}>
                                <Check fontSize="small" color={message.coop.status === 'pending' ? 'warning' : message.coop.status === 'accepted' ? 'success' : 'error'}/> 
                                <Typography color="success">Angenommen</Typography>   
                            </Stack>
                            :
                            <Stack direction='row' gap={1/2} alignItems={'center'}>
                                <Close fontSize="small" color={message.coop.status === 'pending' ? 'warning' : message.coop.status === 'accepted' ? 'success' : 'error'}/> 
                                <Typography color="error">Angenommen</Typography>   
                            </Stack>
                    ):(
                        <Stack direction={'row'} alignItems={'center'} mb={1/2} gap={1/2}>
                            {message.coop.status === 'pending' ? 
                                <Schedule fontSize="small" color={message.coop.status === 'pending' ? 'warning' : message.coop.status === 'accepted' ? 'success' : 'error'}/> 
                            : message.coop.status === 'accepted' ? 
                                <Check fontSize="small" color={message.coop.status === 'pending' ? 'warning' : message.coop.status === 'accepted' ? 'success' : 'error'}/>     
                            : 
                                <Close fontSize="small" color={message.coop.status === 'pending' ? 'warning' : message.coop.status === 'accepted' ? 'success' : 'error'}/> 
                            }
                            
                            <Typography variant="contained" fontSize={15} color={message.coop.status === 'pending' ? 'warning' : message.coop.status === 'accepted' ? 'success' : 'error'}>{message.coop.status === 'pending' ? 'Ausstehend' : message.coop.status === 'accepted' ? 'Angenommen' : 'Abgelehnt'}</Typography>
                        </Stack>
                    ))}
                    {/* {console.log(message.coop)} */}
                    <Stack direction={'row'} alignSelf={'end'} alignItems={'center'} position={'absolute'} bottom={-15} right={-13} gap={1/2} color={grey[100]}>
                        <Typography fontSize={12}>{dayjs(message.time?.toDate()).format('HH:mm')}</Typography>
                        {message.senderID === user.uid && (
                            <DoneAll fontSize="small" color={message.seen ? 'primary' : 'inherit'}/>
                        )}
                    </Stack>
                </Stack>
            </Paper>
        </React.Fragment>
        
    )
}

export function DateSeparator({ date, formatChatDate }) {
    const theme = useTheme()
    return (
        <Box
            component={'div'}
            sx={{
                position: "sticky",
                top: 50,
                bottom: 50,
                zIndex: 5,
                background: theme.palette.background.paper,
                textAlign: "center",
                py: 0.5,
                width: '30%',
                borderRadius: "10px",
                alignSelf: 'center',
            }}
        >
        <Typography sx={{ opacity: 0.9 }}>
            {formatChatDate(date)}
        </Typography>
        </Box>
    );
}

const ChatMessages = ({messages, chatId, friendName}) => {
    const theme = useTheme()
    if(!messages) return

    const callback = () => {
        const container = document.querySelector('.chat-container');
        if(container.lastElementChild) {
            container.lastElementChild.scrollIntoView(true)
        }

    }

    const sortedMessages = [...messages].sort(
    (a, b) => a.time?.toMillis() - b.time?.toMillis()
    );

    const groupedMessages = sortedMessages.reduce((acc, msg) => {
    const ts = msg.time?.toDate();
    const dateKey = dayjs(ts).startOf("day").toDate(); // echtes Date!

    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(msg);

    return acc;
    }, {});

    function formatChatDate(date) {
        const d = dayjs(date);
        const today = dayjs();
        const yesterday = today.subtract(1, "day");

        if (d.isSame(today, "day")) return "Heute";
        if (d.isSame(yesterday, "day")) return "Gestern";

        return d.format("DD.MM.YY");
    }

    return (
        <Stack gap={2} className='chat-container'>
            {Object.entries(groupedMessages).map(([date, msgs]) => (
                <React.Fragment key={date}>
                    <DateSeparator date={date} formatChatDate={formatChatDate} />
                    {msgs.map(message => (
                        <React.Fragment key={message.id}>
                            <Message friendName={friendName} message={message} callback={callback} chatId={chatId}/>
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}
        </Stack >
    )
}

export default ChatMessages