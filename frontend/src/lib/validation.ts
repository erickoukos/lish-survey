import { z } from 'zod'

export const departmentEnum = z.enum([
  'Head of Department (HODs)',
  'Technical Team',
  'Data Annotation Team',
  'Digital Marketing Department',
  'HR & Administration Department',
  'Finance & Accounting Department',
  'Project Management Department',
  'Sanitation Department',
  'Security Department'
])

export const awarenessSchema = z.object({
  antiSocialBehavior: z.number().min(1).max(5),
  antiDiscrimination: z.number().min(1).max(5),
  sexualHarassment: z.number().min(1).max(5),
  safeguarding: z.number().min(1).max(5),
  hrPolicyManual: z.number().min(1).max(5),
  codeOfConduct: z.number().min(1).max(5),
  financeWellness: z.number().min(1).max(5),
  workLifeBalance: z.number().min(1).max(5),
  digitalWorkplace: z.number().min(1).max(5),
  softSkills: z.number().min(1).max(5),
  professionalism: z.number().min(1).max(5)
})

export const urgentTrainingsEnum = z.enum([
  'Anti-Social Behavior Policy',
  'Anti-Discrimination Policy',
  'Sexual and Other forms of harassment Policy',
  'Safeguarding Policy',
  'HR Policy Manual',
  'Code of Conduct',
  'Finance & Financial Wellness',
  'Work-Life Balance & Mental Health Awareness',
  'Digital Workplace & Skills',
  'Soft Skills',
  'Others'
])

export const financeWellnessNeedsEnum = z.enum([
  'Financial Literacy Basics – Saving, spending, and tracking money smartly',
  'Digital Finance Tools – Mobile banking, and expense tracking',
  'Investment & Savings Options – youth-friendly investment paths like SACCOs, money markets, and digital assets',
  'Debt Management – responsible use of loans, credit, and avoiding financial stress'
])

export const cultureWellnessNeedsEnum = z.enum([
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
])

export const digitalSkillsNeedsEnum = z.enum([
  'Cybersecurity Awareness',
  'Responsible AI & Ethical Tech Use',
  'Data Privacy & Compliance'
])

export const professionalDevNeedsEnum = z.enum([
  'Effective Communication',
  'Leadership Skills for Young Professionals',
  'Entrepreneurial Mindset & Intrapreneurship',
  'Personal Branding & Professional Networking',
  'Teamwork & Conflict Resolution',
  'Time Management & Productivity Tools'
])

export const confidenceLevelEnum = z.enum([
  'Not confident at all',
  'Slightly confident',
  'Neutral',
  'Confident',
  'Very confident'
])

export const observedIssuesEnum = z.enum([
  'Anti-social behavior (e.g., verbal abuse, public disorder)',
  'Discrimination (e.g., gender, race, disability bias)',
  'Harassment (verbal, physical, sexual, cyber)',
  'Lack of safeguarding for vulnerable persons (Women, PWDs, Senior Citizens)',
  'None of the above'
])

export const knewReportingChannelEnum = z.enum([
  'Yes',
  'No',
  'Not sure'
])

export const trainingMethodEnum = z.enum([
  'In-person training sessions',
  'Self-paced e-learning modules',
  'Shared Policy handbooks'
])

export const refresherFrequencyEnum = z.enum([
  '1 training /Week',
  '1 training /Monthly',
  '2 trainings /Month'
])

export const prioritizedPoliciesEnum = z.enum([
  'Anti-Social Behavior Policy',
  'Anti-Discrimination Policy',
  'Sexual and Other forms of harassment Policy',
  'Safeguarding Policy',
  'HR Policy Manual',
  'Code of Conduct',
  'Finance & Financial Wellness',
  'Work-Life Balance & Mental Health Awareness',
  'Digital Workplace & Skills',
  'Soft Skills',
  'Professionalism & Ethics'
])

export const policyChallengesEnum = z.enum([
  'Complex language and terminology',
  'Lack of clear examples or scenarios',
  'Insufficient training or orientation',
  'Conflicting information from different sources',
  'Policies not easily accessible',
  'Lack of regular updates or communication',
  'No clear consequences for non-compliance',
  'Cultural or language barriers',
  'Time constraints for reading policies',
  'Lack of practical application guidance',
  'Others'
])

