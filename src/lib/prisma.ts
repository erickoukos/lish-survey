import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use the most appropriate database URL
const databaseUrl = process.env.DATABASE_URL || 
                   process.env.POSTGRES_PRISMA_URL || 
                   process.env.POSTGRES_URL || 
                   process.env.POSTGRES_URL_NON_POOLING

console.log('Database URL source:', {
  DATABASE_URL: !!process.env.DATABASE_URL,
  POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
  POSTGRES_URL: !!process.env.POSTGRES_URL,
  POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
  selected: databaseUrl ? 'Found' : 'None'
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: ['query', 'info', 'warn', 'error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
