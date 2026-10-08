const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Explicitly ensure unique index on email
userSchema.index({ email: 1 }, { unique: true });

// Pre-save hook for password hashing (only if password is modified)
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password against hash
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Gracefully handle index errors (e.g. if duplicate emails already exist in database)
User.on('index', (err) => {
    if (err) {
        console.warn('⚠️ Warning: Failed to build unique index on User.email:', err.message);
    }
});

module.exports = User;