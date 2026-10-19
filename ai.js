// Fighting Game AI Logic
class FighterAI {
    constructor(fighter, opponent, difficulty = 'normal') {
        this.fighter = fighter;
        this.opponent = opponent;
        this.difficulty = difficulty;
        this.actionTimer = 0;
        this.decisionInterval = difficulty === 'hard' ? 12 : 20; // AI reaction rate in frames
    }

    update() {
        if (this.fighter.isDead || this.opponent.isDead) {
            this.fighter.stopMoving();
            this.fighter.block(false);
            return;
        }

        this.actionTimer++;
        if (this.actionTimer < this.decisionInterval) return;
        this.actionTimer = 0;

        const f = this.fighter;
        const opp = this.opponent;
        const dist = Math.abs(f.x - opp.x);

        // 1. Reactive Defense: If player is currently executing an active attack near AI
        if (opp.activeAttack && dist < 120) {
            const blockChance = this.difficulty === 'hard' ? 0.75 : 0.45;
            if (Math.random() < blockChance) {
                f.block(true);
                return;
            }
        } else {
            f.block(false);
        }

        // 2. Ultimate Activation
        if (f.superMeter >= 100 && Math.random() < 0.8) {
            f.ultimate(opp);
            return;
        }

        // 3. Special Powers Usage
        if (f.cooldowns.special1 <= 0 && Math.random() < 0.6) {
            f.special1(opp);
            return;
        }
        if (f.cooldowns.special2 <= 0 && Math.random() < 0.45) {
            f.special2(opp);
            return;
        }

        // 4. Close Combat / Attack Range (< 90px)
        if (dist <= 85) {
            f.stopMoving();
            const roll = Math.random();
            if (roll < 0.45) {
                f.punch();
            } else if (roll < 0.8) {
                f.kick();
            } else if (roll < 0.95) {
                f.block(true);
                setTimeout(() => f.block(false), 300);
            }
            return;
        }

        // 5. Positioning / Spacing
        if (dist > 85) {
            // Move toward opponent
            const dir = (opp.x > f.x) ? 1 : -1;
            f.move(dir);

            // Occasional jump forward
            if (dist > 180 && Math.random() < 0.25) {
                f.jump();
            }
        }
    }
}

window.FighterAI = FighterAI;
