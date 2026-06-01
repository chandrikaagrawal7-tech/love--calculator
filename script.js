// --- STATE & CONFIG ---
let isSoundEnabled = localStorage.getItem('cupid_sound') !== 'false';
let streakCount = parseInt(localStorage.getItem('cupid_streak') || '5', 10);
let energyCount = parseInt(localStorage.getItem('cupid_energy') || '100', 10);
let matchHistory = JSON.parse(localStorage.getItem('cupid_history') || '[]');

// --- WEB AUDIO API SYNTHESIZER ---
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.15) {
    if (!isSoundEnabled) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.log('Audio error:', e);
    }
}

function playBeep() {
    playTone(440, 'sine', 0.08);
}

function playClick() {
    playTone(600, 'triangle', 0.05);
}

function playCalculatingStep() {
    const freqs = [330, 440, 554, 660, 880];
    const randomFreq = freqs[Math.floor(Math.random() * freqs.length)];
    playTone(randomFreq, 'sine', 0.1);
}

function playSuccessSound() {
    if (!isSoundEnabled) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0.15, now + index * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.4);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now + index * 0.1);
            osc.stop(now + index * 0.1 + 0.4);
        });
    } catch(e) { console.log(e); }
}

// --- TOAST NOTIFICATIONS ---
function showToast(message) {
    const toast = document.getElementById('toast-msg');
    const toastText = document.getElementById('toast-text');
    toastText.textContent = message;
    toast.classList.add('show');
    playClick();
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// --- DOM CONTENT LOADED ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI state
    updateGamifiedStats();
    renderHistory();
    initSoundToggle();
    initNavigation();
    initCalculator();
    initGames();
    initShareModal();
});

// --- GAMIFIED STATS ---
function updateGamifiedStats() {
    document.getElementById('streak-count').textContent = streakCount;
    document.getElementById('energy-count').textContent = energyCount;
    localStorage.setItem('cupid_streak', streakCount);
    localStorage.setItem('cupid_energy', energyCount);
}

function initSoundToggle() {
    const soundBtn = document.getElementById('sound-toggle-btn');
    const soundIcon = document.getElementById('sound-icon');
    
    const updateIcon = () => {
        if (isSoundEnabled) {
            soundIcon.className = 'fa-solid fa-volume-high';
            soundBtn.style.background = 'var(--bg-glass)';
        } else {
            soundIcon.className = 'fa-solid fa-volume-xmark';
            soundBtn.style.background = 'rgba(255, 42, 133, 0.2)';
        }
    };
    updateIcon();

    soundBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        localStorage.setItem('cupid_sound', isSoundEnabled);
        updateIcon();
        if (isSoundEnabled) playBeep();
        showToast(isSoundEnabled ? 'Sound Enabled 🔊' : 'Sound Muted 🔇');
    });
}

// --- NAVIGATION ---
function initNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const screens = document.querySelectorAll('main .screen');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.getAttribute('data-tab');
            playClick();
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update active screen
            screens.forEach(screen => screen.classList.remove('active'));
            if (tab === 'home') {
                document.getElementById('screen-home').classList.add('active');
            } else if (tab === 'history') {
                renderHistory();
                document.getElementById('screen-history').classList.add('active');
            } else if (tab === 'games') {
                document.getElementById('screen-games').classList.add('active');
            }
        });
    });
}

// --- CALCULATOR & LOADING LOGIC ---
function initCalculator() {
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    const swapBtn = document.getElementById('swap-btn');
    const calcBtn = document.getElementById('calc-btn');
    const recalcBtn = document.getElementById('recalc-btn');
    const chips = document.querySelectorAll('.quick-match-section .chip');

    // Swap names
    swapBtn.addEventListener('click', () => {
        const temp = name1Input.value;
        name1Input.value = name2Input.value;
        name2Input.value = temp;
        playBeep();
    });

    // Quick Match chips
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            name1Input.value = chip.getAttribute('data-name1');
            name2Input.value = chip.getAttribute('data-name2');
            playBeep();
            showToast(`Loaded ${name1Input.value} & ${name2Input.value}!`);
        });
    });

    // Calculate Button
    calcBtn.addEventListener('click', () => {
        const n1 = name1Input.value.trim();
        const n2 = name2Input.value.trim();

        if (!n1 || !n2) {
            showToast('⚠️ Please enter both names to calculate compatibility!');
            return;
        }

        if (energyCount < 5) {
            showToast('⚡ Not enough Love Energy! Play Trivia or check Oracle to earn more!');
            return;
        }

        // Deduct energy
        energyCount -= 5;
        updateGamifiedStats();

        // Switch to loading screen
        document.getElementById('screen-home').classList.remove('active');
        document.getElementById('screen-loading').classList.add('active');
        
        startLoadingAnimation(n1, n2);
    });

    // Recalculate Button
    recalcBtn.addEventListener('click', () => {
        playClick();
        document.getElementById('screen-results').classList.remove('active');
        document.getElementById('screen-home').classList.add('active');
        name1Input.value = '';
        name2Input.value = '';
        name1Input.focus();
    });
}

