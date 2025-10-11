import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import TherapistRegister from './TherapistRegister'

const AdminOnlyTherapistRegister: React.FC = () => {
  const { user } = useAuth()
  
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }
  
  return <TherapistRegister />
}

export default AdminOnlyTherapistRegister
