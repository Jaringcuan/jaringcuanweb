module.exports = async (req, res) => {
    // --- MULAI: SURAT IZIN PINTU MASUK (CORS) ---
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Mengizinkan form web mengirim data
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Jika browser hanya mengecek izin (Preflight / OPTIONS)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    // --- SELESAI: SURAT IZIN PINTU MASUK ---

    // 1. Menolak jika bukan dari formulir web (Wajib metode POST)
    if (req.method !== 'POST') {
        return res.status(405).json({ status: "DITOLAK", pesan: "Metode tidak diizinkan, gunakan POST" });
    }

    // 2. Menangkap data yang dikirim dari formulir HTML
    const { akun_mt5, nama_klien, no_wa, email, pilihan_ea, pilihan_paket } = req.body;

    // 3. Pengecekan wajib isi
    if (!akun_mt5 || !nama_klien) {
        return res.status(400).json({ status: "GAGAL", pesan: "Nomor Akun MT5 dan Nama wajib diisi!" });
    }

    // KUNCI RAHASIA SUPABASE (Ganti dengan kuncimu sendiri ya!)
    const SUPABASE_URL = "https://mzmvoavsrlasjkxorzhe.supabase.co"; 
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bXZvYXZzcmxhc2preG9yemhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NjIyNzIsImV4cCI6MjEwMzAzODI3Mn0.BFpJLp6hTw0jbNX5fDvhxTvtg8K4u1n00wsSXqdST_E"; 

    try {
        const url = `${SUPABASE_URL}/rest/v1/lisensi%20ea`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({
                akun_mt5: akun_mt5,
                nama_klien: nama_klien,
                no_wa: no_wa,
                email: email,
                pilihan_ea: pilihan_ea,
                pilihan_paket: pilihan_paket
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.code === '23505') {
                return res.status(400).json({ status: "GAGAL", pesan: "Nomor Akun MT5 ini sudah terdaftar di sistem!" });
            }
            return res.status(400).json({ status: "GAGAL", pesan: "Gagal menyimpan ke database", detail: errorData });
        }

        return res.status(200).json({ status: "SUKSES", pesan: "Data berhasil masuk antrean." });

    } catch (error) {
        return res.status(500).json({ status: "ERROR_SISTEM", pesan_asli: error.message });
    }
};
