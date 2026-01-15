const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const colors = ['red', 'blue', 'green', 'yellow'];
const grid = document.getElementById('alphabet-grid');
const messageLog = document.getElementById('message-log');
const wallScreen = document.getElementById('wall-screen');
const upsideDownScreen = document.getElementById('upside-down');
const flashlightOverlay = document.getElementById('flashlight-overlay');
const bgm = document.getElementById('bgm'); // Ambil elemen audio

// --- KONFIGURASI GAME ---
const CORRECT_PASSCODE = "sibayak"; // Ganti sesuai keinginan
let wafflesCollected = 0;

// --- VISUAL LOGIC ---

// 1. GENERATE WALL
letters.split('').forEach((char, index) => {
    const box = document.createElement('div');
    box.className = 'letter-box';
    const color = colors[index % colors.length];
    box.innerHTML = `
        <div class="bulb ${color}" id="light-${char}"></div>
        <div class="char">${char}</div>
    `;
    grid.appendChild(box);
});

// --- MOBILE TOUCH SUPPORT ---
function updateFlashlight(xPos, yPos) {
    const x = (xPos / window.innerWidth) * 100;
    const y = (yPos / window.innerHeight) * 100;
    flashlightOverlay.style.setProperty('--x', `${x}%`);
    flashlightOverlay.style.setProperty('--y', `${y}%`);
}

upsideDownScreen.addEventListener('touchmove', (e) => {
    e.preventDefault(); 
    const touch = e.touches[0]; 
    updateFlashlight(touch.clientX, touch.clientY);
}, { passive: false });

upsideDownScreen.addEventListener('mousemove', (e) => {
    updateFlashlight(e.clientX, e.clientY);
});

// 2. HELPER FUNCTIONS
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function blinkLight(char) {
    const light = document.getElementById(`light-${char.toUpperCase()}`);
    if(light) {
        light.classList.add('active');
        await sleep(800);
        light.classList.remove('active');
        await sleep(200);
    }
}

async function spellMessage(text) {
    messageLog.innerText = "";
    for (let char of text) {
        if (char === ' ') {
            await sleep(500);
            messageLog.innerText += " ";
        } else {
            await blinkLight(char);
            messageLog.innerText += char;
        }
    }
}

// 3. EVENT LISTENER UTAMA (START BUTTON)
document.getElementById('start-btn').addEventListener('click', async () => {
    const inputCode = document.getElementById('passcode').value.toLowerCase().trim();
    const errorMsg = document.getElementById('error-msg');
    
    // --- VALIDASI PASSWORD ---
    if(!inputCode.includes(CORRECT_PASSCODE)) {
        errorMsg.classList.remove('hidden');
        errorMsg.innerText = "ACCESS DENIED - WRONG LOCATION";
        document.querySelector('.login-container').animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], { duration: 300 });
        return; 
    }

    // --- JIKA PASSWORD BENAR ---
    errorMsg.style.color = "#0f0";
    errorMsg.innerText = "ACCESS GRANTED";
    errorMsg.classList.remove('hidden');
    await sleep(1000);

    // --- PLAY MUSIK (LOCAL FILE) ---
    try {
        bgm.volume = 1.0; // Volume Full
        bgm.play();
    } catch (e) {
        console.log("Audio play failed: ", e);
    }

    // --- ANIMASI TRANSISI ---
    const intro = document.getElementById('intro-screen');
    intro.style.opacity = 0;
    await sleep(1000);
    intro.classList.add('hidden');
    
    // Masuk ke Wall Screen
    wallScreen.classList.remove('hidden');
    await sleep(1500);
    
    // Eja Pesan
    await spellMessage("HI SAFA"); 
    await sleep(1000); 
    await spellMessage("FIND THE EGGOS"); 
    await sleep(2000);

    // Transisi ke Upside Down
    wallScreen.style.opacity = 0;
    await sleep(2000);
    wallScreen.classList.add('hidden');
    
    upsideDownScreen.classList.remove('hidden');
    upsideDownScreen.style.opacity = 0;
    
    setTimeout(()=> { upsideDownScreen.style.opacity = 1; }, 100);
});

// 4. LOGIC GAME WAFFLE
const waffles = document.querySelectorAll('.waffle');
const countDisplay = document.getElementById('waffle-count');

waffles.forEach(waffle => {
    waffle.addEventListener('click', collectWaffle);
    waffle.addEventListener('touchstart', collectWaffle);
});

function collectWaffle(e) {
    if(e.target.classList.contains('found')) return;
    
    e.preventDefault(); 
    e.target.classList.add('found'); 
    
    wafflesCollected++;
    countDisplay.innerText = wafflesCollected;

    if(wafflesCollected === 3) {
        revealExit();
    }
}

async function revealExit() {
    await sleep(1000);
    const finalBtn = document.getElementById('final-btn');
    finalBtn.classList.remove('hidden');
    finalBtn.innerText = "PORTAL OPENED - CLICK TO ESCAPE";
    
    finalBtn.style.opacity = 0;
    finalBtn.style.transition = "opacity 2s";
    setTimeout(() => { finalBtn.style.opacity = 1; }, 100);
}

// 5. FINAL BUTTON
document.getElementById('final-btn').addEventListener('click', async () => {
    // Stop Musik saat masuk surat (biar hening)
    bgm.pause();
    
    upsideDownScreen.style.opacity = 0;
    await sleep(1000);
    upsideDownScreen.classList.add('hidden');
    
    const letterScreen = document.getElementById('letter-screen');
    letterScreen.classList.remove('hidden');
    setTimeout(() => { letterScreen.style.opacity = 1; }, 100);
});


// --- KONFIGURASI TANGGAL ULTAH ---
// Format: "Month Day, Year Hour:Minute:Second"
// Ganti tahunnya ke 2026 atau sesuai tahun sekarang
const TARGET_DATE = new Date("Jan 19, 2026 00:00:00").getTime(); 

// --- ELEMEN SCREEN ---
const countdownScreen = document.getElementById('countdown-screen');
const introScreen = document.getElementById('intro-screen');

// --- FUNGSI COUNTDOWN ---
const timerInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = TARGET_DATE - now;

    // 1. Rumus konversi waktu
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // 2. Tampilkan ke HTML
    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');

    // 3. JIKA WAKTU SUDAH TIBA (Ultah dimulai!)
    if (distance < 0) {
        clearInterval(timerInterval); // Stop timer
        
        // Sembunyikan Countdown, Munculkan Intro
        countdownScreen.style.opacity = 0;
        setTimeout(() => {
            countdownScreen.classList.add('hidden');
            introScreen.classList.remove('hidden'); // Intro muncul
            
            // Animasi Intro Masuk (Opsional, biar halus)
            introScreen.style.opacity = 0;
            setTimeout(() => { introScreen.style.opacity = 1; }, 100);
        }, 1000);
    }
}, 1000);

// ... (LANJUTKAN DENGAN KODE LAMA KAMU DI BAWAH INI) ...
// const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// ... dst