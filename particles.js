// Visual Effects, Projectiles & Particle Engine
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.projectiles = [];
        this.shockwaves = [];
        this.ambientParticles = [];
        this.screenShake = 0;
        this.shakeIntensity = 0;
        this.flashAlpha = 0;
        this.flashColor = '#ffffff';
        this.hitStopFrames = 0;
    }

    initAmbient(width, height) {
        this.ambientParticles = [];
        for (let i = 0; i < 40; i++) {
            this.ambientParticles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: -0.3 - Math.random() * 0.7,
                size: 1 + Math.random() * 3,
                alpha: 0.2 + Math.random() * 0.5,
                color: Math.random() > 0.5 ? '#ef4444' : '#eab308' // Fire embers or dust
            });
        }
    }

    addHitImpact(x, y, color = '#ef4444', isHeavy = false) {
        const count = isHeavy ? 28 : 14;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 6 + 2) * (isHeavy ? 1.6 : 1.0);
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 2,
                color: Math.random() > 0.3 ? color : '#ffffff',
                alpha: 1,
                decay: 0.03 + Math.random() * 0.03,
                gravity: 0.2
            });
        }
        // Add shockwave ring
        this.shockwaves.push({
            x, y,
            radius: 5,
            maxRadius: isHeavy ? 55 : 30,
            alpha: 1,
            color: color,
            width: isHeavy ? 4 : 2
        });

        if (isHeavy) {
            this.triggerShake(12, 10);
            this.hitStopFrames = 4;
        } else {
            this.triggerShake(4, 5);
        }
    }

    addBlockSpark(x, y) {
        for (let i = 0; i < 12; i++) {
            const angle = (Math.random() - 0.5) * Math.PI + Math.PI; // Sparks bounce off
            const speed = Math.random() * 5 + 3;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2,
                color: '#facc15', // Bright spark gold
                alpha: 1,
                decay: 0.05,
                gravity: 0.25
            });
        }
        this.shockwaves.push({
            x, y,
            radius: 3,
            maxRadius: 20,
            alpha: 1,
            color: '#facc15',
            width: 2
        });
        this.triggerShake(2, 3);
    }

    addSlashEffect(x, y, facing, color = '#a855f7') {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 40,
                vx: facing * (Math.random() * 4 + 2),
                vy: (Math.random() - 0.5) * 3,
                size: Math.random() * 4 + 2,
                color: color,
                alpha: 0.9,
                decay: 0.06,
                gravity: 0
            });
        }
    }

    addGroundDebris(x, y, count = 15, color = '#78716c') {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 8 - 2,
                size: Math.random() * 4 + 2,
                color: color,
                alpha: 1,
                decay: 0.025,
                gravity: 0.4
            });
        }
        this.triggerShake(14, 12);
    }

    addSuperBurst(x, y, color = '#a855f7') {
        this.flashScreen(color, 0.45);
        this.triggerShake(25, 20);
        this.hitStopFrames = 8;
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 10 + 3;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 5 + 3,
                color: Math.random() > 0.4 ? color : '#ffffff',
                alpha: 1,
                decay: 0.02,
                gravity: 0.1
            });
        }
        this.shockwaves.push({
            x, y,
            radius: 10,
            maxRadius: 120,
            alpha: 1,
            color: color,
            width: 6
        });
    }

    addProjectile(proj) {
        this.projectiles.push(proj);
    }

    flashScreen(color, alpha = 0.5) {
        this.flashColor = color;
        this.flashAlpha = alpha;
    }

    triggerShake(durationFrames, intensity) {
        this.screenShake = durationFrames;
        this.shakeIntensity = intensity;
    }

    update(width, height) {
        if (this.hitStopFrames > 0) {
            this.hitStopFrames--;
            return;
        }

        // Shake
        if (this.screenShake > 0) {
            this.screenShake--;
        }

        // Flash
        if (this.flashAlpha > 0) {
            this.flashAlpha -= 0.04;
            if (this.flashAlpha < 0) this.flashAlpha = 0;
        }

        // Ambient particles
        this.ambientParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < 0) {
                p.y = height;
                p.x = Math.random() * width;
            }
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
        });

        // Hit/Burst particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity || 0;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += (sw.maxRadius - sw.radius) * 0.2 + 2;
            sw.alpha -= 0.05;
            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
                this.shockwaves.splice(i, 1);
            }
        }

        // Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const pr = this.projectiles[i];
            pr.x += pr.vx;
            pr.y += pr.vy;
            pr.life = (pr.life || 0) + 1;

            // Trail particles
            if (Math.random() > 0.3) {
                this.particles.push({
                    x: pr.x + (Math.random() - 0.5) * 8,
                    y: pr.y + (Math.random() - 0.5) * 8,
                    vx: -pr.vx * 0.15,
                    vy: (Math.random() - 0.5) * 1.5,
                    size: pr.size * 0.6,
                    color: pr.color,
                    alpha: 0.8,
                    decay: 0.08,
                    gravity: 0
                });
            }

            // Expiry / boundary
            if (pr.x < -100 || pr.x > width + 100 || pr.life > 180 || pr.hit) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        // Render ambient
        this.ambientParticles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Render shockwaves
        this.shockwaves.forEach(sw => {
            ctx.save();
            ctx.globalAlpha = sw.alpha;
            ctx.strokeStyle = sw.color;
            ctx.lineWidth = sw.width;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });

        // Render particles
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Render projectiles
        this.projectiles.forEach(pr => {
            ctx.save();
            ctx.shadowColor = pr.glowColor || pr.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = pr.color;

            if (pr.type === 'shuriken') {
                ctx.translate(pr.x, pr.y);
                ctx.rotate(pr.life * 0.35);
                ctx.fillRect(-pr.size, -pr.size, pr.size * 2, pr.size * 2);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-pr.size, -pr.size, pr.size * 2, pr.size * 2);
            } else if (pr.type === 'ice_spike') {
                ctx.translate(pr.x, pr.y);
                ctx.beginPath();
                ctx.moveTo(pr.vx > 0 ? pr.size * 2 : -pr.size * 2, 0);
                ctx.lineTo(0, -pr.size);
                ctx.lineTo(0, pr.size);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(pr.x, pr.y, pr.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        // Screen Flash
        if (this.flashAlpha > 0) {
            ctx.save();
            ctx.fillStyle = this.flashColor;
            ctx.globalAlpha = this.flashAlpha;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        }
    }
}

window.particleSystem = new ParticleSystem();
