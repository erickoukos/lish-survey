import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionJProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionJ: React.FC<SectionJProps> = ({ form }) => {
  const { register, formState: { errors } } = form

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
          <textarea
            {...register('prioritizedPolicies', { required: 'Please specify which policies should be prioritized' })}
            rows={4}
            placeholder="Please list the policies you think should be prioritized for training and awareness"
            className="form-textarea w-full"
          />
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
          <textarea
            {...register('policyChallenges', { required: 'Please describe the challenges you face' })}
            rows={4}
            placeholder="Please describe any challenges you face in understanding or applying workplace policies"
            className="form-textarea w-full"
          />
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
