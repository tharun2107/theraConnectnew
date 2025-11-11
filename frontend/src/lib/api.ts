// @ts-ignore
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
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
    type: 'CASUAL' | 'SICK' | 'FESTIVE' | 'OPTIONAL'
    reason?: string
  }) => {
    console.log('[therapistAPI.requestLeave] Request data:', data)
    return api.post('/therapist/leaves', data)
  },
  getMyLeaves: () => {
    console.log('[therapistAPI.getMyLeaves] Fetching leaves...')
    return api.get('/therapist/leaves').then(response => {
      console.log('[therapistAPI.getMyLeaves] Full Response:', response)
      console.log('[therapistAPI.getMyLeaves] Response.data:', response.data)
      console.log('[therapistAPI.getMyLeaves] Response.data.data:', response.data?.data)
      console.log('[therapistAPI.getMyLeaves] Response.data.data.leaves:', response.data?.data?.leaves)
      return response
    }).catch(error => {
      console.error('[therapistAPI.getMyLeaves] Error:', error)
      console.error('[therapistAPI.getMyLeaves] Error response:', error.response)
      throw error
    })
  },
  getLeaveBalance: () => {
    return api.get('/therapist/leaves/balance').then(response => {
      return response
    }).catch(error => {
      console.error('[therapistAPI.getLeaveBalance] Error:', error)
      throw error
    })
  },
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
  getAllLeaves: (status?: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    console.log('[adminAPI.getAllLeaves] Fetching leaves with status:', status)
    return api.get('/admin/leaves', { params: status ? { status } : {} }).then(response => {
      console.log('[adminAPI.getAllLeaves] Full Response:', response)
      console.log('[adminAPI.getAllLeaves] Response.data:', response.data)
      console.log('[adminAPI.getAllLeaves] Response.data.data:', response.data?.data)
      console.log('[adminAPI.getAllLeaves] Response.data.data.leaves:', response.data?.data?.leaves)
      return response
    }).catch(error => {
      console.error('[adminAPI.getAllLeaves] Error:', error)
      console.error('[adminAPI.getAllLeaves] Error response:', error.response)
      throw error
    })
  },
  getLeaveDetails: (leaveId: string) => api.get(`/admin/leaves/${leaveId}`),
  processLeave: (leaveId: string, data: { action: 'APPROVE' | 'REJECT'; adminNotes?: string }) =>
    api.put(`/admin/leaves/${leaveId}`, data),
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
  getTherapistBookings: (therapistId: string) => api.get(`/bookings/therapist/${therapistId}`),
  createZoomMeeting: (bookingId: string) => api.post(`/bookings/${bookingId}/zoom/create`),
  markHostStarted: (bookingId: string) => api.post(`/bookings/${bookingId}/zoom/host-started`),
  getSignature: (bookingId: string) => api.get(`/bookings/${bookingId}/zoom/signature`),
  markSessionCompleted: (bookingId: string) => api.post(`/bookings/${bookingId}/complete`),
  // Recurring bookings
  createRecurringBooking: (data: {
    childId: string
    therapistId: string
    slotTime: string // HH:mm format
    recurrencePattern: 'DAILY' | 'WEEKLY'
    dayOfWeek?: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'
    startDate: string // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
  }) => api.post('/bookings/recurring', data),
  getRecurringBookings: () => api.get('/bookings/recurring'),
  getUpcomingSessions: (recurringBookingId: string) =>
    api.get(`/bookings/recurring/${recurringBookingId}/sessions`),
  cancelRecurringBooking: (recurringBookingId: string) =>
    api.delete(`/bookings/recurring/${recurringBookingId}`),
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

// Therapy Notes API
export const therapyNotesAPI = {
  // Therapist - Monthly Goals
  getMonthlyGoals: (childId: string, month: number, year: number) =>
    api.get('/therapy-notes/therapist/monthly-goals', { params: { childId, month, year } }),
  updateMonthlyGoals: (data: {
    childId: string
    month: number
    year: number
    goals: string[]
  }) => api.put('/therapy-notes/therapist/monthly-goals', data),
  
  // Therapist - Session Reports
  createSessionReport: (data: {
    bookingId: string
    childId: string
    sessionDetails: string[]
    tasks: { taskGiven: string }[]
  }) => api.post('/therapy-notes/therapist/session-report', data),
  getSessionReport: (bookingId: string) =>
    api.get(`/therapy-notes/therapist/session-report/${bookingId}`),
  getMonthlySessionReports: (childId: string, month: number, year: number) =>
    api.get('/therapy-notes/therapist/session-reports/monthly', { params: { childId, month, year } }),
  checkIsFirstSession: (bookingId: string) =>
    api.get(`/therapy-notes/therapist/session-report/${bookingId}/is-first`),
  
  // Parent - Task Management
  updateTaskCompletion: (taskId: string, isDone: boolean) =>
    api.put(`/therapy-notes/parent/task/${taskId}/completion`, { isDone }),
  updateTaskObservation: (taskId: string, observation: string) =>
    api.put(`/therapy-notes/parent/task/${taskId}/observation`, { observation }),
  getPendingTasks: () =>
    api.get('/therapy-notes/parent/tasks/pending'),
  getCurrentMonthTasks: () =>
    api.get('/therapy-notes/parent/tasks/current-month'),
  
  // Therapist - Task Viewing
  getCurrentMonthTasksForTherapist: () =>
    api.get('/therapy-notes/therapist/tasks/current-month'),
  
  // Shared
  getSessionReportShared: (bookingId: string) =>
    api.get(`/therapy-notes/session-report/${bookingId}`),
}

// Demo API
export const demoAPI = {
  getAvailableSlots: (timezone?: string, date?: string) =>
    api.get('/demo/slots', { params: { timezone, date } }),
  createBooking: (data: {
    name: string
    mobile: string
    email: string
    reason: string
    slotDate: string
    slotHour: number
    slotTimeString: string
    userTimezone?: string
  }) => api.post('/demo/bookings', data),
}

// Admin Demo API
export const adminDemoAPI = {
  getSlots: (month?: number, year?: number) =>
    api.get('/demo/admin/slots', { params: { month, year } }),
  createSlots: (data: {
    month: number
    year: number
    slotTimes: string[]
  }) => api.post('/demo/admin/slots', data),
  updateSlots: (month: number, year: number, slotTimes: string[]) =>
    api.put(`/demo/admin/slots/${month}/${year}`, { slotTimes }),
  getBookings: () => api.get('/demo/admin/bookings'),
  getBookingHistory: () => api.get('/demo/admin/bookings/history'),
  createZoomMeeting: (bookingId: string) =>
    api.post(`/demo/admin/bookings/${bookingId}/zoom`),
  updateNotes: (bookingId: string, data: {
    userQuery?: string
    converted?: boolean
    additionalNotes?: string
  }) => api.put(`/demo/admin/bookings/${bookingId}/notes`, data),
}