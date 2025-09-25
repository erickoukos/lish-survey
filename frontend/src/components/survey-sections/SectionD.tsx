import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionDProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionD: React.FC<SectionDProps> = ({ form }) => {
  const { register, watch, setValue } = form
  const financeWellnessNeeds = watch('financeWellnessNeeds') || []

  const financeOptions = [
    'Financial Literacy Basics – Saving, spending, and tracking money smartly',
    'Digital Finance Tools – Mobile banking, and expense tracking',
    'Investment & Savings Options – youth-friendly investment paths like SACCOs, money markets, and digital assets',
    'Debt Management – responsible use of loans, credit, and avoiding financial stress'
  ]

  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (checked) {
      setValue('financeWellnessNeeds', [...financeWellnessNeeds, option])
    } else {
      setValue('financeWellnessNeeds', financeWellnessNeeds.filter(item => item !== option))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Section D: Training Needs – Finance & Financial Wellness
        </h2>
        <p className="text-secondary-600">
          Select all areas of financial wellness training you need
        </p>
      </div>

      <div>
        <label className="form-label block mb-6">
          Q4. Which of the following Finance & Financial Wellness training do you need? (Select all that apply)
        </label>
        
        <div className="space-y-3">
          {financeOptions.map((option) => (
            <label key={option} className="flex items-start space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
              <input
                type="checkbox"
                checked={financeWellnessNeeds.includes(option)}
                onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500 mt-1"
              />
              <span className="text-sm text-secondary-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SectionD

