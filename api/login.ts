import { VercelRequest, VercelResponse } from '@vercel/node'
import { generateToken } from '../src/lib/auth'
import { loginSchema } from '../src/lib/validation'
import { handleCors } from '../src/lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return

  // Set CORS headers
  Object.entries(handleCors(req, res) ? {} : {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }).forEach(([key, value]) => res.setHeader(key, value))

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      })
    }

    const { username, password } = validationResult.data

    // Check credentials (in production, use proper user management)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'lish2025'

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      })
    }

    // Generate JWT token
    const token = generateToken({
      userId: 'admin',
      username: adminUsername
    })

    console.log(`Admin login successful: ${username}`)

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: 'admin',
        username: adminUsername
      }
    })

  } catch (error) {
    console.error('Error during login:', error)
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Login failed'
    })
  }
}
