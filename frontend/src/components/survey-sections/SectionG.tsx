import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionGProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionG: React.FC<SectionGProps> = ({ form }) => {
  const { register, watch, setValue, formState: { errors } } = form
  const professionalDevNeeds = watch('professionalDevNeeds') || []
  const facedUnsureSituation = watch('facedUnsureSituation')

  const professionalOptions = [
    'Effective Communication',
    'Leadership Skills for Young Professionals',
    'Entrepreneurial Mindset & Intrapreneurship',
    'Personal Branding & Professional Networking',
    'Teamwork & Conflict Resolution',
    'Time Management & Productivity Tools'
  ]

  const confidenceLevels = [
    'Not confident at all',
    'Slightly confident',
    'Neutral',
    'Confident',
    'Very confident'
  ]

  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (checked) {
      setValue('professionalDevNeeds', [...professionalDevNeeds, option])
    } else {
      setValue('professionalDevNeeds', professionalDevNeeds.filter(item => item !== option))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Section G: Professional Development
        </h2>
        <p className="text-secondary-600">
          Tell us about your professional development needs and confidence levels
        </p>
      </div>

      <div>
        <label className="form-label block mb-6">
          Q7. Which of the following Professional Development training do you need? (Select all that apply)
        </label>
        
        <div className="space-y-3">
          {professionalOptions.map((option) => (
            <label key={option} className="flex items-start space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
              <input
                type="checkbox"
                checked={professionalDevNeeds.includes(option)}
                onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500 mt-1"
              />
              <span className="text-sm text-secondary-700">{option}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-4">
          <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
            <input
              type="checkbox"
              checked={professionalDevNeeds.includes('Others')}
              onChange={(e) => handleCheckboxChange('Others', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">Others (please specify)</span>
          </label>
          
          {professionalDevNeeds.includes('Others') && (
            <div className="mt-3">
              <input
                type="text"
                {...register('professionalDevOther')}
                placeholder="Please specify other professional development needs"
                className="form-input w-full"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <label className="form-label block mb-4">
          Q8. How confident are you in applying workplace policies in your daily work? <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {confidenceLevels.map((level) => (
            <label key={level} className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
              <input
                type="radio"
                value={level}
                {...register('confidenceLevel', { required: 'Please select your confidence level' })}
                className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
              />
              <span className="text-sm text-secondary-700">{level}</span>
            </label>
          ))}
        </div>
        
        {errors.confidenceLevel && (
          <p className="form-error">{errors.confidenceLevel.message}</p>
        )}
      </div>

      <div className="mt-8">
        <label className="form-label block mb-4">
          Q9. Have you ever faced a situation at work where you were unsure about the right policy to apply? <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
            <input
              type="radio"
              name="facedUnsureSituation"
              checked={facedUnsureSituation === true}
              onChange={() => setValue('facedUnsureSituation', true)}
              className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">Yes</span>
          </label>
          <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
            <input
              type="radio"
              name="facedUnsureSituation"
              checked={facedUnsureSituation === false}
              onChange={() => setValue('facedUnsureSituation', false)}
              className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">No</span>
          </label>
        </div>
        
        {facedUnsureSituation === true && (
          <div className="mt-4">
            <label className="form-label block mb-2">
              Please describe the situation: <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('unsureSituationDescription', { 
                required: facedUnsureSituation === true ? 'Please describe the situation' : false 
              })}
              rows={4}
              placeholder="Describe the situation where you were unsure about the right policy to apply"
              className="form-textarea w-full"
            />
            {errors.unsureSituationDescription && (
              <p className="form-error">{errors.unsureSituationDescription.message}</p>
            )}
          </div>
        )}
        
        {errors.facedUnsureSituation && (
          <p className="form-error">{errors.facedUnsureSituation.message}</p>
        )}
      </div>
    </div>
  )
}

export default SectionG
