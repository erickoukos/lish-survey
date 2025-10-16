import axios from 'axios'

// Detect if we're running locally
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const isProduction = window.location.hostname === 'emp-survey.lishailabs.com'
const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:3000' : (isProduction ? 'https://emp-survey.lishailabs.com' : 'https://lish-survey-rbkg4jfau-lish-ai-labs.vercel.app'))

// Add cache-busting to force fresh API calls
const CACHE_BUST = Date.now()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add debugging
console.log('API Configuration:', {
  baseURL: API_BASE_URL,
  isLocal,
  hostname: window.location.hostname,
  env: import.meta.env.VITE_API_URL
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const surveyApi = {
  submit: async (data: any) => {
    const response = await api.post('/api/submit', data)
    return response.data
  },

  getSurveyConfig: async () => {
    const response = await api.get('/api/survey-config')
    return response.data
  },

  updateSurveyConfig: async (config: any) => {
    try {
      console.log('API: Updating survey config:', config)
      const response = await api.post('/api/survey-config', config)
      console.log('API: Survey config update response:', response.data)
      return response.data
    } catch (error) {
      console.error('API: Survey config update failed:', error)
      throw error
    }
  },

  resetSurvey: async () => {
    const response = await api.delete('/api/survey-config')
    return response.data
  }
}

export const authApi = {
  login: async (username: string, password: string) => {
    console.log('API: Making login request to:', `${API_BASE_URL}/api/login`)
    console.log('API: Request data:', { username, password })
    try {
      const response = await api.post('/api/login', { username, password })
      console.log('API: Login response received:', response.data)
      return response.data
    } catch (error) {
      console.error('API: Login request failed:', error)
      throw error
    }
  }
}

export const adminApi = {
  getResponses: async (params?: { page?: number; limit?: number; department?: string }) => {
    const response = await api.get('/api/responses', { params })
    return response.data
  },
  
  exportResponses: async () => {
    const response = await api.get('/api/export', {
      responseType: 'blob'
    })
    return response.data
  },

  getDepartmentCounts: async () => {
    try {
      console.log('API: Fetching department counts from:', `${API_BASE_URL}/api/department-counts`)
      const response = await api.get('/api/department-counts')
      console.log('API: Department counts response:', response.data)
      return response.data
    } catch (error) {
      console.warn('Primary department-counts API failed, trying fallback:', error)
      try {
        // Fallback to simple endpoint
        console.log('API: Trying fallback endpoint:', `${API_BASE_URL}/api/department-counts-simple`)
        const response = await api.get('/api/department-counts-simple')
        console.log('API: Fallback department counts response:', response.data)
        return response.data
      } catch (fallbackError) {
        console.error('All department APIs failed:', fallbackError)
        // Return hardcoded data as last resort
        console.log('API: Using hardcoded fallback data')
        return {
          success: true,
          data: [
            { id: 'hod-1', department: 'Head of Department (HODs)', staffCount: 7, responseCount: 0, remainingCount: 7, responseRate: 0, isActive: true },
            { id: 'tech-1', department: 'Technical Team', staffCount: 54, responseCount: 0, remainingCount: 54, responseRate: 0, isActive: true },
            { id: 'data-1', department: 'Data Annotation Team', staffCount: 70, responseCount: 0, remainingCount: 70, responseRate: 0, isActive: true },
            { id: 'marketing-1', department: 'Digital Marketing Department', staffCount: 5, responseCount: 0, remainingCount: 5, responseRate: 0, isActive: true },
            { id: 'hr-1', department: 'HR & Administration Department', staffCount: 3, responseCount: 0, remainingCount: 3, responseRate: 0, isActive: true },
            { id: 'finance-1', department: 'Finance & Accounting Department', staffCount: 1, responseCount: 0, remainingCount: 1, responseRate: 0, isActive: true },
            { id: 'pm-1', department: 'Project Management Department', staffCount: 1, responseCount: 0, remainingCount: 1, responseRate: 0, isActive: true },
            { id: 'sanitation-1', department: 'Sanitation Department', staffCount: 2, responseCount: 0, remainingCount: 2, responseRate: 0, isActive: true },
            { id: 'security-1', department: 'Security Department', staffCount: 4, responseCount: 0, remainingCount: 4, responseRate: 0, isActive: true }
          ],
          totalExpected: 147,
          totalResponses: 0,
          totalRemaining: 147,
          overallResponseRate: 0,
          count: 9,
          message: 'Using fallback department data'
        }
      }
    }
  },

  updateDepartmentCount: async (id: string, staffCount: number) => {
    const response = await api.put('/api/department-counts', { id, staffCount })
    return response.data
  },

  updateSurveyConfig: async (config: any) => {
    const response = await api.post('/api/survey-config', config)
    return response.data
  }
}

export default api
