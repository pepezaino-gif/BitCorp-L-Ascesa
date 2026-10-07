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
        rewardText: "+5 Frammenti Quantici Bonus",
        reward: () => { gameData.prestigePoints += 5; gameData.prestigeMult = 1 + (gameData.prestigePoints * 0.1); },
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
    },
    {
        id: 'm4',
        title: "Missione 4: Sindacato Energetico",
        desc: "Dirottare la rete elettrica di un intero distretto industriale. Richiede: 500.000 crediti e 10 Mining Botnet.",
        check: (g) => g.credits >= 500000 && g.generators[1].level >= 10,
        rewardText: "+20 Frammenti Quantici",
        reward: () => { gameData.prestigePoints += 20; gameData.prestigeMult = 1 + (gameData.prestigePoints * 0.1); },
        completed: false
    },
    {
        id: 'm5',
        title: "Missione 5: Singolarità di Rete",
        desc: "Collegare più AI Core per creare una sub-rete autonoma. Richiede: 5 Milioni di crediti e 5 AI Core.",
        check: (g) => g.credits >= 5000000 && g.generators[2].level >= 5,
        rewardText: "+3.5 Moltiplicatore Globale",
        reward: () => { gameData.prestigeMult += 3.5; },
        completed: false
    },
    {
        id: 'm6',
        title: "Missione 6: Dominio Satellitare",
        desc: "Violare le frequenze di comunicazione dei satelliti orbitali commerciali. Richiede: 50 Milioni di crediti e 1 Quantum Rig.",
        check: (g) => g.credits >= 50000000 && g.generators[3].level >= 1,
        rewardText: "+100 Frammenti Quantici",
        reward: () => { gameData.prestigePoints += 100; gameData.prestigeMult = 1 + (gameData.prestigePoints * 0.1); },
        completed: false
    },
    {
        id: 'm7',
        title: "Missione 7: Blackout Globale",
        desc: "Oscurare temporaneamente i mercati finanziari globali. Richiede: 1 Miliardo di crediti e 10 AI Core.",
        check: (g) => g.credits >= 1000000000 && g.generators[2].level >= 10,
        rewardText: "+10.0 Moltiplicatore Globale",
        reward: () => { gameData.prestigeMult += 10.0; },
        completed: false
    },
    {
        id: 'm8',
        title: "Missione 8: Il Progetto Ghost",
        desc: "Cancellare ogni tracciamento biometrico e finanziario dai server governativi. Richiede: 25 Miliardi di crediti e 5 Quantum Rig.",
        check: (g) => g.credits >= 25000000000 && g.generators[3].level >= 5,
        rewardText: "+500 Frammenti Quantici",
        reward: () => { gameData.prestigePoints += 500; gameData.prestigeMult = 1 + (gameData.prestigePoints * 0.1); },
        completed: false
    },
    {
        id: 'm9',
        title: "Missione 9: Ascendenza Matrix",
        desc: "Ottenere il controllo totale della rete neurale planetaria. Richiede: 1 Trilione di crediti e 10 Quantum Rig.",
        check: (g) => g.credits >= 1000000000000 && g.generators[3].level >= 10,
        rewardText: "+50.0 Moltiplicatore Globale",
        reward: () => { gameData.prestigeMult += 50.0; },
        completed: false
    },
    {
        id: 'm10',
        title: "Missione 10: Oltre il Velo",
        desc: "Trascendere la dimensione digitale ed eseguire almeno 5 Ascensioni complete. Richiede: 10 Trilioni di crediti e 5 Ascensioni.",
        check: (g) => g.credits >= 10000000000000 && g.totalAscensions >= 5,
        rewardText: "Moltiplicatore Globale x2 (Raddoppio Potenza)",
        reward: () => { gameData.prestigeMult *= 2.0; },
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
            <div class="gen-info">
                <div class="gen-title">${mission.title} ${mission.completed ? '✅' : ''}</div>
                <div class="gen-stats">${mission.desc}</div>
                <div class="gen-stats" style="color: var(--accent-cyan); margin-top: 4px;">Ricompensa: ${mission.rewardText}</div>
            </div>
            ${!mission.completed ? `
                <button class="buy-btn ${canClaim ? 'can-afford' : ''}" onclick="completeMission(${index})" ${!canClaim ? 'disabled' : ''}>
                    ${canClaim ? 'RISCUOTI' : 'IN CORSO'}
                </button>
            ` : '<div style="color: var(--accent-cyan); font-weight: bold; font-size: 0.8rem;">COMPLETATO</div>'}
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
        renderMissions();
        alert(`🎉 Obiettivo completato: ${mission.title}\nRicompensa riscossa con successo!`);
    }
}
