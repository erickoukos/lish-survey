import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

const ThankYou: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="card">
        <div className="card-content">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            Thank You!
          </h1>
          
          <p className="text-lg text-secondary-600 mb-6">
            Your survey response has been submitted successfully. We appreciate your time and feedback.
          </p>
          
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-primary-900 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-primary-800 space-y-1 text-left">
              <li>• Your responses will be analyzed by our HR team</li>
              <li>• Training programs will be developed based on your feedback</li>
              <li>• You'll receive updates on policy improvements in your department and the organization</li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <Link
              to="/"
              className="btn-primary px-6 py-3"
            >
              Submit Another Response
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThankYou

