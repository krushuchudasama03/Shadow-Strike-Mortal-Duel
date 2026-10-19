// Fighter Class with Physics, Hitboxes, State Machine & Shadow Silhouette Renderer
class Fighter {
    constructor(charData, isPlayer = true, stageWidth = 960, stageHeight = 540) {
        this.charData = charData;
        this.isPlayer = isPlayer;
        this.stageWidth = stageWidth;
        this.stageHeight = stageHeight;

        this.width = 65;
        this.height = 135;
        this.groundY = stageHeight - 90;

        // Position & Physics
        this.x = isPlayer ? stageWidth * 0.25 : stageWidth * 0.75;
        this.y = this.groundY;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5.2 * (charData.speed || 1.0);
        this.jumpForce = -15;
        this.gravity = 0.75;
        this.facing = isPlayer ? 1 : -1;

        // Combat Stats
        this.maxHp = charData.hp || 1000;
        this.hp = this.maxHp;
        this.superMeter = 0; // 0 to 100
        this.isBlocking = false;
        this.isCrouching = false;
        this.isDead = false;

        // State Machine
        this.state = 'idle';
        this.stateFrame = 0;
        this.activeAttack = null;
        this.attackHasHit = false;

        // Cooldowns
        this.cooldowns = {
            special1: 0,
            special2: 0
        };

        // Combos & Status Effects
        this.comboCount = 0;
        this.comboTimer = 0;
        this.frozenTimer = 0;
        this.invincibleTimer = 0;
        this.recoilVx = 0;

        // Cloth / Scarf physics simulation
        this.clothNodes = [
            { x: this.x, y: this.y - 100 },
            { x: this.x - 10, y: this.y - 95 },
            { x: this.x - 20, y: this.y - 90 },
            { x: this.x - 30, y: this.y - 85 }
        ];
    }

    reset(x, facing) {
        this.x = x;
        this.y = this.groundY;
        this.vx = 0;
        this.vy = 0;
        this.facing = facing;
        this.hp = this.maxHp;
        this.superMeter = 25;
        this.state = 'idle';
        this.stateFrame = 0;
        this.activeAttack = null;
        this.attackHasHit = false;
        this.isDead = false;
        this.cooldowns = { special1: 0, special2: 0 };
        this.comboCount = 0;
        this.frozenTimer = 0;
        this.invincibleTimer = 0;
    }

    setState(newState, attackData = null) {
        if (this.isDead) return;
        if (this.state === newState && newState !== 'punch' && newState !== 'kick') return;
        this.state = newState;
        this.stateFrame = 0;
        this.activeAttack = attackData;
        this.attackHasHit = false;
    }

    // Input handlers
    move(dir) {
        if (this.canAct()) {
            this.vx = dir * this.speed;
            if (dir !== 0 && this.state !== 'jump') {
                this.state = 'walk';
            }
        }
    }

    stopMoving() {
        if (this.state === 'walk') {
            this.state = 'idle';
        }
        this.vx = 0;
    }

    jump() {
        if (this.canAct() && this.y >= this.groundY) {
            this.vy = this.jumpForce;
            this.setState('jump');
            window.soundEngine.playSwoosh();
        }
    }

    crouch(isCrouching) {
        if (!this.canAct() && this.state !== 'crouch') return;
        this.isCrouching = isCrouching;
        if (isCrouching && this.y >= this.groundY) {
            this.vx = 0;
            this.setState('crouch');
        } else if (!isCrouching && this.state === 'crouch') {
            this.setState('idle');
        }
    }

    block(isBlocking) {
        if (this.isDead || this.frozenTimer > 0) return;
        this.isBlocking = isBlocking;
        if (isBlocking && this.canAct()) {
            this.vx = 0;
            this.setState('block');
        } else if (!isBlocking && this.state === 'block') {
            this.setState('idle');
        }
    }

    punch() {
        if (!this.canAct()) return;
        this.setState('punch', {
            type: 'punch',
            damage: Math.round(35 * this.charData.power),
            startup: 4,
            active: 10,
            recovery: 8,
            reach: 55,
            isHeavy: false
        });
        window.soundEngine.playSwoosh();
    }

