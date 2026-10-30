const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Warga = require('./models/Warga');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 1. Koneksi Database MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Berhasil terhubung ke Database MongoDB Atlas!'))
  .catch((err) => console.error('❌ Gagal terhubung ke Database:', err));

// ==========================================
// ENDPOINT: REGISTRASI WARGA / PENGGUNA
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nama, noHp, password, role } = req.body;

        // Validasi input kosong
        if (!nama || !noHp || !password) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi!' });
        }

        // Cek apakah nomor HP sudah terdaftar
        const existingUser = await User.findOne({ noHp });
        if (existingUser) {
            return res.status(400).json({ message: 'Nomor HP sudah terdaftar!' });
        }

        // Simpan user baru (menggunakan password teks biasa)
        const newUser = new User({
            nama,
            noHp,
            password,
            role: role || 'warga'
        });

        await newUser.save();
        res.status(201).json({ message: 'Pendaftaran berhasil!' });
    } catch (error) {
        console.error('Error saat register:', error);
        res.status(500).json({ message: 'Kesalahan pada server database: ' + error.message });
    }
});

// ==========================================
// ENDPOINT: LOGIN UTAMA (Warga & RT)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { noHp, password } = req.body;

        // Validasi jika input kosong
        if (!noHp || !password) {
            return res.status(400).json({ message: 'Nomor HP dan password wajib diisi!' });
        }

        // Cari user berdasarkan nomor HP di database Mongoose
        const user = await User.findOne({ noHp });
        if (!user) {
            return res.status(400).json({ message: 'Nomor HP tidak terdaftar!' });
        }

        // Periksa kesesuaian password (teks biasa)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Password salah!' });
        }

        // Jika berhasil login
        res.status(200).json({
            message: 'Login berhasil!',
            role: user.role,
            nama: user.nama
        });
    } catch (error) {
        console.error('Error saat login:', error);
        res.status(500).json({ message: 'Kesalahan pada server database.' });
    }
});

// ==========================================
// ENDPOINT: TAMBAH DATA WARGA BARU
// ==========================================
app.post('/api/warga', async (req, res) => {
    try {
        const { nik, nama, noKk, jenisKelamin, tanggalLahir, alamat } = req.body;

        const wargaAda = await Warga.findOne({ nik });
        if (wargaAda) {
            return res.status(400).json({ pesan: "NIK sudah terdaftar!" });
        }

        const wargaBaru = new Warga({
            nik, nama, noKk, jenisKelamin, tanggalLahir, alamat
        });

        await wargaBaru.save();
        res.status(201).json({ pesan: "Data warga berhasil ditambahkan!", data: wargaBaru });
    } catch (error) {
        res.status(500).json({ pesan: "Gagal menyimpan data warga", error: error.message });
    }
});

// ==========================================
// ENDPOINT: AMBIL STATISTIK DASHBOARD
// ==========================================
app.get('/api/warga/statistik', async (req, res) => {
    try {
        const totalWarga = await Warga.countDocuments();
        const lakiLaki = await Warga.countDocuments({ jenisKelamin: 'Laki-laki' });
        const perempuan = await Warga.countDocuments({ jenisKelamin: 'Perempuan' });
        const daftarKK = await Warga.distinct('nokk');

        res.json({
            totalWarga,
            jumlahKK: daftarKK.length,
            lakilaki: lakiLaki,
            perempuan
        });
    } catch (error) {
        res.status(500).json({ pesan: "Gagal mengambil statistik", error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});