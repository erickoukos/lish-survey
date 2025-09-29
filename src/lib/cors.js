"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCors = exports.corsHeaders = void 0;
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://localhost:3000'
];
exports.corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
};
const handleCors = (req, res) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', exports.corsHeaders['Access-Control-Allow-Methods']);
    res.setHeader('Access-Control-Allow-Headers', exports.corsHeaders['Access-Control-Allow-Headers']);
    res.setHeader('Access-Control-Max-Age', exports.corsHeaders['Access-Control-Max-Age']);
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    return false;
};
exports.handleCors = handleCors;