    kick() {
        if (!this.canAct()) return;
        this.setState('kick', {
            type: 'kick',
            damage: Math.round(55 * this.charData.power),
            startup: 7,
            active: 14,
            recovery: 12,
            reach: 75,
            isHeavy: true
        });
        window.soundEngine.playSwoosh();
    }

    special1(opponent) {
        if (!this.canAct() || this.cooldowns.special1 > 0) return;
        const sp = this.charData.special1;
        this.cooldowns.special1 = sp.cooldown;
        this.superMeter = Math.min(100, this.superMeter + 10);

        if (sp.type === 'teleport') {
            // Shadow Step: teleport behind opponent
            window.soundEngine.playSwoosh();
            window.particleSystem.addHitImpact(this.x, this.y - 60, this.charData.color, false);
            this.x = opponent.x - (opponent.facing * 75);
            this.facing = opponent.facing;
            this.setState('punch', {
                type: 'special1',
                damage: Math.round(sp.damage * this.charData.power),
                startup: 3,
                active: 10,
                recovery: 8,
                reach: 70,
                isHeavy: true
            });
            window.soundEngine.playSlash();
        } else if (sp.type === 'projectile') {
            this.setState('special1', {
                type: 'special1',
                damage: 0, // projectile handles damage
                startup: 5,
                active: 12,
                recovery: 10
            });
            window.soundEngine.playFire();
            // Spawn projectile
            window.particleSystem.addProjectile({
                x: this.x + (this.facing * 40),
                y: this.y - 65,
                vx: this.facing * 10,
                vy: 0,
                size: 14,
                color: this.charData.color,
                glowColor: this.charData.glowColor,
                damage: Math.round(sp.damage * this.charData.power),
                owner: this,
                type: this.charData.id === 'kage' ? 'shuriken' : (this.charData.id === 'frost' ? 'ice_spike' : 'orb'),
                freezeDuration: sp.freezeDuration || 0
            });
        } else if (sp.type === 'dash') {
            this.setState('special1', {
                type: 'special1',
                damage: Math.round(sp.damage * this.charData.power),
                startup: 4,
                active: 16,
                recovery: 10,
                reach: 90,
                isHeavy: true
            });
            this.vx = this.facing * 14;
            window.soundEngine.playLightning();
        } else if (sp.type === 'ground') {
            this.setState('special1', {
                type: 'special1',
                damage: Math.round(sp.damage * this.charData.power),
                startup: 12,
                active: 20,
                recovery: 15,
                reach: 120,
                isHeavy: true
            });
            window.soundEngine.playEarth();
            window.particleSystem.addGroundDebris(this.x + (this.facing * 60), this.groundY, 20, this.charData.color);
        }
    }

    special2(opponent) {
        if (!this.canAct() || this.cooldowns.special2 > 0) return;
        const sp = this.charData.special2;
        this.cooldowns.special2 = sp.cooldown;
        this.superMeter = Math.min(100, this.superMeter + 15);

        if (sp.type === 'pillar') {
            this.setState('special2', {
                type: 'special2',
                damage: 0,
                startup: 6,
                active: 14,
                recovery: 12
            });
            if (this.charData.id === 'ignis') {
                window.soundEngine.playFire();
            } else {
                window.soundEngine.playLightning();
            }
            // Spawn pillar right at opponent's ground position after 0.25s
            setTimeout(() => {
                window.particleSystem.addSuperBurst(opponent.x, opponent.y - 40, this.charData.color);
                if (Math.abs(opponent.x - opponent.x) < 70) {
                    opponent.takeDamage(Math.round(sp.damage * this.charData.power), this, true);
                }
            }, 250);
        } else if (sp.type === 'projectile') {
            this.setState('special2', {
                type: 'special2',
                damage: 0,
                startup: 4,
                active: 12,
                recovery: 10
            });
            window.soundEngine.playSlash();
            // Launch 3 shurikens
            for (let i = -1; i <= 1; i++) {
                window.particleSystem.addProjectile({
                    x: this.x + (this.facing * 40),
                    y: this.y - 65 + (i * 18),
                    vx: this.facing * 11,
                    vy: i * 1.5,
                    size: 10,
                    color: this.charData.color,
                    glowColor: this.charData.glowColor,
                    damage: Math.round(sp.damage * 0.45 * this.charData.power),
                    owner: this,
                    type: 'shuriken'
                });
            }
        } else if (sp.type === 'counter' || sp.type === 'dash') {
            this.setState('special2', {
                type: 'special2',
                damage: Math.round(sp.damage * this.charData.power),
                startup: 4,
                active: 18,
                recovery: 12,
                reach: 90,
                isHeavy: true
            });
            this.vx = this.facing * 12;
            window.soundEngine.playFreeze();
        }
    }

