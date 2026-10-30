const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi token login
const verifikasiToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ pesan: 'Akses ditolak, token tidak ditemukan!' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'KUNCI_RAHASIA_PANTAU_DESA');
        req.user = decoded; // Menyimpan data user (termasuk role) di request
        next();
    } catch (err) {
        res.status(403).json({ pesan: 'Token tidak valid atau sudah kadaluarsa!' });
    }
};

// Middleware khusus untuk memastikan yang akses adalah RT
const hanyaRT = (req, res, next) => {
    if (req.user && req.user.role === 'rt') {
        next();
    } else {
        res.status(403).json({ pesan: 'Akses ditolak! Halaman ini khusus untuk Ketua RT.' });
    }
};

module.exports = { verifikasiToken, hanyaRT };