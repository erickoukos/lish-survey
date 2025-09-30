import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lish-survey-imr4mtj2f-lish-ai-labs.vercel.app'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    const response = await api.post('/api/survey-config', config)
    return response.data
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
  }
}

export default api
