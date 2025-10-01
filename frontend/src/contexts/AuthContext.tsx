import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '../lib/api'

interface User {
  id: string
  email: string
  role: 'PARENT' | 'THERAPIST' | 'ADMIN'
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, role?: string) => Promise<void>
  register: (email: string, password: string, name: string, phone: string, role: string, specialization?: string, experience?: number, baseCostPerSession?: number) => Promise<void>
  registerParent: (data: RegisterParentData) => Promise<void>
  registerTherapist: (data: RegisterTherapistData) => Promise<void>
  registerAdmin: (data: RegisterAdminData) => Promise<void>
  logout: () => void
}

interface RegisterParentData {
  email: string
  password: string
  name: string
  phone: string
}

interface RegisterTherapistData {
  email: string
  password: string
  name: string
  phone: string
  specialization: string
  experience: number
  baseCostPerSession: number
}

interface RegisterAdminData {
  email: string
  password: string
  name: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string, role?: string) => {
    try {
      const response = await authAPI.login(email, password)
      const { user: userData, token } = response.data
      
      // If role is specified, check if user has that role
      if (role && userData.role !== role) {
        throw new Error(`Access denied. This account is for ${userData.role.toLowerCase()}s, not ${role.toLowerCase()}s.`)
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed')
    }
  }

  const register = async (email: string, password: string, name: string, phone: string, role: string, specialization?: string, experience?: number, baseCostPerSession?: number) => {
    try {
      let response
      if (role === 'PARENT') {
        response = await authAPI.registerParent({ email, password, name, phone })
      } else if (role === 'THERAPIST') {
        response = await authAPI.registerTherapist({ email, password, name, phone, specialization: specialization!, experience: experience!, baseCostPerSession: baseCostPerSession! })
      } else if (role === 'ADMIN') {
        response = await authAPI.registerAdmin({ email, password, name })
      } else {
        throw new Error('Invalid role')
      }
      
      const { user: userData, token } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed')
    }
  }

  const registerParent = async (data: RegisterParentData) => {
    try {
      const response = await authAPI.registerParent(data)
      const { user: userData, token } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  const registerTherapist = async (data: RegisterTherapistData) => {
    try {
      const response = await authAPI.registerTherapist(data)
      const { user: userData, token } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  const registerAdmin = async (data: RegisterAdminData) => {
    try {
      const response = await authAPI.registerAdmin(data)
      const { user: userData, token } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    registerParent,
    registerTherapist,
    registerAdmin,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
