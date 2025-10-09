import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface BackupInfo {
  timestamp: string
  responseCount: number
  surveySetId: string
  surveySetName?: string
}

const BackupManager: React.FC = () => {
  const [selectedSurveySet, setSelectedSurveySet] = useState<string>('')
  const [showBackupForm, setShowBackupForm] = useState(false)
  const queryClient = useQueryClient()

  // Fetch survey sets
  const { data: surveySetsData } = useQuery({
    queryKey: ['surveySets'],
    queryFn: async () => {
      const response = await fetch('/api/survey-sets')
      if (!response.ok) throw new Error('Failed to fetch survey sets')
      return response.json()
    }
  })

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async (surveySetId: string) => {
      const response = await fetch('/api/backup-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ surveySetId })
      })
      if (!response.ok) throw new Error('Failed to create backup')
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`Backup created successfully! ${data.backupData.responseCount} responses backed up.`)
    },
    onError: () => {
      toast.error('Failed to create backup')
    }
  })

  // Download backup mutation
  const downloadBackupMutation = useMutation({
    mutationFn: async ({ surveySetId, format }: { surveySetId: string; format: string }) => {
      const response = await fetch(`/api/backup-responses?surveySetId=${surveySetId}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Failed to download backup')
      return response
    },
    onSuccess: async (response) => {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `survey_backup_${new Date().toISOString().split('T')[0]}.${response.headers.get('content-type')?.includes('csv') ? 'csv' : 'json'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Backup downloaded successfully!')
    },
    onError: () => {
      toast.error('Failed to download backup')
    }
  })

  const handleCreateBackup = () => {
    if (!selectedSurveySet) {
      toast.error('Please select a survey set')
      return
    }
    createBackupMutation.mutate(selectedSurveySet)
  }

  const handleDownloadBackup = (format: string) => {
    if (!selectedSurveySet) {
      toast.error('Please select a survey set')
      return
    }
    downloadBackupMutation.mutate({ surveySetId: selectedSurveySet, format })
  }

  const surveySets = surveySetsData?.data || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Backup Manager</h1>
          <p className="text-gray-600">Create and download backups of your survey responses to prevent data loss.</p>
        </div>

        {/* Survey Set Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Survey Set</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {surveySets.map((set: any) => (
              <div
                key={set.id}
                onClick={() => setSelectedSurveySet(set.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedSurveySet === set.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{set.name}</h3>
                <p className="text-sm text-gray-600">{set.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {set._count?.responses || 0} responses
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedSurveySet && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Backup */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Create Backup</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Create a backup of all responses for the selected survey set. This will help protect your data.
              </p>
              <button
                onClick={handleCreateBackup}
                disabled={createBackupMutation.isPending}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {createBackupMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Backup...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Create Backup</span>
                  </>
                )}
              </button>
            </div>

            {/* Download Backup */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Download className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Download Backup</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Download existing responses in CSV or JSON format for external storage.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleDownloadBackup('csv')}
                  disabled={downloadBackupMutation.isPending}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {downloadBackupMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Download CSV</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownloadBackup('json')}
                  disabled={downloadBackupMutation.isPending}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Database className="w-4 h-4" />
                  <span>Download JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Backup Best Practices */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Backup Best Practices</h3>
              <ul className="text-yellow-700 space-y-1">
                <li>• Create backups regularly (at least weekly)</li>
                <li>• Download backups before making major changes</li>
                <li>• Store backups in multiple locations (cloud, local, external drive)</li>
                <li>• Test your backups by restoring them to a test environment</li>
                <li>• Keep multiple backup versions for different time periods</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Backups */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Backups</h2>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent backups found.</p>
            <p className="text-sm text-gray-500 mt-2">Create your first backup to get started.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackupManager
