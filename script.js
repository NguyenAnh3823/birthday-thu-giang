// ==========================================
// PWA SERVICE WORKER & FULLSCREEN HELPER
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered:', reg.scope))
            .catch(err => console.error('SW Registration Failed:', err));
    });
}

function requestAppFullScreen() {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => { });
    } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
    }
}

// Quản lý AudioContext dùng chung
let sharedAudioCtx = null;
function getAudioContext() {
    if (!sharedAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
}

// ==========================================
// 0. CẤU HÌNH ÂM THANH ĐÀN ĐÁ & BGM
// ==========================================
let isDanDaPlaying = false;
let danDaTimer = null;

function playDanDaHappyBirthday() {
    try {
        const ctx = getAudioContext();
        if (!ctx || isDanDaPlaying) return;
        isDanDaPlaying = true;

        const PITCH_SCALE = 1.35;
        const TEMPO_SCALE = 0.78;

        const rawNotes = [
            { f: 523.25, d: 0.5 }, { f: 523.25, d: 0.25 },
            { f: 587.33, d: 0.7 }, { f: 523.25, d: 0.7 },
            { f: 698.46, d: 0.7 }, { f: 659.25, d: 1.3 },
            { f: 523.25, d: 0.5 }, { f: 523.25, d: 0.25 },
            { f: 587.33, d: 0.7 }, { f: 523.25, d: 0.7 },
            { f: 783.99, d: 0.7 }, { f: 698.46, d: 1.3 },
            { f: 523.25, d: 0.5 }, { f: 523.25, d: 0.25 },
            { f: 1046.50, d: 0.7 }, { f: 880.00, d: 0.7 },
            { f: 698.46, d: 0.7 }, { f: 659.25, d: 0.7 },
            { f: 587.33, d: 1.4 },
            { f: 932.33, d: 0.5 }, { f: 932.33, d: 0.25 },
            { f: 880.00, d: 0.7 }, { f: 698.46, d: 0.7 },
            { f: 783.99, d: 0.7 }, { f: 698.46, d: 1.8 }
        ];

        let currTime = ctx.currentTime;

        rawNotes.forEach(rawNote => {
            const freq = rawNote.f * PITCH_SCALE;
            const duration = rawNote.d * TEMPO_SCALE;

            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(freq, currTime);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(freq * 3.0, currTime);

            gain1.gain.setValueAtTime(0, currTime);
            gain1.gain.linearRampToValueAtTime(0.3, currTime + 0.002);
            gain1.gain.exponentialRampToValueAtTime(0.0001, currTime + duration * 0.95);

            gain2.gain.setValueAtTime(0, currTime);
            gain2.gain.linearRampToValueAtTime(0.2, currTime + 0.001);
            gain2.gain.exponentialRampToValueAtTime(0.0001, currTime + 0.08);

            osc1.connect(gain1);
            osc2.connect(gain2);
            gain1.connect(ctx.destination);
            gain2.connect(ctx.destination);

            osc1.start(currTime);
            osc1.stop(currTime + duration * 0.95);

            osc2.start(currTime);
            osc2.stop(currTime + 0.08);

            currTime += duration + 0.035;
        });

        const totalDuration = currTime - ctx.currentTime;

        if (isDanDaPlaying) {
            danDaTimer = setTimeout(() => {
                isDanDaPlaying = false;
            }, totalDuration * 1000 + 1000);
        }
    } catch (e) {
        isDanDaPlaying = false;
    }
}

function stopDanDaHappyBirthday() {
    isDanDaPlaying = false;
    if (danDaTimer) {
        clearTimeout(danDaTimer);
        danDaTimer = null;
    }
}

const hbBgm = new Audio('assets/audio/happy_birthday.mp3');
hbBgm.loop = true;
hbBgm.volume = 0.6;

// HÀM MỞ KHÓA ÂM THANH CHO SAFARI / IPAD OS
let isAudioUnlocked = false;

// HÀM MỞ KHÓA ÂM THANH CHO SAFARI / IPAD OS / ĐIỆN THOẠI
function unlockAudio() {
    // Nếu đã mở khóa rồi thì không cần chạy lại khi vuốt/thổi nến
    if (isAudioUnlocked) return;

    if (hbBgm) {
        // Tắt tiếng trước khi mồi để nhạc không lọt ra ngoài
        hbBgm.muted = true;

        const playPromise = hbBgm.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                hbBgm.pause();
                hbBgm.currentTime = 0;
                hbBgm.muted = false; // Bật lại tiếng để lát pháo hoa kêu bình thường
                isAudioUnlocked = true;
            }).catch(() => {
                // Xử lý lỗi nếu trình duyệt chặn
                hbBgm.muted = false;
            });
        }
    }

    // Mở khóa AudioContext cho tiếng đàn đá
    getAudioContext();
}

