import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

async function run() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cs418projectv2';
  const email = (process.env.ADMIN_EMAIL || 'superadmin@ms1.com').toLowerCase();
  const plain = process.env.ADMIN_PASSWORD || 'beans177';

  if (!email || !plain) {
    console.error('ADMIN_EMAIL / ADMIN_PASSWORD missing in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  const passwordHash = await bcrypt.hash(plain, 12);

  let user = await User.findOne({ email });
  if (user) {
    // update existing user into a verified admin
    user.passwordHash = passwordHash;
    user.isVerified = true;
    user.roles = Array.from(new Set([...(user.roles || []), 'admin', 'user']));
    user.verifyToken = null;
    user.verifyTokenExp = null;
    await user.save();
    console.log(`Updated admin: ${email}`);
  } else {
    // create fresh admin
    user = await User.create({
      email,
      passwordHash,
      isVerified: true,
      roles: ['admin', 'user'],
      givenName: 'Super',
      familyName: 'Admin'
    });
    console.log(`Created admin: ${email}`);
  }

  console.log('Login password set to:', plain);
  await mongoose.disconnect();
}
run().catch(err => {
  console.error('seedAdmin error:', err);
  process.exit(1);
});
