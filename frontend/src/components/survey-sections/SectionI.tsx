import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionIProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionI: React.FC<SectionIProps> = ({ form }) => {
  const { register, watch, formState: { errors } } = form
  const trainingMethod = watch('trainingMethod')

  const trainingMethods = [
    'In-person training sessions',
    'Self-paced e-learning modules',
    'Shared Policy handbooks'
  ]

  const frequencyOptions = [
    '1 training /Week',
    '1 training /Monthly',
    '2 trainings /Month'
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Section I: Training Preferences
        </h2>
        <p className="text-secondary-600">
          Tell us about your preferred training methods and frequency
        </p>
      </div>

      <div>
        <label className="form-label block mb-6">
          Q12. What is your preferred method for policy training? <span className="text-red-500">*</span>
        </label>
        
        <div className="space-y-3">
          {trainingMethods.map((method) => (
            <label key={method} className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
              <input
                type="radio"
                value={method}
                {...register('trainingMethod', { required: 'Please select a training method' })}
                className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
              />
              <span className="text-sm text-secondary-700">{method}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-4">
          <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
            <input
              type="radio"
              value="Others"
              {...register('trainingMethod', { required: 'Please select a training method' })}
              className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">Others (please specify)</span>
          </label>
          
          {trainingMethod === 'Others' && (
            <div className="mt-3">
              <input
                type="text"
                {...register('trainingMethodOther')}
                placeholder="Please specify other training method"
                className="form-input w-full"
              />
            </div>
          )}
        </div>
        
        {errors.trainingMethod && (
          <p className="form-error">{errors.trainingMethod.message}</p>
        )}
      </div>

      <div className="mt-8">
        <label className="form-label block mb-6">
          Q13. How often would you like to receive policy refresher training? <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {frequencyOptions.map((frequency) => (
            <label key={frequency} className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
              <input
                type="radio"
                value={frequency}
                {...register('refresherFrequency', { required: 'Please select a frequency' })}
                className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
              />
              <span className="text-sm text-secondary-700">{frequency}</span>
            </label>
          ))}
        </div>
        
        {errors.refresherFrequency && (
          <p className="form-error">{errors.refresherFrequency.message}</p>
        )}
      </div>
    </div>
  )
}

export default SectionI

