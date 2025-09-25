import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionAProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionA: React.FC<SectionAProps> = ({ form }) => {
  const { register, formState: { errors } } = form

  const departments = [
    'Head of Department (HODs)',
    'Technical Team',
    'Data Annotation Team',
    'Digital Marketing Department',
    'HR & Administration Department',
    'Finance & Accounting Department',
    'Project Management Department',
    'Sanitation Department',
    'Security Department'
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-2">
          Section A: General Information
        </h2>
        <p className="text-sm sm:text-base text-secondary-600">
          Please provide your department information
        </p>
      </div>

      <div>
        <label className="form-label block mb-3 sm:mb-4">
          Q1. Which department do you belong to? <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {departments.map((dept) => (
            <label key={dept} className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
              <input
                type="radio"
                value={dept}
                {...register('department', { required: 'Please select your department' })}
                className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-secondary-700">{dept}</span>
            </label>
          ))}
        </div>
        
        {errors.department && (
          <p className="form-error">{errors.department.message}</p>
        )}
      </div>
    </div>
  )
}

export default SectionA
