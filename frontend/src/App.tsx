import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import ParentLogin from './pages/ParentLogin'
import TherapistLogin from './pages/TherapistLogin'
import AdminLogin from './pages/AdminLogin'
import ParentRegister from './pages/ParentRegister'
import TherapistRegister from './pages/TherapistRegister'
import AdminRegister from './pages/AdminRegister'
import ParentDashboard from './pages/ParentDashboard'
import ParentChildren from './pages/ParentChildren'
import ParentChildDetails from './pages/ParentChildDetails'
import FindTherapists from './pages/FindTherapists'
import TherapistDashboard from './pages/TherapistDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LoadingSpinner from './components/LoadingSpinner'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/parent" element={<ParentLogin />} />
        <Route path="/login/therapist" element={<TherapistLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/register/parent" element={<ParentRegister />} />
        <Route path="/register/therapist" element={<TherapistRegister />} />
        <Route path="/register/admin" element={<AdminRegister />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={`/${user.role.toLowerCase()}`} replace />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/parent/children" element={<ParentChildren />} />
        <Route path="/parent/children/:childId" element={<ParentChildDetails />} />
        <Route path="/parent/therapists" element={<FindTherapists />} />
        <Route path="/therapist" element={<TherapistDashboard />} />
        <Route path="/therapist/bookings" element={<TherapistDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
