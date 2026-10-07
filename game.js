// --- CONFIGURAZIONE E STATO DEL GIOCO ---
let gameData = {
    credits: 0,
    totalClicks: 0,
    secondsPlayed: 0,
    clickPowerLevel: 1,
    clickUpgradeCost: 25,
    quantumFragments: 0,      // Valuta spendibile nel negozio quantico
    totalAscensions: 0,
    lastUpdate: Date.now(),
    generators: [
        { name: "Python Script", cost: 15, baseCps: 0.5, level: 0 },
        { name: "Mining Botnet", cost: 100, baseCps: 4, level: 0 },
        { name: "AI Core", cost: 1100, baseCps: 32, level: 0 },
        { name: "Quantum Rig", cost: 12000, baseCps: 260, level: 0 }
    ],
    // Miglioramenti permanenti acquistabili con i Frammenti Quantici
    quantumUpgrades: {
        autoClicker: 0,     // Clicca automaticamente al secondo
        globalBoost: 0,     // Aumenta la produzione globale (+25% per livello)
        cheapGenerators: 0  // Riduce il costo dei generatori (-2% per livello)
    }
};

// --- RIFERIMENTI DOM ---
const mainCounter = document.getElementById('main-counter');
const perSecondDisplay = document.getElementById('per-second');
const quantumFragmentsCount = document.getElementById('quantum-fragments-count');
const bigClicker = document.getElementById('big-clicker');
const generatorsList = document.getElementById('generators-list');
const clickUpgradesList = document.getElementById('click-upgrades-list');
const quantumShopList = document.getElementById('quantum-shop-list');
const achievementsList = document.getElementById('achievements-list');
const totalClicksDisplay = document.getElementById('total-clicks');
const playTimeDisplay = document.getElementById('play-time');

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
function getGeneratorCost(gen, index) {
    const discountReduction = gameData.quantumUpgrades.cheapGenerators * 0.02; // -2% per livello
    const multiplier = Math.max(0.2, 1 - discountReduction);
    return Math.floor(gen.cost * Math.pow(1.15, gen.level) * multiplier);
}

function calculatePPS() {
    let pps = 0;
    gameData.generators.forEach(gen => {
        pps += gen.baseCps * gen.level;
    });
    // Appliciamo il boost permanente del negozio quantico (+25% per livello)
    const boostMultiplier = 1 + (gameData.quantumUpgrades.globalBoost * 0.25);
    return pps * boostMultiplier;
}

