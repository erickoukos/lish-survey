import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { SurveyFormData } from '../lib/validation'

const STORAGE_KEY = 'lish-survey-form-data'
const SECTION_KEY = 'lish-survey-current-section'

export const useFormPersistence = (
  form: UseFormReturn<SurveyFormData>,
  currentSection: number,
  setCurrentSection: (section: number) => void
) => {
  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (error) {
        console.warn('Failed to save form data to localStorage:', error)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [form])

  // Save current section to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SECTION_KEY, currentSection.toString())
    } catch (error) {
      console.warn('Failed to save current section to localStorage:', error)
    }
  }, [currentSection])

  // Load form data and section from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      const savedSection = localStorage.getItem(SECTION_KEY)
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        // Only restore if the data is valid and not empty
        if (parsedData && Object.keys(parsedData).length > 0) {
          form.reset(parsedData)
          console.log('Form data restored from localStorage:', parsedData)
        }
      }
      
      if (savedSection) {
        const sectionNumber = parseInt(savedSection, 10)
        if (!isNaN(sectionNumber) && sectionNumber >= 0) {
          setCurrentSection(sectionNumber)
          console.log('Current section restored from localStorage:', sectionNumber)
        }
      }
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error)
    }
  }, [form, setCurrentSection])

  // Clear form data from localStorage
  const clearFormData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(SECTION_KEY)
      console.log('Form data cleared from localStorage')
      
      // Also reset the form to ensure it's completely cleared
      form.reset({
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
        urgentTrainingsOther: '',
        financeWellnessNeeds: [],
        cultureWellnessNeeds: [],
        cultureWellnessOther: '',
        digitalSkillsNeeds: [],
        digitalSkillsOther: '',
        professionalDevNeeds: [],
        professionalDevOther: '',
        confidenceLevel: undefined,
        facedUnsureSituation: undefined,
        unsureSituationDescription: '',
        observedIssues: [],
        observedIssuesOther: '',
        knewReportingChannel: undefined,
        trainingMethod: undefined,
        trainingMethodOther: '',
        refresherFrequency: undefined,
        prioritizedPolicies: [],
        prioritizationReason: '',
        policyChallenges: [],
        policyChallengesOther: '',
        complianceSuggestions: '',
        generalComments: ''
      })
      
      // Reset to first section
      setCurrentSection(0)
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error)
    }
  }

  return { clearFormData }
}
