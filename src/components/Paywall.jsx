import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/userAuthConfig';
import { db } from '../firebase.js';
import { collection, doc, getDoc, updateDoc, arrayRemove, arrayUnion, setDoc } from "@firebase/firestore";
import { PaywallStats, PaywallFriends, PaywallMap } from './index.js';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [permission, setPermission] = useState(true)
    const navigate = useNavigate();
    let { user } = useUserAuth();
    const docRef = doc(db, "Users", user.uid)

    const getPermissionStatus = async () => {
        const status = (await getDoc(docRef)).data().hasPremium
        if(status){
            setPermission(status)
            setLoading(false)
            console.log('loading end')
        }else{
            setPermission(false)
            setLoading(false)
            console.log('loading end')
        }
        
    }

    useEffect(() => {
      getPermissionStatus()
    }, [])

    if (loading) {
        return <><div>Loading</div></>
        
    }else{
        if (permission) {
            return children;
        }else {
            if (children.props.displayName === 'Stats') {
                console.log('StatsSeite mit Paywall')
<<<<<<< HEAD
                return <PaywallStats user={user}/>
            } else if (children.props.displayName === 'Friends'){
                return <PaywallFriends user={user}/>
            } else if (children.props.displayName === 'Map'){
                return <PaywallMap user={user}/>
=======
                return <PaywallStats/>
            } else if (children.props.displayName === 'Friends'){
                return <PaywallFriends/>
            } else if (children.props.displayName === 'Map'){
                return <PaywallMap />
>>>>>>> b38927722a79c6504459df6df3ee11d1bf3d2d5c
            }
            
        }
    }
}

export default ProtectedRoute