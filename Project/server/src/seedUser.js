// Project/server/src/seedUser.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

async function run() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cs418projectv2';

  const email = process.env.SEED_USER_EMAIL || 'student1@example.com';
  const password = process.env.SEED_USER_PASSWORD || 'password123';

  await mongoose.connect(mongoUri);

  const passwordHash = await bcrypt.hash(password, 12);

  // upsert so you can run this multiple times
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      email: email.toLowerCase(),
      passwordHash,
      isVerified: true,      // <— skip email
      roles: ['user'],
      verifyToken: null,
    },
    { new: true, upsert: true }
  );

  console.log('Seeded user:');
  console.log('  email:', email);
  console.log('  password:', password);
  console.log('  id:', user._id.toString());

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
