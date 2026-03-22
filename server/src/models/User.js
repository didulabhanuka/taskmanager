const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Generate avatar initials and hash password before saving
// Generate avatar initials and hash password before saving
userSchema.pre('save', async function () {
  if (this.isModified('name') || this.isNew) {
    this.avatar = this.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  if (this.isModified('passwordHash')) {
    // Use 1 round in test env — 12 rounds is too slow for tests
    const bcryptRounds = process.env.NODE_ENV === 'test' ? 1 : 12;
    this.passwordHash = await bcrypt.hash(this.passwordHash, bcryptRounds);
  }
});
// Compare entered password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Strip passwordHash from any API response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);