// --- 3-SECOND DRAMATIC LOADING ---
function startLoadingAnimation(name1, name2) {
    const progressBar = document.getElementById('loading-progress');
    const promptText = document.getElementById('loading-prompt');
    
    const prompts = [
        "Calibrating astrological charts... ✨",
        "Analyzing heartbeat synchronization... 💓",
        "Consulting the celestial love oracle... 🔮",
        "Measuring quantum aura entanglement... 🌌",
        "Finalizing soulmate compatibility index... 💖"
    ];

    progressBar.style.width = '0%';
    let currentStep = 0;
    const totalSteps = prompts.length;
    const stepDuration = 3000 / totalSteps;

    const interval = setInterval(() => {
        if (currentStep < totalSteps) {
            promptText.textContent = prompts[currentStep];
            progressBar.style.width = `${((currentStep + 1) / totalSteps) * 100}%`;
            playCalculatingStep();
            currentStep++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                showResults(name1, name2);
            }, 200);
        }
    }, stepDuration);
}

// --- DETERMINISTIC ALGORITHM & RESULTS ---
function getDeterministicMatch(name1, name2) {
    // Clean and sort names to ensure A+B == B+A
    const clean1 = name1.trim().toLowerCase();
    const clean2 = name2.trim().toLowerCase();
    const sorted = [clean1, clean2].sort();
    const combined = sorted[0] + '|' + sorted[1];

    // Simple string hash
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = (hash << 5) - hash + combined.charCodeAt(i);
        hash |= 0; // Convert to 32bit int
    }
    hash = Math.abs(hash);

    // Generate score between 35 and 99 (with occasional perfect 100 or fun low score)
    // We use pseudo-random based on hash
    const seededRandom = (seedMod) => {
        const x = Math.sin(hash + seedMod) * 10000;
        return x - Math.floor(x);
    };

    let baseScore = Math.floor(seededRandom(1) * 101); // 0 to 100
    // Adjust distribution to make it fun (skew towards 60-95 for better engagement, but keep variety)
    if (baseScore < 30) baseScore += 25; 
    if (baseScore > 100) baseScore = 100;

    // Sub-scores
    const passion = Math.min(100, Math.max(20, Math.floor(baseScore * 0.8 + seededRandom(2) * 30)));
    const comm = Math.min(100, Math.max(20, Math.floor(baseScore * 0.85 + seededRandom(3) * 25)));
    const trust = Math.min(100, Math.max(20, Math.floor(baseScore * 0.9 + seededRandom(4) * 20)));

    // Tier & Verdict
    let tier = { badge: "🧊 FRIENDZONE", icon: "fa-snowflake", color: "#00f5ff" };
    let verdict = "Cosmic alignment suggests you are better off as best friends. But hey, true love defies the odds every day!";

    if (baseScore >= 90) {
        tier = { badge: "🔥 SOULMATES", icon: "fa-fire", color: "#ff2a85" };
        verdict = "A match made in the stars! Your biological rhythms, emotional frequencies, and cosmic alignments are in perfect harmony. You two are meant for each other!";
    } else if (baseScore >= 75) {
        tier = { badge: "✨ MAGIC SPARK", icon: "fa-wand-magic-sparkles", color: "#8a2be2" };
        verdict = "Incredibly high compatibility! There is intense mutual attraction and profound emotional understanding between you two. A beautiful connection.";
    } else if (baseScore >= 60) {
        tier = { badge: "🌟 STEADY VIBES", icon: "fa-star", color: "#ff9d00" };
        verdict = "A solid foundation for a wonderful relationship. With open communication and shared adventures, this connection will flourish beautifully over time.";
    } else if (baseScore >= 40) {
        tier = { badge: "⚡ CHAOTIC ENERGY", icon: "fa-bolt", color: "#ff0077" };
        verdict = "A passionate but turbulent dynamic. You two will keep each other on your toes with electric debates and intense energy, but patience is required!";
    }

    return { score: baseScore, passion, comm, trust, tier, verdict, name1, name2, date: new Date().toLocaleDateString() };
}

