import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionFProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionF: React.FC<SectionFProps> = ({ form }) => {
  const { register, watch, setValue } = form
  const digitalSkillsNeeds = watch('digitalSkillsNeeds') || []

  const digitalOptions = [
    'Cybersecurity Awareness',
    'Responsible AI & Ethical Tech Use',
    'Data Privacy & Compliance'
  ]

  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (checked) {
      setValue('digitalSkillsNeeds', [...digitalSkillsNeeds, option])
    } else {
      setValue('digitalSkillsNeeds', digitalSkillsNeeds.filter(item => item !== option))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Section F: Training Needs – Digital Workplace & Skills
        </h2>
        <p className="text-secondary-600">
          Select all areas of digital skills training you need
        </p>
      </div>

      <div>
        <label className="form-label block mb-6">
          Q6. Which of the following Digital Workplace & Skills training do you need? (Select all that apply)
        </label>
        
        <div className="space-y-3">
          {digitalOptions.map((option) => (
            <label key={option} className="flex items-start space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
              <input
                type="checkbox"
                checked={digitalSkillsNeeds.includes(option)}
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
              checked={digitalSkillsNeeds.includes('Others')}
              onChange={(e) => handleCheckboxChange('Others', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">Others (please specify)</span>
          </label>
          
          {digitalSkillsNeeds.includes('Others') && (
            <div className="mt-3">
              <input
                type="text"
                {...register('digitalSkillsOther')}
                placeholder="Please specify other digital skills training needs"
                className="form-input w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SectionF

