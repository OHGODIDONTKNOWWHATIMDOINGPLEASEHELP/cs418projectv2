import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true },
  givenName: { type: String, default: '' },
  familyName: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  roles: { type: [String], default: ['user'] }, // 'user' | 'admin'

  // email verification
  verifyToken: { type: String, default: null },
  verifyTokenExp: { type: Date, default: null },

  // password reset
  resetToken: { type: String, default: null },
  resetTokenExp: { type: Date, default: null },

  // 2FA (email-based OTP flow is simplest)
  twofa: {
    enabled: { type: Boolean, default: true },
    method: { type: String, default: 'email' }, // 'email'
    pendingCode: { type: String, default: null },
    pendingCodeExp: { type: Date, default: null }
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
