const mongoose = require('mongoose');

const wargaSchema = new mongoose.Schema({
    nik: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    noKk: { type: String, required: true },
    jenisKelamin: { type: String, enum: ['Laki-laki', 'Perempuan'], required: true },
    tanggalLahir: { type: Date, required: true },
    alamat: { type: String, required: true },
    rt: { type: String, default: '009' },
    rw: { type: String, default: '017' },
    statusLayanan: { type: String, default: 'Aktif' }
}, { timestamps: true });

module.exports = mongoose.model('Warga', wargaSchema);