    ultimate(opponent) {
        if (!this.canAct() || this.superMeter < 100) return;
        this.superMeter = 0;
        const ult = this.charData.ultimate;

        this.setState('ultimate', {
            type: 'ultimate',
            damage: Math.round(ult.damage * this.charData.power),
            startup: 8,
            active: 32,
            recovery: 20,
            reach: 120,
            isHeavy: true
        });

        window.soundEngine.playSuper();
        window.soundEngine.playGong();
        window.particleSystem.addSuperBurst(this.x, this.y - 60, this.charData.color);
        window.particleSystem.flashScreen(this.charData.color, 0.6);

        // Rush forward during ultimate
        this.vx = this.facing * 16;
    }

    canAct() {
        return !this.isDead && 
               this.frozenTimer <= 0 && 
               ['idle', 'walk'].includes(this.state);
    }

    takeDamage(dmg, attacker, isHeavy = false) {
        if (this.isDead) return;

        let finalDmg = dmg;
        if (this.isBlocking) {
            finalDmg = Math.round(dmg * 0.18); // 82% damage blocked
            window.soundEngine.playBlock();
            window.particleSystem.addBlockSpark(this.x - (this.facing * 15), this.y - 70);
            this.vx = -this.facing * 3;
            this.superMeter = Math.min(100, this.superMeter + 4);
            return;
        }

        // Apply defense stat
        finalDmg = Math.round(finalDmg / (this.charData.defense || 1.0));
        this.hp = Math.max(0, this.hp - finalDmg);

        // Build attacker combo & super meter
        attacker.comboCount++;
        attacker.comboTimer = 90; // 1.5 seconds window
        attacker.superMeter = Math.min(100, attacker.superMeter + (isHeavy ? 14 : 7));
        this.superMeter = Math.min(100, this.superMeter + (isHeavy ? 10 : 5));

        // Sound & Particle
        window.soundEngine.playHit(isHeavy);
        window.particleSystem.addHitImpact(this.x, this.y - 70, this.charData.color, isHeavy);

        // Knockback
        this.vx = -this.facing * (isHeavy ? 9 : 4);
        this.setState('hurt');

        if (this.hp <= 0) {
            this.die();
        }
    }

    freeze(durationSec) {
        this.frozenTimer = Math.round(durationSec * 60);
        this.setState('frozen');
        window.soundEngine.playFreeze();
        window.particleSystem.addHitImpact(this.x, this.y - 60, '#38bdf8', true);
    }

    die() {
        this.isDead = true;
        this.hp = 0;
        this.setState('dead');
        this.vy = -7;
        this.vx = -this.facing * 5;
        window.soundEngine.playHit(true);
        window.soundEngine.playGong();
    }

    update(opponent) {
        // Cooldown tick down (60fps)
        if (this.cooldowns.special1 > 0) this.cooldowns.special1 = Math.max(0, this.cooldowns.special1 - (1 / 60));
        if (this.cooldowns.special2 > 0) this.cooldowns.special2 = Math.max(0, this.cooldowns.special2 - (1 / 60));

        // Combo decay
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }

        // Frozen status
        if (this.frozenTimer > 0) {
            this.frozenTimer--;
            if (this.frozenTimer <= 0 && !this.isDead) {
                this.setState('idle');
            }
            return;
        }

        // State machine progression
        this.stateFrame++;

