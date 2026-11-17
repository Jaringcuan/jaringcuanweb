const express = require('express');
const path = require('path');
const fs = require('fs');

const indexHandler = require('./api/index.js');
const daftarTrialHandler = require('./api/daftar-trial.js');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.disable('x-powered-by');

// Middleware pembaca body yang aman untuk MT5 WebRequest (termasuk jika ada karakter null \0 di ujung JSON)
// sekaligus mendukung fetch JSON dari browser dan form-urlencoded dari laporan pembayaran otomatis
app.use(express.raw({ type: '*/*', limit: '5mb' }));
app.use((req, res, next) => {
  if (Buffer.isBuffer(req.body) && req.body.length > 0) {
    const rawStr = req.body.toString('utf8').replace(/\0+$/g, '').trim();
    const contentType = String(req.headers['content-type'] || '').toLowerCase();

    if (rawStr.startsWith('{') || rawStr.startsWith('[') || contentType.includes('application/json')) {
      try {
        req.body = JSON.parse(rawStr);
      } catch (e) {
        req.body = {};
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      req.body = Object.fromEntries(new URLSearchParams(rawStr));
    } else {
      try {
        req.body = JSON.parse(rawStr);
      } catch (e) {
        req.body = {};
      }
    }
  } else if (!req.body || Buffer.isBuffer(req.body)) {
    req.body = {};
  }
  next();
});

// ============================================================================
// 1. ENDPOINT API (PERSIS SEPERTI VERCEL — TIDAK PERLU UBAH PENGATURAN DI MT5)
// ============================================================================

// Jalur Pendaftaran Trial dari Website: /api/daftar-trial
app.all(['/api/daftar-trial', '/api/daftar-trial/', '/api/daftar-trial.js'], (req, res) => {
  return daftarTrialHandler(req, res);
});

// Jalur Utama Cek Lisensi EA MT5: /api dan /api/index
app.all(['/api', '/api/', '/api/index', '/api/index.js'], (req, res) => {
  return indexHandler(req, res);
});

// ============================================================================
// 2. FILE STATIS WEBSITE (index.html, images/qrish.jpg, files/*.ex5)
// ============================================================================
const filesDir = path.join(__dirname, 'files');
if (fs.existsSync(filesDir)) {
  app.use('/files', express.static(filesDir, {
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().endsWith('.ex5')) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      }
    }
  }));
}

const imagesDir = path.join(__dirname, 'images');
if (fs.existsSync(imagesDir)) {
  app.use('/images', express.static(imagesDir));
}

const indexHtmlPath = path.join(__dirname, 'index.html');
app.get(['/', '/index.html'], (req, res) => {
  if (fs.existsSync(indexHtmlPath)) {
    return res.sendFile(indexHtmlPath);
  }
  return res.status(200).json({
    status: 'online',
    service: 'Jaring Cuan - Server Lisensi EA MT5 (24 Jam Nonstop)',
    server_time: Math.floor(Date.now() / 1000)
  });
});

// Fallback jika MT5 mengirim POST langsung ke root "/"
app.post('/', (req, res) => {
  return indexHandler(req, res);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Halaman atau endpoint tidak ditemukan.' });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Server Jaring Cuan aktif 24 jam nonstop di http://${HOST}:${PORT}`);
});

['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => {
    server.close(() => {
      process.exit(0);
    });
  });
});
