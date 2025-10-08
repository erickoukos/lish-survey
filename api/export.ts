import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { verifyToken } from '../src/lib/auth'
import { handleCors } from '../src/lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return

  // Set CORS headers
  Object.entries(handleCors(req, res) ? {} : {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }).forEach(([key, value]) => res.setHeader(key, value))

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Export API: Starting export process')
    
    // Check authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Export API: No valid auth header')
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      console.log('Export API: Invalid token')
      return res.status(401).json({ error: 'Invalid token' })
    }

    console.log(`Export API: Authenticated user: ${payload.username}`)

    // Get all responses
    let responses = []
    try {
      console.log('Export API: Fetching responses from database')
      responses = await prisma.surveyResponse.findMany({
        orderBy: { createdAt: 'desc' }
      })
      console.log(`Export API: Found ${responses.length} responses`)
    } catch (dbError) {
      console.error('Export API: Database error:', dbError)
      return res.status(500).json({
        error: 'Database not available',
        message: 'Cannot export responses - database not available'
      })
    }

    // Transform data for CSV
    console.log('Export API: Transforming data for CSV')
    const csvData = responses.map(response => {
      const awareness = response.awareness as any
      return {
        id: response.id,
        timestamp: response.createdAt.toISOString(),
        department: response.department,
        'anti_social_behavior_awareness': awareness?.antiSocialBehavior || '',
        'anti_discrimination_awareness': awareness?.antiDiscrimination || '',
        'sexual_harassment_awareness': awareness?.sexualHarassment || '',
        'safeguarding_awareness': awareness?.safeguarding || '',
        'hr_policy_manual_awareness': awareness?.hrPolicyManual || '',
        'code_of_conduct_awareness': awareness?.codeOfConduct || '',
        'finance_wellness_awareness': awareness?.financeWellness || '',
        'work_life_balance_awareness': awareness?.workLifeBalance || '',
        'digital_workplace_awareness': awareness?.digitalWorkplace || '',
        'soft_skills_awareness': awareness?.softSkills || '',
        'professionalism_awareness': awareness?.professionalism || '',
        urgent_trainings: JSON.parse(response.urgentTrainings).join('; '),
        urgent_trainings_other: response.urgentTrainingsOther || '',
        finance_wellness_needs: JSON.parse(response.financeWellnessNeeds).join('; '),
        culture_wellness_needs: JSON.parse(response.cultureWellnessNeeds).join('; '),
        culture_wellness_other: response.cultureWellnessOther || '',
        digital_skills_needs: JSON.parse(response.digitalSkillsNeeds).join('; '),
        digital_skills_other: response.digitalSkillsOther || '',
        professional_dev_needs: JSON.parse(response.professionalDevNeeds).join('; '),
        professional_dev_other: response.professionalDevOther || '',
        confidence_level: response.confidenceLevel,
        faced_unsure_situation: response.facedUnsureSituation,
        unsure_situation_description: response.unsureSituationDescription || '',
        observed_issues: JSON.parse(response.observedIssues).join('; '),
        observed_issues_other: response.observedIssuesOther || '',
        knew_reporting_channel: response.knewReportingChannel,
        training_method: response.trainingMethod,
        training_method_other: response.trainingMethodOther || '',
        refresher_frequency: response.refresherFrequency,
        prioritized_policies: response.prioritizedPolicies || '',
        prioritization_reason: response.prioritizationReason || '',
        policy_challenges: response.policyChallenges || '',
        compliance_suggestions: response.complianceSuggestions || '',
        general_comments: response.generalComments || ''
      }
    })

    // Generate CSV content in memory
    const headers = [
      'ID', 'Timestamp', 'Department', 'Anti-Social Behavior Awareness', 'Anti-Discrimination Awareness',
      'Sexual Harassment Awareness', 'Safeguarding Awareness', 'HR Policy Manual Awareness',
      'Code of Conduct Awareness', 'Finance Wellness Awareness', 'Work-Life Balance Awareness',
      'Digital Workplace Awareness', 'Soft Skills Awareness', 'Professionalism Awareness',
      'Urgent Trainings', 'Urgent Trainings Other', 'Finance Wellness Needs', 'Culture Wellness Needs',
      'Culture Wellness Other', 'Digital Skills Needs', 'Digital Skills Other',
      'Professional Development Needs', 'Professional Development Other', 'Confidence Level',
      'Faced Unsure Situation', 'Unsure Situation Description', 'Observed Issues', 'Observed Issues Other',
      'Knew Reporting Channel', 'Training Method', 'Training Method Other', 'Refresher Frequency',
      'Prioritized Policies', 'Prioritization Reason', 'Policy Challenges', 'Compliance Suggestions',
      'General Comments'
    ]

    // Escape CSV values
    const escapeCsvValue = (value: any) => {
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    // Generate CSV content
    const csvRows = [headers.join(',')]
    csvData.forEach(row => {
      const values = [
        escapeCsvValue(row.id),
        escapeCsvValue(row.timestamp),
        escapeCsvValue(row.department),
        escapeCsvValue(row.anti_social_behavior_awareness),
        escapeCsvValue(row.anti_discrimination_awareness),
        escapeCsvValue(row.sexual_harassment_awareness),
        escapeCsvValue(row.safeguarding_awareness),
        escapeCsvValue(row.hr_policy_manual_awareness),
        escapeCsvValue(row.code_of_conduct_awareness),
        escapeCsvValue(row.finance_wellness_awareness),
        escapeCsvValue(row.work_life_balance_awareness),
        escapeCsvValue(row.digital_workplace_awareness),
        escapeCsvValue(row.soft_skills_awareness),
        escapeCsvValue(row.professionalism_awareness),
        escapeCsvValue(row.urgent_trainings),
        escapeCsvValue(row.urgent_trainings_other),
        escapeCsvValue(row.finance_wellness_needs),
        escapeCsvValue(row.culture_wellness_needs),
        escapeCsvValue(row.culture_wellness_other),
        escapeCsvValue(row.digital_skills_needs),
        escapeCsvValue(row.digital_skills_other),
        escapeCsvValue(row.professional_dev_needs),
        escapeCsvValue(row.professional_dev_other),
        escapeCsvValue(row.confidence_level),
        escapeCsvValue(row.faced_unsure_situation),
        escapeCsvValue(row.unsure_situation_description),
        escapeCsvValue(row.observed_issues),
        escapeCsvValue(row.observed_issues_other),
        escapeCsvValue(row.knew_reporting_channel),
        escapeCsvValue(row.training_method),
        escapeCsvValue(row.training_method_other),
        escapeCsvValue(row.refresher_frequency),
        escapeCsvValue(row.prioritized_policies),
        escapeCsvValue(row.prioritization_reason),
        escapeCsvValue(row.policy_challenges),
        escapeCsvValue(row.compliance_suggestions),
        escapeCsvValue(row.general_comments)
      ]
      csvRows.push(values.join(','))
    })

    const csvContent = csvRows.join('\n')
    console.log(`Export API: Generated CSV with ${csvRows.length} rows`)

    console.log(`Admin ${payload.username} exported ${responses.length} responses`)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="survey_responses.csv"')
    return res.status(200).send(csvContent)

  } catch (error) {
    console.error('Export API: Unexpected error:', error)
    console.error('Export API: Error details:', JSON.stringify(error, null, 2))
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to export responses',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
