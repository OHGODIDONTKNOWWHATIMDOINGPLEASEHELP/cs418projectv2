import mongoose from 'mongoose';

const CourseRowSchema = new mongoose.Schema(
  {
    level: { type: String, default: '' },       // e.g. "Undergraduate"
    courseName: { type: String, default: '' },  // e.g. "CS418"
  },
  { _id: false }
);

const AdvisingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // header section
    lastTerm: { type: String, default: '' },    // e.g. "Fall 2024"
    lastGpa: { type: String, default: '' },     // keep string to avoid float issues
    currentTerm: { type: String, default: '' }, // e.g. "Spring 2025"

    // course plan section
    courses: { type: [CourseRowSchema], default: [] },

    // status workflow
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Advising', AdvisingSchema);
