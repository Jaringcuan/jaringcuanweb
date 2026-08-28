// --- 0. GOOGLE ANALYTICS EVENT TRACKER HELPER ---
function trackEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    }
}

// --- 1. LOGIKA FAQ ACCORDION ---
const accordions = document.querySelectorAll('.faq-question');
accordions.forEach(acc => {
    acc.addEventListener('click', function() {
        const isActive = this.classList.contains('active');
        accordions.forEach(otherAcc => {
            otherAcc.classList.remove('active');
            otherAcc.nextElementSibling.style.maxHeight = null;
        });
        if (!isActive) {
            this.classList.add('active');
            const panel = this.nextElementSibling;
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    });
});

// --- 2. DETEKSI OTOMATIS LINK #form (MARKETPLACE MODE) ---
let isMarketplaceMode = false;
const currentHash = window.location.hash;

if (currentHash === '#form') {
    isMarketplaceMode = true;
}

window.history.replaceState({ room: 'lobby' }, '', window.location.pathname);

window.addEventListener('popstate', function(event) {
    if (event.state && event.state.room && event.state.room !== 'lobby') {
        showRoomElement(event.state.room);
    } else {
        showLobbyElement();
    }
});

// EKSEKUSI FORM #form SETELAH HALAMAN SIAP
window.addEventListener('DOMContentLoaded', function() {
    if (isMarketplaceMode) {
        document.getElementById('lobby').style.display = 'none';
        document.querySelectorAll('.ea-room').forEach(room => room.style.display = 'none');
        
        document.getElementById('payment-info').style.display = 'none';
        document.getElementById('sumber-order-group').style.display = 'block';
        document.getElementById('sumber_order').setAttribute('required', 'true');
        
        document.getElementById('group-paket-normal').style.display = 'none';
        document.getElementById('group-paket-market').style.display = 'block';
        document.getElementById('market_val_paket').setAttribute('required', 'true');
        document.getElementById('val_paket').removeAttribute('required');

        document.getElementById('group-ea-normal').style.display = 'none';
        document.getElementById('group-ea-market').style.display = 'block';
        document.getElementById('market_val_ea').setAttribute('required', 'true');
        document.getElementById('val_ea').removeAttribute('required');
        
        document.getElementById('promo-marketplace').style.display = 'block';

        const formModal = document.getElementById('formModal');
        formModal.classList.add('active');
        
        trackEvent('buka_form_marketplace');
    }
});

function showRoomElement(roomId) {
    document.getElementById('lobby').style.display = 'none';
    const rooms = document.querySelectorAll('.ea-room');
    rooms.forEach(room => room.style.display = 'none');
    document.getElementById(roomId).style.display = 'block';
    window.scrollTo(0, 0);
}

function showLobbyElement() {
    const rooms = document.querySelectorAll('.ea-room');
    rooms.forEach(room => room.style.display = 'none');
    document.getElementById('lobby').style.display = 'block';
    window.scrollTo(0, 0);
    
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        let temp = iframe.src;
        iframe.src = temp;
    });
}

function openRoom(roomId) {
    showRoomElement(roomId);
    window.history.pushState({ room: roomId }, '', '#' + roomId);
}

function goBackToLobby() { window.history.back(); }
function goHome() {
    showLobbyElement();
    window.history.pushState({ room: 'lobby' }, '', window.location.pathname);
}

// --- 3. FUNGSI COPY KLASIK ---
function copyText(text, btnElement) {
    const originalText = btnElement.innerHTML;
    function fallbackCopy(textToCopy) {
        var textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { return document.execCommand('copy'); } catch (err) { return false; } finally { document.body.removeChild(textArea); }
    }
    function showSuccess() {
        btnElement.innerHTML = '✅ Tersalin!';
        btnElement.style.color = '#22c55e'; 
        setTimeout(() => { btnElement.innerHTML = originalText; btnElement.style.color = ''; }, 2000);
    }
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(showSuccess).catch(err => {
            if(fallbackCopy(text)) showSuccess(); else alert("Browser memblokir fitur salin.");
        });
    } else {
        if(fallbackCopy(text)) showSuccess(); else alert("Browser memblokir fitur salin.");
    }
}

// --- 4. MANAJEMEN POP-UP (MODAL) ---
const wajibBacaModal = document.getElementById('wajibBacaModal');
function openWajibBacaModal() { wajibBacaModal.classList.add('active'); }
function closeWajibBacaModal() { wajibBacaModal.classList.remove('active'); }

const referralModal = document.getElementById('referralModal');
function openReferralModal() { referralModal.classList.add('active'); }
function closeReferralModal() { referralModal.classList.remove('active'); }