        if (this.activeAttack) {
            const atk = this.activeAttack;
            const totalFrames = atk.startup + atk.active + atk.recovery;

            // Active hit window
            if (!this.attackHasHit && this.stateFrame >= atk.startup && this.stateFrame <= (atk.startup + atk.active)) {
                // Check distance & hit connection
                const distX = Math.abs(this.x - opponent.x);
                const distY = Math.abs(this.y - opponent.y);
                const isFacingOpponent = (opponent.x - this.x) * this.facing > 0;

                if (distX <= (this.width / 2 + opponent.width / 2 + atk.reach) && distY < 80 && isFacingOpponent) {
                    this.attackHasHit = true;
                    opponent.takeDamage(atk.damage, this, atk.isHeavy);
                }
            }

            if (this.stateFrame >= totalFrames) {
                this.setState('idle');
            }
        } else if (this.state === 'hurt' && this.stateFrame > 14) {
            this.setState('idle');
        }

        // Apply friction to X
        this.x += this.vx;
        this.vx *= 0.82;

        // Apply gravity to Y
        this.y += this.vy;
        if (this.y < this.groundY) {
            this.vy += this.gravity;
        } else {
            this.y = this.groundY;
            this.vy = 0;
            if (this.state === 'jump' && !this.activeAttack) {
                this.setState('idle');
            }
        }

        // Arena boundaries
        const padding = 50;
        if (this.x < padding) this.x = padding;
        if (this.x > this.stageWidth - padding) this.x = this.stageWidth - padding;

        // Auto face opponent when not attacking
        if (!this.activeAttack && this.state !== 'hurt' && !this.isDead) {
            this.facing = (opponent.x >= this.x) ? 1 : -1;
        }

