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
      // Try to find admin user in database
      const adminUser = await prisma.adminUser.findUnique({
        where: { username }
      })

      if (adminUser) {
        // Database authentication
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
      } else {
        // Fallback to environment variables for initial setup
        console.log('No admin user found in database, using fallback authentication')
        
        const fallbackUsername = process.env.ADMIN_USERNAME || 'admin'
        const fallbackPassword = process.env.ADMIN_PASSWORD || 'lish2025'

        if (username !== fallbackUsername || password !== fallbackPassword) {
          return res.status(401).json({
            error: 'Invalid credentials'
          })
        }

        // Generate JWT token for fallback user
        const token = generateToken({
          userId: 'fallback-admin',
          username: fallbackUsername,
          role: 'admin'
        })

        console.log(`Fallback admin login successful: ${username}`)

        return res.status(200).json({
          success: true,
          token,
          user: {
            id: 'fallback-admin',
            username: fallbackUsername,
            fullName: 'System Administrator',
            email: 'admin@lishailabs.com',
            role: 'admin'
          }
        })
      }

    } catch (dbError) {
      console.error('Database error during login, using fallback:', dbError)
      
      // Fallback to environment variables when database is not available
      const fallbackUsername = process.env.ADMIN_USERNAME || 'admin'
      const fallbackPassword = process.env.ADMIN_PASSWORD || 'lish2025'

      if (username !== fallbackUsername || password !== fallbackPassword) {
        return res.status(401).json({
          error: 'Invalid credentials'
        })
      }

      // Generate JWT token for fallback user
      const token = generateToken({
        userId: 'fallback-admin',
        username: fallbackUsername,
        role: 'admin'
      })

      console.log(`Fallback admin login successful: ${username}`)

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: 'fallback-admin',
          username: fallbackUsername,
          fullName: 'System Administrator',
          email: 'admin@lishailabs.com',
          role: 'admin'
        }
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