function copyAndRedirect(btnElement) {
    trackEvent('klik_link_exness');
    copyText('1l69bo5xiw', btnElement);
    setTimeout(() => {
        window.open('https://one.exnessonelink.com/a/1l69bo5xiw', '_blank');
        closeReferralModal();
    }, 1000);
}

const formModal = document.getElementById('formModal');
const inputEa = document.getElementById('val_ea');
const inputPaket = document.getElementById('val_paket');
const inputMt5 = document.getElementById('val_mt5');

function openSmartForm(btnElement, eaName) {
    const card = btnElement.closest('.price-card');
    const packageName = card.querySelector('h4').innerText;
    let packageResult = packageName;

    if (!isMarketplaceMode) {
        const priceElement = card.querySelector('.price');
        let priceText = priceElement.innerText.replace(/\n/g, ' ').trim();
        const coret = priceElement.querySelector('.price-coret');
        if (coret) {
            priceText = priceText.replace(coret.innerText, '').trim();
        }
        packageResult = `${packageName} (${priceText})`;
    }

    inputEa.value = eaName;
    document.getElementById('market_val_ea').value = eaName; 
    inputPaket.value = packageResult;
    inputMt5.value = ''; 
    
    formModal.classList.add('active');
}

function closeFormModal() { 
    formModal.classList.remove('active'); 
    if (isMarketplaceMode) {
        showLobbyElement();
        window.history.replaceState({ room: 'lobby' }, '', window.location.pathname);
        isMarketplaceMode = false;
    }
}

window.addEventListener('click', function(e) {
    if (e.target === wajibBacaModal) closeWajibBacaModal();
    if (e.target === referralModal) closeReferralModal();
    if (e.target === formModal) closeFormModal();
});

// --- 5. SUBMIT GOOGLE SHEET & WHATSAPP ---
const form = document.getElementById('form-klaim');
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const honeypot = document.getElementById('hp_trap').value;
    if (honeypot !== "") {
        alert("Sistem mendeteksi aktivitas mencurigakan. Permintaan diblokir.");
        return false;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Menyimpan Data...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    const formData = new FormData(form);
    const nama = formData.get('nama');
    const wa = formData.get('no_wa');
    const email = formData.get('email');
    const mt5 = formData.get('no_mt5');
    
    const ea = isMarketplaceMode ? document.getElementById('market_val_ea').value : formData.get('pilihan_ea');
    const paket = isMarketplaceMode ? document.getElementById('market_val_paket').value : formData.get('pilihan_paket');
    const sumber = formData.get('sumber_order');

    if (isMarketplaceMode) {
        formData.set('pilihan_ea', ea);
        formData.set('pilihan_paket', paket);
    }
    
    trackEvent('submit_order_sukses', {ea_terpilih: ea, paket_terpilih: paket});

    let teksWA = "";

    if (isMarketplaceMode) {
        teksWA = `🚨 *[ KLAIM MARKETPLACE ]* 🚨\nHalo Admin, saya sudah order EA via Aplikasi dan mengisi form aktivasi.\n\nSumber Order: ${sumber}\nProduk: *${ea}*\nPaket: *${paket}*\n\nNama: ${nama}\nNo WA: ${wa}\nEmail: ${email}\nID MT5: ${mt5}\n\n*Pembayaran sudah diselesaikan via ${sumber}, mohon segera proses License Key saya.*`;
    } 
    else {
        teksWA = `Halo Admin, saya memesan Lisensi EA.\n\nProduk: *${ea}*\nPaket: *${paket}*\n\nNama: ${nama}\nNo WA: ${wa}\nEmail: ${email}\nID MT5: ${mt5}`;

        if (paket.includes('Kemitraan') || paket.includes('Ekosistem') || paket.includes('Subsidi')) {
            teksWA += `\n\n*Saya sudah daftar Exness di bawah IB Jaring Cuan dan berikut lampiran bukti transfer server:*`;
        } else {
            teksWA += `\n\n*Berikut saya lampirkan foto bukti transfer lisensi saya:*`;
        }
    }

    const URL_GOOGLE_SHEET = 'https://script.google.com/macros/s/AKfycbwHUkRHa4COqQZ4W8cNLyZMnVJvF7zcsQZta6IX_CzGtPwYjFrtc4OVR2IpcFrsS8Zr/exec';
    
    fetch(URL_GOOGLE_SHEET, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(formData).toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(() => {
        const noAdmin = '6285178755343'; 
        window.location.href = `https://wa.me/${noAdmin}?text=${encodeURIComponent(teksWA)}`;
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        closeFormModal();
    })
    .catch(error => {
        alert('Sistem sedang mengalihkan Anda ke WhatsApp Admin...');
        const noAdmin = '6285178755343'; 
        window.location.href = `https://wa.me/${noAdmin}?text=${encodeURIComponent(teksWA)}`;
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    });
});
