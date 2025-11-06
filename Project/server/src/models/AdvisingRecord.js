import mongoose from 'mongoose';

const CourseRowSchema = new mongoose.Schema({
  level: { type: String, required: true },       // e.g. '400', 'Graduate'
  courseName: { type: String, required: true },  // e.g. 'CS418'
}, { _id: false });

const AdvisingRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentEmail: { type: String, required: true },

  // header
  lastTerm: { type: String, required: true },     // e.g. 'Fall 2024'
  lastGpa: { type: Number, required: true },
  currentTerm: { type: String, required: true },  // e.g. 'Spring 2025'

  // course plan rows
  courses: { type: [CourseRowSchema], default: [] },

  // status
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },

  // for history display
  submittedAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

export default mongoose.model('AdvisingRecord', AdvisingRecordSchema);
