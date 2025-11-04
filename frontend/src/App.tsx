import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load pages for better code splitting and performance
const LandingPage = lazy(() => import('./pages/LandingPage'))
const NewLandingPage = lazy(() => import('./pages/NewLandingPage'))
const UnifiedLogin = lazy(() => import('./pages/UnifiedLogin'))
const ParentRegister = lazy(() => import('./pages/ParentRegister'))
const AdminOnlyTherapistRegister = lazy(() => import('./pages/AdminOnlyTherapistRegister'))
const AdminRegister = lazy(() => import('./pages/AdminRegister'))
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'))
const ParentChildren = lazy(() => import('./pages/ParentChildren'))
const ParentChildDetails = lazy(() => import('./pages/ParentChildDetails'))
const FindTherapists = lazy(() => import('./pages/FindTherapists'))
const TherapistDashboard = lazy(() => import('./pages/TherapistDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminTherapistsView = lazy(() => import('./pages/AdminTherapistsView'))
const AdminChildrenView = lazy(() => import('./pages/AdminChildrenView'))
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'))
const AdminProfile = lazy(() => import('./pages/AdminProfile'))
const AdminSettings = lazy(() => import('./pages/AdminSettings'))
const AdminDemoManagement = lazy(() => import('./pages/AdminDemoManagement'))
const AdminDemoHistory = lazy(() => import('./pages/AdminDemoHistory'))
const VideoCallPage = lazy(() => import('./pages/VideoCallPage'))
const ParentBookings = lazy(() => import('./pages/ParentBookings'))
const ParentAnalytics = lazy(() => import('./pages/ParentAnalytics'))
const ParentProfile = lazy(() => import('./pages/ParentProfile'))
const ParentSettings = lazy(() => import('./pages/ParentSettings'))
const TherapistSchedule = lazy(() => import('./pages/TherapistSchedule'))
const TherapistBookings = lazy(() => import('./pages/TherapistBookings'))
const TherapistAnalytics = lazy(() => import('./pages/TherapistAnalytics'))
const TherapistProfile = lazy(() => import('./pages/TherapistProfile'))
const TherapistSettings = lazy(() => import('./pages/TherapistSettings'))

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<NewLandingPage />} />
          <Route path="/old-landing" element={<LandingPage />} />
          <Route path="/login" element={<UnifiedLogin />} />
          {/* Manual registration disabled; OAuth only */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Video call route without layout (fullscreen) */}
        <Route path="/video-call/:bookingId" element={<VideoCallPage />} />
        
        {/* All other routes with layout */}
        <Route path="/*" element={
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
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
                <Route path="/therapist/bookings" element={<TherapistBookings />} />
                <Route path="/therapist/schedule" element={<TherapistSchedule />} />
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
                <Route path="/admin/demo-slots" element={<AdminDemoManagement />} />
                <Route path="/admin/demo-history" element={<AdminDemoHistory />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        } />
      </Routes>
    </Suspense>
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
