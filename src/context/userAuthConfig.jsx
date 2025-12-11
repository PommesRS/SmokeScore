import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signInWithRedirect
} from "firebase/auth";
import { auth } from "../firebase";
import { db } from "../firebase";
import { doc, setDoc, query, collection, getDoc } from "@firebase/firestore";


const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signUp(email, password, Name) {
    return createUserWithEmailAndPassword(auth, email, password).then(async function (result) {
      await setDoc(doc(db, "Users", result.user.uid), {
        counter: 0,
        displayName: Name,
        Friends: [],
        FriendRequests: [],
        geoLocations: [],
        latestCigs: [],
        spendingHistory: [],
        hasPremium: false,
        tags: {},
        canGetNotifications: true,
        events: []
      })
      return await updateProfile(result.user, {
        displayName: Name
      })
    })

  }
  
  function logOut() {
    return signOut(auth);
  }

  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithRedirect(auth, googleAuthProvider).then(async function (result) {
      const docRef = doc(db, 'Users', result.user.uid)
      if ((await docRef.getDoc()).exists()) {
        console.log('exists')
        return
      }
      await setDoc(doc(db, "Users", result.user.uid), {
        counter: 0,
        displayName: result.user.displayName,
        Friends: [],
        FriendRequests: [],
        geoLocations: [],
        latestCigs: [],
        spendingHistory: [],
        hasPremium: false,
        tags: {},
        canGetNotifications: true,
        events: [],
        streak: 0
      })
    })
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
      console.log("Auth", currentuser);
      setUser(currentuser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <userAuthContext.Provider value={{ user, logIn, signUp, logOut, googleSignIn }}>
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}