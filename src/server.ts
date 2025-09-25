import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { prisma } from './lib/prisma'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API Routes
app.post('/api/submit', async (req, res) => {
  try {
    const { VercelRequest, VercelResponse } = await import('@vercel/node')
    
    // Create mock Vercel request/response objects
    const vercelReq = {
      ...req,
      headers: req.headers,
      method: req.method,
      body: req.body,
      query: req.query
    } as VercelRequest

    const vercelRes = {
      ...res,
      status: (code: number) => ({ ...res, statusCode: code }),
      json: (data: any) => res.json(data),
      setHeader: (name: string, value: string) => res.setHeader(name, value),
      end: (data?: any) => res.end(data)
    } as VercelResponse

    // Import and call the actual handler
    const handler = await import('../api/submit')
    return handler.default(vercelReq, vercelRes)
  } catch (error) {
    console.error('Error in submit handler:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { VercelRequest, VercelResponse } = await import('@vercel/node')
    
    const vercelReq = {
      ...req,
      headers: req.headers,
      method: req.method,
      body: req.body,
      query: req.query
    } as VercelRequest

    const vercelRes = {
      ...res,
      status: (code: number) => ({ ...res, statusCode: code }),
      json: (data: any) => res.json(data),
      setHeader: (name: string, value: string) => res.setHeader(name, value),
      end: (data?: any) => res.end(data)
    } as VercelResponse

    const handler = await import('../api/login')
    return handler.default(vercelReq, vercelRes)
  } catch (error) {
    console.error('Error in login handler:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/responses', async (req, res) => {
  try {
    const { VercelRequest, VercelResponse } = await import('@vercel/node')
    
    const vercelReq = {
      ...req,
      headers: req.headers,
      method: req.method,
      body: req.body,
      query: req.query
    } as VercelRequest

    const vercelRes = {
      ...res,
      status: (code: number) => ({ ...res, statusCode: code }),
      json: (data: any) => res.json(data),
      setHeader: (name: string, value: string) => res.setHeader(name, value),
      end: (data?: any) => res.end(data)
    } as VercelResponse

    const handler = await import('../api/responses')
    return handler.default(vercelReq, vercelRes)
  } catch (error) {
    console.error('Error in responses handler:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/export', async (req, res) => {
  try {
    const { VercelRequest, VercelResponse } = await import('@vercel/node')
    
    const vercelReq = {
      ...req,
      headers: req.headers,
      method: req.method,
      body: req.body,
      query: req.query
    } as VercelRequest

    const vercelRes = {
      ...res,
      status: (code: number) => ({ ...res, statusCode: code }),
      json: (data: any) => res.json(data),
      setHeader: (name: string, value: string) => res.setHeader(name, value),
      end: (data?: any) => res.end(data)
    } as VercelResponse

    const handler = await import('../api/export')
    return handler.default(vercelReq, vercelRes)
  } catch (error) {
    console.error('Error in export handler:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
