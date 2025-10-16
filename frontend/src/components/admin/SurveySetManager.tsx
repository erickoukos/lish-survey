import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Settings, 
  Trash2, 
  RotateCcw, 
  Users, 
  FileText, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

interface SurveySet {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    responses: number
    sections: number
    questions: number
  }
}

const SurveySetManager: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState<string | null>(null)
  const [newSurveySet, setNewSurveySet] = useState({ name: '', description: '' })
  const queryClient = useQueryClient()

  // Fetch survey sets
  const { data: surveySetsData, isLoading, refetch } = useQuery({
    queryKey: ['surveySets'],
    queryFn: async () => {
      const response = await fetch('/api/survey-sets')
      if (!response.ok) throw new Error('Failed to fetch survey sets')
      return response.json()
    },
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the data
    refetchOnMount: true,
    refetchOnWindowFocus: true
  })

  // Create survey set mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await fetch('/api/survey-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create survey set')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveySets'] })
      setShowCreateForm(false)
      setNewSurveySet({ name: '', description: '' })
      toast.success('Survey set created successfully!')
    },
    onError: () => {
      toast.error('Failed to create survey set')
    }
  })

  // Delete survey set mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch('/api/survey-sets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id })
      })
      if (!response.ok) throw new Error('Failed to delete survey set')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveySets'] })
      toast.success('Survey set deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete survey set')
    }
  })

  // Reset responses mutation
  const resetMutation = useMutation({
    mutationFn: async (surveySetId: string) => {
      const response = await fetch('/api/reset-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          surveySetId, 
          confirmReset: true 
        })
      })
      if (!response.ok) throw new Error('Failed to reset responses')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surveySets'] })
      queryClient.invalidateQueries({ queryKey: ['responses'] })
      setShowResetConfirm(null)
      toast.success(data.message)
    },
    onError: () => {
      toast.error('Failed to reset responses')
    }
  })

  // Set active survey set mutation
  const setActiveMutation = useMutation({
    mutationFn: async (surveySetId: string) => {
      const response = await fetch('/api/survey-sets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          id: surveySetId,
          isActive: true
        })
      })
      if (!response.ok) throw new Error('Failed to set active survey set')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveySets'] })
      toast.success('Survey set activated successfully!')
    },
    onError: () => {
      toast.error('Failed to activate survey set')
    }
  })

  const handleCreateSurveySet = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSurveySet.name.trim()) {
      toast.error('Survey set name is required')
      return
    }
    createMutation.mutate(newSurveySet)
  }

  const handleDeleteSurveySet = (id: string) => {
    if (window.confirm('Are you sure you want to delete this survey set? This action cannot be undone.')) {
      deleteMutation.mutate(id)
    }
  }

  const handleResetResponses = (surveySetId: string) => {
    resetMutation.mutate(surveySetId)
  }

  const handleSetActive = (surveySetId: string) => {
    setActiveMutation.mutate(surveySetId)
  }

  const surveySets: SurveySet[] = surveySetsData?.data || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading survey sets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Set Manager</h1>
              <p className="text-gray-600">Create and manage different survey versions with their own questions and responses.</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Create New Survey Set */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Survey Set</h2>
            <form onSubmit={handleCreateSurveySet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Survey Set Name *
                </label>
                <input
                  type="text"
                  value={newSurveySet.name}
                  onChange={(e) => setNewSurveySet({ ...newSurveySet, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q1 2024 Employee Survey"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newSurveySet.description}
                  onChange={(e) => setNewSurveySet({ ...newSurveySet, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description for this survey set"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Survey Set'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Survey Sets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          {!showCreateForm && (
            <div 
              className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-colors"
              onClick={() => setShowCreateForm(true)}
            >
              <div className="text-center">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Survey Set</h3>
                <p className="text-gray-600">Start a new survey with custom questions and sections.</p>
              </div>
            </div>
          )}

          {/* Survey Set Cards */}
          {surveySets.map((surveySet) => (
            <div key={surveySet.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{surveySet.name}</h3>
                  {surveySet.description && (
                    <p className="text-sm text-gray-600 mb-2">{surveySet.description}</p>
                  )}
                  <div className="flex items-center space-x-2">
                    {surveySet.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteSurveySet(surveySet.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete survey set"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{surveySet._count.responses}</div>
                  <div className="text-xs text-gray-600">Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{surveySet._count.sections}</div>
                  <div className="text-xs text-gray-600">Sections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{surveySet._count.questions}</div>
                  <div className="text-xs text-gray-600">Questions</div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {!surveySet.isActive && (
                  <button
                    onClick={() => handleSetActive(surveySet.id)}
                    disabled={setActiveMutation.isPending}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    {setActiveMutation.isPending ? 'Activating...' : 'Set as Active'}
                  </button>
                )}
                
                <button
                  onClick={() => {
                    // Navigate to questions management for this survey set
                    window.location.href = `/admin?surveySetId=${surveySet.id}&tab=questions`
                  }}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Manage Questions
                </button>
                
                {surveySet._count.responses > 0 && (
                  <button
                    onClick={() => setShowResetConfirm(surveySet.id)}
                    className="w-full px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Reset Responses
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Reset Responses</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to reset all responses for this survey set? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleResetResponses(showResetConfirm)}
                  disabled={resetMutation.isPending}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {resetMutation.isPending ? 'Resetting...' : 'Yes, Reset Responses'}
                </button>
                <button
                  onClick={() => setShowResetConfirm(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SurveySetManager
