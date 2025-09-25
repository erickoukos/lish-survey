import React, { useState } from 'react'
import { format } from 'date-fns'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import ResponseModal from './ResponseModal'

interface Response {
  id: string
  department: string
  awareness: any // Can be object or JSON string
  urgentTrainings: string[] | string // Can be array or JSON string
  confidenceLevel: string
  facedUnsureSituation: boolean
  knewReportingChannel: string
  trainingMethod: string
  refresherFrequency: string
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ResponsesTableProps {
  data: Response[]
  pagination?: Pagination
  isLoading: boolean
  onPageChange: (page: number) => void
}

const ResponsesTable: React.FC<ResponsesTableProps> = ({ 
  data, 
  pagination, 
  isLoading, 
  onPageChange 
}) => {
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewResponse = (response: Response) => {
    setSelectedResponse(response)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedResponse(null)
  }
  const getAwarenessAverage = (awareness: any) => {
    try {
      // Handle both object and JSON string formats
      const awarenessData = typeof awareness === 'string' ? JSON.parse(awareness) : awareness
      const values = Object.values(awarenessData).filter(v => typeof v === 'number') as number[]
      return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 'N/A'
    } catch (error) {
      console.error('Error parsing awareness data:', error)
      return 'N/A'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Awareness Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Urgent Trainings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Training Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {data.map((response) => (
              <tr key={response.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {format(new Date(response.createdAt), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {response.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {getAwarenessAverage(response.awareness)}/5
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-secondary-900">
                  <div className="max-w-xs">
                    {(() => {
                      const trainings = Array.isArray(response.urgentTrainings) 
                        ? response.urgentTrainings 
                        : JSON.parse(response.urgentTrainings || '[]')
                      return trainings.slice(0, 2).map((training, index) => (
                        <span key={index} className="inline-block bg-secondary-100 text-secondary-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {training}
                        </span>
                      ))
                    })()}
                    {(() => {
                      const trainings = Array.isArray(response.urgentTrainings) 
                        ? response.urgentTrainings 
                        : JSON.parse(response.urgentTrainings || '[]')
                      return trainings.length > 2 && (
                        <span className="text-xs text-secondary-500">
                          +{trainings.length - 2} more
                        </span>
                      )
                    })()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    response.confidenceLevel === 'Very confident' ? 'bg-green-100 text-green-800' :
                    response.confidenceLevel === 'Confident' ? 'bg-blue-100 text-blue-800' :
                    response.confidenceLevel === 'Neutral' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {response.confidenceLevel}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {response.trainingMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleViewResponse(response)}
                    className="text-primary-600 hover:text-primary-900 transition-colors"
                    title="View full response"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-6 py-3 bg-secondary-50 border-t border-secondary-200">
          <div className="flex items-center text-sm text-secondary-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn-outline px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-secondary-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="btn-outline px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Response Modal */}
      <ResponseModal
        response={selectedResponse}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default ResponsesTable