        // Update cloth physics
        const headX = this.x - (this.facing * 12);
        const headY = this.y - 110;
        this.clothNodes[0].x = headX;
        this.clothNodes[0].y = headY;
        for (let i = 1; i < this.clothNodes.length; i++) {
            const prev = this.clothNodes[i - 1];
            const curr = this.clothNodes[i];
            const wind = Math.sin(Date.now() * 0.008 + i) * 3 - (this.vx * 1.5) - (this.facing * 6);
            curr.x += (prev.x + wind - curr.x) * 0.35;
            curr.y += (prev.y + 12 - curr.y) * 0.35;
        }
    }

    render(ctx) {
        ctx.save();

        const x = this.x;
        const y = this.y;
        const f = this.facing;
        const color = this.charData.color;
        const glow = this.charData.glowColor;

        // Shadow under fighter
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        const shadowScale = Math.max(0.4, 1 - (this.groundY - y) / 200);
        ctx.ellipse(x, this.groundY, 40 * shadowScale, 12 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Glow aura around fighter
        ctx.shadowColor = glow;
        ctx.shadowBlur = (this.superMeter >= 100) ? 25 : 12;

        // Cloth / Headband Ribbon Trail
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.clothNodes[0].x, this.clothNodes[0].y);
        for (let i = 1; i < this.clothNodes.length; i++) {
            ctx.lineTo(this.clothNodes[i].x, this.clothNodes[i].y);
        }
        ctx.stroke();

        // Base Silhouette Style: Dark Ninja Obsidian Body with Elemental Accent Trim
        ctx.fillStyle = '#111827'; // Dark obsidian shadow
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;

        // Dynamic Pose offsets based on state and frame
        let torsoAngle = 0;
        let legL_X = -12, legL_Y = 0;
        let legR_X = 14, legR_Y = 0;
        let armFront_X = 20, armFront_Y = -65;
        let armBack_X = -15, armBack_Y = -65;

        const breathe = Math.sin(Date.now() * 0.006) * 3;

        if (this.state === 'idle') {
            armFront_X = 16 * f;
            armBack_X = -14 * f;
            legL_Y = breathe * 0.5;
        } else if (this.state === 'walk') {
            const walkCycle = Math.sin(this.stateFrame * 0.3);
            legL_X += walkCycle * 14 * f;
            legR_X -= walkCycle * 14 * f;
            armFront_X = (16 + walkCycle * 12) * f;
            armBack_X = (-14 - walkCycle * 12) * f;
        } else if (this.state === 'punch') {
            const progress = this.stateFrame / 15;
            armFront_X = (30 + Math.sin(progress * Math.PI) * 45) * f;
            armFront_Y = -75;
            torsoAngle = f * 0.15;
        } else if (this.state === 'kick') {
            const progress = this.stateFrame / 20;
            legR_X = (25 + Math.sin(progress * Math.PI) * 55) * f;
            legR_Y = -Math.sin(progress * Math.PI) * 50;
            torsoAngle = -f * 0.2;
        } else if (this.state === 'block') {
            armFront_X = 18 * f;
            armFront_Y = -85;
            armBack_X = 14 * f;
            armBack_Y = -80;
            torsoAngle = -f * 0.15;
        } else if (this.state === 'crouch') {
            armFront_Y = -45;
            legL_Y = -25;
            legR_Y = -25;
        } else if (this.state === 'hurt') {
            torsoAngle = -f * 0.35;
            armFront_X = -20 * f;
            armBack_X = -30 * f;
        } else if (this.state === 'dead') {
            torsoAngle = -f * 1.3;
        }

        // Draw Body Joints & Silhouette
        // Torso & Hips
        ctx.save();
        ctx.translate(x, y - 55 + breathe);
        ctx.rotate(torsoAngle);

        // Legs (Shadow Shinobi greaves)
        ctx.beginPath();
        // Back leg
        ctx.moveTo(-10 * f, 15);
        ctx.lineTo(legL_X, 55 + legL_Y);
        // Front leg
        ctx.moveTo(10 * f, 15);
        ctx.lineTo(legR_X, 55 + legR_Y);
        ctx.stroke();

        // Torso / Gi
        ctx.beginPath();
        ctx.roundRect(-16, -42, 32, 55, 6);
        ctx.fill();
        ctx.stroke();

        // Martial Arts Belt / Sash
        ctx.fillStyle = color;
        ctx.fillRect(-16, 2, 32, 7);

        // Head / Cowl
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -58, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glowing Ninja Eyes / Visor
        ctx.fillStyle = this.charData.eyeColor;
        ctx.shadowColor = this.charData.eyeColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(f > 0 ? 3 : -9, -60, 8, 3.5);

        // Arms & Weapon Rendering
        ctx.shadowColor = glow;
        ctx.shadowBlur = 14;

        // Front Arm & Weapon
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.lineTo(armFront_X, armFront_Y + 55);
        ctx.stroke();

        // Weapon
        this.renderWeapon(ctx, armFront_X, armFront_Y + 55, f, color);

        ctx.restore();

        // If frozen, render ice crystal cage around fighter
        if (this.frozenTimer > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.strokeStyle = '#e0f2fe';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x - 35, y);
            ctx.lineTo(x - 45, y - 70);
            ctx.lineTo(x, y - 140);
            ctx.lineTo(x + 45, y - 70);
            ctx.lineTo(x + 35, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }

    renderWeapon(ctx, wx, wy, f, color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3.5;

        const id = this.charData.id;
        if (id === 'kage') {
            // Dual Katana Blade
            ctx.beginPath();
            ctx.moveTo(wx, wy);
            ctx.lineTo(wx + (38 * f), wy - 30);
            ctx.stroke();
        } else if (id === 'ignis') {
            // Hellfire Claws
            ctx.beginPath();
            ctx.arc(wx, wy, 8, 0, Math.PI * 2);
            ctx.fill();
            for (let i = -1; i <= 1; i++) {
                ctx.fillRect(wx + (i * 4), wy - 10, 2.5, 12);
            }
        } else if (id === 'volt') {
            // Lightning Quarterstaff
            ctx.beginPath();
            ctx.moveTo(wx - (20 * f), wy + 25);
            ctx.lineTo(wx + (35 * f), wy - 45);
            ctx.stroke();
        } else if (id === 'frost') {
            // Cryo Kamas / Daggers
            ctx.beginPath();
            ctx.moveTo(wx, wy);
            ctx.lineTo(wx + (24 * f), wy - 20);
            ctx.lineTo(wx + (32 * f), wy - 14);
            ctx.stroke();
        } else if (id === 'titan') {
            // Giant War Hammer
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(wx - (10 * f), wy + 15);
            ctx.lineTo(wx + (25 * f), wy - 35);
            ctx.stroke();
            // Hammer head
            ctx.fillRect(wx + (18 * f) - 10, wy - 45, 20, 16);
        }
        ctx.restore();
    }
}

window.Fighter = Fighter;
