const gameData = {
    credits: 0,
    totalClicks: 0,
    startTime: Date.now(),
    secondsPlayed: 0,
    lastUpdate: Date.now(),
    prestigePoints: 0,
    prestigeMult: 1,
    totalAscensions: 0,
    generators: [
        { id: 'script', name: 'Python Script', level: 0, baseCost: 10, baseProd: 1 },
        { id: 'bot', name: 'Mining Botnet', level: 0, baseCost: 100, baseProd: 8 },
        { id: 'ai', name: 'AI Core', level: 0, baseCost: 1200, baseProd: 65 },
        { id: 'server', name: 'Quantum Server Farm', level: 0, baseCost: 18000, baseProd: 550 },
        { id: 'corp', name: 'Cyber Corporation', level: 0, baseCost: 300000, baseProd: 4000 },
        { id: 'net', name: 'Darknet Hub', level: 0, baseCost: 5000000, baseProd: 35000 },
        { id: 'gate', name: 'Reality Gateway', level: 0, baseCost: 100000000, baseProd: 300000 }
    ],
    achievements: [
        { id: 'c1', name: 'Novizio Digitale', desc: 'Fai 100 Clic', check: (g) => g.totalClicks >= 100, unlocked: false },
        { id: 'g1', name: 'Script Kiddie', desc: 'Python Script Lv 10', check: (g) => g.generators[0].level >= 10, unlocked: false },
        { id: 'p1', name: 'Rinascita', desc: 'Esegui la prima Ascensione', check: (g) => g.totalAscensions >= 1, unlocked: false },
        { id: 'rich1', name: 'Milionario', desc: 'Possiedi 1 Milione di Crediti', check: (g) => g.credits >= 1e6, unlocked: false }
    ],
    adBoostActive: false,
    adBoostEnds: 0
};

const uiCounter = document.getElementById('main-counter');
const uiPerSecond = document.getElementById('per-second');
const genList = document.getElementById('generators-list');
const bigClicker = document.getElementById('big-clicker');
const achList = document.getElementById('achievements-list');
const uiPrestigeMult = document.getElementById('prestige-mult');
const uiPrestigePending = document.getElementById('prestige-pending');
const uiPrestigeBtn = document.getElementById('prestige-btn');
const uiTotalAscensions = document.getElementById('total-ascensions');
const uiTotalClicks = document.getElementById('total-clicks');
const uiPlayTime = document.getElementById('play-time');
const uiWatchAdBtn = document.getElementById('watch-ad-btn');

function loadGame() {
    const saved = localStorage.getItem('cyberTycoonSave_v2');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(gameData, parsed);
            gameData.startTime = Date.now() - (gameData.secondsPlayed * 1000);
        } catch(e) { console.log("Errore caricamento"); }
    }
    updateUI_Full();
}

function saveGame() {
    localStorage.setItem('cyberTycoonSave_v2', JSON.stringify(gameData));
}

function formatNum(num) {
    if (num === 0) return "0";
    if (num < 1000) return Math.floor(num).toString();
    const k = 1000;
    const sizes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx"];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + sizes[i];
}

function getGeneratorCost(gen, amount = 1) {
    if (amount === 1) {
        return Math.floor(gen.baseCost * Math.pow(1.15, gen.level));
    }
    let totalCost = 0;
    let currentLevel = gen.level;
    let numToBuy = 1;
    let tempCredits = gameData.credits;
    while (tempCredits > 0) {
        let cost = Math.floor(gen.baseCost * Math.pow(1.15, currentLevel));
        if (tempCredits >= cost) {
            tempCredits -= cost;
            totalCost += cost;
            currentLevel++;
            numToBuy++;
        } else { break; }
        if (numToBuy > 500) break;
    }
    return totalCost;
}

function getGeneratorProd(gen) {
    let prod = gen.baseProd * gen.level;
    if (gen.level >= 25) {
        const mults25 = Math.floor(gen.level / 25);
        prod *= Math.pow(4, mults25);
    }
    return prod;
}

function calculatePPS() {
    let totalPPS = 0;
    gameData.generators.forEach(gen => {
        totalPPS += getGeneratorProd(gen);
    });
    let finalPPS = totalPPS * gameData.prestigeMult;
    if (gameData.adBoostActive) finalPPS *= 2;
    return finalPPS;
}

function renderGenerators() {
    genList.innerHTML = '';
    const currentPPS = calculatePPS();

    gameData.generators.forEach((gen, index) => {
        const cost = getGeneratorCost(gen, 1);
        const prod = getGeneratorProd(gen);
        const canAfford = gameData.credits >= cost;
        
        const div = document.createElement('div');
        div.className = 'gen-item';
        
        const prodPerSec = (currentPPS > 0) ? (prod / currentPPS * 100) : 0;

        div.innerHTML = `
            <div class="gen-info">
                <div class="gen-title">${gen.name} <span class="gen-mult">Lv ${gen.level}</span></div>
                <div class="gen-stats">Prod: ${formatNum(prod)}/s (${prodPerSec.toFixed(0)}%)</div>
            </div>
            <div class="gen-btn-group">
                <button class="buy-btn ${canAfford ? 'can-afford' : ''}" onclick="buyGenerator(${index})">
                    COMPRA<br>${formatNum(cost)}
                </button>
                <button class="buy-btn buy-btn-max" onclick="buyGeneratorMax(${index})">Max</button>
            </div>
        `;
        genList.appendChild(div);
    });
}

function buyGenerator(index) {
    const gen = gameData.generators[index];
    const cost = getGeneratorCost(gen, 1);
    if (gameData.credits >= cost) {
        gameData.credits -= cost;
        gen.level++;
        saveGame();
        updateUI_Full();
    }
}

