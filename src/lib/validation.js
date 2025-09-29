"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.surveyResponseSchema = exports.refresherFrequencyEnum = exports.trainingMethodEnum = exports.knewReportingChannelEnum = exports.observedIssuesEnum = exports.confidenceLevelEnum = exports.professionalDevNeedsEnum = exports.digitalSkillsNeedsEnum = exports.cultureWellnessNeedsEnum = exports.financeWellnessNeedsEnum = exports.urgentTrainingsEnum = exports.awarenessSchema = exports.departmentEnum = void 0;
const zod_1 = require("zod");
exports.departmentEnum = zod_1.z.enum([
    'Head of Department (HODs)',
    'Technical Team',
    'Data Annotation Team',
    'Digital Marketing Department',
    'HR & Administration Department',
    'Finance & Accounting Department',
    'Project Management Department',
    'Sanitation Department',
    'Security Department'
]);
exports.awarenessSchema = zod_1.z.object({
    antiSocialBehavior: zod_1.z.number().min(1).max(5),
    antiDiscrimination: zod_1.z.number().min(1).max(5),
    sexualHarassment: zod_1.z.number().min(1).max(5),
    safeguarding: zod_1.z.number().min(1).max(5),
    hrPolicyManual: zod_1.z.number().min(1).max(5),
    codeOfConduct: zod_1.z.number().min(1).max(5),
    financeWellness: zod_1.z.number().min(1).max(5),
    workLifeBalance: zod_1.z.number().min(1).max(5),
    digitalWorkplace: zod_1.z.number().min(1).max(5),
    softSkills: zod_1.z.number().min(1).max(5),
    professionalism: zod_1.z.number().min(1).max(5)
});
exports.urgentTrainingsEnum = zod_1.z.enum([
    'Anti-Social Behavior Policy',
    'Anti-Discrimination Policy',
    'HR Policy Manual',
    'Code of Conduct',
    'Safeguarding Policy',
    'Sexual and Other forms of harassment Policy',
    'Finance & Financial Wellness',
    'Work-Life Balance & Mental Health Awareness',
    'Digital Workplace & Skills',
    'Soft Skills'
]);
exports.financeWellnessNeedsEnum = zod_1.z.enum([
    'Financial Literacy Basics – Saving, spending, and tracking money smartly',
    'Digital Finance Tools – Mobile banking, and expense tracking',
    'Investment & Savings Options – youth-friendly investment paths like SACCOs, money markets, and digital assets',
    'Debt Management – responsible use of loans, credit, and avoiding financial stress'
]);
exports.cultureWellnessNeedsEnum = zod_1.z.enum([
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
]);
exports.digitalSkillsNeedsEnum = zod_1.z.enum([
    'Cybersecurity Awareness',
    'Responsible AI & Ethical Tech Use',
    'Data Privacy & Compliance'
]);
exports.professionalDevNeedsEnum = zod_1.z.enum([
    'Effective Communication',
    'Leadership Skills for Young Professionals',
    'Entrepreneurial Mindset & Intrapreneurship',
    'Personal Branding & Professional Networking',
    'Teamwork & Conflict Resolution',
    'Time Management & Productivity Tools'
]);
exports.confidenceLevelEnum = zod_1.z.enum([
    'Not confident at all',
    'Slightly confident',
    'Neutral',
    'Confident',
    'Very confident'
]);
exports.observedIssuesEnum = zod_1.z.enum([
    'Anti-social behavior (e.g., verbal abuse, public disorder)',
    'Discrimination (e.g., gender, race, disability bias)',
    'Harassment (verbal, physical, sexual, cyber)',
    'Lack of safeguarding for vulnerable persons (Women, PWDs, Senior Citizens)',
    'None of the above'
]);
exports.knewReportingChannelEnum = zod_1.z.enum([
    'Yes',
    'No',
    'Not sure'
]);
exports.trainingMethodEnum = zod_1.z.enum([
    'In-person training sessions',
    'Self-paced e-learning modules',
    'Shared Policy handbooks'
]);
exports.refresherFrequencyEnum = zod_1.z.enum([
    '1 training /Week',
    '1 training /Monthly',
    '2 trainings /Month'
]);
exports.surveyResponseSchema = zod_1.z.object({
    department: exports.departmentEnum,
    awareness: exports.awarenessSchema,
    urgentTrainings: zod_1.z.array(exports.urgentTrainingsEnum).min(1),
    urgentTrainingsOther: zod_1.z.string().optional(),
    financeWellnessNeeds: zod_1.z.array(exports.financeWellnessNeedsEnum).optional(),
    cultureWellnessNeeds: zod_1.z.array(exports.cultureWellnessNeedsEnum).optional(),
    cultureWellnessOther: zod_1.z.string().optional(),
    digitalSkillsNeeds: zod_1.z.array(exports.digitalSkillsNeedsEnum).optional(),
    digitalSkillsOther: zod_1.z.string().optional(),
    professionalDevNeeds: zod_1.z.array(exports.professionalDevNeedsEnum).optional(),
    professionalDevOther: zod_1.z.string().optional(),
    confidenceLevel: exports.confidenceLevelEnum,
    facedUnsureSituation: zod_1.z.boolean(),
    unsureSituationDescription: zod_1.z.string().optional(),
    observedIssues: zod_1.z.array(exports.observedIssuesEnum).optional(),
    observedIssuesOther: zod_1.z.string().optional(),
    knewReportingChannel: exports.knewReportingChannelEnum,
    trainingMethod: exports.trainingMethodEnum,
    trainingMethodOther: zod_1.z.string().optional(),
    refresherFrequency: exports.refresherFrequencyEnum,
    prioritizedPolicies: zod_1.z.string().optional(),
    prioritizationReason: zod_1.z.string().optional(),
    policyChallenges: zod_1.z.string().optional(),
    complianceSuggestions: zod_1.z.string().optional(),
    generalComments: zod_1.z.string().optional()
});
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1)
});
