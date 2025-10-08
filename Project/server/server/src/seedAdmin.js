import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!email) throw new Error('ADMIN_EMAIL not set');
  let admin = await User.findOne({ email });
  if (admin) {
    console.log('Admin already exists:', email);
  } else {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMeNow123!', 12);
    admin = await User.create({
      email, passwordHash, isVerified: true, roles: ['admin', 'user'],
      givenName: 'Admin', familyName: 'User'
    });
    console.log('Admin created:', email);
  }
  await mongoose.disconnect();
};
run();
