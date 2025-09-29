"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../src/lib/prisma");
const validation_1 = require("../src/lib/validation");
const rateLimiter_1 = require("../src/lib/rateLimiter");
const cors_1 = require("../src/lib/cors");
async function handler(req, res) {
    // Handle CORS
    if ((0, cors_1.handleCors)(req, res))
        return;
    // Set CORS headers
    Object.entries((0, cors_1.handleCors)(req, res) ? {} : {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }).forEach(([key, value]) => res.setHeader(key, value));
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        // Rate limiting
        const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
        const rateLimitPassed = await (0, rateLimiter_1.checkRateLimit)(`submit:${clientIP}`);
        if (!rateLimitPassed) {
            return res.status(429).json({
                error: 'Too many requests. Please try again later.'
            });
        }
        // Validate request body
        const validationResult = validation_1.surveyResponseSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Invalid request data',
                details: validationResult.error.errors
            });
        }
        const data = validationResult.data;
        // Create survey response
        const response = await prisma_1.prisma.surveyResponse.create({
            data: {
                department: data.department,
                awareness: JSON.stringify(data.awareness),
                urgentTrainings: JSON.stringify(data.urgentTrainings),
                urgentTrainingsOther: data.urgentTrainingsOther,
                financeWellnessNeeds: JSON.stringify(data.financeWellnessNeeds || []),
                cultureWellnessNeeds: JSON.stringify(data.cultureWellnessNeeds || []),
                cultureWellnessOther: data.cultureWellnessOther,
                digitalSkillsNeeds: JSON.stringify(data.digitalSkillsNeeds || []),
                digitalSkillsOther: data.digitalSkillsOther,
                professionalDevNeeds: JSON.stringify(data.professionalDevNeeds || []),
                professionalDevOther: data.professionalDevOther,
                confidenceLevel: data.confidenceLevel,
                facedUnsureSituation: data.facedUnsureSituation,
                unsureSituationDescription: data.unsureSituationDescription,
                observedIssues: JSON.stringify(data.observedIssues || []),
                observedIssuesOther: data.observedIssuesOther,
                knewReportingChannel: data.knewReportingChannel,
                trainingMethod: data.trainingMethod,
                trainingMethodOther: data.trainingMethodOther,
                refresherFrequency: data.refresherFrequency,
                prioritizedPolicies: data.prioritizedPolicies || '',
                prioritizationReason: data.prioritizationReason || '',
                policyChallenges: data.policyChallenges || '',
                complianceSuggestions: data.complianceSuggestions || '',
                generalComments: data.generalComments || ''
            }
        });
        console.log(`Survey response submitted: ${response.id}`);
        return res.status(201).json({
            success: true,
            id: response.id,
            message: 'Survey response submitted successfully'
        });
    }
    catch (error) {
        console.error('Error submitting survey response:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to submit survey response'
        });
    }
}
