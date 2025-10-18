import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import NewLandingPage from './pages/NewLandingPage'
import UnifiedLogin from './pages/UnifiedLogin'
import ParentRegister from './pages/ParentRegister'
import AdminOnlyTherapistRegister from './pages/AdminOnlyTherapistRegister'
import AdminRegister from './pages/AdminRegister'
import ParentDashboard from './pages/ParentDashboard'
import ParentChildren from './pages/ParentChildren'
import ParentChildDetails from './pages/ParentChildDetails'
import FindTherapists from './pages/FindTherapists'
import TherapistDashboard from './pages/TherapistDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminTherapistsView from './pages/AdminTherapistsView'
import AdminChildrenView from './pages/AdminChildrenView'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminProfile from './pages/AdminProfile'
import AdminSettings from './pages/AdminSettings'
import VideoCallPage from './pages/VideoCallPage'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'
import ChangePassword from './pages/ChangePassword'
import ParentBookings from './pages/ParentBookings'
import ParentAnalytics from './pages/ParentAnalytics'
import ParentProfile from './pages/ParentProfile'
import ParentSettings from './pages/ParentSettings'
import TherapistAnalytics from './pages/TherapistAnalytics'
import TherapistProfile from './pages/TherapistProfile'
import TherapistSettings from './pages/TherapistSettings'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<NewLandingPage />} />
        <Route path="/old-landing" element={<LandingPage />} />
        <Route path="/login" element={<UnifiedLogin />} />
        {/* Manual registration disabled; OAuth only */}
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {/* Video call route without layout (fullscreen) */}
      <Route path="/video-call/:bookingId" element={<VideoCallPage />} />
      
      {/* All other routes with layout */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to={`/${user.role.toLowerCase()}`} replace />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/parent/children" element={<ParentChildren />} />
            <Route path="/parent/children/:childId" element={<ParentChildDetails />} />
            <Route path="/parent/therapists" element={<FindTherapists />} />
            <Route path="/parent/bookings" element={<ParentBookings />} />
            <Route path="/parent/analytics" element={<ParentAnalytics />} />
            <Route path="/parent/profile" element={<ParentProfile />} />
            <Route path="/parent/settings" element={<ParentSettings />} />
            <Route path="/therapist" element={<TherapistDashboard />} />
            <Route path="/therapist/bookings" element={<TherapistDashboard />} />
            <Route path="/therapist/schedule" element={<TherapistDashboard />} />
            <Route path="/therapist/analytics" element={<TherapistAnalytics />} />
            <Route path="/therapist/profile" element={<TherapistProfile />} />
            <Route path="/therapist/settings" element={<TherapistSettings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/therapists" element={<AdminTherapistsView />} />
            <Route path="/admin/children" element={<AdminChildrenView />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/create-therapist" element={<AdminOnlyTherapistRegister />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