// ==========================================
// 1. CẤU HÌNH SCENE 1
// ==========================================
const targetDate = 12;
const wrapper = document.getElementById('numbers-wrapper');

if (wrapper) {
    let html = '';
    for (let i = 1; i <= 31; i++) {
        html += `<div class="number-item" id="num-${i}">${i}</div>`;
    }
    wrapper.innerHTML = html;
}

function getNumberHeight() {
    const sampleItem = document.querySelector('.number-item');
    return sampleItem ? sampleItem.getBoundingClientRect().height : 70;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 2. CÁC HÀM ÂM THANH HIỆU ỨNG
// ==========================================
function playTickSound(currentIndex = 1) {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const dist = Math.abs(targetDate - currentIndex);
        const baseFreq = 1200 - Math.min(dist, 16) * 50;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.035);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.035);
    } catch (e) { }
}

function playTargetSelectedSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        const oscSlide = ctx.createOscillator();
        const gainSlide = ctx.createGain();
        oscSlide.type = 'sawtooth';
        oscSlide.frequency.setValueAtTime(350, now);
        oscSlide.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

        gainSlide.gain.setValueAtTime(0.12, now);
        gainSlide.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        oscSlide.connect(gainSlide);
        gainSlide.connect(ctx.destination);
        oscSlide.start(now);
        oscSlide.stop(now + 0.15);

        const lockTime = now + 0.15;

        const oscThump = ctx.createOscillator();
        const gainThump = ctx.createGain();
        oscThump.type = 'triangle';
        oscThump.frequency.setValueAtTime(180, lockTime);
        oscThump.frequency.exponentialRampToValueAtTime(30, lockTime + 0.12);

        gainThump.gain.setValueAtTime(0.35, lockTime);
        gainThump.gain.exponentialRampToValueAtTime(0.001, lockTime + 0.12);

        const oscClick = ctx.createOscillator();
        const gainClick = ctx.createGain();
        oscClick.type = 'sine';
        oscClick.frequency.setValueAtTime(1500, lockTime);
        oscClick.frequency.exponentialRampToValueAtTime(200, lockTime + 0.025);

        gainClick.gain.setValueAtTime(0.25, lockTime);
        gainClick.gain.exponentialRampToValueAtTime(0.001, lockTime + 0.025);

        oscThump.connect(gainThump);
        gainThump.connect(ctx.destination);
        oscClick.connect(gainClick);
        gainClick.connect(ctx.destination);

        oscThump.start(lockTime);
        oscThump.stop(lockTime + 0.12);
        oscClick.start(lockTime);
        oscClick.stop(lockTime + 0.025);
    } catch (e) { }
}

function playLightCandleSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        const oscSpark = ctx.createOscillator();
        const gainSpark = ctx.createGain();
        oscSpark.type = 'triangle';
        oscSpark.frequency.setValueAtTime(3500, now);
        oscSpark.frequency.exponentialRampToValueAtTime(900, now + 0.02);

        gainSpark.gain.setValueAtTime(0.35, now);
        gainSpark.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        oscSpark.connect(gainSpark);
        gainSpark.connect(ctx.destination);
        oscSpark.start(now);
        oscSpark.stop(now + 0.02);

        const duration = 0.4;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(700, now + duration);
        filter.Q.value = 3;

        const gainNoise = ctx.createGain();
        gainNoise.gain.setValueAtTime(0.01, now);
        gainNoise.gain.linearRampToValueAtTime(0.22, now + 0.03);
        gainNoise.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gainNoise);
        gainNoise.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    } catch (e) { }
}

function playWishSuccessSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        const duration = 0.55;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(1600, now + 0.22);
        filter.frequency.exponentialRampToValueAtTime(250, now + duration);
        filter.Q.value = 2;

        const gainNoise = ctx.createGain();
        gainNoise.gain.setValueAtTime(0.01, now);
        gainNoise.gain.linearRampToValueAtTime(0.2, now + 0.18);
        gainNoise.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gainNoise);
        gainNoise.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + duration);

        const chimeNotes = [1046.50, 1318.51, 1567.98, 2093.00];
        chimeNotes.forEach((freq, index) => {
            const chimeTime = now + 0.12 + (index * 0.09);

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, chimeTime);

            gain.gain.setValueAtTime(0, chimeTime);
            gain.gain.linearRampToValueAtTime(0.12, chimeTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 0.85);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(chimeTime);
            osc.stop(chimeTime + 0.85);
        });
    } catch (e) { }
}

function playBlowSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const duration = 1.5;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(550, ctx.currentTime + duration / 2);
        filter.frequency.linearRampToValueAtTime(150, ctx.currentTime + duration);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.4);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        noise.stop(ctx.currentTime + duration);
    } catch (e) { }
}

function playTonearmSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const duration = 0.4;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(2000, ctx.currentTime + duration);
        filter.Q.value = 3;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        noise.stop(ctx.currentTime + duration);
    } catch (e) { }
}

// ==========================================
// 3. LUỒNG KỊCH BẢN CHÍNH (SCENE 1 -> SCENE 2)
// ==========================================
async function runAnimationFlow() {
    const currentNumberHeight = getNumberHeight();
    const startY = 2 * currentNumberHeight;
    wrapper.style.transform = `translateY(${startY}px)`;
    wrapper.style.transition = 'none';

    await delay(50);

    wrapper.style.transition = 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)';
    const targetY = -(targetDate - 3) * currentNumberHeight;
    wrapper.style.transform = `translateY(${targetY}px)`;

    let lastPlayedIndex = -1;
    const startTime = performance.now();
    const duration = 2500;

    function monitorScrolling(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const matrix = window.getComputedStyle(wrapper).transform;

        if (matrix && matrix !== 'none') {
            const matrixValues = matrix.split(',')[5];
            if (matrixValues) {
                const currentY = parseFloat(matrixValues);
                const currentIndex = Math.round(3 - (currentY / getNumberHeight()));

                if (currentIndex !== lastPlayedIndex && currentIndex >= 1 && currentIndex <= 31) {
                    playTickSound(currentIndex);
                    lastPlayedIndex = currentIndex;
                }
            }
        }

        if (progress < 1) {
            requestAnimationFrame(monitorScrolling);
        }
    }

    requestAnimationFrame(monitorScrolling);

    await delay(2500);
    document.getElementById(`num-${targetDate}`)?.classList.add('active');
    playTargetSelectedSound();
    document.getElementById('glow').style.opacity = '1';
    document.getElementById('arrow').style.opacity = '1';

    await delay(800);
    document.getElementById('month').classList.add('show-element');

    await delay(1000);
    document.getElementById('hb-text').classList.add('show-element');

    playDanDaHappyBirthday();

    document.getElementById('particles').classList.add('bright');

    await delay(1700);
    const sceneIntro = document.getElementById('scene-intro');
    sceneIntro.style.opacity = '0';

    await delay(1000);
    sceneIntro.style.display = 'none';

    const sceneCake = document.getElementById('scene-cake');
    const bunting = document.getElementById('bunting');
    const subtitleText = document.getElementById('subtitle-text');
    const instructionText = document.getElementById('instruction-text');
    const matchstick = document.getElementById('matchstick');
    const candleFlame = document.getElementById('candle-flame');
    const warmGlow = document.getElementById('warm-glow');

    sceneCake.classList.add('active');
    bunting.style.opacity = '1';
    bunting.style.transform = 'translateY(0)';

    await delay(600);

    await updateSubtitle("Có một món quà nhỏ dành cho cậu...", 2000);
    await updateSubtitle("Nhưng trước khi mở...", 1000);
    await updateSubtitle("Hãy cùng thổi nến nhé.", 1500);

    subtitleText.classList.remove('show');
    await delay(500);

    matchstick.classList.add('approach');
    await delay(1200);

    playLightCandleSound();

    candleFlame.classList.add('lit');
    warmGlow.classList.add('lit');
    await delay(400);

    matchstick.classList.remove('approach');
    matchstick.style.opacity = '0';
    await delay(800);

    subtitleText.textContent = "Nhắm mắt lại và cùng ước trước khi thổi nha!";
    subtitleText.classList.add('show');

    await delay(800);
    instructionText.classList.add('show');

    enableBlowCandleInteraction();
}

async function updateSubtitle(text, displayTimeMs) {
    const subtitleText = document.getElementById('subtitle-text');
    subtitleText.classList.remove('show');

    await delay(300);
    subtitleText.textContent = text;
    subtitleText.classList.add('show');

    await delay(displayTimeMs);
    subtitleText.classList.remove('show');
    await delay(400);
}

