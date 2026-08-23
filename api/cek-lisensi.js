module.exports = async (req, res) => {
    const { akun, tipe } = req.query;

    if (!akun) {
        return res.status(400).json({ status: "ERROR", pesan: "Nomor akun kosong" });
    }

    // URL dan Key Brankas Anda
    const SUPABASE_URL = "https://mzmvoavsrlasjkxorzhe.supabase.co"; 
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bXZvYXZzcmxhc2preG9yemhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NjIyNzIsImV4cCI6MjEwMzAzODI3Mn0.BFpJLp6hTw0jbNX5fDvhxTvtg8K4u1n00wsSXqdST_E";

    try {
        const url = `${SUPABASE_URL}/rest/v1/lisensi_ea?akun_mt5=eq.${akun}&select=*`;
        const response = await fetch(url, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        });

        const data = await response.json();

        // 1. Jika Supabase error (contoh: nama tabel salah)
        if (data.error) {
            return res.status(200).json({ status: "ERROR_DATABASE" });
        }

        // 2. Jika nomor akun tidak ada di Supabase
        if (!data || data.length === 0) {
            return res.status(200).json({ status: "TIDAK_TERDAFTAR" });
        }

        const klien = data[0]; 

        // 3. Jika Anda mematikan centang "status_aktif" (blokir)
        if (klien.status_aktif === false) {
            return res.status(200).json({ status: "MATI" });
        }

        // 4. Mengecek Akun Demo vs Real
        if (!klien.tipe_akun || klien.tipe_akun.toLowerCase() !== tipe.toLowerCase()) {
            return res.status(200).json({ status: "SALAH_TIPE" });
        }

        // 5. Mengecek kedaluwarsa masa sewa
        if (klien.tanggal_expired) {
            const tglExpired = new Date(klien.tanggal_expired);
            const tglSekarang = new Date();
            tglSekarang.setHours(0,0,0,0); // Samakan jam
            
            if (tglSekarang > tglExpired) {
                return res.status(200).json({ status: "EXPIRED" });
            }
        }

        // 6. Jika semua lolos
        return res.status(200).json({ status: "AKTIF" });

    } catch (error) {
        return res.status(500).json({ status: "ERROR_SISTEM" });
    }
};
