import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { verifyToken } from '../src/lib/auth'
import { handleCors } from '../src/lib/cors'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createAdminUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
  role: z.string().default('admin')
})

const updateAdminUserSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().min(2).max(100).optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return

  // Set CORS headers
  Object.entries(handleCors(req, res) ? {} : {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }).forEach(([key, value]) => res.setHeader(key, value))

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Check authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload || payload.role !== 'admin') {
      return res.status(401).json({ error: 'Admin access required' })
    }

    if (req.method === 'GET') {
      // Get all admin users
      const users = await prisma.adminUser.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return res.status(200).json({
        success: true,
        users
      })
    }

    if (req.method === 'POST') {
      // Create new admin user
      const validationResult = createAdminUserSchema.safeParse(req.body)
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.errors
        })
      }

      const { username, email, password, fullName, role } = validationResult.data

      // Check if username or email already exists
      const existingUser = await prisma.adminUser.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      })

      if (existingUser) {
        return res.status(400).json({
          error: 'User already exists',
          message: 'Username or email already in use'
        })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12)

      // Create user
      const user = await prisma.adminUser.create({
        data: {
          username,
          email,
          passwordHash,
          fullName,
          role,
          isActive: true
        },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      })

      console.log(`Admin user created: ${username} by ${payload.username}`)

      return res.status(201).json({
        success: true,
        user,
        message: 'Admin user created successfully'
      })
    }

    if (req.method === 'PUT') {
      // Update admin user
      const { id } = req.query
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'User ID is required' })
      }

      const validationResult = updateAdminUserSchema.safeParse(req.body)
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.errors
        })
      }

      const updateData = validationResult.data

      // Check if user exists
      const existingUser = await prisma.adminUser.findUnique({
        where: { id }
      })

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Update user
      const user = await prisma.adminUser.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          updatedAt: true
        }
      })

      console.log(`Admin user updated: ${user.username} by ${payload.username}`)

      return res.status(200).json({
        success: true,
        user,
        message: 'Admin user updated successfully'
      })
    }

    if (req.method === 'DELETE') {
      // Deactivate admin user (soft delete)
      const { id } = req.query
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'User ID is required' })
      }

      // Check if user exists
      const existingUser = await prisma.adminUser.findUnique({
        where: { id }
      })

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Prevent deleting the main admin user
      if (existingUser.username === 'admin') {
        return res.status(400).json({
          error: 'Cannot deactivate main admin user'
        })
      }

      // Deactivate user
      await prisma.adminUser.update({
        where: { id },
        data: { isActive: false }
      })

      console.log(`Admin user deactivated: ${existingUser.username} by ${payload.username}`)

      return res.status(200).json({
        success: true,
        message: 'Admin user deactivated successfully'
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Error in admin-users API:', error)
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process admin user request'
    })
  }
}
