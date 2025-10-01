import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionJProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionJ: React.FC<SectionJProps> = ({ form }) => {
  const { register, formState: { errors }, watch, setValue } = form

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Section J: Open Feedback
        </h2>
        <p className="text-secondary-600">
          Share your thoughts and suggestions for improving our policies
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="form-label block mb-2">
            Q14. Which policies do you think should be prioritized for training and awareness? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
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
                <label key={policy} className="flex items-center space-x-3 cursor-pointer">
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
                    className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <span className="text-sm text-secondary-700">{policy}</span>
                </label>
              )
            })}
          </div>
          {errors.prioritizedPolicies && (
            <p className="form-error mt-2">{errors.prioritizedPolicies.message}</p>
          )}
        </div>

        <div>
          <label className="form-label block mb-2">
            Q15. Why do you think these policies should be prioritized? <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('prioritizationReason', { required: 'Please explain why these policies should be prioritized' })}
            rows={4}
            placeholder="Please explain why you think these policies should be prioritized"
            className="form-textarea w-full"
          />
          {errors.prioritizationReason && (
            <p className="form-error mt-2">{errors.prioritizationReason.message}</p>
          )}
        </div>

        <div>
          <label className="form-label block mb-2">
            Q16. What challenges do you face in understanding or applying workplace policies? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
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
                <label key={challenge} className="flex items-center space-x-3 cursor-pointer">
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
                    className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <span className="text-sm text-secondary-700">{challenge}</span>
                </label>
              )
            })}
          </div>
          {watch('policyChallenges')?.includes('Others (Specify)') && (
            <div className="mt-3">
              <label className="form-label block mb-2">
                Please specify the other challenges you face:
              </label>
              <textarea
                {...register('policyChallengesOther')}
                rows={3}
                placeholder="Please specify the other challenges you face"
                className="form-textarea w-full"
              />
            </div>
          )}
          {errors.policyChallenges && (
            <p className="form-error mt-2">{errors.policyChallenges.message}</p>
          )}
        </div>

        <div>
          <label className="form-label block mb-2">
            Q17. What suggestions do you have for improving policy awareness and compliance? <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('complianceSuggestions', { required: 'Please share your suggestions for improvement' })}
            rows={4}
            placeholder="Please share your suggestions for improving policy awareness and compliance"
            className="form-textarea w-full"
          />
          {errors.complianceSuggestions && (
            <p className="form-error mt-2">{errors.complianceSuggestions.message}</p>
          )}
        </div>

        <div>
          <label className="form-label block mb-2">
            Q18. Any additional comments or feedback?
          </label>
          <textarea
            {...register('generalComments')}
            rows={4}
            placeholder="Please share any additional comments or feedback you have"
            className="form-textarea w-full"
          />
        </div>
      </div>
    </div>
  )
}

export default SectionJ
