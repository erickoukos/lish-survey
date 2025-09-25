import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Header: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">
                  LISH AI LABS
                </h1>
                <p className="text-sm text-secondary-600">
                  Policy Survey
                </p>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-secondary-600 hover:text-primary-600 transition-colors"
            >
              Survey
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/admin"
                  className="text-secondary-600 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-secondary-600 hover:text-primary-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-primary px-4 py-2"
              >
                Admin Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

