export default async function handler(req, res) {
    const { akun, tipe } = req.query;

    if (!akun) {
        return res.status(400).json({ status: "ERROR", pesan: "Nomor akun kosong" });
    }

    // =========================================================================
    // PASTIKAN ANDA MENGGANTI TULISAN DI BAWAH INI DENGAN PROJECT URL SUPABASE ANDA
    // (Bentuknya seperti: "https://abcdefghijk.supabase.co")
    // =========================================================================
    const SUPABASE_URL = "https://mzmvoavsrlasjkxorzhe.supabase.co"; 
    
    // API Key Anda sudah saya masukkan di bawah ini:
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bXZvYXZzcmxhc2preG9yemhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NjIyNzIsImV4cCI6MjEwMzAzODI3Mn0.BFpJLp6hTw0jbNX5fDvhxTvtg8K4u1n00wsSXqdST_E";
    // =========================================================================

    try {
        // Vercel mengecek ke tabel "lisensi_ea" di Supabase Anda
        const url = `${SUPABASE_URL}/rest/v1/lisensi_ea?akun_mt5=eq.${akun}&select=*`;
        const response = await fetch(url, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        });

        const data = await response.json();

        // 1. Jika nomor akun tidak ada di Supabase
        if (data.length === 0) {
            return res.status(200).json({ status: "TIDAK_TERDAFTAR" });
        }

        const klien = data[0]; 

        // 2. Jika Anda mematikan centang "status_aktif" secara manual (blokir)
        if (klien.status_aktif === false) {
            return res.status(200).json({ status: "MATI" });
        }

        // 3. Jika Si Iseng mendaftar akun Demo tapi EA dipasang di akun Real
        if (klien.tipe_akun.toLowerCase() !== tipe.toLowerCase()) {
            return res.status(200).json({ status: "SALAH_TIPE" });
        }

        // 4. Mengecek batas kedaluwarsa masa sewa
        if (klien.tanggal_expired) {
            const tglExpired = new Date(klien.tanggal_expired);
            const tglSekarang = new Date();
            tglSekarang.setHours(0,0,0,0); // Menyamakan jam agar adil
            
            if (tglSekarang > tglExpired) {
                return res.status(200).json({ status: "EXPIRED" });
            }
        }

        // 5. Jika semua lolos, EA diizinkan bekerja
        return res.status(200).json({ status: "AKTIF" });

    } catch (error) {
        return res.status(500).json({ status: "ERROR" });
    }
}
