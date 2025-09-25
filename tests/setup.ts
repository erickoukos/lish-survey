// Test setup file
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

beforeAll(async () => {
  // Setup test database if needed
  console.log('Setting up test environment...')
})

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect()
  console.log('Test environment cleaned up')
})

// Global test timeout
jest.setTimeout(10000)
