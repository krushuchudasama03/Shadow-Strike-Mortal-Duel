// Sound FX and Music Synthesizer using Web Audio API
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmPlaying = false;
        this.bgmInterval = null;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.muted;
    }

    playHit(isHeavy = false) {
        if (this.muted || !this.ctx) return;
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = isHeavy ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(isHeavy ? 180 : 280, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + (isHeavy ? 0.22 : 0.12));

        gain.gain.setValueAtTime(isHeavy ? 0.8 : 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (isHeavy ? 0.22 : 0.12));

        // Add small burst of noise for punch impact
        const bufferSize = this.ctx.sampleRate * (isHeavy ? 0.08 : 0.04);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(isHeavy ? 0.5 : 0.3, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + (isHeavy ? 0.08 : 0.04));

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        whiteNoise.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + (isHeavy ? 0.22 : 0.12));
        whiteNoise.start(t);
        whiteNoise.stop(t + (isHeavy ? 0.08 : 0.04));
    }

    playSlash() {
        if (this.muted || !this.ctx) return;
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    playBlock() {
        if (this.muted || !this.ctx) return;
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    playSwoosh() {
        if (this.muted || !this.ctx) return;
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    playFire() {
        if (this.muted || !this.ctx) return;
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.35);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
    }

    playLightning() {
        if (this.muted || !this.ctx) return;
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.setValueAtTime(200, t + 0.05);
        osc.frequency.setValueAtTime(900, t + 0.1);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);

        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    playFreeze() {
        if (this.muted || !this.ctx) return;
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, t);
        osc.frequency.linearRampToValueAtTime(1400, t + 0.15);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.35);

        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
    }

    playEarth() {
        if (this.muted || !this.ctx) return;
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.4);

        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
    }

    playSuper() {
        if (this.muted || !this.ctx) return;
        this.init();
        const t = this.ctx.currentTime;
        // Dramatic power riser
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(950, t + 0.6);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.7, t + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.7);
    }

    playGong() {
        if (this.muted || !this.ctx) return;
        this.init();
        const t = this.ctx.currentTime;
        const freqs = [180, 290, 420];
        freqs.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.4);
        });
    }

    // Procedural Dark Combat Drum Loop
    startBGM() {
        if (this.muted || this.bgmPlaying) return;
        this.init();
        this.bgmPlaying = true;
        let step = 0;

        const playDrum = (freq, decay, vol = 0.3) => {
            if (!this.ctx || this.muted) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(30, t + decay);
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + decay);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + decay);
        };

        const playBass = (pitch, vol = 0.15) => {
            if (!this.ctx || this.muted) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(pitch, t);
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.3);
        };

        const notes = [65.41, 65.41, 77.78, 65.41, 87.31, 65.41, 73.42, 58.27];

        this.bgmInterval = setInterval(() => {
            if (!this.bgmPlaying || this.muted) return;
            
            // Heavy Taiko Kick on 0, 4, 8, 12
            if (step % 4 === 0) {
                playDrum(120, 0.35, 0.35);
            }
            // Snare / Rim on 2, 6, 10, 14
            if ((step + 2) % 4 === 0) {
                playDrum(240, 0.18, 0.2);
            }
            // Double kick roll occasionally
            if (step % 8 === 6) {
                playDrum(90, 0.2, 0.25);
            }

            // Dark ominous bassline
            const note = notes[Math.floor(step / 2) % notes.length];
            if (step % 2 === 0) {
                playBass(note, 0.12);
            }

            step = (step + 1) % 16;
        }, 160); // ~94 BPM martial arts pulse
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
}

window.soundEngine = new SoundEngine();
