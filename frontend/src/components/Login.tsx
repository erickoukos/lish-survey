import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { Lock, User } from 'lucide-react'

interface LoginFormData {
  username: string
  password: string
}

const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    console.log('Login attempt with:', data)
    setIsLoading(true)
    try {
      console.log('Calling login function...')
      await login(data.username, data.password)
      console.log('Login successful, navigating to admin...')
      toast.success('Login successful!')
      navigate('/emp-surv')
    } catch (error: any) {
      console.error('Login error:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-6 sm:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-secondary-900">
            Admin Login
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-secondary-600">
            Access the LISH AI LABS Survey Dashboard
          </p>
        </div>

        <div className="card">
          <div className="card-content">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="form-label block mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    type="text"
                    {...register('username', { required: 'Username is required' })}
                    className="form-input pl-10"
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && (
                  <p className="form-error">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="form-label block mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    type="password"
                    {...register('password', { required: 'Password is required' })}
                    className="form-input pl-10"
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-secondary-600">
            Need help? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
