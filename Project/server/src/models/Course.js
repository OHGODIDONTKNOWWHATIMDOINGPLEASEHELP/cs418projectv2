import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },  // e.g. "CS418"
  title: { type: String, required: true },                // e.g. "Interactive Computer Graphics"
  level: { type: String, default: 'Undergraduate' },      // or "Graduate"
  credits: { type: Number, default: 3 },
  termOffered: { type: [String], default: [] },           // e.g. ["Fall 2024", "Spring 2025"]
  prerequisites: { type: [String], default: [] },         // e.g. ["CS225"]
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Course', CourseSchema);
