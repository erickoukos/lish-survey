import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionEProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionE: React.FC<SectionEProps> = ({ form }) => {
  const { register, watch, setValue } = form
  const cultureWellnessNeeds = watch('cultureWellnessNeeds') || []

  const cultureOptions = [
    'Stress management strategies for high-paced digital environments',
    'Recognizing burnout and early warning signs',
    'Accessing mental health resources and support',
    'Avoiding digital fatigue and information overload (Healthy Tech Use)',
    'Self-awareness and emotional regulation',
    'Understanding others\' perspectives (empathy)',
    'Using emotional intelligence for leadership and teamwork',
    'Resilience & Adaptability Training',
    'Wellness & Lifestyle Management',
    'Diversity, Equity & Inclusion (DEI) Awareness'
  ]

  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (checked) {
      setValue('cultureWellnessNeeds', [...cultureWellnessNeeds, option])
    } else {
      setValue('cultureWellnessNeeds', cultureWellnessNeeds.filter(item => item !== option))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Section E: Training Needs – Culture & Wellness
        </h2>
        <p className="text-secondary-600">
          Select all areas of culture and wellness training you need
        </p>
      </div>

      <div>
        <label className="form-label block mb-6">
          Q5. Which of the following Culture & Wellness training do you need? (Select all that apply)
        </label>
        
        <div className="space-y-3">
          {cultureOptions.map((option) => (
            <label key={option} className="flex items-start space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
              <input
                type="checkbox"
                checked={cultureWellnessNeeds.includes(option)}
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
              checked={cultureWellnessNeeds.includes('Others')}
              onChange={(e) => handleCheckboxChange('Others', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">Others (please specify)</span>
          </label>
          
          {cultureWellnessNeeds.includes('Others') && (
            <div className="mt-3">
              <input
                type="text"
                {...register('cultureWellnessOther')}
                placeholder="Please specify other culture & wellness training needs"
                className="form-input w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SectionE

