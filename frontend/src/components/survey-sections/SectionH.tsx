import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../../lib/validation'

interface SectionHProps {
  form: UseFormReturn<SurveyFormData>
}

const SectionH: React.FC<SectionHProps> = ({ form }) => {
  const { register, watch, setValue, formState: { errors } } = form
  const observedIssues = watch('observedIssues') || []

  const specificIssues = [
    'Anti-social behavior (e.g., verbal abuse, public disorder)',
    'Discrimination (e.g., gender, race, disability bias)',
    'Harassment (verbal, physical, sexual, cyber)',
    'Lack of safeguarding for vulnerable persons (Women, PWDs, Senior Citizens)'
  ]

  const issueOptions = [
    ...specificIssues,
    'None of the above'
  ]

  const reportingOptions = [
    'Yes',
    'No',
    'Not sure'
  ]

  const handleCheckboxChange = (option: string, checked: boolean) => {
    let newIssues = [...observedIssues]

    if (checked) {
      if (option === 'None of the above') {
        // If "None of the above" is selected, remove all specific issues but keep "Others"
        newIssues = newIssues.filter(item => !specificIssues.includes(item))
        newIssues.push('None of the above')
      } else if (specificIssues.includes(option)) {
        // If a specific issue is selected, remove "None of the above" but keep "Others"
        newIssues = newIssues.filter(item => item !== 'None of the above')
        newIssues.push(option)
      } else if (option === 'Others') {
        // "Others" can be selected with any other option
        newIssues.push('Others')
      }
    } else {
      // Remove the option
      newIssues = newIssues.filter(item => item !== option)
    }

    setValue('observedIssues', newIssues)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Section H: Workplace Practices
        </h2>
        <p className="text-secondary-600">
          Share your observations about workplace practices and reporting
        </p>
      </div>

      <div>
        <label className="form-label block mb-6">
          Q10. Have you observed any of the following issues in your workplace? (Select all that apply)
        </label>
        
        <div className="space-y-3">
          {issueOptions.map((option) => (
            <label key={option} className="flex items-start space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
              <input
                type="checkbox"
                checked={observedIssues.includes(option)}
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
              checked={observedIssues.includes('Others')}
              onChange={(e) => handleCheckboxChange('Others', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">Others (please specify)</span>
          </label>
          
          {observedIssues.includes('Others') && (
            <div className="mt-3">
              <input
                type="text"
                {...register('observedIssuesOther')}
                placeholder="Please specify other issues observed"
                className="form-input w-full"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <label className="form-label block mb-4">
          Q11. Do you know the proper channels to report workplace issues or violations? <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-3 gap-4">
          {reportingOptions.map((option) => (
            <label key={option} className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
              <input
                type="radio"
                value={option}
                {...register('knewReportingChannel', { required: 'Please select an option' })}
                className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
              />
              <span className="text-sm text-secondary-700">{option}</span>
            </label>
          ))}
        </div>
        
        {errors.knewReportingChannel && (
          <p className="form-error">{errors.knewReportingChannel.message}</p>
        )}
      </div>
    </div>
  )
}

export default SectionH

