module.exports = async (req, res) => {
    // 1. Menolak jika bukan dari formulir web (Wajib metode POST)
    if (req.method !== 'POST') {
        return res.status(405).json({ status: "DITOLAK", pesan: "Metode tidak diizinkan, gunakan POST" });
    }

    // 2. Menangkap data yang dikirim dari formulir HTML
    const { akun_mt5, nama_klien, no_wa, email, pilihan_ea, pilihan_paket } = req.body;

    // 3. Pengecekan wajib isi (Satpam memeriksa)
    if (!akun_mt5 || !nama_klien) {
        return res.status(400).json({ status: "GAGAL", pesan: "Nomor Akun MT5 dan Nama wajib diisi!" });
    }

    // KUNCI RAHASIA SUPABASE (Ganti dengan kuncimu sendiri)
    const SUPABASE_URL = "https://mzmvoavsrlasjkxorzhe.supabase.co"; 
    const SUPABASE_KEY = "PASTE_SUPABASE_KEY_KAMU_DI_SINI"; 

    try {
        // 4. URL untuk memasukkan data ke tabel "lisensi ea"
        const url = `${SUPABASE_URL}/rest/v1/lisensi%20ea`;
        
        const response = await fetch(url, {
            method: 'POST', // Metode memasukkan data baru
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal" // Perintah agar Supabase mengeksekusi diam-diam
            },
            // 5. Data yang dibungkus untuk dilempar ke Supabase
            body: JSON.stringify({
                akun_mt5: akun_mt5,
                nama_klien: nama_klien,
                no_wa: no_wa,
                email: email,
                pilihan_ea: pilihan_ea,
                pilihan_paket: pilihan_paket
                // NOTE: status_aktif tidak dikirim karena Supabase akan otomatis menjadikannya FALSE
            })
        });

        // 6. Jika Supabase menolak (Misal karena akun sudah terdaftar/Unique)
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.code === '23505') {
                return res.status(400).json({ status: "GAGAL", pesan: "Nomor Akun MT5 ini sudah terdaftar di sistem!" });
            }
            return res.status(400).json({ status: "GAGAL", pesan: "Gagal menyimpan ke database", detail: errorData });
        }

        // 7. Jika berhasil masuk ke Supabase
        return res.status(200).json({ status: "SUKSES", pesan: "Data berhasil masuk antrean." });

    } catch (error) {
        return res.status(500).json({ status: "ERROR_SISTEM", pesan_asli: error.message });
    }
};
