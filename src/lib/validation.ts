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
  'Sexual Harassment Prevention',
  'Safeguarding Policy',
  'HR Policy Manual',
  'Code of Conduct',
  'Finance & Financial Wellness',
  'Work-Life Balance & Mental Health Awareness',
  'Digital Workplace & Skills',
  'Soft Skills'
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
  'Finance & Financial Wellness Policy',
  'Work-Life Balance & Mental Health Policy',
  'Digital Workplace & Skills Policy',
  'Soft Skills Development Policy'
])

export const policyChallengesEnum = z.enum([
  'Policies are too complex or difficult to understand',
  'Lack of clear examples or case studies',
  'Insufficient training on policy implementation',
  'Policies are not easily accessible or well-organized',
  'Conflicting information between different policies',
  'Language barriers or technical jargon',
  'Lack of regular updates or communication about policy changes',
  'Unclear consequences or enforcement procedures',
  'Limited time to read and understand all policies',
  'Others (Specify)'
])

// Updated validation schema for Section J array fields - Force Vercel redeploy
export const surveyResponseSchema = z.object({
  department: departmentEnum,
  awareness: awarenessSchema,
  urgentTrainings: z.array(urgentTrainingsEnum).min(1),
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
  prioritizedPolicies: z.array(prioritizedPoliciesEnum).min(1),
  prioritizationReason: z.string().optional(),
  policyChallenges: z.array(policyChallengesEnum).min(1),
  policyChallengesOther: z.string().optional(),
  complianceSuggestions: z.string().optional(),
  generalComments: z.string().optional()
})

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})
