import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionBProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionB: React.FC<SectionBProps> = ({ form }) => {
  const { register, formState: { errors } } = form

  const awarenessItems = [
    { key: 'antiSocialBehavior', label: 'Anti-Social Behavior Policy' },
    { key: 'antiDiscrimination', label: 'Anti-Discrimination Policy' },
    { key: 'sexualHarassment', label: 'Sexual & Other forms of harassment Policy' },
    { key: 'safeguarding', label: 'Safeguarding Policy' },
    { key: 'hrPolicyManual', label: 'HR Policy Manual' },
    { key: 'codeOfConduct', label: 'Code of Conduct' },
    { key: 'financeWellness', label: 'Finance & Financial Wellness' },
    { key: 'workLifeBalance', label: 'Work-Life Balance & Mental Health Awareness' },
    { key: 'digitalWorkplace', label: 'Digital Workplace & Skills' },
    { key: 'softSkills', label: 'Soft Skills' },
    { key: 'professionalism', label: 'Professionalism at Work Place' }
  ]

  const scaleLabels = {
    1: 'Not aware',
    2: 'Heard of it',
    3: 'Somewhat familiar',
    4: 'Familiar',
    5: 'Fully understand & can apply'
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Section B: Awareness & Understanding
        </h2>
        <p className="text-secondary-600">
          Rate your awareness level for each policy (1=Not aware, 5=Fully understand & can apply)
        </p>
      </div>

      <div>
        <label className="form-label block mb-6">
          Q2. How would you rate your awareness and understanding of the following policies? <span className="text-red-500">*</span>
        </label>
        
        <div className="space-y-6">
          {awarenessItems.map((item) => (
            <div key={item.key} className="border border-secondary-200 rounded-lg p-4">
              <h4 className="font-medium text-secondary-900 mb-4">{item.label}</h4>
              
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="flex flex-col items-center space-y-2 p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
                    <input
                      type="radio"
                      value={value}
                      {...register(`awareness.${item.key}` as any, { 
                        required: 'Please select a rating',
                        valueAsNumber: true
                      })}
                      className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
                    />
                    <span className="text-xs text-center text-secondary-600">
                      {value}
                    </span>
                    <span className="text-xs text-center text-secondary-500">
                      {scaleLabels[value as keyof typeof scaleLabels]}
                    </span>
                  </label>
                ))}
              </div>
              
              {errors.awareness?.[item.key as keyof typeof errors.awareness] && (
                <p className="form-error mt-2">
                  {errors.awareness[item.key as keyof typeof errors.awareness]?.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SectionB
