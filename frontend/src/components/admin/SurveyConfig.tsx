import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Settings, Trash2, Save, AlertTriangle } from 'lucide-react'
import { surveyApi } from '../../lib/api'
import toast from 'react-hot-toast'

interface SurveyConfig {
  id: string
  isActive: boolean
  startDate: string
  endDate: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
}

const SurveyConfig: React.FC = () => {
  const [config, setConfig] = useState<SurveyConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await surveyApi.getSurveyConfig()
      setConfig(response.config)
    } catch (error) {
      console.error('Error fetching survey config:', error)
      toast.error('Failed to load survey configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    setSaving(true)
    try {
      await surveyApi.updateSurveyConfig(config)
      toast.success('Survey configuration updated successfully')
    } catch (error) {
      console.error('Error updating survey config:', error)
      toast.error('Failed to update survey configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      await surveyApi.resetSurvey()
      toast.success('Survey has been reset successfully')
      await fetchConfig() // Refresh the config
    } catch (error) {
      console.error('Error resetting survey:', error)
      toast.error('Failed to reset survey')
    } finally {
      setResetting(false)
      setShowResetConfirm(false)
    }
  }

  const getStatusInfo = () => {
    if (!config) return { status: 'Unknown', color: 'text-gray-500' }

    const now = new Date()
    const startDate = new Date(config.startDate)
    const endDate = new Date(config.endDate)

    if (!config.isActive) {
      return { status: 'Inactive', color: 'text-gray-500' }
    }

    if (now < startDate) {
      return { status: 'Not Started', color: 'text-yellow-600' }
    }

    if (now > endDate) {
      return { status: 'Ended', color: 'text-red-600' }
    }

    return { status: 'Active', color: 'text-green-600' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-secondary-600">Failed to load survey configuration</p>
      </div>
    )
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary-900 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          Survey Configuration
        </h2>
        <div className="flex items-center space-x-2">
          <span className={`font-semibold ${statusInfo.color}`}>
            Status: {statusInfo.status}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Survey Title
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="form-input w-full"
              placeholder="Survey title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Active Status
            </label>
            <select
              value={config.isActive ? 'true' : 'false'}
              onChange={(e) => setConfig({ ...config, isActive: e.target.value === 'true' })}
              className="form-input w-full"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={new Date(config.startDate).toISOString().slice(0, 16)}
              onChange={(e) => setConfig({ ...config, startDate: new Date(e.target.value).toISOString() })}
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={new Date(config.endDate).toISOString().slice(0, 16)}
              onChange={(e) => setConfig({ ...config, endDate: new Date(e.target.value).toISOString() })}
              className="form-input w-full"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Description
          </label>
          <textarea
            value={config.description || ''}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            rows={3}
            className="form-textarea w-full"
            placeholder="Survey description"
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-secondary-600">
            <p>Created: {new Date(config.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(config.updatedAt).toLocaleString()}</p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Survey
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-secondary-900">
                Reset Survey
              </h3>
            </div>
            
            <p className="text-secondary-600 mb-6">
              This action will permanently delete all survey responses and reset the survey configuration. 
              This cannot be undone. Are you sure you want to continue?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="btn-primary bg-red-600 hover:bg-red-700 flex-1 flex items-center justify-center"
              >
                {resetting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset Survey
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SurveyConfig