// ==========================================
// 4. HIỆU ỨNG PHÁO HOA CANVAS
// ==========================================
function launchFireworks() {
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '9999'
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#ff4500', '#ffd700', '#ff69b4', '#00ffff', '#ffffff', '#ffeb3b'];

    function createBurst(x, y) {
        for (let i = 0; i < 70; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 7 + 2;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 3 + 1,
                decay: Math.random() * 0.012 + 0.008
            });
        }
    }

    createBurst(canvas.width * 0.3, canvas.height * 0.35);
    createBurst(canvas.width * 0.7, canvas.height * 0.35);
    createBurst(canvas.width * 0.5, canvas.height * 0.25);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (particles.length > 0) {
            requestAnimationFrame(animate);
        } else {
            canvas.remove();
        }
    }

    animate();
}

// ==========================================
// 5. XỬ LÝ TƯƠNG TÁC THỔI NẾN & ĐOM ĐÓM
// ==========================================
function enableBlowCandleInteraction() {
    const cakeContainer = document.getElementById('cake-container');
    const candleFlame = document.getElementById('candle-flame');
    const warmGlow = document.getElementById('warm-glow');
    const smoke = document.getElementById('smoke');
    const instructionText = document.getElementById('instruction-text');
    const subtitleText = document.getElementById('subtitle-text');
    const sceneCake = document.getElementById('scene-cake');
    const darkOverlay = document.getElementById('dark-overlay');
    const finalWish = document.getElementById('final-wish');

    instructionText.textContent = "👆 Nhấn giữ hoặc vuốt lên ngọn nến để thổi nến";

    let isBlown = false;
    let currentProgress = 0;
    let holdTimer = null;
    let audioFadeInterval = null;
    let touchStartY = 0;

    const CIRCUMFERENCE = 2 * Math.PI * 26;
    const progressRing = cakeContainer.querySelector('.blow-progress-ring');
    const ringFill = progressRing ? progressRing.querySelector('.ring-fill') : null;

    if (ringFill) {
        ringFill.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
        ringFill.style.strokeDashoffset = `${CIRCUMFERENCE}`;
    }

    const fadeOutIntroAudio = () => {
        if (audioFadeInterval) clearInterval(audioFadeInterval);
        audioFadeInterval = setInterval(() => {
            if (hbBgm && hbBgm.volume > 0.05) {
                hbBgm.volume = Math.max(0, hbBgm.volume - 0.08);
            } else {
                clearInterval(audioFadeInterval);
                audioFadeInterval = null;
            }
        }, 50);
    };

    const stopIntroAudioCompletely = () => {
        if (audioFadeInterval) clearInterval(audioFadeInterval);
        stopDanDaHappyBirthday();
        if (hbBgm) {
            hbBgm.pause();
            hbBgm.currentTime = 0;
        }
    };

    const extinguishCandle = async () => {
        if (isBlown) return;
        isBlown = true;

        clearHold();
        stopIntroAudioCompletely();

        candleFlame.style.transform = 'translate(-50%, -100%) scale(0.1) rotate(15deg)';
        candleFlame.style.opacity = '0';
        warmGlow.style.opacity = '0';

        smoke.classList.add('active');
        smoke.style.opacity = '0.9';

        playWishSuccessSound();

        subtitleText.classList.remove('show');
        instructionText.classList.remove('show');

        await delay(600);
        darkOverlay.classList.add('active');
        sceneCake.style.opacity = '0';

        await delay(1800);

        hbBgm.volume = 0.6;
        hbBgm.play().catch(err => console.log("BGM play failed:", err));

        finalWish.style.fontFamily = "'Cormorant Garamond', serif";
        finalWish.textContent = "Có vài điều mình muốn gửi đến cậu";
        finalWish.classList.add('show');
        launchFireworks();

        await delay(3000);
        finalWish.classList.remove('show');
        await delay(800);

        finalWish.textContent = "Mình cất chúng trong những chiếc lọ này.";
        finalWish.classList.add('show');
        await delay(3000);
        finalWish.classList.remove('show');
        await delay(800);

        finalWish.textContent = "Hãy chọn chiếc lọ mà cậu thích nhất nhé!";
        finalWish.classList.add('show');

        await delay(3500);
        finalWish.classList.remove('show');

        await delay(800);
        const sceneWishes = document.getElementById('scene-wishes');
        if (sceneWishes) {
            sceneWishes.classList.add('active');
            initFireflies();
            initWishCardsInteraction();
        }
    };

    const updateFlameBlowingState = (progressRatio) => {
        if (isBlown) return;

        currentProgress = Math.min(Math.max(progressRatio, 0), 1);

        const scale = 1 - (currentProgress * 0.6);
        const opacity = 1 - (currentProgress * 0.5);
        const tiltAngle = (Math.random() - 0.5) * 12 + (currentProgress * 20);

        candleFlame.style.transform = `translate(-50%, -100%) scale(${scale}) rotate(${tiltAngle}deg)`;
        candleFlame.style.opacity = opacity;
        candleFlame.style.filter = `drop-shadow(0 0 ${12 * (1 - currentProgress)}px #ff5722)`;

        warmGlow.style.opacity = (1 - currentProgress).toFixed(2);

        if (currentProgress >= 0.7) {
            smoke.style.opacity = ((currentProgress - 0.7) / 0.3 * 0.7).toFixed(2);
        } else {
            smoke.style.opacity = '0';
        }

        if (progressRing && ringFill) {
            progressRing.classList.add('active');
            const offset = CIRCUMFERENCE - (currentProgress * CIRCUMFERENCE);
            ringFill.style.strokeDashoffset = offset;
        }

        if (currentProgress >= 1) {
            extinguishCandle();
        }
    };

    const resetFlameState = () => {
        if (isBlown) return;
        currentProgress = 0;
        candleFlame.style.transform = '';
        candleFlame.style.opacity = '';
        candleFlame.style.filter = '';
        warmGlow.style.opacity = '';
        smoke.style.opacity = '0';
        instructionText.textContent = "👆 Nhấn giữ hoặc vuốt lên ngọn nến để thổi nến";
        darkOverlay.style.opacity = '0';

        if (progressRing && ringFill) {
            progressRing.classList.remove('active');
            ringFill.style.strokeDashoffset = `${CIRCUMFERENCE}`;
        }
        if (hbBgm && hbBgm.volume < 0.6) {
            hbBgm.volume = 0.6;
        }
    };

    const startInteraction = (e) => {
        unlockAudio();
        if (isBlown) return;

        if (progressRing) progressRing.classList.add('active');

        fadeOutIntroAudio();
        playBlowSound();

        if (e.touches && e.touches[0]) {
            touchStartY = e.touches[0].clientY;
        }

        const startTime = Date.now();
        const duration = 2200;

        if (holdTimer) clearInterval(holdTimer);
        holdTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const p = elapsed / duration;
            updateFlameBlowingState(p);
        }, 30);
    };

    const clearHold = () => {
        if (holdTimer) {
            clearInterval(holdTimer);
            holdTimer = null;
        }
        if (!isBlown) {
            resetFlameState();
        }
    };

    const handleTouchMove = (e) => {
        if (isBlown || !e.touches || !e.touches[0]) return;
        const currentY = e.touches[0].clientY;
        const deltaY = touchStartY - currentY;

        if (deltaY > 10) {
            const swipeProgress = Math.min(deltaY / 150, 1);
            updateFlameBlowingState(Math.max(currentProgress, swipeProgress));
        }
    };

    cakeContainer.addEventListener('touchstart', startInteraction, { passive: true });
    cakeContainer.addEventListener('touchend', clearHold);
    cakeContainer.addEventListener('touchcancel', clearHold);
    cakeContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    cakeContainer.addEventListener('mousedown', startInteraction);
    cakeContainer.addEventListener('mouseup', clearHold);
    cakeContainer.addEventListener('mouseleave', clearHold);
}