export const surveyFormSchema = z.object({
  department: departmentEnum,
  awareness: awarenessSchema,
  urgentTrainings: z.array(urgentTrainingsEnum).min(1, 'Please select at least one urgent training'),
  urgentTrainingsOther: z.string().optional(),
  financeWellnessNeeds: z.array(financeWellnessNeedsEnum).optional(),
  cultureWellnessNeeds: z.array(cultureWellnessNeedsEnum).optional(),
  cultureWellnessOther: z.string().optional(),
  digitalSkillsNeeds: z.array(digitalSkillsNeedsEnum).optional(),
  digitalSkillsOther: z.string().optional(),
  professionalDevNeeds: z.array(professionalDevNeedsEnum).optional(),
  professionalDevOther: z.string().optional(),
  confidenceLevel: confidenceLevelEnum,
  facedUnsureSituation: z.boolean(),
  unsureSituationDescription: z.string().optional(),
  observedIssues: z.array(observedIssuesEnum).optional(),
  observedIssuesOther: z.string().optional(),
  knewReportingChannel: knewReportingChannelEnum,
  trainingMethod: trainingMethodEnum,
  trainingMethodOther: z.string().optional(),
  refresherFrequency: refresherFrequencyEnum,
  prioritizedPolicies: z.array(prioritizedPoliciesEnum).min(1, 'Please select at least one policy to prioritize'),
  prioritizationReason: z.string().min(1, 'Please explain why these policies should be prioritized'),
  policyChallenges: z.array(policyChallengesEnum).min(1, 'Please select at least one challenge'),
  policyChallengesOther: z.string().optional(),
  complianceSuggestions: z.string().min(1, 'Please share your suggestions for improvement'),
  generalComments: z.string().optional()
})

// Create a more flexible schema for section-by-section validation
export const createSectionSchema = (section: number) => {
  const baseSchema = z.object({
    department: departmentEnum.optional(),
    awareness: awarenessSchema.optional(),
    urgentTrainings: z.array(urgentTrainingsEnum).optional(),
    urgentTrainingsOther: z.string().optional(),
    financeWellnessNeeds: z.array(financeWellnessNeedsEnum).optional(),
    cultureWellnessNeeds: z.array(cultureWellnessNeedsEnum).optional(),
    cultureWellnessOther: z.string().optional(),
    digitalSkillsNeeds: z.array(digitalSkillsNeedsEnum).optional(),
    digitalSkillsOther: z.string().optional(),
    professionalDevNeeds: z.array(professionalDevNeedsEnum).optional(),
    professionalDevOther: z.string().optional(),
    confidenceLevel: confidenceLevelEnum.optional(),
    facedUnsureSituation: z.boolean().optional(),
    unsureSituationDescription: z.string().optional(),
    observedIssues: z.array(observedIssuesEnum).optional(),
    observedIssuesOther: z.string().optional(),
    knewReportingChannel: knewReportingChannelEnum.optional(),
    trainingMethod: trainingMethodEnum.optional(),
    trainingMethodOther: z.string().optional(),
    refresherFrequency: refresherFrequencyEnum.optional(),
    prioritizedPolicies: z.array(prioritizedPoliciesEnum).optional(),
    prioritizationReason: z.string().optional(),
    policyChallenges: z.array(policyChallengesEnum).optional(),
    policyChallengesOther: z.string().optional(),
    complianceSuggestions: z.string().optional(),
    generalComments: z.string().optional()
  })

  // Make specific fields required based on section
  switch (section) {
    case 1: // Section A
      return baseSchema.extend({
        department: departmentEnum
      })
    case 2: // Section B
      return baseSchema.extend({
        awareness: awarenessSchema
      })
    case 3: // Section C
      return baseSchema.extend({
        urgentTrainings: z.array(urgentTrainingsEnum).min(1, 'Please select at least one urgent training')
      })
    case 6: // Section F
      return baseSchema.extend({
        confidenceLevel: confidenceLevelEnum
      })
    case 7: // Section G
      return baseSchema.extend({
        facedUnsureSituation: z.boolean()
      })
    case 9: // Section I
      return baseSchema.extend({
        knewReportingChannel: knewReportingChannelEnum
      })
    case 10: // Section J
      return baseSchema.extend({
        prioritizedPolicies: z.array(prioritizedPoliciesEnum).min(1, 'Please select at least one policy to prioritize'),
        prioritizationReason: z.string().min(1, 'Please explain why these policies should be prioritized'),
        policyChallenges: z.array(policyChallengesEnum).min(1, 'Please select at least one challenge'),
        complianceSuggestions: z.string().min(1, 'Please share your suggestions for improvement')
      })
    default:
      return baseSchema
  }
}

export type SurveyFormData = z.infer<typeof surveyFormSchema>
