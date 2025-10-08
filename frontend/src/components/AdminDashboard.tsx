import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Download, Filter, Search, BarChart3, Users, TrendingUp } from 'lucide-react'
import ResponsesTable from './admin/ResponsesTable'
import AnalyticsDashboard from './admin/AnalyticsDashboard'
import SurveyConfig from './admin/SurveyConfig'
import QuestionManager from './admin/QuestionManager'
import DepartmentCounts from './admin/DepartmentCounts'

const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<'table' | 'analytics' | 'config' | 'questions' | 'departments'>('table')
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    department: 'all',
    search: ''
  })

  const { data: responsesData, isLoading, refetch } = useQuery({
    queryKey: ['responses', filters],
    queryFn: () => adminApi.getResponses(filters),
    enabled: currentView === 'table'
  })

  const handleExport = async () => {
    try {
      toast.loading('Preparing export...', { id: 'export' })
      const blob = await adminApi.exportResponses()
      
      // Check if blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('Export returned empty data')
      }
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `survey_responses_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Export completed successfully!', { id: 'export' })
    } catch (error: any) {
      console.error('Export error:', error)
      const errorMessage = error.message || 'Export failed. Please try again.'
      toast.error(errorMessage, { id: 'export' })
    }
  }

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Survey Dashboard
          </h1>
          <p className="text-secondary-600">
            Welcome back, {user?.username}
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentView('table')}
            className={`btn ${currentView === 'table' ? 'btn-primary' : 'btn-outline'} px-4 py-2`}
          >
            <Users className="w-4 h-4 mr-2" />
            Responses
          </button>
          <button
            onClick={() => setCurrentView('analytics')}
            className={`btn ${currentView === 'analytics' ? 'btn-primary' : 'btn-outline'} px-4 py-2`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setCurrentView('config')}
            className={`btn ${currentView === 'config' ? 'btn-primary' : 'btn-outline'} px-4 py-2`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Configuration
          </button>
          <button
            onClick={() => setCurrentView('questions')}
            className={`btn ${currentView === 'questions' ? 'btn-primary' : 'btn-outline'} px-4 py-2`}
          >
            <Search className="w-4 h-4 mr-2" />
            Questions
          </button>
          <button
            onClick={() => setCurrentView('departments')}
            className={`btn ${currentView === 'departments' ? 'btn-primary' : 'btn-outline'} px-4 py-2`}
          >
            <Users className="w-4 h-4 mr-2" />
            Departments
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary px-4 py-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {currentView === 'table' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Survey Responses</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search responses..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange({ search: e.target.value })}
                      className="form-input pl-10 w-64"
                    />
                  </div>
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange({ department: e.target.value })}
                    className="form-input w-48"
                  >
                    <option value="all">All Departments</option>
                    <option value="Head of Department (HODs)">Head of Department (HODs)</option>
                    <option value="Technical Team">Technical Team</option>
                    <option value="Data Annotation Team">Data Annotation Team</option>
                    <option value="Digital Marketing Department">Digital Marketing Department</option>
                    <option value="HR & Administration Department">HR & Administration Department</option>
                    <option value="Finance & Accounting Department">Finance & Accounting Department</option>
                    <option value="Project Management Department">Project Management Department</option>
                    <option value="Sanitation Department">Sanitation Department</option>
                    <option value="Security Department">Security Department</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card-content">
              <ResponsesTable 
                data={responsesData?.data || []} 
                pagination={responsesData?.pagination}
                isLoading={isLoading}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      )}

      {currentView === 'analytics' && (
        <AnalyticsDashboard />
      )}

      {currentView === 'config' && (
        <SurveyConfig />
      )}

      {currentView === 'questions' && (
        <QuestionManager />
      )}

      {currentView === 'departments' && (
        <DepartmentCounts />
      )}
    </div>
  )
}

export default AdminDashboard