function showResults(name1, name2) {
    // Switch screens
    document.getElementById('screen-loading').classList.remove('active');
    const resultsScreen = document.getElementById('screen-results');
    resultsScreen.classList.add('active');

    // Get match data
    const match = getDeterministicMatch(name1, name2);

    // Update DOM
    document.getElementById('result-names').textContent = `${name1} & ${name2}`;
    document.getElementById('score-val').textContent = match.score;
    
    const gauge = document.getElementById('score-gauge');
    const offset = 502 - (502 * match.score) / 100;
    gauge.style.strokeDashoffset = offset;

    const tierBadge = document.getElementById('tier-badge');
    tierBadge.innerHTML = `<i class="fa-solid ${match.tier.icon}"></i> ${match.tier.badge}`;
    tierBadge.style.borderColor = match.tier.color;

    document.getElementById('verdict-desc').textContent = match.verdict;

    // Breakdown bars
    document.getElementById('passion-val').textContent = `${match.passion}%`;
    document.getElementById('passion-bar').style.width = `${match.passion}%`;

    document.getElementById('comm-val').textContent = `${match.comm}%`;
    document.getElementById('comm-bar').style.width = `${match.comm}%`;

    document.getElementById('trust-val').textContent = `${match.trust}%`;
    document.getElementById('trust-bar').style.width = `${match.trust}%`;

    // Play sounds & confetti
    playSuccessSound();
    triggerConfetti();

    // Save to history & update stats
    saveToHistory(match);
    streakCount++;
    energyCount += 15; // Reward for calculating
    updateGamifiedStats();
    showToast('🎉 Match Calculated! +15 Love Energy earned!');
}

// --- CONFETTI ANIMATION ---
function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#ff2a85', '#8a2be2', '#00f5ff', '#ffd8e7', '#ff9d00'];

    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height * 0.4,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12 - 6,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * 360,
            vrot: (Math.random() - 0.5) * 10
        });
    }

    let startTime = Date.now();
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let elapsed = Date.now() - startTime;

        particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3; // gravity
            p.rot += p.vrot;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        if (elapsed < 4000) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    animate();
}

// --- HISTORY MANAGEMENT ---
function saveToHistory(match) {
    // Check if match already exists
    const existingIndex = matchHistory.findIndex(m => 
        (m.name1 === match.name1 && m.name2 === match.name2) ||
        (m.name1 === match.name2 && m.name2 === match.name1)
    );

    if (existingIndex !== -1) {
        matchHistory.splice(existingIndex, 1);
    }

    matchHistory.unshift(match);
    if (matchHistory.length > 20) matchHistory.pop(); // Keep max 20

    localStorage.setItem('cupid_history', JSON.stringify(matchHistory));
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-container');
    container.innerHTML = '';

    if (matchHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-history">
                <i class="fa-solid fa-heart-circle-exclamation"></i>
                <p>No matches recorded yet. Calculate compatibility to start your history streak!</p>
            </div>
        `;
        return;
    }

    matchHistory.forEach(match => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div>
                <div class="history-names">${match.name1} & ${match.name2}</div>
                <div class="history-date"><i class="fa-regular fa-calendar-days"></i> ${match.date}</div>
            </div>
            <div class="history-score-badge">${match.score}%</div>
        `;

        card.addEventListener('click', () => {
            playClick();
            // Switch to results screen directly
            document.querySelectorAll('main .screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-results').classList.add('active');
            
            // Populate results
            document.getElementById('result-names').textContent = `${match.name1} & ${match.name2}`;
            document.getElementById('score-val').textContent = match.score;
            document.getElementById('score-gauge').style.strokeDashoffset = 502 - (502 * match.score) / 100;
            
            const tierBadge = document.getElementById('tier-badge');
            tierBadge.innerHTML = `<i class="fa-solid ${match.tier.icon}"></i> ${match.tier.badge}`;
            tierBadge.style.borderColor = match.tier.color;
            
            document.getElementById('verdict-desc').textContent = match.verdict;
            document.getElementById('passion-val').textContent = `${match.passion}%`;
            document.getElementById('passion-bar').style.width = `${match.passion}%`;
            document.getElementById('comm-val').textContent = `${match.comm}%`;
            document.getElementById('comm-bar').style.width = `${match.comm}%`;
            document.getElementById('trust-val').textContent = `${match.trust}%`;
            document.getElementById('trust-bar').style.width = `${match.trust}%`;
        });

        container.appendChild(card);
    });

    // Clear button
    const clearBtn = document.getElementById('clear-history-btn');
    clearBtn.onclick = () => {
        matchHistory = [];
        localStorage.removeItem('cupid_history');
        renderHistory();
        playBeep();
        showToast('🗑️ History Cleared!');
    };
}

