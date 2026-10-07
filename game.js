// --- CONFIGURAZIONE E STATO DEL GIOCO ---
let gameData = {
    credits: 0,
    totalClicks: 0,
    secondsPlayed: 0,
    clickPowerLevel: 1,
    prestigePoints: 0,
    prestigeMult: 1.0,
    totalAscensions: 0,
    lastUpdate: Date.now(),
    generators: [
        { name: "Python Script", cost: 15, baseCps: 0.5, level: 0 },
        { name: "Mining Botnet", cost: 100, baseCps: 4, level: 0 },
        { name: "AI Core", cost: 1100, baseCps: 32, level: 0 },
        { name: "Quantum Rig", cost: 12000, baseCps: 260, level: 0 }
    ]
};

// --- RIFERIMENTI DOM ---
const mainCounter = document.getElementById('main-counter');
const perSecondDisplay = document.getElementById('per-second');
const bigClicker = document.getElementById('big-clicker');
const generatorsList = document.getElementById('generators-list');
const achievementsList = document.getElementById('achievements-list');
const totalClicksDisplay = document.getElementById('total-clicks');
const playTimeDisplay = document.getElementById('play-time');

const uiPrestigeMult = document.getElementById('prestige-mult');
const uiPrestigePending = document.getElementById('prestige-pending');
const uiPrestigeBtn = document.getElementById('prestige-btn');

// --- FORMATTAZIONE NUMERI ---
function formatNum(num) {
    if (num < 1000) return num.toFixed(1).replace('.0', '');
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
    return (num / 1000000000).toFixed(2) + 'B';
}

// --- CALCOLO COSTI E CPS ---
function getGeneratorCost(gen, level) {
    return Math.floor(gen.cost * Math.pow(1.15, level));
}

function calculatePPS() {
    let pps = 0;
    gameData.generators.forEach(gen => {
        pps += gen.baseCps * gen.level;
    });
    return pps * gameData.prestigeMult;
}

function getClickPower() {
    return 1 * gameData.clickPowerLevel * gameData.prestigeMult;
}

// --- AZIONE PRINCIPALE (CLICK) ---
bigClicker.addEventListener('click', (e) => {
    const power = getClickPower();
    gameData.credits += power;
    gameData.totalClicks++;
    
    createClickText(e, `+${formatNum(power)}`);
    updateUI_Full();
});

