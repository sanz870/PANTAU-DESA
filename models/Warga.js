const mongoose = require('mongoose');

const WargaSchema = new mongoose.Schema({
    nama: { type: String, required: true },
    gender: { type: String, required: true },
    usia: { type: Number, required: true },
    timestamp: { type: Number, default: Date.now }
});

module.exports = mongoose.model('Warga', WargaSchema);