// --- DAILY ORACLE & GAMES ---
function initGames() {
    const oracleBtn = document.getElementById('oracle-btn');
    const oracleResult = document.getElementById('oracle-result');
    const oracleQuote = document.getElementById('oracle-quote');
    const triviaBtns = document.querySelectorAll('.trivia-btn');

    const quotes = [
        "The energy of the universe favors bold confessions today. Speak your truth! ✨",
        "A surprise message from someone special will brighten your evening. 📱",
        "True compatibility is built on shared laughter. Find a reason to smile together today! 💖",
        "The stars align for romantic gestures. Don't hold back your affection. 🌟",
        "Patience is your greatest love asset right now. Let things flow naturally. 🌊",
        "An unexpected encounter could lead to a beautiful cosmic connection. 🌌",
        "Vulnerability is your superpower today. Open your heart to deeper trust. 🗝️"
    ];

    oracleBtn.addEventListener('click', () => {
        playSuccessSound();
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        oracleQuote.textContent = randomQuote;
        oracleResult.style.display = 'block';
        oracleBtn.style.display = 'none';
        
        energyCount += 10;
        updateGamifiedStats();
        showToast('🔮 Oracle Card Pulled! +10 Love Energy earned!');
    });

    triviaBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isCorrect = btn.getAttribute('data-correct') === 'true';
            if (isCorrect) {
                btn.style.background = '#25D366';
                btn.style.borderColor = '#25D366';
                playSuccessSound();
                energyCount += 20;
                updateGamifiedStats();
                showToast('🎉 Correct Answer! +20 Love Energy earned!');
            } else {
                btn.style.background = '#ff0077';
                btn.style.borderColor = '#ff0077';
                playBeep();
                showToast('❌ Incorrect! The Heart is the universal symbol of love.');
            }
            // Disable buttons after answer
            triviaBtns.forEach(b => b.disabled = true);
        });
    });
}

// --- SHARE MODAL ---
function initShareModal() {
    const shareBtn = document.getElementById('share-btn');
    const shareModal = document.getElementById('share-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    const shareModalNames = document.getElementById('share-modal-names');
    const shareModalScore = document.getElementById('share-modal-score');
    const shareModalBadge = document.getElementById('share-modal-badge');

    const shareWa = document.getElementById('share-wa');
    const shareTw = document.getElementById('share-tw');
    const shareCp = document.getElementById('share-cp');

    shareBtn.addEventListener('click', () => {
        playClick();
        const names = document.getElementById('result-names').textContent;
        const score = document.getElementById('score-val').textContent;
        const badgeText = document.getElementById('tier-badge').textContent.trim();

        shareModalNames.textContent = names;
        shareModalScore.textContent = `${score}%`;
        shareModalBadge.textContent = badgeText;

        shareModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        playClick();
        shareModal.classList.remove('active');
    });

    // Share actions
    const getShareText = () => {
        const names = shareModalNames.textContent;
        const score = shareModalScore.textContent;
        const badgeText = shareModalBadge.textContent;
        return `💖 LOVE CALCULATOR MATCH 💖\n${names}: ${score} (${badgeText})\nCalculate your cosmic compatibility now!`;
    };

    shareWa.addEventListener('click', () => {
        playClick();
        const text = encodeURIComponent(getShareText());
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });

    shareTw.addEventListener('click', () => {
        playClick();
        const text = encodeURIComponent(getShareText());
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    });

    shareCp.addEventListener('click', () => {
        playClick();
        navigator.clipboard.writeText(getShareText()).then(() => {
            showToast('📋 Share text copied to clipboard!');
            shareModal.classList.remove('active');
        }).catch(() => {
            showToast('⚠️ Failed to copy text.');
        });
    });
}
