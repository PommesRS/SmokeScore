import React from 'react'
import { Navigate } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/userAuthConfig';


const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    let { user } = useUserAuth();

    if (user != null) {
        return children;
    }else {
        return <Navigate to='/login' replace/>
    }
}

export default ProtectedRoute