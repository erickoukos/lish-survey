"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../src/lib/prisma");
const auth_1 = require("../src/lib/auth");
const cors_1 = require("../src/lib/cors");
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
}
