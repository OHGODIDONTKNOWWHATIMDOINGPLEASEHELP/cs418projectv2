import mongoose from 'mongoose';

const advisingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastTerm: { type: String, default: '' },
  lastGpa:   { type: String, default: '' },
  currentTerm: { type: String, default: '' },
  courses: {
    type: [{ level: String, courseName: String }],
    default: [],
  },
  lastTermCourses: { type: [String], default: [] },
  status: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
  adminFeedback: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Advising', advisingSchema);
