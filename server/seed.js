import bcrypt from 'bcryptjs';
import prisma from './config/database.js';

async function seedSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingSuperAdmin) {
      console.log('Super Admin already exists');
      return;
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);
    
    const superAdmin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        role: 'SUPER_ADMIN'

      }
    });

    console.log('Super Admin created successfully:');
    
  } catch (error) {
    console.error('Error seeding super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();