const mongoose = require('mongoose');
const MemorialSchema = new mongoose.Schema({
    nama: String,
    waktu: String,
    timestamp: { type: Number, default: Date.now }
});
module.exports = mongoose.model('Memorial', MemorialSchema);