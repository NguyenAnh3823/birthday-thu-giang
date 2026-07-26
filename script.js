// ==========================================
// 0. CẤU HÌNH ÂM THANH PIANO & NHẠC NỀN MP3
// ==========================================
let pianoAudioCtx = null;
let isPianoPlaying = false;

function playPianoHappyBirthday() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!pianoAudioCtx) pianoAudioCtx = new AudioContext();
        if (pianoAudioCtx.state === 'suspended') pianoAudioCtx.resume();

        if (isPianoPlaying) return;
        isPianoPlaying = true;

        const notes = [
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

        let currTime = pianoAudioCtx.currentTime;
        let totalDuration = 0;

        notes.forEach(note => {
            const osc = pianoAudioCtx.createOscillator();
            const gain = pianoAudioCtx.createGain();
            const filter = pianoAudioCtx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, currTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(4000, currTime);

            gain.gain.setValueAtTime(0, currTime);
            gain.gain.linearRampToValueAtTime(0.2, currTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, currTime + note.d);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(pianoAudioCtx.destination);

            osc.start(currTime);
            osc.stop(currTime + note.d);

            currTime += note.d + 0.08;
            totalDuration = currTime - pianoAudioCtx.currentTime;
        });

        if (isPianoPlaying) {
            setTimeout(() => {
                if (isPianoPlaying) playPianoHappyBirthday();
            }, totalDuration * 1000 + 1500);
        }
    } catch (e) { }
}

function stopPianoHappyBirthday() {
    isPianoPlaying = false;
}

const hbBgm = new Audio('assets/audio/happy_birthday.mp3');
hbBgm.loop = true;
hbBgm.volume = 0.6;

// ==========================================
// 1. CẤU HÌNH BIẾN CHÍNH (SCENE 1) - RESPONSIVE SYNC
// ==========================================
const targetDate = 12;
const wrapper = document.getElementById('numbers-wrapper');

let html = '';
for (let i = 1; i <= 31; i++) {
    html += `<div class="number-item" id="num-${i}">${i}</div>`;
}
wrapper.innerHTML = html;

// [RESPONSIVE FIX] Lấy chiều cao thực tế của thẻ số theo responsive CSS
function getNumberHeight() {
    const sampleItem = document.querySelector('.number-item');
    return sampleItem ? sampleItem.offsetHeight : 90;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 2. CÁC HÀM ÂM THANH (WEB AUDIO API)
// ==========================================
function playTickSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
    } catch (e) { }
}

function playTargetSelectedSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.6);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
    } catch (e) { }
}

function playLightCandleSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const duration = 0.2;
        const ctx = new AudioContext();
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
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(3500, ctx.currentTime + duration);
        filter.Q.value = 4;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        noise.stop(ctx.currentTime + duration);
    } catch (e) { }
}

let sharedAudioCtx = null;
function playBlowSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!sharedAudioCtx) sharedAudioCtx = new AudioContext();
        if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();

        const duration = 1.5;
        const bufferSize = sharedAudioCtx.sampleRate * duration;
        const buffer = sharedAudioCtx.createBuffer(1, bufferSize, sharedAudioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, sharedAudioCtx.currentTime);
        filter.frequency.linearRampToValueAtTime(550, sharedAudioCtx.currentTime + duration / 2);
        filter.frequency.linearRampToValueAtTime(150, sharedAudioCtx.currentTime + duration);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, sharedAudioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, sharedAudioCtx.currentTime + 0.4);
        gain.gain.linearRampToValueAtTime(0.001, sharedAudioCtx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(sharedAudioCtx.destination);
        noise.start();
        noise.stop(sharedAudioCtx.currentTime + duration);
    } catch (e) { }
}

function playTonearmSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
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
                    playTickSound();
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
    document.getElementById(`num-${targetDate}`).classList.add('active');
    playTargetSelectedSound();
    document.getElementById('glow').style.opacity = '1';
    document.getElementById('arrow').style.opacity = '1';

    await delay(800);
    document.getElementById('month').classList.add('show-element');

    playPianoHappyBirthday();

    await delay(1000);
    document.getElementById('hb-text').classList.add('show-element');
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
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
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
                x: x,
                y: y,
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

        particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(index, 1);
                return;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

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
    playPianoHappyBirthday();
    const cakeContainer = document.getElementById('cake-container');
    const candleFlame = document.getElementById('candle-flame');
    const warmGlow = document.getElementById('warm-glow');
    const smoke = document.getElementById('smoke');
    const instructionText = document.getElementById('instruction-text');
    const subtitleText = document.getElementById('subtitle-text');
    const sceneCake = document.getElementById('scene-cake');

    instructionText.textContent = "👆 Nhấn giữ hoặc vuốt lên ngọn nến để thổi nến";

    let isBlown = false;
    let holdStartTime = 0;
    let holdProgressTimer = null;
    const HOLD_DURATION = 3000;

    let swipeCount = 0;
    let lastSwipeDirection = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let swipeResetTimer = null;

    let darkOverlay = document.querySelector('.dark-overlay');
    if (!darkOverlay) {
        darkOverlay = document.createElement('div');
        darkOverlay.className = 'dark-overlay';
        document.body.appendChild(darkOverlay);
    }

    let finalWish = document.querySelector('.final-wish');
    if (!finalWish) {
        finalWish = document.createElement('div');
        finalWish.className = 'final-wish';
        document.body.appendChild(finalWish);
    }

    const CIRCUMFERENCE = 2 * Math.PI * 26;
    let progressRing = cakeContainer.querySelector('.blow-progress-ring');
    let ringFill = null;

    if (!progressRing) {
        progressRing = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        progressRing.setAttribute('class', 'blow-progress-ring');
        progressRing.setAttribute('viewBox', '0 0 64 64');
        progressRing.innerHTML = `
            <circle class="ring-bg" cx="32" cy="32" r="26" fill="none"></circle>
            <circle class="ring-fill" cx="32" cy="32" r="26" fill="none"></circle>
        `;
        cakeContainer.appendChild(progressRing);
    }

    ringFill = progressRing.querySelector('.ring-fill');
    if (ringFill) {
        ringFill.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
        ringFill.style.strokeDashoffset = `${CIRCUMFERENCE}`;
    }

    const extinguishCandle = async () => {
        if (isBlown) return;
        isBlown = true;

        clearHold();
        clearSwipeReset();

        stopPianoHappyBirthday();

        if (progressRing) progressRing.classList.remove('active');

        candleFlame.classList.remove('lit');
        candleFlame.style.transform = '';
        candleFlame.style.opacity = '0';
        warmGlow.classList.remove('lit');
        smoke.classList.add('active');

        subtitleText.classList.remove('show');
        instructionText.classList.remove('show');

        darkOverlay.classList.add('active');
        sceneCake.style.opacity = '0';

        await delay(2000);

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

    const updateFlameBlowingState = (progressRatio, type = 'hold') => {
        if (isBlown) return;

        const scale = 1 - (progressRatio * 0.5);
        const opacity = 1 - (progressRatio * 0.4);
        const randomRotate = (Math.random() - 0.5) * (progressRatio * 30);

        candleFlame.style.transform = `translate(-50%, -100%) scale(${scale}) rotate(${randomRotate}deg)`;
        candleFlame.style.opacity = opacity;

        if (type === 'hold') {
            instructionText.textContent = `💨 Nhấn nữa... giữ tiếp...`;
        } else if (type === 'swipe') {
            instructionText.textContent = `💨 Đang vuốt... Lần ${swipeCount}/5`;
        }

        if (progressRing && ringFill) {
            if (progressRatio > 0) {
                progressRing.classList.add('active');
                const offset = CIRCUMFERENCE - (progressRatio * CIRCUMFERENCE);
                ringFill.style.strokeDashoffset = offset;
            } else {
                progressRing.classList.remove('active');
            }
        }

        if (type === 'hold' && progressRatio >= 2 / 3) {
            const darkProgress = (progressRatio - 2 / 3) / (1 - 2 / 3);
            darkOverlay.style.opacity = (darkProgress * 0.85).toFixed(2);
        }
    };

    const resetFlameState = () => {
        if (isBlown) return;
        candleFlame.style.transform = '';
        candleFlame.style.opacity = '';
        instructionText.textContent = "👆 Nhấn giữ hoặc vuốt lên ngọn nến để thổi nến";
        darkOverlay.style.opacity = '0';

        if (progressRing && ringFill) {
            progressRing.classList.remove('active');
            ringFill.style.strokeDashoffset = `${CIRCUMFERENCE}`;
        }
    };

    const startHold = (e) => {
        playPianoHappyBirthday();
        if (isBlown) return;
        if (e.touches) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }

        holdStartTime = Date.now();
        holdProgressTimer = setInterval(() => {
            const elapsedTime = Date.now() - holdStartTime;
            const progress = Math.min(elapsedTime / HOLD_DURATION, 1);
            updateFlameBlowingState(progress, 'hold');

            if (elapsedTime >= HOLD_DURATION) {
                extinguishCandle();
            }
        }, 50);

        playBlowSound();
    };

    const clearHold = () => {
        if (holdProgressTimer) {
            clearInterval(holdProgressTimer);
            holdProgressTimer = null;
        }
        if (!isBlown) resetFlameState();
    };

    const clearSwipeReset = () => {
        if (swipeResetTimer) {
            clearTimeout(swipeResetTimer);
            swipeResetTimer = null;
        }
    };

    const handleTouchMove = (e) => {
        if (isBlown || !e.touches) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - touchStartX;
        const diffY = currentY - touchStartY;

        if (Math.abs(diffX) > 35 || Math.abs(diffY) > 35) {
            let currentDirection = Math.abs(diffX) > Math.abs(diffY)
                ? (diffX > 0 ? 'right' : 'left')
                : (diffY > 0 ? 'down' : 'up');

            if (lastSwipeDirection && lastSwipeDirection !== currentDirection) {
                swipeCount++;
                updateFlameBlowingState(swipeCount / 5, 'swipe');

                if (swipeCount >= 5) {
                    extinguishCandle();
                    return;
                }

                clearSwipeReset();
                swipeResetTimer = setTimeout(() => {
                    swipeCount = 0;
                    lastSwipeDirection = null;
                    resetFlameState();
                }, 1500);
            }

            lastSwipeDirection = currentDirection;
            touchStartX = currentX;
            touchStartY = currentY;
        }
    };

    cakeContainer.addEventListener('touchstart', startHold, { passive: true });
    cakeContainer.addEventListener('touchend', clearHold);
    cakeContainer.addEventListener('touchcancel', clearHold);
    cakeContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    cakeContainer.addEventListener('mousedown', startHold);
    cakeContainer.addEventListener('mouseup', clearHold);
}

