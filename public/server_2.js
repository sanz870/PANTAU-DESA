const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Warga = require('./models/Warga');
const Pelayanan = require('./models/Pelayanan');
const Aduan = require('./models/Aduan');
const Kegiatan = require('./models/Kegiatan');
const Memorial = require('./models/Memorial');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Berhasil terhubung ke Database MongoDB Atlas!'))
  .catch((err) => console.error('❌ Gagal terhubung ke Database:', err));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { nama, noHp, password, role } = req.body;
        if (!nama || !noHp || !password) return res.status(400).json({ message: 'Semua kolom wajib diisi!' });
        const existingUser = await User.findOne({ noHp });
        if (existingUser) return res.status(400).json({ message: 'Nomor HP sudah terdaftar!' });

        const newUser = new User({ nama, noHp, password, role: role || 'warga' });
        await newUser.save();
        res.status(201).json({ message: 'Pendaftaran berhasil!' });
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan server: ' + error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { noHp, password } = req.body;
        if (!noHp || !password) return res.status(400).json({ message: 'Nomor HP dan password wajib diisi!' });
        const user = await User.findOne({ noHp });
        if (!user || user.password !== password) return res.status(400).json({ message: 'Nomor HP atau password salah!' });

        res.status(200).json({ message: 'Login berhasil!', role: user.role, nama: user.nama });
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan server.' });
    }
});

app.post('/api/warga', async (req, res) => {
    try {
        const { nik, nama, noKk, jenisKelamin, tanggalLahir, alamat } = req.body;
        const wargaAda = await Warga.findOne({ nik });
        if (wargaAda) return res.status(400).json({ pesan: "NIK sudah terdaftar!" });

        const wargaBaru = new Warga({ nik, nama, noKk, jenisKelamin, tanggalLahir, alamat });
        await wargaBaru.save();
        res.status(201).json({ pesan: "Data warga berhasil ditambahkan!", data: wargaBaru });
    } catch (error) {
        res.status(500).json({ pesan: "Gagal menyimpan data warga", error: error.message });
    }
});

app.get('/api/warga/statistik', async (req, res) => {
    try {
        const totalWarga = await Warga.countDocuments();
        const lakiLaki = await Warga.countDocuments({ jenisKelamin: 'Laki-laki' });
        const perempuan = await Warga.countDocuments({ jenisKelamin: 'Perempuan' });
        const daftarKK = await Warga.distinct('nokk');
        res.json({ totalWarga, jumlahKK: daftarKK.length, lakilaki: lakiLaki, perempuan });
    } catch (error) {
        res.status(500).json({ pesan: "Gagal mengambil statistik", error: error.message });
    }
});

app.get('/api/pelayanan', async (req, res) => {
    try { const data = await Pelayanan.find().sort({ timestamp: -1 }); res.json(data); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/pelayanan', async (req, res) => {
    try { const baru = new Pelayanan(req.body); await baru.save(); res.status(201).json(baru); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/aduan', async (req, res) => {
    try { const data = await Aduan.find().sort({ timestamp: -1 }); res.json(data); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/aduan', async (req, res) => {
    try { const baru = new Aduan(req.body); await baru.save(); res.status(201).json(baru); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/kegiatan', async (req, res) => {
    try { const data = await Kegiatan.find().sort({ timestamp: -1 }); res.json(data); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/kegiatan', async (req, res) => {
    try { const baru = new Kegiatan(req.body); await baru.save(); res.status(201).json(baru); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/memorial', async (req, res) => {
    try { const data = await Memorial.find().sort({ timestamp: -1 }); res.json(data); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/memorial', async (req, res) => {
    try { const baru = new Memorial(req.body); await baru.save(); res.status(201).json(baru); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server berjalan di port ${PORT}`));