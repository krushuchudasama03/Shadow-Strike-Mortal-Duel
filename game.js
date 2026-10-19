// Game Engine, Arena Renderer & State Coordinator
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Logical virtual resolution (16:9 widescreen)
        this.virtualWidth = 960;
        this.virtualHeight = 540;

        // Current selection
        this.playerChar = CHARACTERS[0];
        this.cpuChar = CHARACTERS[1];
        this.selectedArena = 0; // 0: Blood Moon, 1: Cyber Dojo, 2: Nether Pit

        // State & Loop
        this.state = 'TITLE'; // TITLE, SELECT, VS, FIGHT, ROUND_END, GAME_OVER
        this.player = null;
        this.cpu = null;
        this.ai = null;
        this.controls = new ControlsManager();

        // Match Progression
        this.round = 1;
        this.maxRounds = 3;
        this.playerScore = 0;
        this.cpuScore = 0;
        this.roundTimer = 99;
        this.timerInterval = null;
        this.bannerText = "";
        this.bannerSubtext = "";
        this.bannerAlpha = 0;

        // Display lag health for smooth street fighter/MK healthbars
        this.playerLagHp = 1000;
        this.cpuLagHp = 1000;

        this.initResize();
        this.initUI();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initResize() {
        const resize = () => {
            const container = document.getElementById('game-container');
            const dpr = window.devicePixelRatio || 1;
            const rect = container.getBoundingClientRect();

            this.canvas.width = this.virtualWidth * dpr;
            this.canvas.height = this.virtualHeight * dpr;
            this.ctx.scale(dpr, dpr);
        };
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => setTimeout(resize, 200));
        resize();
    }

    initUI() {
        // Sound toggle
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const muted = window.soundEngine.toggleMute();
                soundBtn.textContent = muted ? '🔇' : '🔊';
            });
        }

        // Fullscreen toggle
        const fsBtn = document.getElementById('btn-fullscreen');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            });
        }

        // Title Screen Start
        const startBtn = document.getElementById('btn-title-start');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                window.soundEngine.init();
                window.soundEngine.playGong();
                this.showScreen('CHAR_SELECT');
            });
        }

        // Character Select Setup
        this.buildCharacterSelect();

        // Fight Start from Select
        const fightBtn = document.getElementById('btn-start-fight');
        if (fightBtn) {
            fightBtn.addEventListener('click', () => {
                this.startMatch();
            });
        }

        // Rematch & Select Again buttons
        const rematchBtn = document.getElementById('btn-rematch');
        if (rematchBtn) {
            rematchBtn.addEventListener('click', () => {
                this.startMatch();
            });
        }
        const backSelectBtn = document.getElementById('btn-back-select');
        if (backSelectBtn) {
            backSelectBtn.addEventListener('click', () => {
                this.showScreen('CHAR_SELECT');
            });
        }
    }

    buildCharacterSelect() {
        const list = document.getElementById('roster-grid');
        if (!list) return;
        list.innerHTML = '';

        CHARACTERS.forEach((char, index) => {
            const card = document.createElement('div');
            card.className = `roster-card ${index === 0 ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="roster-avatar">${char.avatar}</div>
                <div class="roster-name" style="color: ${char.color}">${char.name}</div>
                <div class="roster-title">${char.title}</div>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('.roster-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.playerChar = char;
                window.soundEngine.playSlash();
                this.updateCharacterPreview(char);
            });
            list.appendChild(card);
        });

        // Set initial preview
        this.updateCharacterPreview(this.playerChar);

        // CPU Selector & Randomizer
        const cpuSelect = document.getElementById('cpu-select-dropdown');
        if (cpuSelect) {
            cpuSelect.innerHTML = '<option value="random">🎲 Random Opponent</option>';
            CHARACTERS.forEach(c => {
                cpuSelect.innerHTML += `<option value="${c.id}">${c.name} (${c.title})</option>`;
            });
            cpuSelect.addEventListener('change', (e) => {
                if (e.target.value === 'random') {
                    const pool = CHARACTERS.filter(c => c.id !== this.playerChar.id);
                    this.cpuChar = pool[Math.floor(Math.random() * pool.length)];
                } else {
                    this.cpuChar = CHARACTERS.find(c => c.id === e.target.value) || CHARACTERS[1];
                }
            });
        }
    }

    updateCharacterPreview(char) {
        document.getElementById('preview-name').textContent = char.name;
        document.getElementById('preview-name').style.color = char.color;
        document.getElementById('preview-title').textContent = `${char.title} • [${char.element}]`;
        document.getElementById('preview-weapon').textContent = `Weapon: ${char.weapon}`;
        document.getElementById('preview-bio').textContent = char.bio;

        // Stats bars
        document.getElementById('stat-hp').style.width = `${(char.hp / 1200) * 100}%`;
        document.getElementById('stat-power').style.width = `${(char.power / 1.4) * 100}%`;
        document.getElementById('stat-speed').style.width = `${(char.speed / 1.4) * 100}%`;
        document.getElementById('stat-def').style.width = `${(char.defense / 1.3) * 100}%`;

        // Powers detail
        document.getElementById('sp1-desc').innerHTML = `<strong>${char.special1.icon} ${char.special1.name}:</strong> ${char.special1.desc}`;
        document.getElementById('sp2-desc').innerHTML = `<strong>${char.special2.icon} ${char.special2.name}:</strong> ${char.special2.desc}`;
        document.getElementById('ult-desc').innerHTML = `<strong>${char.ultimate.icon} ${char.ultimate.name}:</strong> ${char.ultimate.desc}`;
    }

    showScreen(screenId) {
        this.state = screenId;
        const screens = ['screen-title', 'screen-select', 'screen-vs', 'hud-overlay', 'screen-gameover'];
        screens.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.classList.add('hidden');
        });

        if (screenId === 'TITLE') {
            document.getElementById('screen-title').classList.remove('hidden');
            window.soundEngine.stopBGM();
        } else if (screenId === 'CHAR_SELECT') {
            document.getElementById('screen-select').classList.remove('hidden');
            window.soundEngine.stopBGM();
        } else if (screenId === 'VS') {
            document.getElementById('screen-vs').classList.remove('hidden');
        } else if (screenId === 'FIGHT') {
            document.getElementById('hud-overlay').classList.remove('hidden');
            window.soundEngine.startBGM();
        } else if (screenId === 'GAME_OVER') {
            document.getElementById('screen-gameover').classList.remove('hidden');
            window.soundEngine.stopBGM();
        }
    }

    startMatch() {
        // Pick CPU opponent if random selected
        const cpuVal = document.getElementById('cpu-select-dropdown')?.value;
        if (!cpuVal || cpuVal === 'random') {
            const pool = CHARACTERS.filter(c => c.id !== this.playerChar.id);
            this.cpuChar = pool[Math.floor(Math.random() * pool.length)] || CHARACTERS[1];
        }

        // Arena selection
        const arenaVal = document.getElementById('arena-select-dropdown')?.value;
        this.selectedArena = arenaVal ? parseInt(arenaVal) : Math.floor(Math.random() * 3);

        // Reset match score
        this.round = 1;
        this.playerScore = 0;
        this.cpuScore = 0;

        // Show VS Screen
        document.getElementById('vs-p1-avatar').textContent = this.playerChar.avatar;
        document.getElementById('vs-p1-name').textContent = this.playerChar.name;
        document.getElementById('vs-p1-name').style.color = this.playerChar.color;

        document.getElementById('vs-p2-avatar').textContent = this.cpuChar.avatar;
        document.getElementById('vs-p2-name').textContent = this.cpuChar.name;
        document.getElementById('vs-p2-name').style.color = this.cpuChar.color;

        this.showScreen('VS');
        window.soundEngine.playGong();

        // Transition from VS screen to Battle
        setTimeout(() => {
            this.initRound();
        }, 1800);
    }

    initRound() {
        this.player = new Fighter(this.playerChar, true, this.virtualWidth, this.virtualHeight);
        this.cpu = new Fighter(this.cpuChar, false, this.virtualWidth, this.virtualHeight);
        this.ai = new FighterAI(this.cpu, this.player, 'normal');
        this.controls.bindFighter(this.player, this.cpu);

        this.playerLagHp = this.player.maxHp;
        this.cpuLagHp = this.cpu.maxHp;

        window.particleSystem.initAmbient(this.virtualWidth, this.virtualHeight);

        // Setup HUD names & avatars
        document.getElementById('hud-p1-name').textContent = this.playerChar.name;
        document.getElementById('hud-p1-avatar').textContent = this.playerChar.avatar;
        document.getElementById('hud-p2-name').textContent = this.cpuChar.name;
        document.getElementById('hud-p2-avatar').textContent = this.cpuChar.avatar;

        // Set action button labels for character powers
        document.getElementById('sp1-name-tag').textContent = this.playerChar.special1.icon;
        document.getElementById('sp2-name-tag').textContent = this.playerChar.special2.icon;

        this.updateRoundWins();
        this.showScreen('FIGHT');

        // Announcer Sequence
        this.bannerText = `ROUND ${this.round}`;
        this.bannerSubtext = "";
        this.bannerAlpha = 1;
        window.soundEngine.playGong();

        setTimeout(() => {
            this.bannerText = "FIGHT!";
            window.soundEngine.playSlash();
            setTimeout(() => {
                this.bannerAlpha = 0;
                this.startTimer();
            }, 800);
        }, 1100);
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.roundTimer = 99;
        document.getElementById('round-timer').textContent = this.roundTimer;

        this.timerInterval = setInterval(() => {
            if (this.state !== 'FIGHT') return;
            this.roundTimer--;
            document.getElementById('round-timer').textContent = this.roundTimer;

            if (this.roundTimer <= 0) {
                clearInterval(this.timerInterval);
                this.handleTimeOut();
            }
        }, 1000);
    }

    updateRoundWins() {
        const p1Dots = document.querySelectorAll('#p1-wins .win-dot');
        const p2Dots = document.querySelectorAll('#p2-wins .win-dot');

        p1Dots.forEach((dot, i) => {
            dot.classList.toggle('active', i < this.playerScore);
        });
        p2Dots.forEach((dot, i) => {
            dot.classList.toggle('active', i < this.cpuScore);
        });
    }

    handleRoundEnd(winner) {
        clearInterval(this.timerInterval);
        this.state = 'ROUND_END';

        if (winner === 'player') {
            this.playerScore++;
            this.bannerText = "KNOCKOUT!";
            this.bannerSubtext = `${this.playerChar.name} WINS ROUND`;
        } else {
            this.cpuScore++;
            this.bannerText = "KNOCKOUT!";
            this.bannerSubtext = `${this.cpuChar.name} WINS ROUND`;
        }

        this.bannerAlpha = 1;
        this.updateRoundWins();
        window.soundEngine.playGong();

        setTimeout(() => {
            if (this.playerScore >= 2 || this.cpuScore >= 2) {
                this.handleMatchOver(winner);
            } else {
                this.round++;
                this.initRound();
            }
        }, 2200);
    }

    handleTimeOut() {
        if (this.player.hp > this.cpu.hp) {
            this.handleRoundEnd('player');
        } else if (this.cpu.hp > this.player.hp) {
            this.handleRoundEnd('cpu');
        } else {
            // Draw
            this.bannerText = "TIME OVER!";
            this.bannerSubtext = "DRAW";
            this.bannerAlpha = 1;
            setTimeout(() => this.initRound(), 2000);
        }
    }

    handleMatchOver(winner) {
        this.showScreen('GAME_OVER');
        const titleEl = document.getElementById('gameover-title');
        const subEl = document.getElementById('gameover-sub');

        if (winner === 'player') {
            titleEl.textContent = "VICTORY";
            titleEl.style.color = "#4ade80";
            subEl.textContent = `FATALITY! ${this.playerChar.name} RULES THE SHADOW REALM!`;
            window.soundEngine.playSuper();
        } else {
            titleEl.textContent = "DEFEATED";
            titleEl.style.color = "#ef4444";
            subEl.textContent = `YOUR SOUL WAS CLAIMED BY ${this.cpuChar.name}!`;
            window.soundEngine.playGong();
        }
    }

    updateHUD() {
        if (!this.player || !this.cpu) return;

        // Smooth lagging health bars
        const p1Pct = (this.player.hp / this.player.maxHp) * 100;
        const p2Pct = (this.cpu.hp / this.cpu.maxHp) * 100;

        document.getElementById('hud-p1-hp-fill').style.width = `${p1Pct}%`;
        document.getElementById('hud-p2-hp-fill').style.width = `${p2Pct}%`;

        this.playerLagHp += (this.player.hp - this.playerLagHp) * 0.05;
        this.cpuLagHp += (this.cpu.hp - this.cpuLagHp) * 0.05;

        document.getElementById('hud-p1-hp-lag').style.width = `${(this.playerLagHp / this.player.maxHp) * 100}%`;
        document.getElementById('hud-p2-hp-lag').style.width = `${(this.cpuLagHp / this.cpu.maxHp) * 100}%`;

        // Super Meter Fill
        document.getElementById('hud-p1-super-fill').style.width = `${this.player.superMeter}%`;
        const superBtn = document.getElementById('btn-super');
        if (superBtn) {
            superBtn.classList.toggle('ready', this.player.superMeter >= 100);
        }

        // Special Cooldown Overlays
        const sp1Btn = document.getElementById('btn-sp1');
        const sp2Btn = document.getElementById('btn-sp2');
        if (sp1Btn) {
            const cd1 = this.player.cooldowns.special1;
            sp1Btn.classList.toggle('cooldown', cd1 > 0);
            sp1Btn.setAttribute('data-cd', cd1 > 0 ? cd1.toFixed(1) : '');
        }
        if (sp2Btn) {
            const cd2 = this.player.cooldowns.special2;
            sp2Btn.classList.toggle('cooldown', cd2 > 0);
            sp2Btn.setAttribute('data-cd', cd2 > 0 ? cd2.toFixed(1) : '');
        }

        // Combo notification
        const comboEl = document.getElementById('hud-combo-counter');
        if (this.player.comboCount >= 2) {
            comboEl.textContent = `${this.player.comboCount} HITS! COMBO!`;
            comboEl.style.opacity = '1';
        } else {
            comboEl.style.opacity = '0';
        }
    }

    renderArenaBackground() {
        const ctx = this.ctx;
        const w = this.virtualWidth;
        const h = this.virtualHeight;

        if (this.selectedArena === 0) {
            // Blood Moon Shrine (Mortal Kombat / Shadow Fight classic)
            // Gradient Sky
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            sky.addColorStop(0, '#1c0505');
            sky.addColorStop(0.5, '#450a0a');
            sky.addColorStop(1, '#0f0505');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, h);

            // Giant Blood Moon
            ctx.save();
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 45;
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.28, 85, 0, Math.PI * 2);
            ctx.fill();
            // Moon craters / texture
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.arc(w * 0.48, h * 0.25, 25, 0, Math.PI * 2);
            ctx.arc(w * 0.54, h * 0.32, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Distant Mountains & Silhouette Pagoda
            ctx.fillStyle = '#170b0b';
            ctx.beginPath();
            ctx.moveTo(0, h * 0.7);
            ctx.lineTo(w * 0.2, h * 0.45);
            ctx.lineTo(w * 0.45, h * 0.65);
            ctx.lineTo(w * 0.75, h * 0.4);
            ctx.lineTo(w, h * 0.68);
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.fill();

            // Shrine Torii Gate Silhouettes
            ctx.fillStyle = '#0a0a0a';
            // Pillars
            ctx.fillRect(w * 0.15, h * 0.35, 14, h * 0.5);
            ctx.fillRect(w * 0.32, h * 0.35, 14, h * 0.5);
            // Crossbeams
            ctx.fillRect(w * 0.12, h * 0.42, w * 0.23, 12);
            ctx.fillRect(w * 0.10, h * 0.36, w * 0.27, 16);

        } else if (this.selectedArena === 1) {
            // Cyber Dojo (Neon cyan & violet)
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            sky.addColorStop(0, '#030712');
            sky.addColorStop(0.6, '#0f172a');
            sky.addColorStop(1, '#020617');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, h);

            // Neon Grid Floor & Wall
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
            ctx.lineWidth = 1;
            for (let i = 0; i < w; i += 50) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, h);
                ctx.stroke();
            }
            // Hologram Ring in center
            ctx.save();
            ctx.strokeStyle = '#06b6d4';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(w / 2, h * 0.45, 110, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

        } else {
            // Nether Pit
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            sky.addColorStop(0, '#180404');
            sky.addColorStop(0.7, '#2e0a0a');
            sky.addColorStop(1, '#7f1d1d');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, h);

            // Molten magma glow at bottom
            ctx.save();
            ctx.shadowColor = '#f97316';
            ctx.shadowBlur = 30;
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(0, h - 70, w, 70);
            ctx.restore();
        }

        // Stone Ground Platform
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, h - 90, w, 90);
        // Ground trim neon line
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, h - 90);
        ctx.lineTo(w, h - 90);
        ctx.stroke();
    }

    renderBanner() {
        if (this.bannerAlpha <= 0) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = this.bannerAlpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Banner text shadow & glow
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 30;
        ctx.font = '900 68px "Impact", "Arial Black", sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(this.bannerText, this.virtualWidth / 2, this.virtualHeight / 2 - 20);

        if (this.bannerSubtext) {
            ctx.font = '700 24px "Impact", "Arial Black", sans-serif';
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 15;
            ctx.fillText(this.bannerSubtext, this.virtualWidth / 2, this.virtualHeight / 2 + 40);
        }
        ctx.restore();
    }

    animate() {
        requestAnimationFrame(this.animate);

        // Screen Shake calculation
        this.ctx.save();
        if (window.particleSystem.screenShake > 0) {
            const intensity = window.particleSystem.shakeIntensity;
            const dx = (Math.random() - 0.5) * intensity;
            const dy = (Math.random() - 0.5) * intensity;
            this.ctx.translate(dx, dy);
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);

        if (this.state === 'FIGHT' || this.state === 'ROUND_END') {
            // Render Background
            this.renderArenaBackground();

            // Update Fighters
            if (this.player && this.cpu) {
                this.player.update(this.cpu);
                this.cpu.update(this.player);
                if (this.ai) this.ai.update();

                // Check death conditions
                if (this.state === 'FIGHT') {
                    if (this.cpu.isDead && !this.player.isDead) {
                        this.handleRoundEnd('player');
                    } else if (this.player.isDead) {
                        this.handleRoundEnd('cpu');
                    }
                }

                // Render Fighters
                this.player.render(this.ctx);
                this.cpu.render(this.ctx);
            }

            // Update & Render Particles
            window.particleSystem.update(this.virtualWidth, this.virtualHeight);
            window.particleSystem.render(this.ctx);

            // Announcer Banner
            this.renderBanner();

            // Update UI HUD
            this.updateHUD();
        }

        this.ctx.restore();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
