module.exports = async (req, res) => {
    const { akun, tipe } = req.query;

    if (!akun) {
        return res.status(400).json({ status: "ERROR", pesan: "Nomor akun kosong" });
    }

    const SUPABASE_URL = "https://mzmvoavsrlasjkxorzhe.supabase.co"; 
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bXZvYXZzcmxhc2preG9yemhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NjIyNzIsImV4cCI6MjEwMzAzODI3Mn0.BFpJLp6hTw0jbNX5fDvhxTvtg8K4u1n00wsSXqdST_E";

    try {
        // PERHATIKAN: Nama tabel disesuaikan dengan spasi (%20)
        const url = `${SUPABASE_URL}/rest/v1/lisensi_ea?akun_mt5=eq.${akun}&select=*`;
        const response = await fetch(url, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        });

        const data = await response.json();

        if (!Array.isArray(data)) {
            return res.status(200).json({ status: "SUPABASE_REJECT", detail: data });
        }

        if (data.length === 0) {
            return res.status(200).json({ status: "TIDAK_TERDAFTAR" });
        }

        const klien = data[0]; 

        if (klien.status_aktif === false) {
            return res.status(200).json({ status: "MATI" });
        }

        if (!klien.tipe_akun || klien.tipe_akun.toLowerCase() !== tipe.toLowerCase()) {
            return res.status(200).json({ status: "SALAH_TIPE" });
        }

        if (klien.tanggal_expired) {
            const tglExpired = new Date(klien.tanggal_expired);
            const tglSekarang = new Date();
            tglSekarang.setHours(0,0,0,0);
            
            if (tglSekarang > tglExpired) {
                return res.status(200).json({ status: "EXPIRED" });
            }
        }

        return res.status(200).json({ status: "AKTIF" });

    } catch (error) {
        return res.status(500).json({ 
            status: "ERROR_SISTEM", 
            pesan_asli: error.message 
        });
    }
};
