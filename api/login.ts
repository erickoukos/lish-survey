import { VercelRequest, VercelResponse } from '@vercel/node'
import { generateToken } from '../src/lib/auth'
import { loginSchema } from '../src/lib/validation'
import { handleCors } from '../src/lib/cors'
import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

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

    try {
      // Find admin user in database
      const adminUser = await prisma.adminUser.findUnique({
        where: { username }
      })

      if (!adminUser) {
        return res.status(401).json({
          error: 'Invalid credentials'
        })
      }

      // Check if user is active
      if (!adminUser.isActive) {
        return res.status(401).json({
          error: 'Account is deactivated'
        })
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash)
      
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid credentials'
        })
      }

      // Update last login time
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { lastLoginAt: new Date() }
      })

      // Generate JWT token
      const token = generateToken({
        userId: adminUser.id,
        username: adminUser.username,
        role: adminUser.role
      })

      console.log(`Admin login successful: ${username} (${adminUser.fullName})`)

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: adminUser.id,
          username: adminUser.username,
          fullName: adminUser.fullName,
          email: adminUser.email,
          role: adminUser.role
        }
      })

    } catch (dbError) {
      console.error('Database error during login:', dbError)
      return res.status(500).json({
        error: 'Database error',
        message: 'Unable to authenticate user'
      })
    }

  } catch (error) {
    console.error('Error during login:', error)
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Login failed'
    })
  }
}
