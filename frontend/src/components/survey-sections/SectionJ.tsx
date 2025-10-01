import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionJProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionJ: React.FC<SectionJProps> = ({ form }) => {
  const { register, formState: { errors }, watch, setValue } = form

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 mb-6">
          <h2 className="text-3xl font-bold text-secondary-900 mb-3">
            Section J: Policy Feedback & Recommendations
          </h2>
          <p className="text-secondary-600 text-lg">
            Help us improve our workplace policies by sharing your insights and suggestions
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-secondary-200 p-6 shadow-sm">
          <label className="block text-lg font-semibold text-secondary-900 mb-4">
            Q14. Which policies do you think should be prioritized for training and awareness? <span className="text-red-500">*</span>
          </label>
          <p className="text-secondary-600 mb-4">Select all policies that you believe require immediate attention and training focus.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Anti-Social Behavior Policy',
              'Anti-Discrimination Policy',
              'Sexual and Other forms of harassment Policy',
              'Safeguarding Policy',
              'HR Policy Manual',
              'Code of Conduct',
              'Finance & Financial Wellness Policy',
              'Work-Life Balance & Mental Health Policy',
              'Digital Workplace & Skills Policy',
              'Soft Skills Development Policy'
            ].map((policy) => {
              const currentValues = watch('prioritizedPolicies') || []
              const isChecked = currentValues.includes(policy)
              
              return (
                <label key={policy} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const currentValues = watch('prioritizedPolicies') || []
                      if (e.target.checked) {
                        setValue('prioritizedPolicies', [...currentValues, policy])
                      } else {
                        setValue('prioritizedPolicies', currentValues.filter(v => v !== policy))
                      }
                    }}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <span className="text-sm font-medium text-secondary-700">{policy}</span>
                </label>
              )
            })}
          </div>
          {errors.prioritizedPolicies && (
            <p className="form-error mt-2">{errors.prioritizedPolicies.message}</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-secondary-200 p-6 shadow-sm">
          <label className="block text-lg font-semibold text-secondary-900 mb-4">
            Q15. Why do you think these policies should be prioritized? <span className="text-red-500">*</span>
          </label>
          <p className="text-secondary-600 mb-4">Please explain your reasoning for prioritizing the selected policies.</p>
          <textarea
            {...register('prioritizationReason', { required: 'Please explain why these policies should be prioritized' })}
            rows={4}
            placeholder="Please explain why you think these policies should be prioritized for training and awareness..."
            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
          />
          {errors.prioritizationReason && (
            <p className="form-error mt-2">{errors.prioritizationReason.message}</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-secondary-200 p-6 shadow-sm">
          <label className="block text-lg font-semibold text-secondary-900 mb-4">
            Q16. What challenges do you face in understanding or applying workplace policies? <span className="text-red-500">*</span>
          </label>
          <p className="text-secondary-600 mb-4">Select all challenges that apply to your experience with workplace policies.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Policies are too complex or difficult to understand',
              'Lack of clear examples or case studies',
              'Insufficient training on policy implementation',
              'Policies are not easily accessible or well-organized',
              'Conflicting information between different policies',
              'Language barriers or technical jargon',
              'Lack of regular updates or communication about policy changes',
              'Unclear consequences or enforcement procedures',
              'Limited time to read and understand all policies',
              'Others (Specify)'
            ].map((challenge) => {
              const currentValues = watch('policyChallenges') || []
              const isChecked = currentValues.includes(challenge)
              
              return (
                <label key={challenge} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const currentValues = watch('policyChallenges') || []
                      if (e.target.checked) {
                        setValue('policyChallenges', [...currentValues, challenge])
                      } else {
                        setValue('policyChallenges', currentValues.filter(v => v !== challenge))
                      }
                    }}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <span className="text-sm font-medium text-secondary-700">{challenge}</span>
                </label>
              )
            })}
          </div>
          {watch('policyChallenges')?.includes('Others (Specify)') && (
            <div className="mt-4 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                Please specify the other challenges you face:
              </label>
              <textarea
                {...register('policyChallengesOther')}
                rows={3}
                placeholder="Please describe any additional challenges you face with workplace policies..."
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          )}
          {errors.policyChallenges && (
            <p className="form-error mt-2">{errors.policyChallenges.message}</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-secondary-200 p-6 shadow-sm">
          <label className="block text-lg font-semibold text-secondary-900 mb-4">
            Q17. What suggestions do you have for improving policy awareness and compliance? <span className="text-red-500">*</span>
          </label>
          <p className="text-secondary-600 mb-4">Share your ideas for making policies more accessible and effective.</p>
          <textarea
            {...register('complianceSuggestions', { required: 'Please share your suggestions for improvement' })}
            rows={4}
            placeholder="Please share your suggestions for improving policy awareness and compliance..."
            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
          />
          {errors.complianceSuggestions && (
            <p className="form-error mt-2">{errors.complianceSuggestions.message}</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-secondary-200 p-6 shadow-sm">
          <label className="block text-lg font-semibold text-secondary-900 mb-4">
            Q18. Any additional comments or feedback?
          </label>
          <p className="text-secondary-600 mb-4">Share any other thoughts or feedback you have about workplace policies.</p>
          <textarea
            {...register('generalComments')}
            rows={4}
            placeholder="Please share any additional comments or feedback you have..."
            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  )
}

export default SectionJ
