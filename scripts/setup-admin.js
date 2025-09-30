const { execSync } = require('child_process');

console.log('🚀 Setting up professional admin authentication...');

try {
  console.log('📊 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('🗄️ Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('🌱 Seeding admin users...');
  execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });

  console.log('✅ Professional admin authentication setup completed!');
  console.log('');
  console.log('🔐 Admin Credentials:');
  console.log('   Username: admin');
  console.log('   Password: LishAdmin2025!');
  console.log('   Email: admin@lishailabs.com');
  console.log('');
  console.log('🌐 Access URLs:');
  console.log('   Login: https://your-domain.vercel.app/login');
  console.log('   Dashboard: https://your-domain.vercel.app/emp-surv');
  console.log('');
  console.log('⚠️  Important: Change the default password after first login!');

} catch (error) {
  console.error('❌ Error during setup:', error.message);
  process.exit(1);
}
