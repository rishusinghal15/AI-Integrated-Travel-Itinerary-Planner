/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import API_URL from '../config'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')))

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
    }

    const login = (userData, userToken) => {
        setUser(userData)
        setToken(userToken)
        localStorage.setItem('token', userToken)
    }

    useEffect(() => {
        if (!token) return

        let isMounted = true

        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.status === 401) {
                    if (isMounted) logout()
                    return
                }
                const data = await res.json()
                if (data.success && isMounted) {
                    setUser(data.user)
                } else if (isMounted) {
                    logout()
                }
            } catch {
                if (isMounted) logout()
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchProfile()

        return () => {
            isMounted = false
        }
    }, [token])

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)