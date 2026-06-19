import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth"
import { auth, isConfigured } from "./firebase.js"
import { ensureProfile } from "./lib/team.js"

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      if (u) ensureProfile(u).catch((e) => console.error(e))
    })
    return unsub
  }, [])

  const value = {
    user,
    loading,
    login: (email, pass) => signInWithEmailAndPassword(auth, email, pass),
    signup: (email, pass) => createUserWithEmailAndPassword(auth, email, pass),
    loginGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
    logout: () => signOut(auth),
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