function createClickText(e, text) {
    const el = document.createElement('div');
    el.className = 'click-text';
    el.innerText = text;
    el.style.left = (e.clientX - 15) + 'px';
    el.style.top = (e.clientY - 20) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

// --- ACQUISTO GENERATORI ---
function buyGenerator(index) {
    const gen = gameData.generators[index];
    const cost = getGeneratorCost(gen, gen.level);
    
    if (gameData.credits >= cost) {
        gameData.credits -= cost;
        gen.level++;
        updateUI_Full();
        saveGame();
    }
}

// --- RENDER GENERATORI NELLA UI ---
function renderGenerators() {
    if (!generatorsList) return;
    generatorsList.innerHTML = '';
    
    gameData.generators.forEach((gen, index) => {
        const cost = getGeneratorCost(gen, gen.level);
        const canAfford = gameData.credits >= cost;
        
        const div = document.createElement('div');
        div.className = 'gen-item';
        div.innerHTML = `
            <div class="gen-info">
                <div class="gen-title">${gen.name} [Lv. ${gen.level}]</div>
                <div class="gen-stats">Flusso: +${formatNum(gen.baseCps * gameData.prestigeMult)}/s</div>
            </div>
            <button class="buy-btn ${canAfford ? 'can-afford' : ''}" onclick="buyGenerator(${index})">
                ${formatNum(cost)} Crediti
            </button>
        `;
        generatorsList.appendChild(div);
    });
}

// --- SISTEMA DI PRESTIGIO (FRAMMENTI QUANTICI) ---
function calculatePendingPrestige() {
    return Math.floor(Math.sqrt(gameData.credits / 1000));
}

function updatePrestigeUI() {
    const pending = calculatePendingPrestige();
    if (uiPrestigePending) uiPrestigePending.innerText = formatNum(pending) + ' FT';
    if (uiPrestigeMult) uiPrestigeMult.innerText = 'x' + gameData.prestigeMult.toFixed(2);
    
    if (uiPrestigeBtn) {
        if (pending >= 1) {
            uiPrestigeBtn.disabled = false;
            uiPrestigeBtn.classList.add('can-afford');
            uiPrestigeBtn.innerText = `ATTIVA PROTOCOLLO (+${pending} Frammenti)`;
        } else {
            uiPrestigeBtn.disabled = true;
            uiPrestigeBtn.classList.remove('can-afford');
            uiPrestigeBtn.innerText = 'ATTIVA PROTOCOLLO DI ASCENSIONE';
        }
    }
}

if (uiPrestigeBtn) {
    uiPrestigeBtn.addEventListener('click', () => {
        const pending = calculatePendingPrestige();
        if (pending >= 1) {
            gameData.prestigePoints += pending;
            gameData.prestigeMult = 1 + (gameData.prestigePoints * 0.1);
            gameData.totalAscensions++;
            
            gameData.credits = 0;
            gameData.generators.forEach(g => g.level = 0);
            
            saveGame();
            updateUI_Full();
            alert(`⚡ Protocollo di Ascensione completato!\nMoltiplicatore attuale: x${gameData.prestigeMult.toFixed(2)}`);
        }
    });
}

// --- LOG E SUCCESSI ---
function renderAchievements() {
    if (!achievementsList) return;
    achievementsList.innerHTML = `
        <div class="gen-item">
            <div class="gen-info">
                <div class="gen-title">Stato Rete</div>
                <div class="gen-stats">Moltiplicatore Attivo: x${gameData.prestigeMult.toFixed(2)}</div>
            </div>
        </div>
    `;
}

// --- AGGIORNAMENTO INTERFACCIA COMPLETA ---
function updateUI_Full() {
    if (mainCounter) mainCounter.innerText = formatNum(gameData.credits);
    if (perSecondDisplay) perSecondDisplay.innerText = `Crediti al secondo: ${formatNum(calculatePPS())}`;
    if (totalClicksDisplay) totalClicksDisplay.innerText = gameData.totalClicks;
    if (playTimeDisplay) playTimeDisplay.innerText = Math.floor(gameData.secondsPlayed) + 's';
    
    renderGenerators();
    updatePrestigeUI();
    renderAchievements();
}

// --- NAVIGAZIONE TAB (Sincronizzata con index.html) ---
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add('active');
    
    if (tabName === 'generators') document.querySelectorAll('.tab-btn')[0]?.classList.add('active');
    if (tabName === 'missions') document.querySelectorAll('.tab-btn')[1]?.classList.add('active');
    if (tabName === 'prestige') document.querySelectorAll('.tab-btn')[2]?.classList.add('active');
    if (tabName === 'stats') document.querySelectorAll('.tab-btn')[3]?.classList.add('active');
    
    if (tabName === 'missions' && typeof renderMissions === 'function') {
        renderMissions();
    }
}

// --- SALVATAGGIO E CARICAMENTO ---
function saveGame() {
    localStorage.setItem('bitcorp_save', JSON.stringify(gameData));
}

function loadGame() {
    const saved = localStorage.getItem('bitcorp_save');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameData = Object.assign({}, gameData, parsed);
        } catch(e) {
            console.error("Errore nel caricamento salvataggio", e);
        }
    }
}

// --- LOOP PRINCIPALE DI GIOCO (100ms) ---
setInterval(() => {
    const now = Date.now();
    const delta = (now - gameData.lastUpdate) / 1000;
    gameData.lastUpdate = now;
    
    gameData.secondsPlayed += delta;
    
    const pps = calculatePPS();
    if (pps > 0) {
        gameData.credits += pps * delta;
    }
    
    updateUI_Full();
    
    if (Math.floor(gameData.secondsPlayed) % 10 === 0) {
        saveGame();
    }
}, 100);

window.onload = function() {
    loadGame();
    updateUI_Full();
};