function getClickPower() {
    const boostMultiplier = 1 + (gameData.quantumUpgrades.globalBoost * 0.25);
    return gameData.clickPowerLevel * boostMultiplier;
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

// --- ACQUISTO POTANZIAMENTO CLIC ---
function buyClickUpgrade() {
    if (gameData.credits >= gameData.clickUpgradeCost) {
        gameData.credits -= gameData.clickUpgradeCost;
        gameData.clickPowerLevel += 1;
        gameData.clickUpgradeCost = Math.floor(gameData.clickUpgradeCost * 1.8);
        updateUI_Full();
        saveGame();
    }
}

// --- ACQUISTO GENERATORI ---
function buyGenerator(index) {
    const gen = gameData.generators[index];
    const cost = getGeneratorCost(gen, index);
    
    if (gameData.credits >= cost) {
        gameData.credits -= cost;
        gen.level++;
        updateUI_Full();
        saveGame();
    }
}

// --- NEGOZIO QUANTICO (ACQUISTO CON FRAMMENTI) ---
const quantumUpgradesConfig = [
    {
        id: 'autoClicker',
        name: 'Nano-Bot Autonomo',
        desc: 'Esegue 1 click automatico al secondo per ogni livello.',
        cost: (lvl) => 2 + lvl * 3,
        max: 10
    },
    {
        id: 'globalBoost',
        name: 'Sintonia Dimensionale',
        desc: 'Aumenta la produzione globale (clic e impianti) del +25% per livello.',
        cost: (lvl) => 5 + lvl * 5,
        max: 20
    },
    {
        id: 'cheapGenerators',
        name: 'Compressione Costi Rete',
        desc: 'Riduce il costo di acquisto di tutti gli impianti del 2% per livello.',
        cost: (lvl) => 3 + lvl * 4,
        max: 15
    }
];

function buyQuantumUpgrade(id) {
    const upgradeDef = quantumUpgradesConfig.find(u => u.id === id);
    const currentLvl = gameData.quantumUpgrades[id];
    const cost = upgradeDef.cost(currentLvl);

    if (gameData.quantumFragments >= cost && currentLvl < upgradeDef.max) {
        gameData.quantumFragments -= cost;
        gameData.quantumUpgrades[id]++;
        updateUI_Full();
        saveGame();
    }
}

function renderQuantumShop() {
    if (!quantumShopList) return;
    quantumShopList.innerHTML = '';

    quantumUpgradesConfig.forEach(u => {
        const currentLvl = gameData.quantumUpgrades[u.id];
        const cost = u.cost(currentLvl);
        const canAfford = gameData.quantumFragments >= cost && currentLvl < u.max;

        const div = document.createElement('div');
        div.className = 'gen-item';
        div.innerHTML = `
            <div class="gen-info">
                <div class="gen-title">${u.name} [Lv. ${currentLvl}/${u.max}]</div>
                <div class="gen-stats">${u.desc}</div>
            </div>
            <button class="quantum-btn ${canAfford ? 'can-afford' : ''}" onclick="buyQuantumUpgrade('${u.id}')" ${currentLvl >= u.max ? 'disabled' : ''}>
                ${currentLvl >= u.max ? 'MAX' : `${cost} FT`}
            </button>
        `;
        quantumShopList.appendChild(div);
    });
}

// --- RENDER POTENZIAMENTO CLIC NELLA UI ---
function renderClickUpgrades() {
    if (!clickUpgradesList) return;
    const canAfford = gameData.credits >= gameData.clickUpgradeCost;
    
    clickUpgradesList.innerHTML = `
        <div class="gen-item">
            <div class="gen-info">
                <div class="gen-title">Algoritmo di Decifratura [Potenza: +${gameData.clickPowerLevel}]</div>
                <div class="gen-stats">Aumenta i crediti per ogni singolo click.</div>
            </div>
            <button class="buy-btn ${canAfford ? 'can-afford' : ''}" onclick="buyClickUpgrade()">
                ${formatNum(gameData.clickUpgradeCost)} Crediti
            </button>
        </div>
    `;
}

// --- RENDER GENERATORI NELLA UI ---
function renderGenerators() {
    if (!generatorsList) return;
    generatorsList.innerHTML = '';
    
    gameData.generators.forEach((gen, index) => {
        const cost = getGeneratorCost(gen, index);
        const canAfford = gameData.credits >= cost;
        
        const div = document.createElement('div');
        div.className = 'gen-item';
        div.innerHTML = `
            <div class="gen-info">
                <div class="gen-title">${gen.name} [Lv. ${gen.level}]</div>
                <div class="gen-stats">Flusso: +${formatNum(gen.baseCps * (1 + gameData.quantumUpgrades.globalBoost * 0.25))}/s</div>
            </div>
            <button class="buy-btn ${canAfford ? 'can-afford' : ''}" onclick="buyGenerator(${index})">
                ${formatNum(cost)} Crediti
            </button>
        `;
        generatorsList.appendChild(div);
    });
}

// --- SISTEMA DI PRESTIGIO ---
function calculatePendingPrestige() {
    return Math.floor(Math.sqrt(gameData.credits / 1000));
}

function updatePrestigeUI() {
    const pending = calculatePendingPrestige();
    if (uiPrestigePending) uiPrestigePending.innerText = formatNum(pending) + ' FT';
    if (quantumFragmentsCount) quantumFragmentsCount.innerText = formatNum(gameData.quantumFragments) + ' FT';
    
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
            gameData.quantumFragments += pending;
            gameData.totalAscensions++;
            
            // Reset dei progressi di base della partita corrente
            gameData.credits = 0;
            gameData.clickPowerLevel = 1;
            gameData.clickUpgradeCost = 25;
            gameData.generators.forEach(g => g.level = 0);
            
            saveGame();
            updateUI_Full();
            alert(`⚡ Protocollo di Ascensione completato!\nHai ottenuto ${pending} Frammenti Quantici da spendere nel Negozio Quantico.`);
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
                <div class="gen-stats">Ascensioni Effettuate: ${gameData.totalAscensions} | Frammenti Totali: ${gameData.quantumFragments}</div>
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
    
    renderClickUpgrades();
    renderGenerators();
    renderQuantumShop();
    updatePrestigeUI();
    renderAchievements();
}

// --- NAVIGAZIONE TAB (5 tab) ---
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add('active');
    
    if (tabName === 'generators') document.querySelectorAll('.tab-btn')[0]?.classList.add('active');
    if (tabName === 'missions') document.querySelectorAll('.tab-btn')[1]?.classList.add('active');
    if (tabName === 'quantumShop') document.querySelectorAll('.tab-btn')[2]?.classList.add('active');
    if (tabName === 'prestige') document.querySelectorAll('.tab-btn')[3]?.classList.add('active');
    if (tabName === 'stats') document.querySelectorAll('.tab-btn')[4]?.classList.add('active');
    
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
    
    // Generazione automatica passiva normale
    const pps = calculatePPS();
    if (pps > 0) {
        gameData.credits += pps * delta;
    }
    
    // Gestione Auto-Clicker dal negozio quantico (1 click al secondo per livello)
    if (gameData.quantumUpgrades.autoClicker > 0) {
        const autoClicks = gameData.quantumUpgrades.autoClicker * delta;
        gameData.credits += getClickPower() * autoClicks;
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
