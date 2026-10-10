import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { db } from "../firebase";
import { doc, setDoc, query, collection, getDoc, onSnapshot } from "@firebase/firestore";
import { useAppTheme } from '../components/Settings/ThemeProviderCustom'
import { useUserAuth } from "./userAuthConfig";
import { Snackbar, Alert } from "@mui/material";

const flashMessageContext = createContext();

export function FlashMessageContextProvider({ children }) {
    const [open, setOpen] = useState(false)
    const [severity, setSeverity] = useState('success')
    const [message, setMessage] = useState('')
    const [action, setAction] = useState(<></>)

    const handleSnackClose = () => {
        setOpen(false)
    }

    const showFlashMessage = (messageParam, severityParam, actionParam) => {
        setOpen(true)
        setMessage(messageParam)
        setSeverity(severityParam)
        setAction(actionParam)
    }

    return (
        <flashMessageContext.Provider value={{ showFlashMessage }}>
            <Snackbar
                open={open}
                onClose={handleSnackClose}
                autoHideDuration={4000}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert severity={severity} variant="filled" sx={{ width: '100%', color: '#fff', display: 'flex', alignItems: 'center'}} action={action} onClick={handleSnackClose}>
                    {message}
                </Alert>
            </Snackbar>
            {children}
        </flashMessageContext.Provider>
    );
}

export function useFlashMessage() {
  return useContext(flashMessageContext);
}