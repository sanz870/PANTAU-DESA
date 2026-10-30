const mongoose = require('mongoose');
const PelayananSchema = new mongoose.Schema({
    nama: String,
    nohp: String,
    jenis: String,
    keperluan: String,
    tanggal: String,
    timestamp: { type: Number, default: Date.now }
});
module.exports = mongoose.model('Pelayanan', PelayananSchema);