function buyGeneratorMax(index) {
    const gen = gameData.generators[index];
    let levelsBought = 0;
    let totalCost = 0;
    while(true) {
        let cost = Math.floor(gen.baseCost * Math.pow(1.15, gen.level + levelsBought));
        if (gameData.credits - totalCost >= cost) {
            totalCost += cost;
            levelsBought++;
        } else {
            break;
        }
        if (levelsBought > 500) break;
    }
    if (levelsBought > 0) {
        gameData.credits -= totalCost;
        gen.level += levelsBought;
        saveGame();
        updateUI_Full();
    }
}

bigClicker.addEventListener('click', (e) => {
    const pps = calculatePPS();
    const clickVal = Math.max(1, pps);
    gameData.credits += clickVal;
    gameData.totalClicks++;

    const clickText = document.createElement('div');
    clickText.className = 'click-text';
    clickText.innerText = '+' + formatNum(clickVal);
    clickText.style.left = (e.clientX - 20) + 'px';
    clickText.style.top = (e.clientY - 20) + 'px';
    document.body.appendChild(clickText);
    setTimeout(() => clickText.remove(), 1000);

    updateUI_Credits();
    saveGame();
});

function calculatePendingPrestige() {
    let totalLevel = 0;
    gameData.generators.forEach(g => totalLevel += g.level);
    if (totalLevel < 50) return 0;
    return Math.floor(Math.sqrt(totalLevel * 500) / 10);
}

function updatePrestigeUI() {
    const pending = calculatePendingPrestige();
    uiPrestigePending.innerText = formatNum(pending) + ' NT';
    uiPrestigeMult.innerText = 'x' + gameData.prestigeMult.toFixed(2);
    uiTotalAscensions.innerText = gameData.totalAscensions;
    uiPrestigeBtn.disabled = pending < 1;
}

uiPrestigeBtn.addEventListener('click', () => {
    const pending = calculatePendingPrestige();
    if (pending < 1) return;
    if(!confirm("Resettare progressi per guadagnare Naniti Quantici?")) return;

    gameData.credits = 0;
    gameData.prestigePoints += pending;
    gameData.prestigeMult = 1 + (gameData.prestigePoints * 0.1);
    gameData.totalAscensions++;
    gameData.generators.forEach(gen => gen.level = 0);

    saveGame();
    updateUI_Full();
    openTab('generators');
});

function renderAchievements() {
    achList.innerHTML = '';
    gameData.achievements.forEach(ach => {
        const div = document.createElement('div');
        div.className = `ach-item ${ach.unlocked ? 'unlocked' : ''}`;
        div.innerHTML = `<div class="ach-title">${ach.name} ${ach.unlocked ? '✅' : ''}</div><div class="ach-desc">${ach.desc}</div>`;
        achList.appendChild(div);
    });
}

function checkAchievements() {
    let changed = false;
    gameData.achievements.forEach(ach => {
        if (!ach.unlocked && ach.check(gameData)) {
            ach.unlocked = true;
            changed = true;
        }
    });
    if (changed) renderAchievements();
}

uiWatchAdBtn.addEventListener('click', () => {
    if (confirm("Simulazione annuncio: Vuoi raddoppiare la produzione per 5 minuti?")) {
        gameData.adBoostActive = true;
        gameData.adBoostEnds = Date.now() + (5 * 60 * 1000);
        uiWatchAdBtn.innerText = "BOOST ATTIVO";
        uiWatchAdBtn.disabled = true;
        
        const timer = setInterval(() => {
            const rem = Math.floor((gameData.adBoostEnds - Date.now()) / 1000);
            if (rem <= 0) {
                gameData.adBoostActive = false;
                uiWatchAdBtn.innerText = "GUARDA VIDEO AD";
                uiWatchAdBtn.disabled = false;
                clearInterval(timer);
            } else {
                uiWatchAdBtn.innerText = `Boost: ${Math.floor(rem/60)}:${(rem%60 < 10 ? '0':'')}${rem%60}`;
            }
        }, 1000);
        updateUI_Full();
    }
});

function updateUI_Credits() {
    uiCounter.innerText = formatNum(gameData.credits);
    uiPerSecond.innerText = 'Crediti al secondo: ' + formatNum(calculatePPS());
    
    gameData.generators.forEach((gen, i) => {
        const cost = getGeneratorCost(gen, 1);
        const btn = document.querySelectorAll('.buy-btn')[i * 2];
        if (btn) {
            if (gameData.credits >= cost) btn.classList.add('can-afford');
            else btn.classList.remove('can-afford');
        }
    });
}

function updateUI_Full() {
    updateUI_Credits();
    renderGenerators();
    renderAchievements();
    updatePrestigeUI();
    uiTotalClicks.innerText = formatNum(gameData.totalClicks);
    uiPlayTime.innerText = Math.floor(gameData.secondsPlayed) + 's';
}

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    if (tabName === 'generators') document.querySelectorAll('.tab-btn')[0].classList.add('active');
    if (tabName === 'prestige') document.querySelectorAll('.tab-btn')[1].classList.add('active');
    if (tabName === 'stats') document.querySelectorAll('.tab-btn')[2].classList.add('active');
}

setInterval(() => {
    const now = Date.now();
    const delta = (now - gameData.lastUpdate) / 1000;
    gameData.secondsPlayed += delta;
    gameData.lastUpdate = now;

    const pps = calculatePPS();
    if (pps > 0) {
        gameData.credits += pps * delta;
    }

    updateUI_Credits();
    checkAchievements();

    if (Math.floor(gameData.secondsPlayed) % 10 === 0) {
        saveGame();
    }
}, 100);

loadGame();
  
