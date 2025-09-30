import React from 'react'
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react'

interface SurveyUnavailableProps {
  reason: 'not_started' | 'ended' | 'inactive'
  startDate?: string
  endDate?: string
}

const SurveyUnavailable: React.FC<SurveyUnavailableProps> = ({ 
  reason, 
  startDate, 
  endDate 
}) => {
  const getMessage = () => {
    switch (reason) {
      case 'not_started':
        return {
          title: 'Survey Not Yet Available',
          message: 'The survey has not started yet. Please check back later.',
          icon: <Clock className="w-16 h-16 text-blue-500" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        }
      case 'ended':
        return {
          title: 'Survey Period Has Ended',
          message: 'The survey period has concluded. For access to the form or any questions, please contact the HR office.',
          icon: <Calendar className="w-16 h-16 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        }
      case 'inactive':
        return {
          title: 'Survey Currently Inactive',
          message: 'The survey is temporarily inactive. Please contact the HR office for assistance.',
          icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        }
      default:
        return {
          title: 'Survey Unavailable',
          message: 'The survey is currently not available. Please contact the HR office for assistance.',
          icon: <Users className="w-16 h-16 text-gray-500" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        }
    }
  }

  const messageInfo = getMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className={`${messageInfo.bgColor} ${messageInfo.borderColor} border-2 rounded-2xl p-8 text-center shadow-lg`}>
          <div className="flex justify-center mb-6">
            {messageInfo.icon}
          </div>
          
          <h1 className={`text-3xl font-bold ${messageInfo.textColor} mb-4`}>
            {messageInfo.title}
          </h1>
          
          <p className={`text-lg ${messageInfo.textColor} mb-8 leading-relaxed`}>
            {messageInfo.message}
          </p>

          {(startDate || endDate) && (
            <div className={`${messageInfo.bgColor} rounded-lg p-6 mb-6`}>
              <h3 className={`text-lg font-semibold ${messageInfo.textColor} mb-4`}>
                Survey Schedule
              </h3>
              <div className="space-y-2">
                {startDate && (
                  <div className="flex items-center justify-center">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className={`${messageInfo.textColor}`}>
                      <strong>Start Date:</strong> {new Date(startDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {endDate && (
                  <div className="flex items-center justify-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className={`${messageInfo.textColor}`}>
                      <strong>End Date:</strong> {new Date(endDate).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              If you have any questions or need assistance with the survey, please contact:
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>HR Office:</strong> hr@lishailabs.com</p>
              <p><strong>Phone:</strong> +254 715 545 018</p>
              <p><strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM</p>
              <p><strong>Survey Duration:</strong> Usually takes 7 days to complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyUnavailable
