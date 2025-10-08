// @ts-ignore
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
export const ZOOM_SDK_JS_CDN = 'https://source.zoom.us/3.2.1/zoom-meeting-embedded-3.2.1.min.js'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Try to route the user to the correct login page based on their last known role
      const userRaw = localStorage.getItem('user')
      let role: string | undefined
      try {
        role = userRaw ? JSON.parse(userRaw)?.role : undefined
      } catch {}

      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (role === 'THERAPIST') {
        window.location.href = '/login/therapist'
      } else if (role === 'PARENT') {
        window.location.href = '/login/parent'
      } else if (role === 'ADMIN') {
        window.location.href = '/login/admin'
      } else {
        // Fallback to landing page which has all login choices
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  registerParent: (data: {
    email: string
    password: string
    name: string
    phone: string
  }) => api.post('/auth/register/parent', data),
  
  registerTherapist: (data: {
    email: string
    password: string
    name: string
    phone: string
    specialization: string
    experience: number
    baseCostPerSession: number
  }) => api.post('/auth/register/therapist', data),
  
  registerAdmin: (data: {
    email: string
    password: string
    name: string
  }) => api.post('/auth/register/adminthera-connect395', data),

  changePassword: (data: { email: string; currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
}

// Parent API
export const parentAPI = {
  getProfile: () => api.get('/parents/me/profile'),
  getChildren: () => api.get('/parents/me/children'),
  addChild: (data: {
    name: string
    age: number
    address?: string
    condition?: string
    notes?: string
  }) => api.post('/parents/me/children', data),
  updateChild: (childId: string, data: any) =>
    api.put(`/parents/me/children/${childId}`, data),
  deleteChild: (childId: string) =>
    api.delete(`/parents/me/children/${childId}`),
  // Returns only ACTIVE therapists
  getActiveTherapists: () => api.get('/parents/therapists'),
}

// Therapist API
export const therapistAPI = {
  getProfile: () => api.get('/therapists/me/profile'),
  getPublicList: () => api.get('/therapists/public'),
  getMySlots: (date: string) => api.get(`/therapists/me/slots`, { params: { date } }),
  createTimeSlots: (data: {
    date: string
    slots: { startTime: string; endTime: string }[]
  }) => api.post('/therapists/me/slots', data),
  requestLeave: (data: {
    date: string
    type: 'FULL_DAY'
    reason?: string
  }) => api.post('/therapists/me/leaves', data),
}

// Admin API
export const adminAPI = {
  getAllTherapists: () => api.get('/admin/therapists'),
  updateTherapistStatus: (therapistId: string, status: string) =>
    api.patch(`/admin/therapists/${therapistId}/status`, { status }),
}

// Booking API
export const bookingAPI = {
  getAvailableSlots: (therapistId: string, date: string) =>
    api.get(`/bookings/slots?therapistId=${therapistId}&date=${date}`),
  createBooking: (data: {
    childId: string
    timeSlotId: string
  }) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/me'),
  createZoomMeeting: (bookingId: string) => api.post(`/bookings/${bookingId}/zoom/create`),
  markHostStarted: (bookingId: string) => api.post(`/bookings/${bookingId}/zoom/host-started`),
  getSignature: (bookingId: string) => api.get(`/bookings/${bookingId}/zoom/signature`),
}

// Slots API
export const slotsAPI = {
  getAvailableSlots: (therapistId: string, date: string) =>
    api.post('/slots', { therapistId, date }),
  bookSlot: (timeSlotId: string, childId: string) =>
    api.post('/slots/book', { timeSlotId, childId }),
}
