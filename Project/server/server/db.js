import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
export default prisma;

// Seed a single admin if invoked with "seed"
if (process.argv[2] === 'seed') {
  const email = process.env.ADMIN_EMAIL;
  const pass  = process.env.ADMIN_PASSWORD;
  if (!email || !pass) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    process.exit(1);
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const hash = await bcrypt.hash(pass, 12);
    await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: 'ADMIN',
        emailVerifiedAt: new Date()
      }
    });
    console.log('Admin created:', email);
  } else {
    console.log('Admin already exists.');
  }
  process.exit(0);
}
