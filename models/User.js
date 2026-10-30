
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
        trim: true
    },
    noHp: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['rt', 'warga'],
        default: 'warga'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports =
    mongoose.models.User ||
    mongoose.model('User', userSchema);
