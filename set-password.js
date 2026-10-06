const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'test_export@example.com' },
    update: { passwordHash: hash },
    create: { 
      email: 'test_export@example.com', 
      name: 'Test User', 
      passwordHash: hash, 
      profile: { create: { age: 25, weight: 70 } }, 
      subscription: { create: { plan: 'premium', status: 'active' } } 
    } 
  });
  
  console.log('✅ User updated successfully!');
  console.log('Email: test_export@example.com');
  console.log('Password: password123');
}

main().finally(() => prisma.$disconnect());
