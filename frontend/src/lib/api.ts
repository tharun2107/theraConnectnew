// @ts-ignore
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
// Debug: surface which API base URL is used at runtime
try {
  // eslint-disable-next-line no-console
  console.log('[API] Base URL:', API_BASE_URL)
} catch {}
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
    try {
      // eslint-disable-next-line no-console
      console.log('[API][request]', config.method?.toUpperCase(), config.baseURL + config.url, {
        headers: { Authorization: !!token ? 'Bearer ***' : 'none' },
      })
    } catch {}
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
    try {
      // eslint-disable-next-line no-console
      console.error('[API][response][error]', {
        url: error?.config?.baseURL + error?.config?.url,
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
        code: error?.code,
        readyState: error?.request?.readyState,
        xhrStatus: error?.request?.status,
        method: error?.config?.method,
        withCredentials: error?.config?.withCredentials,
      })
    } catch {}
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect to unified login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  loginWithGoogle: (idToken: string) =>
    api.post('/auth/google', { idToken }),
  
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
  updateProfile: (data: { name?: string; phone?: string }) => api.put('/parents/me/profile', data),
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
  getAllChildren: () => api.get('/admin/children'),
}

// Therapist API
export const therapistAPI = {
  getProfile: () => api.get('/therapists/me/profile'),
  getPublicList: () => api.get('/therapists/public'),
  getMySlots: (date: string) => api.get(`/therapists/me/slots`, { params: { date } }),
  checkHasActiveSlots: () => api.get('/therapists/me/slots/check'),
  setAvailableSlotTimes: (slotTimes: string[]) => api.put('/therapists/me/slots/available-times', { slotTimes }),
  createTimeSlots: (data: {
    date: string
    slots?: { startTime: string; endTime: string }[]
    generate?: boolean
    activateSlotIds?: string[]
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
  getTherapistSessions: (therapistId: string) => api.get(`/admin/therapists/${therapistId}/sessions`),
  getAllChildren: () => api.get('/admin/children'),
  getChildSessions: (childId: string) => api.get(`/admin/children/${childId}/sessions`),
  getAllBookings: () => api.get('/admin/bookings'),
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data: any) => api.put('/admin/profile', data),
  getPlatformSettings: () => api.get('/admin/settings'),
  updatePlatformSettings: (data: any) => api.put('/admin/settings', data),
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
  markSessionCompleted: (bookingId: string) => api.post(`/bookings/${bookingId}/complete`),
}

// Slots API
export const slotsAPI = {
  getAvailableSlots: (therapistId: string, date: string) =>
    api.post('/slots', { therapistId, date }),
  bookSlot: (timeSlotId: string, childId: string) =>
    api.post('/slots/book', { timeSlotId, childId }),
}

// Feedback API
export const feedbackAPI = {
  createFeedback: (data: {
    bookingId: string
    rating: number
    comment?: string
    isAnonymous?: boolean
    consentToDataSharing?: boolean
  }) => api.post('/feedback/feedback', data),
  
  createSessionReport: (data: {
    bookingId: string
    sessionExperience: string
    childPerformance?: string
    improvements?: string
    medication?: string
    recommendations?: string
    nextSteps?: string
  }) => api.post('/feedback/session-report', data),
  
  updateConsent: (data: {
    bookingId: string
    status: 'GRANTED' | 'DENIED'
    notes?: string
  }) => api.put('/feedback/consent', data),
  
  getSessionDetails: (bookingId: string) =>
    api.get(`/feedback/session/${bookingId}`),
}
