"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const prisma_1 = require("./lib/prisma");
const validation_1 = require("./lib/validation");
const rateLimiter_1 = require("./lib/rateLimiter");
const auth_1 = require("./lib/auth");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// API Routes - Direct implementation for local testing
app.post('/api/submit', async (req, res) => {
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
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : 'Unknown'
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to submit survey response',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.post('/api/login', async (req, res) => {
    try {
        // Validate request body
        const validationResult = validation_1.loginSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Invalid request data',
                details: validationResult.error.errors
            });
        }
        const { username, password } = validationResult.data;
        // Check credentials (in production, use proper user management)
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'lish2025';
        if (username !== adminUsername || password !== adminPassword) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }
        // Generate JWT token
        const token = (0, auth_1.generateToken)({
            userId: 'admin',
            username: adminUsername
        });
        console.log(`Admin login successful: ${username}`);
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: 'admin',
                username: adminUsername
            }
        });
    }
    catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Login failed'
        });
    }
});
app.get('/api/responses', async (req, res) => {
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
        // Parse query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const department = req.query.department;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {};
        if (department && department !== 'all') {
            where.department = department;
        }
        // Get total count
        const totalCount = await prisma_1.prisma.surveyResponse.count({ where });
        // Get responses with pagination
        const responses = await prisma_1.prisma.surveyResponse.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });
        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        console.log(`Admin ${payload.username} accessed responses: page ${page}, ${responses.length} results`);
        return res.status(200).json({
            success: true,
            data: responses,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });
    }
    catch (error) {
        console.error('Error fetching responses:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch responses'
        });
    }
});
// Export CSV endpoint
app.get('/api/export', async (req, res) => {
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
            // Parse JSON strings for array fields
            const awareness = typeof response.awareness === 'string'
                ? JSON.parse(response.awareness)
                : response.awareness;
            const urgentTrainings = typeof response.urgentTrainings === 'string'
                ? JSON.parse(response.urgentTrainings)
                : response.urgentTrainings;
            const financeWellnessNeeds = typeof response.financeWellnessNeeds === 'string'
                ? JSON.parse(response.financeWellnessNeeds)
                : response.financeWellnessNeeds;
            const cultureWellnessNeeds = typeof response.cultureWellnessNeeds === 'string'
                ? JSON.parse(response.cultureWellnessNeeds)
                : response.cultureWellnessNeeds;
            const digitalSkillsNeeds = typeof response.digitalSkillsNeeds === 'string'
                ? JSON.parse(response.digitalSkillsNeeds)
                : response.digitalSkillsNeeds;
            const professionalDevNeeds = typeof response.professionalDevNeeds === 'string'
                ? JSON.parse(response.professionalDevNeeds)
                : response.professionalDevNeeds;
            const observedIssues = typeof response.observedIssues === 'string'
                ? JSON.parse(response.observedIssues)
                : response.observedIssues;
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
                urgent_trainings: Array.isArray(urgentTrainings) ? urgentTrainings.join('; ') : '',
                urgent_trainings_other: response.urgentTrainingsOther || '',
                finance_wellness_needs: Array.isArray(financeWellnessNeeds) ? financeWellnessNeeds.join('; ') : '',
                culture_wellness_needs: Array.isArray(cultureWellnessNeeds) ? cultureWellnessNeeds.join('; ') : '',
                culture_wellness_other: response.cultureWellnessOther || '',
                digital_skills_needs: Array.isArray(digitalSkillsNeeds) ? digitalSkillsNeeds.join('; ') : '',
                digital_skills_other: response.digitalSkillsOther || '',
                professional_dev_needs: Array.isArray(professionalDevNeeds) ? professionalDevNeeds.join('; ') : '',
                professional_dev_other: response.professionalDevOther || '',
                confidence_level: response.confidenceLevel,
                faced_unsure_situation: response.facedUnsureSituation,
                unsure_situation_description: response.unsureSituationDescription || '',
                observed_issues: Array.isArray(observedIssues) ? observedIssues.join('; ') : '',
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
        // Create CSV content manually (since we can't use csv-writer in local dev)
        const headers = [
            'ID', 'Timestamp', 'Department',
            'Anti-Social Behavior Awareness', 'Anti-Discrimination Awareness', 'Sexual Harassment Awareness',
            'Safeguarding Awareness', 'HR Policy Manual Awareness', 'Code of Conduct Awareness',
            'Finance Wellness Awareness', 'Work-Life Balance Awareness', 'Digital Workplace Awareness',
            'Soft Skills Awareness', 'Professionalism Awareness',
            'Urgent Trainings', 'Urgent Trainings Other',
            'Finance Wellness Needs', 'Culture Wellness Needs', 'Culture Wellness Other',
            'Digital Skills Needs', 'Digital Skills Other',
            'Professional Development Needs', 'Professional Development Other',
            'Confidence Level', 'Faced Unsure Situation', 'Unsure Situation Description',
            'Observed Issues', 'Observed Issues Other', 'Knew Reporting Channel',
            'Training Method', 'Training Method Other', 'Refresher Frequency',
            'Prioritized Policies', 'Prioritization Reason', 'Policy Challenges',
            'Compliance Suggestions', 'General Comments'
        ];
        // Escape CSV values
        const escapeCsvValue = (value) => {
            if (value === null || value === undefined)
                return '';
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
        // Create CSV content
        const csvRows = [
            headers.join(','),
            ...csvData.map(row => headers.map(header => {
                const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                const value = row[key];
                return escapeCsvValue(value);
            }).join(','))
        ];
        const csvContent = csvRows.join('\n');
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
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
