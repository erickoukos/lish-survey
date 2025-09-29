"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../src/lib/prisma");
const auth_1 = require("../src/lib/auth");
const cors_1 = require("../src/lib/cors");
const csv_writer_1 = require("csv-writer");
async function handler(req, res) {
    // Handle CORS
    if ((0, cors_1.handleCors)(req, res))
        return;
    // Set CORS headers
    Object.entries((0, cors_1.handleCors)(req, res) ? {} : {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }).forEach(([key, value]) => res.setHeader(key, value));
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        // Check authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const token = authHeader.substring(7);
        const payload = (0, auth_1.verifyToken)(token);
        if (!payload) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Get all responses
        const responses = await prisma_1.prisma.surveyResponse.findMany({
            orderBy: { createdAt: 'desc' }
        });
        // Transform data for CSV
        const csvData = responses.map(response => {
            const awareness = response.awareness;
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
            };
        });
        // Create CSV
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: '/tmp/survey_responses.csv',
            header: [
                { id: 'id', title: 'ID' },
                { id: 'timestamp', title: 'Timestamp' },
                { id: 'department', title: 'Department' },
                { id: 'anti_social_behavior_awareness', title: 'Anti-Social Behavior Awareness' },
                { id: 'anti_discrimination_awareness', title: 'Anti-Discrimination Awareness' },
                { id: 'sexual_harassment_awareness', title: 'Sexual Harassment Awareness' },
                { id: 'safeguarding_awareness', title: 'Safeguarding Awareness' },
                { id: 'hr_policy_manual_awareness', title: 'HR Policy Manual Awareness' },
                { id: 'code_of_conduct_awareness', title: 'Code of Conduct Awareness' },
                { id: 'finance_wellness_awareness', title: 'Finance Wellness Awareness' },
                { id: 'work_life_balance_awareness', title: 'Work-Life Balance Awareness' },
                { id: 'digital_workplace_awareness', title: 'Digital Workplace Awareness' },
                { id: 'soft_skills_awareness', title: 'Soft Skills Awareness' },
                { id: 'professionalism_awareness', title: 'Professionalism Awareness' },
                { id: 'urgent_trainings', title: 'Urgent Trainings' },
                { id: 'urgent_trainings_other', title: 'Urgent Trainings Other' },
                { id: 'finance_wellness_needs', title: 'Finance Wellness Needs' },
                { id: 'culture_wellness_needs', title: 'Culture Wellness Needs' },
                { id: 'culture_wellness_other', title: 'Culture Wellness Other' },
                { id: 'digital_skills_needs', title: 'Digital Skills Needs' },
                { id: 'digital_skills_other', title: 'Digital Skills Other' },
                { id: 'professional_dev_needs', title: 'Professional Development Needs' },
                { id: 'professional_dev_other', title: 'Professional Development Other' },
                { id: 'confidence_level', title: 'Confidence Level' },
                { id: 'faced_unsure_situation', title: 'Faced Unsure Situation' },
                { id: 'unsure_situation_description', title: 'Unsure Situation Description' },
                { id: 'observed_issues', title: 'Observed Issues' },
                { id: 'observed_issues_other', title: 'Observed Issues Other' },
                { id: 'knew_reporting_channel', title: 'Knew Reporting Channel' },
                { id: 'training_method', title: 'Training Method' },
                { id: 'training_method_other', title: 'Training Method Other' },
                { id: 'refresher_frequency', title: 'Refresher Frequency' },
                { id: 'prioritized_policies', title: 'Prioritized Policies' },
                { id: 'prioritization_reason', title: 'Prioritization Reason' },
                { id: 'policy_challenges', title: 'Policy Challenges' },
                { id: 'compliance_suggestions', title: 'Compliance Suggestions' },
                { id: 'general_comments', title: 'General Comments' }
            ]
        });
        await csvWriter.writeRecords(csvData);
        // Read the CSV file and send as response
        const fs = require('fs');
        const csvContent = fs.readFileSync('/tmp/survey_responses.csv', 'utf8');
        console.log(`Admin ${payload.username} exported ${responses.length} responses`);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="survey_responses.csv"');
        return res.status(200).send(csvContent);
    }
    catch (error) {
        console.error('Error exporting responses:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to export responses'
        });
    }
}
