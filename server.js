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

let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("Variabel lingkungan MONGO_URI belum diatur!");
        }
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
        });
        isConnected = true;
        console.log('✅ Berhasil terhubung ke Database MongoDB Atlas!');
    } catch (error) {
        console.error('❌ Gagal terhubung ke Database:', error.message);
        throw error;
    }
}

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({ 
            message: 'Kesalahan pada server database', 
            error: error.message 
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// ==========================================
// AUTHENTICATION
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nama, noHp, password, role } = req.body;
        const existingUser = await User.findOne({ noHp });
        if (existingUser) return res.status(400).json({ message: 'Nomor HP sudah terdaftar!' });

        const newUser = new User({ nama, noHp, password, role: role || 'warga' });
        await newUser.save();
        res.status(201).json({ message: 'Pendaftaran berhasil!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { noHp, password } = req.body;
        const user = await User.findOne({ noHp });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: 'Nomor HP atau password salah!' });
        }
        res.status(200).json({ message: 'Login berhasil!', role: user.role, nama: user.nama });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// API DATA WARGA (DIOPTIMASI UNTUK HP & PC)
// ==========================================
app.get('/api/warga', async (req, res) => {
    try {
        const data = await Warga.find().sort({ _id: -1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/warga', async (req, res) => {
    try {
        // Membersihkan dan memetakan data agar aman diterima dari perangkat seluler manapun
        const dataBersih = {
            nama: req.body.nama || "Tanpa Nama",
            gender: req.body.gender || req.body.jenisKelamin || "Laki-laki",
            usia: Number(req.body.usia) || 0,
            timestamp: req.body.timestamp || Date.now()
        };

        const baru = new Warga(dataBersih);
        await baru.save();
        res.status(201).json({ message: "Berhasil disimpan", data: baru });
    } catch (error) {
        console.error("Error simpan warga:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// API PELAYANAN SURAT
// ==========================================
app.get('/api/pelayanan', async (req, res) => {
    try {
        const data = await Pelayanan.find().sort({ timestamp: -1 });
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/pelayanan', async (req, res) => {
    try {
        const baru = new Pelayanan(req.body);
        await baru.save();
        res.status(201).json(baru);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// API ADUAN WARGA
// ==========================================
app.get('/api/aduan', async (req, res) => {
    try {
        const data = await Aduan.find().sort({ timestamp: -1 });
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/aduan', async (req, res) => {
    try {
        const baru = new Aduan(req.body);
        await baru.save();
        res.status(201).json(baru);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// API KEGIATAN RT
// ==========================================
app.get('/api/kegiatan', async (req, res) => {
    try {
        const data = await Kegiatan.find().sort({ timestamp: -1 });
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/kegiatan', async (req, res) => {
    try {
        const baru = new Kegiatan(req.body);
        await baru.save();
        res.status(201).json(baru);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// API BERITA DUKA
// ==========================================
app.get('/api/memorial', async (req, res) => {
    try {
        const data = await Memorial.find().sort({ timestamp: -1 });
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/memorial', async (req, res) => {
    try {
        const baru = new Memorial(req.body);
        await baru.save();
        res.status(201).json(baru);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
}