import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionCProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionC: React.FC<SectionCProps> = ({ form }) => {
  const { register, watch, setValue, formState: { errors } } = form
  const urgentTrainings = watch('urgentTrainings') || []
  const urgentTrainingsOther = watch('urgentTrainingsOther')

  const trainingOptions = [
    'Anti-Social Behavior Policy',
    'Anti-Discrimination Policy',
    'HR Policy Manual',
    'Code of Conduct',
    'Safeguarding Policy',
    'Sexual and Other forms of harassment Policy',
    'Finance & Financial Wellness',
    'Work-Life Balance & Mental Health Awareness',
    'Digital Workplace & Skills',
    'Soft Skills',
    'Others'
  ]

  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (checked) {
      setValue('urgentTrainings', [...urgentTrainings, option])
    } else {
      setValue('urgentTrainings', urgentTrainings.filter(item => item !== option))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Section C: Training Needs & Gaps
        </h2>
        <p className="text-secondary-600">
          Select all areas where you need urgent training or clarification
        </p>
      </div>

      <div>
        <label className="form-label block mb-6">
          Q3. Which of the following do you need urgent training or clarification on? <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {trainingOptions.map((option) => (
            <label key={option} className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
              <input
                type="checkbox"
                checked={urgentTrainings.includes(option)}
                onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-secondary-700">{option}</span>
            </label>
          ))}
        </div>
        
        {urgentTrainings.includes('Others') && (
          <div className="mt-3">
            <input
              type="text"
              {...register('urgentTrainingsOther')}
              placeholder="Please specify other training needs"
              className="form-input w-full"
            />
          </div>
        )}
        
        {errors.urgentTrainings && (
          <p className="form-error">{errors.urgentTrainings.message}</p>
        )}
      </div>
    </div>
  )
}

export default SectionC

