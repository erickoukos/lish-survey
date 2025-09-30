import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = 'LishAdmin2025!' // Strong default password
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const adminUser = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@lishailabs.com',
      passwordHash: hashedPassword,
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true
    }
  })

  console.log('✅ Admin user created:', {
    id: adminUser.id,
    username: adminUser.username,
    email: adminUser.email,
    fullName: adminUser.fullName,
    role: adminUser.role
  })

  // Create default survey configuration if it doesn't exist
  const surveyConfig = await prisma.surveyConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      title: 'Policy Awareness Survey',
      description: 'LISH AI LABS Policy Awareness & Training Needs Survey'
    }
  })

  console.log('✅ Survey configuration created:', {
    id: surveyConfig.id,
    isActive: surveyConfig.isActive,
    title: surveyConfig.title
  })

  console.log('🎉 Database seeding completed successfully!')
  console.log('📧 Admin credentials:')
  console.log('   Username: admin')
  console.log('   Password: LishAdmin2025!')
  console.log('   Email: admin@lishailabs.com')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })