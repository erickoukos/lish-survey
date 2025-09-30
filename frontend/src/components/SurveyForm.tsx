import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { surveyFormSchema, SurveyFormData } from '../lib/validation'
import { surveyApi } from '../lib/api'
import { useFormPersistence } from '../hooks/useFormPersistence'
import ProgressBar from './ProgressBar'
import Introduction from './Introduction'
import SurveyUnavailable from './SurveyUnavailable'
import SectionA from './survey-sections/SectionA'
import SectionB from './survey-sections/SectionB'
import SectionC from './survey-sections/SectionC'
import SectionD from './survey-sections/SectionD'
import SectionE from './survey-sections/SectionE'
import SectionF from './survey-sections/SectionF'
import SectionG from './survey-sections/SectionG'
import SectionH from './survey-sections/SectionH'
import SectionI from './survey-sections/SectionI'
import SectionJ from './survey-sections/SectionJ'

const SurveyForm: React.FC = () => {
  const navigate = useNavigate()
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [surveyConfig, setSurveyConfig] = useState<any>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  
  const totalSections = 11

  // Check survey availability
  useEffect(() => {
    const checkSurveyAvailability = async () => {
      try {
        const response = await surveyApi.getSurveyConfig()
        setSurveyConfig(response.config)
      } catch (error) {
        console.error('Error fetching survey config:', error)
        // If we can't fetch config, assume survey is available
        setSurveyConfig({
          isActive: true,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      } finally {
        setIsLoadingConfig(false)
      }
    }

    checkSurveyAvailability()
  }, [])

  const isSurveyAvailable = () => {
    if (!surveyConfig) return true // Default to available if no config

    const now = new Date()
    const startDate = new Date(surveyConfig.startDate)
    const endDate = new Date(surveyConfig.endDate)

    if (!surveyConfig.isActive) {
      return { available: false, reason: 'inactive' as const }
    }

    if (now < startDate) {
      return { 
        available: false, 
        reason: 'not_started' as const,
        startDate: surveyConfig.startDate,
        endDate: surveyConfig.endDate
      }
    }

    if (now > endDate) {
      return { 
        available: false, 
        reason: 'ended' as const,
        startDate: surveyConfig.startDate,
        endDate: surveyConfig.endDate
      }
    }

    return { available: true }
  }

  const getSectionName = (section: number) => {
    const sectionNames = [
      'Introduction',
      'Section A - General Information',
      'Section B - Awareness & Understanding',
      'Section C - Urgent Trainings',
      'Section D - Finance & Wellness',
      'Section E - Culture & Wellness',
      'Section F - Digital Skills',
      'Section G - Professional Development',
      'Section H - Observed Issues',
      'Section I - Training Methods',
      'Section J - Final Questions'
    ]
    return sectionNames[section] || `Section ${section}`
  }

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      department: '',
      awareness: {
        antiSocialBehavior: undefined,
        antiDiscrimination: undefined,
        sexualHarassment: undefined,
        safeguarding: undefined,
        hrPolicyManual: undefined,
        codeOfConduct: undefined,
        financeWellness: undefined,
        workLifeBalance: undefined,
        digitalWorkplace: undefined,
        softSkills: undefined,
        professionalism: undefined
      },
      urgentTrainings: [],
      financeWellnessNeeds: [],
      cultureWellnessNeeds: [],
      digitalSkillsNeeds: [],
      professionalDevNeeds: [],
      confidenceLevel: undefined,
      facedUnsureSituation: false,
      observedIssues: [],
      knewReportingChannel: undefined,
      trainingMethod: undefined,
      refresherFrequency: undefined,
      prioritizedPolicies: [],
      prioritizationReason: '',
      policyChallenges: [],
      complianceSuggestions: '',
      generalComments: ''
    }
  })

  // Use form persistence hook
  const { clearFormData } = useFormPersistence(form, currentSection, setCurrentSection)

  const { watch, handleSubmit, formState: { errors } } = form
  const watchedValues = watch()

  const onSubmit = async (data: SurveyFormData) => {
    console.log('Form submission started:', data)
    console.log('Form errors:', errors)
    console.log('Form is valid:', Object.keys(errors).length === 0)
    
    // Prepare data for submission - send arrays as arrays, not strings
    const dataToSend = {
      ...data,
      awareness: data.awareness, // Keep as object (not array)
      urgentTrainings: data.urgentTrainings?.filter(Boolean) || [],
      financeWellnessNeeds: data.financeWellnessNeeds?.filter(Boolean) || [],
      cultureWellnessNeeds: data.cultureWellnessNeeds?.filter(Boolean) || [],
      digitalSkillsNeeds: data.digitalSkillsNeeds?.filter(Boolean) || [],
      professionalDevNeeds: data.professionalDevNeeds?.filter(Boolean) || [],
      observedIssues: data.observedIssues?.filter(Boolean) || [],
      prioritizedPolicies: data.prioritizedPolicies?.filter(Boolean) || [],
      policyChallenges: data.policyChallenges?.filter(Boolean) || []
    }

    console.log('Data to send:', dataToSend)
    console.log('Awareness array:', transformedAwareness)
    
    setIsSubmitting(true)
    try {
      console.log('Submitting to API...')
      const result = await surveyApi.submit(dataToSend)
      console.log('API response:', result)
      
      // Clear form data from localStorage after successful submission
      clearFormData()
      
      toast.success('Survey submitted successfully!')
      navigate('/thank-you')
    } catch (error: any) {
      console.error('Submission error:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error(error.response?.data?.message || 'Failed to submit survey. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextSection = async () => {
    // Skip validation for introduction section
    if (currentSection === 0) {
      setCurrentSection(currentSection + 1)
      return
    }
    
    // Comprehensive validation for each section
    let isValid = true
    const formData = form.getValues()
    
    // Debug logging for all sections
    console.log(`Validating Section ${currentSection}:`, {
      section: currentSection,
      formData: formData,
      currentSectionName: getSectionName(currentSection)
    })
    
    // Extra debugging for Section B
    if (currentSection === 2) {
      console.log('Section B detailed validation:', {
        awareness: formData.awareness,
        awarenessKeys: formData.awareness ? Object.keys(formData.awareness) : 'no awareness',
        awarenessValues: formData.awareness ? Object.values(formData.awareness) : 'no awareness',
        awarenessEntries: formData.awareness ? Object.entries(formData.awareness) : 'no awareness'
      })
    }
    
    switch (currentSection) {
      case 1: // Section A - Department
        if (!formData.department || formData.department.trim() === '') {
          isValid = false
          console.log('Section A validation failed:', {
            department: formData.department
          })
        }
        break
      case 2: // Section B - Awareness (all fields required)
        const awareness = formData.awareness
        const requiredAwarenessFields = [
          'antiSocialBehavior', 'antiDiscrimination', 'sexualHarassment', 
          'safeguarding', 'hrPolicyManual', 'codeOfConduct', 'financeWellness',
          'workLifeBalance', 'digitalWorkplace', 'softSkills', 'professionalism'
        ]
        
        // Check if awareness object exists and all required fields are filled with valid values
        if (!awareness) {
          isValid = false
          console.log('Section B validation failed: No awareness object')
        } else {
          // Check if all required fields are present
          const missingFields = requiredAwarenessFields.filter(field => {
            const value = awareness[field as keyof typeof awareness]
            return value === undefined || value === null || value === '' || !value
          })
          
          // Check if all present fields have valid values
          const invalidFields = requiredAwarenessFields.filter(field => {
            const value = awareness[field as keyof typeof awareness]
            const numValue = Number(value)
            return value && (isNaN(numValue) || numValue < 1 || numValue > 5)
          })
          
          if (missingFields.length > 0) {
            isValid = false
            console.log('Section B validation failed - Missing fields:', {
              missingFields,
              totalRequired: requiredAwarenessFields.length,
              presentFields: requiredAwarenessFields.length - missingFields.length
            })
          }
          
          if (invalidFields.length > 0) {
            isValid = false
            console.log('Section B validation failed - Invalid values:', {
              invalidFields,
              fieldValues: invalidFields.map(field => ({
                field,
                value: awareness[field as keyof typeof awareness],
                type: typeof awareness[field as keyof typeof awareness]
              }))
            })
          }
          
          // Final check: ensure we have exactly 11 valid fields
          const validFields = requiredAwarenessFields.filter(field => {
            const value = awareness[field as keyof typeof awareness]
            const numValue = Number(value)
            return value !== undefined && value !== null && value !== '' && !isNaN(numValue) && numValue >= 1 && numValue <= 5
          })
          
          if (validFields.length !== 11) {
            isValid = false
            console.log('Section B validation failed - Not all fields completed:', {
              validFieldsCount: validFields.length,
              requiredCount: 11,
              validFields: validFields,
              missingFields: requiredAwarenessFields.filter(field => !validFields.includes(field))
            })
          }
        }
        break
      case 3: // Section C - Urgent Trainings
        if (!formData.urgentTrainings || formData.urgentTrainings.length === 0) {
          isValid = false
          console.log('Section C validation failed:', {
            urgentTrainings: formData.urgentTrainings
          })
        } else if (formData.urgentTrainings.includes('Others') && (!formData.urgentTrainingsOther || formData.urgentTrainingsOther.trim() === '')) {
          isValid = false
          console.log('Section C validation failed - Others selected but no details provided:', {
            urgentTrainings: formData.urgentTrainings,
            urgentTrainingsOther: formData.urgentTrainingsOther
          })
        }
        break
      case 4: // Section D - Finance & Wellness (required)
        if (!formData.financeWellnessNeeds || formData.financeWellnessNeeds.length === 0) {
          isValid = false
          console.log('Section D validation failed:', {
            financeWellnessNeeds: formData.financeWellnessNeeds
          })
        }
        break
      case 5: // Section E - Culture & Wellness (required)
        if (!formData.cultureWellnessNeeds || formData.cultureWellnessNeeds.length === 0) {
          isValid = false
          console.log('Section E validation failed:', {
            cultureWellnessNeeds: formData.cultureWellnessNeeds
          })
        } else if (formData.cultureWellnessNeeds.includes('Others') && (!formData.cultureWellnessOther || formData.cultureWellnessOther.trim() === '')) {
          isValid = false
          console.log('Section E validation failed - Others selected but no details provided:', {
            cultureWellnessNeeds: formData.cultureWellnessNeeds,
            cultureWellnessOther: formData.cultureWellnessOther
          })
        }
        break
      case 6: // Section F - Digital Skills (required)
        if (!formData.digitalSkillsNeeds || formData.digitalSkillsNeeds.length === 0) {
          isValid = false
          console.log('Section F validation failed:', {
            digitalSkillsNeeds: formData.digitalSkillsNeeds
          })
        } else if (formData.digitalSkillsNeeds.includes('Others') && (!formData.digitalSkillsOther || formData.digitalSkillsOther.trim() === '')) {
          isValid = false
          console.log('Section F validation failed - Others selected but no details provided:', {
            digitalSkillsNeeds: formData.digitalSkillsNeeds,
            digitalSkillsOther: formData.digitalSkillsOther
          })
        }
        break
      case 7: // Section G - Confidence Level and Faced Unsure Situation
        if (!formData.confidenceLevel || formData.facedUnsureSituation === undefined || formData.facedUnsureSituation === null) {
          isValid = false
          console.log('Section G validation failed:', {
            confidenceLevel: formData.confidenceLevel,
            facedUnsureSituation: formData.facedUnsureSituation
          })
        } else if (formData.professionalDevNeeds && formData.professionalDevNeeds.includes('Others') && (!formData.professionalDevOther || formData.professionalDevOther.trim() === '')) {
          isValid = false
          console.log('Section G validation failed - Others selected but no details provided:', {
            professionalDevNeeds: formData.professionalDevNeeds,
            professionalDevOther: formData.professionalDevOther
          })
        }
        break
      case 8: // Section H - Observed Issues and Knew Reporting Channel
        if (!formData.knewReportingChannel) {
          isValid = false
          console.log('Section H validation failed:', {
            knewReportingChannel: formData.knewReportingChannel
          })
        } else if (formData.observedIssues && formData.observedIssues.includes('Others') && (!formData.observedIssuesOther || formData.observedIssuesOther.trim() === '')) {
          isValid = false
          console.log('Section H validation failed - Others selected but no details provided:', {
            observedIssues: formData.observedIssues,
            observedIssuesOther: formData.observedIssuesOther
          })
        }
        break
      case 9: // Section I - Training Method and Frequency
        if (!formData.trainingMethod || !formData.refresherFrequency) {
          isValid = false
          console.log('Section I validation failed:', {
            trainingMethod: formData.trainingMethod,
            refresherFrequency: formData.refresherFrequency
          })
        } else if (formData.trainingMethod === 'Others' && (!formData.trainingMethodOther || formData.trainingMethodOther.trim() === '')) {
          isValid = false
          console.log('Section I validation failed - Others selected but no details provided:', {
            trainingMethod: formData.trainingMethod,
            trainingMethodOther: formData.trainingMethodOther
          })
        }
        break
      case 10: // Section J - Final Questions (required)
        if (!formData.prioritizedPolicies || formData.prioritizedPolicies.trim() === '' ||
            !formData.prioritizationReason || formData.prioritizationReason.trim() === '' ||
            !formData.policyChallenges || formData.policyChallenges.trim() === '' ||
            !formData.complianceSuggestions || formData.complianceSuggestions.trim() === '') {
          isValid = false
          console.log('Section J validation failed:', {
            prioritizedPolicies: formData.prioritizedPolicies,
            prioritizationReason: formData.prioritizationReason,
            policyChallenges: formData.policyChallenges,
            complianceSuggestions: formData.complianceSuggestions
          })
        }
        break
    }
    
    if (isValid && currentSection < totalSections - 1) {
      console.log(`✅ Section ${currentSection} validation passed`)
      setCurrentSection(currentSection + 1)
    } else if (!isValid) {
      console.log(`❌ Section ${currentSection} validation failed`)
      toast.error(`Please complete all required fields in ${getSectionName(currentSection)} before proceeding`)
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return <Introduction />
      case 1:
        return <SectionA form={form} />
      case 2:
        return <SectionB form={form} />
      case 3:
        return <SectionC form={form} />
      case 4:
        return <SectionD form={form} />
      case 5:
        return <SectionE form={form} />
      case 6:
        return <SectionF form={form} />
      case 7:
        return <SectionG form={form} />
      case 8:
        return <SectionH form={form} />
      case 9:
        return <SectionI form={form} />
      case 10:
        return <SectionJ form={form} />
      default:
        return null
    }
  }

  // Show loading state while checking survey availability
  if (isLoadingConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  // Check if survey is available
  const availability = isSurveyAvailable()
  if (!availability.available) {
    return (
      <SurveyUnavailable 
        reason={availability.reason}
        startDate={availability.startDate}
        endDate={availability.endDate}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary-900 mb-2 sm:mb-3">
            LISH AI LABS Policy Survey
          </h1>
          <p className="text-sm sm:text-base text-secondary-600">
            Policy Awareness & Training Needs Assessment
          </p>
        </div>

        <ProgressBar current={currentSection} total={totalSections} />

        <div className="card mt-4 sm:mt-6">
          <div className="card-content p-3 sm:p-4 lg:p-6">
          <form onSubmit={(e) => {
            console.log('Form submit event triggered')
            e.preventDefault()
            handleSubmit(onSubmit)(e)
          }}>
            {renderSection()}
            
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-secondary-200">
              <button
                type="button"
                onClick={prevSection}
                disabled={currentSection === 0}
                className="btn-outline px-4 sm:px-6 py-3 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Previous
              </button>
              
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
                {currentSection < totalSections - 1 ? (
                  <button
                    type="button"
                    onClick={nextSection}
                    className="btn-primary px-4 sm:px-6 py-2 w-full sm:w-auto"
                  >
                    {currentSection === 0 ? 'Start Survey' : 'Next'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={async () => {
                      console.log('Submit button clicked')
                      console.log('Form errors:', errors)
                      console.log('Form values:', form.getValues())
                      
                      // Validate all required fields before submitting
                      const formData = form.getValues()
                      
                      // Check if all required fields are filled
                      const requiredFields = [
                        'department',
                        'awareness',
                        'urgentTrainings',
                        'confidenceLevel',
                        'facedUnsureSituation',
                        'knewReportingChannel',
                        'trainingMethod',
                        'refresherFrequency',
                        'prioritizedPolicies',
                        'prioritizationReason',
                        'policyChallenges',
                        'complianceSuggestions'
                      ]
                      
                      const missingFields = requiredFields.filter(field => {
                        const value = formData[field as keyof typeof formData]
                        if (field === 'awareness') {
                          return !value || Object.values(value).some(v => v === undefined || v === null || v === '')
                        }
                        if (field === 'urgentTrainings' || field === 'prioritizedPolicies' || field === 'policyChallenges') {
                          return !value || (Array.isArray(value) && value.length === 0)
                        }
                        if (field === 'facedUnsureSituation') {
                          return !value || value === '' || value === undefined || value === null
                        }
                        return !value || value === '' || value === undefined || value === null
                      })
                      
                      if (missingFields.length > 0) {
                        toast.error(`Please complete all required fields. Missing: ${missingFields.join(', ')}`)
                        console.log('Required fields validation failed:', {
                          missingFields,
                          formData: formData
                        })
                        return
                      }
                      
                      // Check if Section J fields are filled
                      if (!formData.prioritizedPolicies || (Array.isArray(formData.prioritizedPolicies) && formData.prioritizedPolicies.length === 0) ||
                          !formData.prioritizationReason || formData.prioritizationReason.trim() === '' ||
                          !formData.policyChallenges || (Array.isArray(formData.policyChallenges) && formData.policyChallenges.length === 0) ||
                          !formData.complianceSuggestions || formData.complianceSuggestions.trim() === '') {
                        toast.error('Please complete all required fields in Section J before submitting')
                        console.log('Section J validation failed on submit:', {
                          prioritizedPolicies: formData.prioritizedPolicies,
                          prioritizationReason: formData.prioritizationReason,
                          policyChallenges: formData.policyChallenges,
                          complianceSuggestions: formData.complianceSuggestions
                        })
                        return
                      }
                      
                      console.log('Manual submit with data:', formData)
                      console.log('Awareness data:', formData.awareness)
                      console.log('Awareness data type:', typeof formData.awareness)
                      console.log('Awareness values:', Object.values(formData.awareness || {}))
                      console.log('Awareness individual values:', {
                        antiSocialBehavior: formData.awareness?.antiSocialBehavior,
                        antiDiscrimination: formData.awareness?.antiDiscrimination,
                        sexualHarassment: formData.awareness?.sexualHarassment
                      })
                      
                      // Debug all form data
                      console.log('=== FULL FORM DATA DEBUG ===')
                      console.log('Department:', formData.department)
                      console.log('Urgent Trainings:', formData.urgentTrainings)
                      console.log('Finance Wellness Needs:', formData.financeWellnessNeeds)
                      console.log('Culture Wellness Needs:', formData.cultureWellnessNeeds)
                      console.log('Digital Skills Needs:', formData.digitalSkillsNeeds)
                      console.log('Professional Dev Needs:', formData.professionalDevNeeds)
                      console.log('Confidence Level:', formData.confidenceLevel)
                      console.log('Faced Unsure Situation:', formData.facedUnsureSituation)
                      console.log('Knew Reporting Channel:', formData.knewReportingChannel)
                      console.log('Training Method:', formData.trainingMethod)
                      console.log('Refresher Frequency:', formData.refresherFrequency)
                      console.log('Prioritized Policies:', formData.prioritizedPolicies)
                      console.log('Prioritization Reason:', formData.prioritizationReason)
                      console.log('Policy Challenges:', formData.policyChallenges)
                      console.log('Compliance Suggestions:', formData.complianceSuggestions)
                      console.log('=== END FORM DATA DEBUG ===')
                      
                      // Transform data to ensure correct format
                      const transformedData = {
                        ...formData,
                        awareness: {
                          antiSocialBehavior: Number(formData.awareness?.antiSocialBehavior) || 1,
                          antiDiscrimination: Number(formData.awareness?.antiDiscrimination) || 1,
                          sexualHarassment: Number(formData.awareness?.sexualHarassment) || 1,
                          safeguarding: Number(formData.awareness?.safeguarding) || 1,
                          hrPolicyManual: Number(formData.awareness?.hrPolicyManual) || 1,
                          codeOfConduct: Number(formData.awareness?.codeOfConduct) || 1,
                          financeWellness: Number(formData.awareness?.financeWellness) || 1,
                          workLifeBalance: Number(formData.awareness?.workLifeBalance) || 1,
                          digitalWorkplace: Number(formData.awareness?.digitalWorkplace) || 1,
                          softSkills: Number(formData.awareness?.softSkills) || 1,
                          professionalism: Number(formData.awareness?.professionalism) || 1
                        },
                        urgentTrainings: formData.urgentTrainings || [],
                        financeWellnessNeeds: formData.financeWellnessNeeds || [],
                        cultureWellnessNeeds: formData.cultureWellnessNeeds || [],
                        digitalSkillsNeeds: formData.digitalSkillsNeeds || [],
                        professionalDevNeeds: formData.professionalDevNeeds || [],
                        observedIssues: formData.observedIssues || [],
                        facedUnsureSituation: formData.facedUnsureSituation === 'true'
                      }
                      
                      console.log('Transformed data:', transformedData)
                      console.log('Transformed awareness:', transformedData.awareness)
                      console.log('Transformed awareness values:', Object.values(transformedData.awareness))
                      
                      setIsSubmitting(true)
                      try {
                        console.log('Submitting to API...')
                        console.log('API Base URL:', import.meta.env.VITE_API_URL || 'https://lish-survey-kv379w9h1-lish-ai-labs.vercel.app')
                        const result = await surveyApi.submit(transformedData)
                        console.log('API response:', result)
                        toast.success('Survey submitted successfully!')
                        navigate('/thank-you')
                      } catch (error: any) {
                        console.error('Submission error:', error)
                        console.error('Error details:', {
                          message: error.message,
                          response: error.response?.data,
                          status: error.response?.status,
                          code: error.code
                        })
                        
                        let errorMessage = 'Failed to submit survey. Please try again.'
                        
                        if (error.code === 'ERR_NETWORK') {
                          errorMessage = 'Network error. Please check your connection and try again.'
                        } else if (error.response?.status === 500) {
                          errorMessage = 'Server error. Please try again later.'
                        } else if (error.response?.data?.message) {
                          errorMessage = error.response.data.message
                        }
                        
                        toast.error(errorMessage)
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                    className="btn-primary px-4 sm:px-6 py-3 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  )
}

export default SurveyForm