function initFireflies() {
    const container = document.getElementById('fireflies-container');
    if (!container) return;

    const fireflyCount = 20;
    for (let i = 0; i < fireflyCount; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';

        firefly.style.left = `${Math.random() * window.innerWidth}px`;
        firefly.style.top = `${Math.random() * window.innerHeight}px`;

        const moveX = (Math.random() - 0.5) * 250;
        const moveY = (Math.random() - 0.5) * 250;
        const moveX2 = moveX + (Math.random() - 0.5) * 150;
        const moveY2 = moveY + (Math.random() - 0.5) * 150;

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
    const finalWish = document.querySelector('.final-wish');
    const darkOverlay = document.querySelector('.dark-overlay');

    const scenePlayer = document.getElementById('scene-player');
    const turntableBox = document.querySelector('.turntable-box');
    const vinylDisc = document.getElementById('vinyl-disc');
    const needle = document.querySelector('.tonearm');
    const startListenBtn = document.getElementById('start-listen-btn');
    const bgAudio = document.getElementById('bg-audio');

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
    let fireflyInterval = null;

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
                card.style.transform = 'translateY(-260px) scale(0.15)';
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
        card.addEventListener('touchstart', handleWishSelection, { passive: true });
    });

    let endButtonsContainer = document.querySelector('.end-buttons-container');
    if (!endButtonsContainer) {
        endButtonsContainer = document.createElement('div');
        endButtonsContainer.className = 'end-buttons-container';
        endButtonsContainer.innerHTML = `
            <button class="custom-action-btn" id="replay-btn">↺ Nghe lại</button>
            <button class="custom-action-btn" id="send-sky-btn">⭐ Gửi lời chúc lên bầu trời</button>
        `;
        endButtonsContainer.style.position = 'absolute';
        endButtonsContainer.style.bottom = '12%';
        endButtonsContainer.style.left = '50%';
        endButtonsContainer.style.transform = 'translateX(-50%)';
        endButtonsContainer.style.display = 'flex';
        endButtonsContainer.style.flexDirection = 'row';
        endButtonsContainer.style.gap = '12px';
        endButtonsContainer.style.alignItems = 'center';
        endButtonsContainer.style.justifyContent = 'center';
        endButtonsContainer.style.opacity = '0';
        endButtonsContainer.style.pointerEvents = 'none';
        endButtonsContainer.style.transition = 'opacity 0.8s ease';
        endButtonsContainer.style.zIndex = '60';
        endButtonsContainer.style.width = '100%';
        endButtonsContainer.style.padding = '0 20px';
        endButtonsContainer.style.boxSizing = 'border-box';

        setTimeout(() => {
            const btns = endButtonsContainer.querySelectorAll('.custom-action-btn');
            btns.forEach(btn => {
                btn.style.padding = '10px 18px';
                btn.style.fontSize = 'clamp(0.9rem, 2.5vw, 1.1rem)';
                btn.style.fontFamily = "'Montserrat', sans-serif";
                btn.style.fontWeight = '500';
                btn.style.borderRadius = '30px';
                btn.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                btn.style.background = 'rgba(255, 255, 255, 0.15)';
                btn.style.backdropFilter = 'blur(10px)';
                btn.style.color = '#fff';
                btn.style.cursor = 'pointer';
                btn.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.2)';
                btn.style.transition = 'all 0.3s ease';
                btn.style.whiteSpace = 'nowrap';
            });
        }, 100);

        scenePlayer.appendChild(endButtonsContainer);
    }

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

    function startMeteorShower(container) {
        setInterval(() => {
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
                        <div class="sky-title" style="font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 400; letter-spacing: 2px; color: rgba(255,255,255,0.7); text-transform: uppercase; margin: 0;">Gửi lên trời</div>
                        <div class="sky-title" style="font-family: 'Cormorant Garamond', serif; font-size: clamp(1.4rem, 4vw, 2rem); font-weight: 600; letter-spacing: 2px; color: rgba(255,255,255,0.9); text-transform: uppercase; margin: 0; text-align: center;">Biến điều ước thành sao băng</div>
                    </div>
                    <div class="glowing-star-container" id="glowing-star" style="position: relative; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; margin: 5px 0;">
                        <div class="star-glow-effect"></div>
                        <svg class="four-pointed-star-svg" viewBox="0 0 100 100" width="50" height="50">
                            <path d="M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z" fill="#ffffff" />
                        </svg>
                    </div>
                    <div class="sky-subtitle" id="sky-subtitle" style="font-family: 'Cormorant Garamond', serif; font-size: clamp(1.2rem, 3.5vw, 1.8rem); color: #fff; text-align: center; max-width: 85%; opacity: 0; transition: opacity 0.8s ease; min-height: 60px; line-height: 1.5; z-index: 2; margin: 0;"></div>
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

            const showSkyText = async (text, duration) => {
                skySubtitle.style.opacity = '0';
                await delay(400);
                skySubtitle.textContent = text;
                skySubtitle.style.opacity = '1';
                await delay(duration);
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

    function startFireflies() {
        const container = document.querySelector('#scene-player .fireflies-container');
        if (!container) return;

        if (fireflyInterval) clearInterval(fireflyInterval);

        fireflyInterval = setInterval(() => {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';
            firefly.style.left = `${Math.random() * window.innerWidth}px`;
            firefly.style.top = `${Math.random() * window.innerHeight}px`;

            const moveX = (Math.random() - 0.5) * 250;
            const moveY = (Math.random() - 0.5) * 250;
            firefly.style.setProperty('--fireflyX', `${moveX}px`);
            firefly.style.setProperty('--fireflyY', `${moveY}px`);

            const duration = Math.random() * 4 + 3;
            firefly.style.animationDuration = `${duration}s`;
            container.appendChild(firefly);

            setTimeout(() => { firefly.remove(); }, duration * 1000);
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

window.addEventListener('DOMContentLoaded', runAnimationFlow);