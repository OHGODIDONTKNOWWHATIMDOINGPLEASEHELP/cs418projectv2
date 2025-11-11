import 'dotenv/config';
import mongoose from 'mongoose';
import Course from './models/Course.js';

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cs418projectv2';
  await mongoose.connect(uri);

  const initial = [
    {
      code: 'CS418',
      title: 'Interactive Computer Graphics',
      level: 'Undergraduate',
      credits: 3,
      termOffered: ['Fall 2024', 'Spring 2025'],
      prerequisites: ['CS225']
    },
    {
      code: 'CS440',
      title: 'Artificial Intelligence',
      level: 'Undergraduate',
      credits: 3,
      termOffered: ['Fall 2024'],
      prerequisites: ['CS374']
    },
    {
      code: 'CS450',
      title: 'Numerical Analysis',
      level: 'Undergraduate',
      credits: 3,
      termOffered: ['Spring 2025'],
      prerequisites: []
    }
  ];

  for (const c of initial) {
    await Course.updateOne({ code: c.code }, { $set: c }, { upsert: true });
  }

  console.log('Seeded courses:', initial.map(c => c.code));
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
