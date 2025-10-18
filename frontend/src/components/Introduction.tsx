import React from 'react'
import CountdownTimer from './CountdownTimer'

interface IntroductionProps {
  surveyConfig?: {
    endDate: string
    startDate: string
    isActive: boolean
  } | null
}

const Introduction: React.FC<IntroductionProps> = ({ surveyConfig }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="w-[180px] h-[120px] sm:w-[223px] sm:h-[153px] rounded-lg overflow-hidden shadow-lg">
            <img 
              src="/logo.png" 
              alt="LISH AI Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900 mb-2 sm:mb-4">
          LISH AI LABS Policy Survey
        </h1>
        <p className="text-base sm:text-lg text-secondary-600 mb-6 sm:mb-8">
          Policy Awareness & Training Needs Assessment
        </p>
        
        {/* Countdown Timer */}
        {surveyConfig && surveyConfig.isActive && (
          <div className="mb-6 sm:mb-8">
            <CountdownTimer 
              endDate={surveyConfig.endDate} 
              className="max-w-2xl mx-auto"
            />
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-content p-4 sm:p-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-4 sm:mb-6">
              Welcome to Our Policy Survey
            </h2>
            
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <p className="text-base sm:text-lg text-primary-900 leading-relaxed">
                This survey is completely anonymous; no names, emails, or identifying details will be collected. 
                The HR Department aims to gather honest feedback from the LISH AI LABS workforce ahead of our 
                Policy Training Program. Your feedback is invaluable in shaping a safer, healthier, and more 
                empowering workplace for all!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary-900 mb-1 sm:mb-2 text-sm sm:text-base">Anonymous</h3>
                <p className="text-xs sm:text-sm text-secondary-600">Your responses are completely confidential</p>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary-900 mb-1 sm:mb-2 text-sm sm:text-base">Flexible</h3>
                <p className="text-xs sm:text-sm text-secondary-600">Survey runs for 7 days - complete at your pace</p>
              </div>
              
              <div className="text-center sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary-900 mb-1 sm:mb-2 text-sm sm:text-base">Impactful</h3>
                <p className="text-xs sm:text-sm text-secondary-600">Help shape our training programs</p>
              </div>
            </div>

            <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-secondary-900 mb-2 text-sm sm:text-base">What to Expect:</h4>
              <ul className="text-xs sm:text-sm text-secondary-700 space-y-1 text-left">
                <li>• 10 comprehensive sections covering all policy areas</li>
                <li>• Questions about your awareness and training needs</li>
                <li>• Opportunities to provide feedback and suggestions</li>
                <li>• All questions are required to ensure complete responses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Introduction
