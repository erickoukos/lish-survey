import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionJProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionJ: React.FC<SectionJProps> = ({ form }) => {
  const { register, watch, setValue, formState: { errors } } = form
  const prioritizedPolicies = watch('prioritizedPolicies') || []
  const policyChallenges = watch('policyChallenges') || []

  const policyOptions = [
    'Anti-Social Behavior Policy',
    'Anti-Discrimination Policy',
    'Sexual and Other forms of harassment Policy',
    'Safeguarding Policy',
    'HR Policy Manual',
    'Code of Conduct',
    'Finance & Financial Wellness',
    'Work-Life Balance & Mental Health Awareness',
    'Digital Workplace & Skills',
    'Soft Skills',
    'Professionalism & Ethics'
  ]

  const challengeOptions = [
    'Complex language and terminology',
    'Lack of clear examples or scenarios',
    'Insufficient training or orientation',
    'Conflicting information from different sources',
    'Policies not easily accessible',
    'Lack of regular updates or communication',
    'No clear consequences for non-compliance',
    'Cultural or language barriers',
    'Time constraints for reading policies',
    'Lack of practical application guidance',
    'Others'
  ]

  const handlePolicyChange = (policy: string, checked: boolean) => {
    if (checked) {
      setValue('prioritizedPolicies', [...prioritizedPolicies, policy])
    } else {
      setValue('prioritizedPolicies', prioritizedPolicies.filter(item => item !== policy))
    }
  }

  const handleChallengeChange = (challenge: string, checked: boolean) => {
    if (checked) {
      setValue('policyChallenges', [...policyChallenges, challenge])
    } else {
      setValue('policyChallenges', policyChallenges.filter(item => item !== challenge))
    }
  }

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
          <label className="form-label block mb-4">
            Q14. Which policies do you think should be prioritized for training and awareness? <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {policyOptions.map((policy) => (
              <label key={policy} className="flex items-start space-x-3 p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prioritizedPolicies.includes(policy)}
                  onChange={(e) => handlePolicyChange(policy, e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500 mt-1"
                />
                <span className="text-sm text-secondary-700">{policy}</span>
              </label>
            ))}
          </div>
          
          {errors.prioritizedPolicies && (
            <p className="form-error mt-2">{errors.prioritizedPolicies.message}</p>
          )}
        </div>

        <div>
          <label className="form-label block mb-2">
            Q15. Why do you think these policies should be prioritized? <span className="text-red-500">*</span>
          </label>
          {prioritizedPolicies.length > 0 && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Selected policies:</p>
              <div className="flex flex-wrap gap-2">
                {prioritizedPolicies.map((policy, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {policy}
                  </span>
                ))}
              </div>
            </div>
          )}
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
          <label className="form-label block mb-4">
            Q16. What challenges do you face in understanding or applying workplace policies? <span className="text-red-500">*</span>
          </label>
          
          <div className="space-y-3">
            {challengeOptions.map((challenge) => (
              <label key={challenge} className="flex items-start space-x-3 p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyChallenges.includes(challenge)}
                  onChange={(e) => handleChallengeChange(challenge, e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500 mt-1"
                />
                <span className="text-sm text-secondary-700">{challenge}</span>
              </label>
            ))}
          </div>
          
          {policyChallenges.includes('Others') && (
            <div className="mt-3">
              <input
                type="text"
                {...register('policyChallengesOther')}
                placeholder="Please specify other challenges you face"
                className="form-input w-full"
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
