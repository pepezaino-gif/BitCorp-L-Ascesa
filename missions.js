const missionsData = [
    {
        id: 'm1',
        title: "Missione 1: Infiltrazione Locale",
        desc: "Bucare il database della polizia locale. Richiede: 50 crediti e 1 Python Script.",
        check: (g) => g.credits >= 50 && g.generators[0].level >= 1,
        rewardText: "+0.2 Moltiplicatore Globale",
        reward: () => { gameData.prestigeMult += 0.2; },
        completed: false
    },
    {
        id: 'm2',
        title: "Missione 2: Attacco alla Banca",
        desc: "Sottrarre fondi dai terminali della banca centrale. Richiede: 1.000 crediti e 5 Mining Botnet.",
        check: (g) => g.credits >= 1000 && g.generators[1].level >= 5,
        rewardText: "+5 Naniti Quantici Bonus",
        reward: () => { gameData.prestigePoints += 5; gameData.prestigeMult = 1 + (gameData.prestigePoints * 0.15); },
        completed: false
    },
    {
        id: 'm3',
        title: "Missione 3: Il Risveglio dell'AI",
        desc: "Sbloccare il nucleo dell'intelligenza artificiale reclusa. Richiede: 25.000 crediti e 1 AI Core.",
        check: (g) => g.credits >= 25000 && g.generators[2].level >= 1,
        rewardText: "+1.0 Moltiplicatore Globale",
        reward: () => { gameData.prestigeMult += 1.0; },
        completed: false
    }
];

function renderMissions() {
    const list = document.getElementById('missions-list');
    if (!list) return;
    list.innerHTML = '';

    missionsData.forEach((mission, index) => {
        const canClaim = !mission.completed && mission.check(gameData);
        const div = document.createElement('div');
        div.className = `ach-item ${mission.completed ? 'unlocked' : ''}`;
        div.innerHTML = `
            <div class="ach-title">${mission.title} ${mission.completed ? '✅' : ''}</div>
            <div class="ach-desc">${mission.desc}</div>
            <div class="ach-desc" style="color: var(--accent-2); margin-top: 4px;">Ricompensa: ${mission.rewardText}</div>
            ${!mission.completed ? `
                <button class="buy-btn ${canClaim ? 'can-afford' : ''}" style="margin-top: 8px; width: 100%;" onclick="completeMission(${index})" ${!canClaim ? 'disabled style="background:#555; color:#999; cursor:not-allowed;"' : ''}>
                    ${canClaim ? 'RISCUOTI OBIETTIVO' : 'IN CORSO...'}
                </button>
            ` : '<div style="color: #00f2fe; margin-top: 5px; font-weight: bold; text-align: center;">COMPLETATO</div>'}
        `;
        list.appendChild(div);
    });
}

function completeMission(index) {
    const mission = missionsData[index];
    if (!mission.completed && mission.check(gameData)) {
        mission.completed = true;
        mission.reward();
        saveGame();
        updateUI_Full();
        alert(`🎉 Obiettivo completato: ${mission.title}\nRicompensa riscossa!`);
    }
}

// Aggiorniamo la funzione di aggiornamento UI globale per includere le missioni
const originalUpdateFull = window.updateUI_Full;
if (typeof updateUI_Full === 'function') {
    // Esegue il render delle missioni ogni volta che si aggiorna l'interfaccia
    setInterval(() => {
        if (document.getElementById('missions')?.classList.contains('active')) {
            renderMissions();
        }
    }, 1000);
}
