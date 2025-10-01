import React from 'react'
import { X } from 'lucide-react'

interface Response {
  id: string
  department: string
  awareness: any // Can be object or JSON string
  urgentTrainings: string[] | string // Can be array or JSON string
  urgentTrainingsOther?: string
  financeWellnessNeeds: string[] | string
  cultureWellnessNeeds: string[] | string
  cultureWellnessOther?: string
  digitalSkillsNeeds: string[] | string
  digitalSkillsOther?: string
  professionalDevNeeds: string[] | string
  professionalDevOther?: string
  confidenceLevel: string
  facedUnsureSituation: boolean
  unsureSituationDescription?: string
  observedIssues: string[] | string
  observedIssuesOther?: string
  knewReportingChannel: string
  trainingMethod: string
  trainingMethodOther?: string
  refresherFrequency: string
  prioritizedPolicies?: string[] | string
  prioritizationReason?: string
  policyChallenges?: string[] | string
  policyChallengesOther?: string
  complianceSuggestions?: string
  generalComments?: string
  createdAt: string
}

interface ResponseModalProps {
  response: Response | null
  isOpen: boolean
  onClose: () => void
}

const ResponseModal: React.FC<ResponseModalProps> = ({ response, isOpen, onClose }) => {
  if (!isOpen || !response) return null

  const parseArrayField = (field: string[] | string) => {
    if (Array.isArray(field)) return field
    if (typeof field === 'string') {
      try {
        return JSON.parse(field)
      } catch {
        return []
      }
    }
    return []
  }

  const parseObjectField = (field: any) => {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field)
      } catch {
        return {}
      }
    }
    return field || {}
  }

  const awareness = parseObjectField(response.awareness)
  const urgentTrainings = parseArrayField(response.urgentTrainings)
  const financeWellnessNeeds = parseArrayField(response.financeWellnessNeeds)
  const cultureWellnessNeeds = parseArrayField(response.cultureWellnessNeeds)
  const digitalSkillsNeeds = parseArrayField(response.digitalSkillsNeeds)
  const professionalDevNeeds = parseArrayField(response.professionalDevNeeds)
  const observedIssues = parseArrayField(response.observedIssues)
  const prioritizedPolicies = parseArrayField(response.prioritizedPolicies)
  const policyChallenges = parseArrayField(response.policyChallenges)

  const awarenessLabels = {
    antiSocialBehavior: 'Anti-Social Behavior Policy',
    antiDiscrimination: 'Anti-Discrimination Policy',
    sexualHarassment: 'Sexual & Other forms of harassment Policy',
    safeguarding: 'Safeguarding Policy',
    hrPolicyManual: 'HR Policy Manual',
    codeOfConduct: 'Code of Conduct',
    financeWellness: 'Finance & Financial Wellness',
    workLifeBalance: 'Work-Life Balance & Mental Health Awareness',
    digitalWorkplace: 'Digital Workplace & Skills',
    softSkills: 'Soft Skills',
    professionalism: 'Professionalism at Work Place'
  }

  const scaleLabels = {
    1: 'Not aware',
    2: 'Heard of it',
    3: 'Somewhat familiar',
    4: 'Familiar',
    5: 'Fully understand & can apply'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">
            Survey Response Details
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-600">Department</label>
                <p className="text-sm text-secondary-900">{response.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-600">Submitted</label>
                <p className="text-sm text-secondary-900">
                  {new Date(response.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Awareness Ratings */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Policy Awareness Ratings</h3>
            <div className="space-y-3">
              {Object.entries(awareness).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-sm font-medium text-secondary-700">
                    {awarenessLabels[key as keyof typeof awarenessLabels]}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-primary-600">{value}</span>
                    <span className="text-xs text-secondary-500">
                      {scaleLabels[value as keyof typeof scaleLabels]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Trainings */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Urgent Training Needs</h3>
            <div className="space-y-2">
              {urgentTrainings.map((training, index) => (
                <span key={index} className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full mr-2 mb-2">
                  {training}
                </span>
              ))}
              {response.urgentTrainingsOther && (
                <div className="mt-2">
                  <label className="text-sm font-medium text-secondary-600">Other:</label>
                  <p className="text-sm text-secondary-900">{response.urgentTrainingsOther}</p>
                </div>
              )}
            </div>
          </div>

          {/* Training Needs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Finance & Wellness Needs */}
            <div>
              <h4 className="text-md font-medium text-secondary-900 mb-3">Finance & Wellness Needs</h4>
              <div className="space-y-1">
                {financeWellnessNeeds.map((need, index) => (
                  <span key={index} className="block text-sm text-secondary-700 bg-secondary-50 px-3 py-2 rounded">
                    {need}
                  </span>
                ))}
              </div>
            </div>

            {/* Culture & Wellness Needs */}
            <div>
              <h4 className="text-md font-medium text-secondary-900 mb-3">Culture & Wellness Needs</h4>
              <div className="space-y-1">
                {cultureWellnessNeeds.map((need, index) => (
                  <span key={index} className="block text-sm text-secondary-700 bg-secondary-50 px-3 py-2 rounded">
                    {need}
                  </span>
                ))}
                {response.cultureWellnessOther && (
                  <div className="mt-2">
                    <label className="text-sm font-medium text-secondary-600">Other:</label>
                    <p className="text-sm text-secondary-900">{response.cultureWellnessOther}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Digital Skills Needs */}
            <div>
              <h4 className="text-md font-medium text-secondary-900 mb-3">Digital Skills Needs</h4>
              <div className="space-y-1">
                {digitalSkillsNeeds.map((need, index) => (
                  <span key={index} className="block text-sm text-secondary-700 bg-secondary-50 px-3 py-2 rounded">
                    {need}
                  </span>
                ))}
                {response.digitalSkillsOther && (
                  <div className="mt-2">
                    <label className="text-sm font-medium text-secondary-600">Other:</label>
                    <p className="text-sm text-secondary-900">{response.digitalSkillsOther}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Development Needs */}
            <div>
              <h4 className="text-md font-medium text-secondary-900 mb-3">Professional Development Needs</h4>
              <div className="space-y-1">
                {professionalDevNeeds.map((need, index) => (
                  <span key={index} className="block text-sm text-secondary-700 bg-secondary-50 px-3 py-2 rounded">
                    {need}
                  </span>
                ))}
                {response.professionalDevOther && (
                  <div className="mt-2">
                    <label className="text-sm font-medium text-secondary-600">Other:</label>
                    <p className="text-sm text-secondary-900">{response.professionalDevOther}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Assessment */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Professional Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-600">Confidence Level</label>
                <p className="text-sm text-secondary-900">{response.confidenceLevel}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-600">Faced Unsure Situation</label>
                <p className="text-sm text-secondary-900">
                  {response.facedUnsureSituation ? 'Yes' : 'No'}
                </p>
              </div>
              {response.unsureSituationDescription && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-secondary-600">Situation Description</label>
                  <p className="text-sm text-secondary-900">{response.unsureSituationDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Observed Issues */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Observed Issues</h3>
            <div className="space-y-1">
              {observedIssues.map((issue, index) => (
                <span key={index} className="block text-sm text-secondary-700 bg-secondary-50 px-3 py-2 rounded">
                  {issue}
                </span>
              ))}
              {response.observedIssuesOther && (
                <div className="mt-2">
                  <label className="text-sm font-medium text-secondary-600">Other:</label>
                  <p className="text-sm text-secondary-900">{response.observedIssuesOther}</p>
                </div>
              )}
            </div>
          </div>

          {/* Training Preferences */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Training Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-600">Reporting Channel Knowledge</label>
                <p className="text-sm text-secondary-900">{response.knewReportingChannel}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-600">Training Method</label>
                <p className="text-sm text-secondary-900">{response.trainingMethod}</p>
                {response.trainingMethodOther && (
                  <p className="text-sm text-secondary-700 mt-1">Other: {response.trainingMethodOther}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-600">Refresher Frequency</label>
                <p className="text-sm text-secondary-900">{response.refresherFrequency}</p>
              </div>
            </div>
          </div>

          {/* Open Feedback */}
          {(prioritizedPolicies.length > 0 || response.prioritizationReason || policyChallenges.length > 0 || response.complianceSuggestions || response.generalComments) && (
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Open Feedback</h3>
              <div className="space-y-4">
                {prioritizedPolicies.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Prioritized Policies</label>
                    <div className="space-y-1">
                      {prioritizedPolicies.map((policy, index) => (
                        <span key={index} className="block text-sm text-secondary-700 bg-primary-100 text-primary-800 px-3 py-2 rounded">
                          {policy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {response.prioritizationReason && (
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Prioritization Reason</label>
                    <p className="text-sm text-secondary-900 bg-secondary-50 p-3 rounded">{response.prioritizationReason}</p>
                  </div>
                )}
                {policyChallenges.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Policy Challenges</label>
                    <div className="space-y-1">
                      {policyChallenges.map((challenge, index) => (
                        <span key={index} className="block text-sm text-secondary-700 bg-red-100 text-red-800 px-3 py-2 rounded">
                          {challenge}
                        </span>
                      ))}
                    </div>
                    {response.policyChallengesOther && (
                      <div className="mt-2">
                        <label className="text-sm font-medium text-secondary-600">Other Challenges:</label>
                        <p className="text-sm text-secondary-900 bg-secondary-50 p-3 rounded">{response.policyChallengesOther}</p>
                      </div>
                    )}
                  </div>
                )}
                {response.complianceSuggestions && (
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Compliance Suggestions</label>
                    <p className="text-sm text-secondary-900 bg-secondary-50 p-3 rounded">{response.complianceSuggestions}</p>
                  </div>
                )}
                {response.generalComments && (
                  <div>
                    <label className="text-sm font-medium text-secondary-600">General Comments</label>
                    <p className="text-sm text-secondary-900 bg-secondary-50 p-3 rounded">{response.generalComments}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResponseModal

