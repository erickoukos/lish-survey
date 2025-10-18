const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function setupSecureAdmin() {
  try {
    console.log('🔐 Setting up secure admin user...')
    
    // Generate a strong random password
    const password = crypto.randomBytes(16).toString('hex')
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findFirst({
      where: { role: 'admin' }
    })
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Updating password...')
      await prisma.adminUser.update({
        where: { id: existingAdmin.id },
        data: {
          passwordHash: hashedPassword,
          isActive: true,
          updatedAt: new Date()
        }
      })
      console.log(`✅ Admin password updated successfully!`)
    } else {
      // Create new admin user
      await prisma.adminUser.create({
        data: {
          username: 'admin',
          passwordHash: hashedPassword,
          fullName: 'System Administrator',
          email: 'admin@lishailabs.com',
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`✅ Admin user created successfully!`)
    }
    
    console.log('\n🔑 IMPORTANT SECURITY INFORMATION:')
    console.log('=====================================')
    console.log(`Username: admin`)
    console.log(`Password: ${password}`)
    console.log('\n⚠️  PLEASE SAVE THIS PASSWORD SECURELY!')
    console.log('⚠️  This password will not be shown again.')
    console.log('⚠️  Store it in a secure password manager.')
    console.log('\n📝 You can now login to the admin panel with these credentials.')
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the setup
setupSecureAdmin()