function initFireflies() {
    const container = document.getElementById('fireflies-container');
    if (!container) return;
    container.innerHTML = '';

    const fireflyCount = 20;
    for (let i = 0; i < fireflyCount; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';

        firefly.style.left = `${Math.random() * window.innerWidth}px`;
        firefly.style.top = `${Math.random() * window.innerHeight}px`;

        const moveX = (Math.random() - 0.5) * 200;
        const moveY = (Math.random() - 0.5) * 200;
        const moveX2 = moveX + (Math.random() - 0.5) * 120;
        const moveY2 = moveY + (Math.random() - 0.5) * 120;

        firefly.style.setProperty('--moveX', `${moveX}px`);
        firefly.style.setProperty('--moveY', `${moveY}px`);
        firefly.style.setProperty('--moveX2', `${moveX2}px`);
        firefly.style.setProperty('--moveY2', `${moveY2}px`);

        firefly.style.animationDuration = `${Math.random() * 4 + 3}s`;
        firefly.style.animationDelay = `${Math.random() * 5}s`;

        container.appendChild(firefly);
    }
}

// ==========================================
// 6. XỬ LÝ LỌ ƯỚC NGUYỆN & MÁY PHÁT NHẠC
// ==========================================
function initWishCardsInteraction() {
    const cards = document.querySelectorAll('.wish-card');
    const sceneWishes = document.getElementById('scene-wishes');
    const firefliesContainer = document.getElementById('fireflies-container');
    const wishesHeaderSmall = document.querySelector('.wishes-header-small');
    const wishesTitle = document.querySelector('.wishes-title');
    const finalWish = document.getElementById('final-wish');
    const darkOverlay = document.getElementById('dark-overlay');

    const scenePlayer = document.getElementById('scene-player');
    const turntableBox = document.querySelector('.turntable-box');
    const vinylDisc = document.getElementById('vinyl-disc');
    const needle = document.querySelector('.tonearm');
    const startListenBtn = document.getElementById('start-listen-btn');
    const bgAudio = document.getElementById('bg-audio');
    const endButtonsContainer = document.getElementById('end-buttons-container');

    const discMapping = {
        'happiness': 'assets/image/disc_happiness.svg',
        'vietlott': 'assets/image/disc_vietlott.svg',
        'health': 'assets/image/disc_health.svg',
        'peace': 'assets/image/disc_peace.svg'
    };

    const audioMapping = {
        'happiness': 'assets/audio/du1.mp3',
        'vietlott': 'assets/audio/du2.mp3',
        'health': 'assets/audio/du3.mp3',
        'peace': 'assets/audio/du4.mp3'
    };

    let selectedWishType = 'happiness';

    cards.forEach(card => {
        const handleWishSelection = () => {
            cards.forEach(c => c.style.pointerEvents = 'none');
            selectedWishType = card.getAttribute('data-wish');

            if (navigator.vibrate) navigator.vibrate([150, 80, 150]);

            cards.forEach(c => {
                if (c !== card) {
                    c.style.transition = 'opacity 1.2s ease';
                    c.style.opacity = '0';
                }
            });

            if (wishesHeaderSmall) {
                wishesHeaderSmall.style.transition = 'opacity 1.2s ease';
                wishesHeaderSmall.style.opacity = '0';
            }
            if (wishesTitle) {
                wishesTitle.style.transition = 'opacity 1.2s ease';
                wishesTitle.style.opacity = '0';
            }
            if (firefliesContainer) {
                firefliesContainer.style.transition = 'opacity 1.2s ease';
                firefliesContainer.style.opacity = '0';
            }
            if (finalWish) {
                finalWish.style.transition = 'opacity 1.2s ease';
                finalWish.style.opacity = '0';
            }

            setTimeout(() => {
                card.style.transition = 'transform 1.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.4s ease';
                card.style.transform = 'translateY(-30vh) scale(0.15)';
                card.style.opacity = '0';

                setTimeout(() => {
                    sceneWishes.classList.remove('active');
                    if (darkOverlay) darkOverlay.classList.remove('active');

                    if (discMapping[selectedWishType]) {
                        vinylDisc.src = discMapping[selectedWishType];
                    }

                    scenePlayer.classList.add('active');

                    setTimeout(() => {
                        if (turntableBox) turntableBox.classList.add('show');
                        setTimeout(() => {
                            if (vinylDisc) vinylDisc.classList.add('show');
                            if (startListenBtn) startListenBtn.classList.add('show');
                        }, 800);
                    }, 600);

                }, 1400);
            }, 1200);
        };

        card.addEventListener('click', handleWishSelection);
    });

    const replayBtn = document.getElementById('replay-btn');
    const sendSkyBtn = document.getElementById('send-sky-btn');

    if (startListenBtn) {
        startListenBtn.addEventListener('click', async () => {
            hbBgm.pause();

            if (needle) needle.classList.add('active');
            playTonearmSound();

            await delay(900);
            if (vinylDisc) vinylDisc.classList.add('spinning');

            if (bgAudio && audioMapping[selectedWishType]) {
                bgAudio.src = audioMapping[selectedWishType];
                bgAudio.play().catch(err => console.log("Audio play failed:", err));
            }

            startFireflies();
            startListenBtn.style.opacity = '0';
            startListenBtn.style.pointerEvents = 'none';
        });
    }

    if (bgAudio) {
        bgAudio.addEventListener('ended', () => {
            if (needle) needle.classList.remove('active');
            if (vinylDisc) vinylDisc.classList.remove('spinning');
            stopFireflies();

            hbBgm.play().catch(err => console.log("BGM resume failed:", err));

            if (endButtonsContainer) {
                endButtonsContainer.style.opacity = '1';
                endButtonsContainer.style.pointerEvents = 'auto';
            }
        });
    }

    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            hbBgm.pause();

            endButtonsContainer.style.opacity = '0';
            endButtonsContainer.style.pointerEvents = 'none';

            if (needle) needle.classList.add('active');
            if (vinylDisc) vinylDisc.classList.add('spinning');

            if (bgAudio) {
                bgAudio.currentTime = 0;
                bgAudio.play().catch(err => console.log("Audio play failed:", err));
            }
            startFireflies();
        });
    }

    let meteorInterval = null;
    function startMeteorShower(container) {
        if (meteorInterval) clearInterval(meteorInterval);
        meteorInterval = setInterval(() => {
            const meteor = document.createElement('div');
            meteor.className = 'shooting-meteor';
            meteor.style.left = `${Math.random() * window.innerWidth}px`;
            meteor.style.top = `${Math.random() * (window.innerHeight * 0.4)}px`;
            container.appendChild(meteor);

            setTimeout(() => { meteor.remove(); }, 1200);
        }, 250);

        if (!container.querySelector('.birthday-wish-text')) {
            const wishText = document.createElement('div');
            wishText.className = 'birthday-wish-text';
            wishText.innerText = 'Chúc mừng sinh nhật tuổi 23 vui vẻ, Thu Giang!';
            container.appendChild(wishText);
        }
    }

    if (sendSkyBtn) {
        sendSkyBtn.addEventListener('click', async () => {
            endButtonsContainer.style.opacity = '0';
            endButtonsContainer.style.pointerEvents = 'none';

            if (bgAudio) bgAudio.pause();
            if (needle) needle.classList.remove('active');
            if (vinylDisc) vinylDisc.classList.remove('spinning');
            stopFireflies();

            let skyScene = document.getElementById('sky-scene');
            if (!skyScene) {
                skyScene = document.createElement('div');
                skyScene.id = 'sky-scene';
                skyScene.innerHTML = `
                    <div class="sky-bg-stars"></div>
                    <div class="sky-fireflies-layer"></div>
                    <div class="sky-header-group" style="display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 2;">
                        <div style="font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 400; letter-spacing: 2px; color: rgba(255,255,255,0.7); text-transform: uppercase; margin: 0;">Gửi lên trời</div>
                        <div style="font-family: 'Cormorant Garamond', serif; font-size: clamp(1.3rem, 3.8vmin, 2rem); font-weight: 600; letter-spacing: 2px; color: rgba(255,255,255,0.9); text-transform: uppercase; margin: 0; text-align: center;">Biến điều ước thành sao băng</div>
                    </div>
                    <div class="glowing-star-container" id="glowing-star" style="position: relative; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; margin: 5px 0;">
                        <div class="star-glow-effect"></div>
                        <svg class="four-pointed-star-svg" viewBox="0 0 100 100" width="50" height="50">
                            <path d="M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z" fill="#ffffff" />
                        </svg>
                    </div>
                    <div class="sky-subtitle" id="sky-subtitle" style="font-family: 'Cormorant Garamond', serif; font-size: clamp(1.1rem, 3.5vmin, 1.8rem); color: #fff; text-align: center; max-width: 85%; opacity: 0; transition: opacity 0.8s ease; min-height: 60px; line-height: 1.5; z-index: 2; margin: 0;"></div>
                `;
                document.body.appendChild(skyScene);

                const skyStarsContainer = skyScene.querySelector('.sky-bg-stars');
                for (let i = 0; i < 110; i++) {
                    const star = document.createElement('div');
                    star.className = 'sky-tiny-star';
                    const size = Math.random() * 3.5 + 1;
                    star.style.width = `${size}px`;
                    star.style.height = `${size}px`;
                    star.style.left = `${Math.random() * 100}%`;
                    star.style.top = `${Math.random() * 100}%`;
                    if (size > 3) {
                        star.style.boxShadow = `0 0 ${size * 2}px rgba(255, 255, 255, 0.9)`;
                        star.style.backgroundColor = '#ffffff';
                    }
                    star.style.animationDuration = `${Math.random() * 3 + 2}s`;
                    star.style.animationDelay = `${Math.random() * 3}s`;
                    skyStarsContainer.appendChild(star);
                }

                const skyFirefliesContainer = skyScene.querySelector('.sky-fireflies-layer');
                for (let i = 0; i < 25; i++) {
                    const firefly = document.createElement('div');
                    firefly.className = 'sky-firefly';
                    firefly.style.left = `${Math.random() * window.innerWidth}px`;
                    firefly.style.top = `${Math.random() * window.innerHeight}px`;
                    firefly.style.setProperty('--moveX', `${(Math.random() - 0.5) * 200}px`);
                    firefly.style.setProperty('--moveY', `${(Math.random() - 0.5) * 200}px`);
                    skyFirefliesContainer.appendChild(firefly);
                }
            }

            skyScene.style.display = 'flex';
            await delay(50);
            skyScene.style.opacity = '1';

            const skySubtitle = document.getElementById('sky-subtitle');
            const glowingStar = document.getElementById('glowing-star');

            const showSkyText = async (text, displayDuration) => {
                skySubtitle.style.opacity = '0';
                await delay(400);
                skySubtitle.textContent = text;
                skySubtitle.style.opacity = '1';
                await delay(displayDuration);
            };

            await delay(1000);
            await showSkyText("Nếu những điều mình vừa nói...", 3000);
            await showSkyText("Có thể mang đến một chút may mắn...", 3000);

            skySubtitle.style.opacity = '0';
            await delay(400);
            skySubtitle.textContent = "Hãy chạm vào ngôi sao.";
            skySubtitle.style.opacity = '1';

            glowingStar.onclick = () => {
                const headerGroup = skyScene.querySelector('.sky-header-group');
                glowingStar.style.pointerEvents = 'none';
                if (headerGroup) headerGroup.style.opacity = '0';
                skySubtitle.style.opacity = '0';

                const bgStars = skyScene.querySelector('.sky-bg-stars');
                if (bgStars) {
                    bgStars.style.transition = 'filter 1.5s ease';
                    bgStars.style.filter = 'blur(1.5px)';
                }

                glowingStar.style.transition = 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.5s ease';
                glowingStar.style.transform = 'translateY(-200px) scale(0.1)';
                glowingStar.style.opacity = '0';

                startMeteorShower(skyScene);
            };
        });
    }

    let fireflyInterval = null;
    function startFireflies() {
        const container = document.querySelector('#scene-player .fireflies-container');
        if (!container) return;

        if (fireflyInterval) clearInterval(fireflyInterval);

        fireflyInterval = setInterval(() => {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';
            firefly.style.left = `${Math.random() * window.innerWidth}px`;
            firefly.style.top = `${Math.random() * window.innerHeight}px`;

            const moveX = (Math.random() - 0.5) * 200;
            const moveY = (Math.random() - 0.5) * 200;
            firefly.style.setProperty('--fireflyX', `${moveX}px`);
            firefly.style.setProperty('--fireflyY', `${moveY}px`);

            const animationDuration = Math.random() * 4 + 3;
            firefly.style.animationDuration = `${animationDuration}s`;
            container.appendChild(firefly);

            setTimeout(() => { firefly.remove(); }, animationDuration * 1000);
        }, 250);
    }

    function stopFireflies() {
        if (fireflyInterval) {
            clearInterval(fireflyInterval);
            fireflyInterval = null;
        }
        const container = document.querySelector('#scene-player .fireflies-container');
        if (container) container.innerHTML = '';
    }
}

// ==========================================
// KÍCH HOẠT MÀN HÌNH BẤT NGỜ & FULLSCREEN
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const surpriseScreen = document.getElementById('scene-surprise');
    const btnYes = document.getElementById('surprise-btn-yes');
    const btnNo = document.getElementById('surprise-btn-no');

    const prepareStableLayout = async () => {
        if (document.fonts) {
            await document.fonts.ready;
        }
        void document.body.offsetHeight;
    };

    if (btnYes) {
        btnYes.addEventListener('click', async () => {
            unlockAudio();
            requestAppFullScreen();

            await prepareStableLayout();

            surpriseScreen.style.opacity = '0';
            setTimeout(() => {
                surpriseScreen.style.display = 'none';
                runAnimationFlow();
            }, 800);
        });
    }

    if (btnNo) {
        btnNo.addEventListener('click', () => {
            document.body.innerHTML = `
                <div style="
                    background: #1a0b1f; 
                    color: #fff; 
                    height: 100vh; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-family: sans-serif;
                    font-size: 1.2rem;
                    text-align: center;
                    padding: 20px;">
                    Website đã đóng. Chúc bạn một ngày tốt lành!
                </div>`;
        });
    }
});
