// Input Manager: Multi-Touch Virtual Controls & Keyboard Fallback
class ControlsManager {
    constructor() {
        this.player = null;
        this.opponent = null;
        this.keys = {};
        this.touchStates = {
            left: false,
            right: false,
            up: false,
            down: false,
            block: false
        };

        this.initKeyboard();
        this.initTouch();
    }

    bindFighter(player, opponent) {
        this.player = player;
        this.opponent = opponent;
    }

    initKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (!this.player) return;
            const key = e.key.toLowerCase();
            this.keys[key] = true;

            if (['arrowup', 'w', ' '].includes(key)) {
                e.preventDefault();
            }

            if (key === 'a' || key === 'arrowleft') {
                this.player.move(-1);
            } else if (key === 'd' || key === 'arrowright') {
                this.player.move(1);
            } else if (key === 'w' || key === 'arrowup') {
                this.player.jump();
            } else if (key === 's' || key === 'arrowdown') {
                this.player.crouch(true);
            } else if (key === 'j') {
                this.player.punch();
            } else if (key === 'k') {
                this.player.kick();
            } else if (key === 'l') {
                this.player.block(true);
            } else if (key === 'u') {
                this.player.special1(this.opponent);
            } else if (key === 'i') {
                this.player.special2(this.opponent);
            } else if (key === ' ' || key === 'o') {
                this.player.ultimate(this.opponent);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (!this.player) return;
            const key = e.key.toLowerCase();
            this.keys[key] = false;

            if (key === 'a' || key === 'arrowleft' || key === 'd' || key === 'arrowright') {
                if (this.keys['a'] || this.keys['arrowleft']) {
                    this.player.move(-1);
                } else if (this.keys['d'] || this.keys['arrowright']) {
                    this.player.move(1);
                } else {
                    this.player.stopMoving();
                }
            } else if (key === 's' || key === 'arrowdown') {
                this.player.crouch(false);
            } else if (key === 'l') {
                this.player.block(false);
            }
        });
    }

    initTouch() {
        const bindButton = (elemId, onPress, onRelease) => {
            const btn = document.getElementById(elemId);
            if (!btn) return;

            const handlePress = (e) => {
                e.preventDefault();
                e.stopPropagation();
                btn.classList.add('active');
                if (navigator.vibrate) navigator.vibrate(15);
                if (onPress) onPress();
            };

            const handleRelease = (e) => {
                e.preventDefault();
                e.stopPropagation();
                btn.classList.remove('active');
                if (onRelease) onRelease();
            };

            btn.addEventListener('touchstart', handlePress, { passive: false });
            btn.addEventListener('touchend', handleRelease, { passive: false });
            btn.addEventListener('touchcancel', handleRelease, { passive: false });
            btn.addEventListener('mousedown', handlePress);
            btn.addEventListener('mouseup', handleRelease);
            btn.addEventListener('mouseleave', handleRelease);
        };

        // Directional controls
        bindButton('btn-left', 
            () => { if (this.player) { this.touchStates.left = true; this.player.move(-1); } },
            () => { if (this.player) { this.touchStates.left = false; if (!this.touchStates.right) this.player.stopMoving(); } }
        );

        bindButton('btn-right', 
            () => { if (this.player) { this.touchStates.right = true; this.player.move(1); } },
            () => { if (this.player) { this.touchStates.right = false; if (!this.touchStates.left) this.player.stopMoving(); } }
        );

        bindButton('btn-up', 
            () => { if (this.player) this.player.jump(); },
            null
        );

        bindButton('btn-down', 
            () => { if (this.player) this.player.crouch(true); },
            () => { if (this.player) this.player.crouch(false); }
        );

        // Action Combat buttons
        bindButton('btn-punch', 
            () => { if (this.player) this.player.punch(); },
            null
        );

        bindButton('btn-kick', 
            () => { if (this.player) this.player.kick(); },
            null
        );

        bindButton('btn-block', 
            () => { if (this.player) this.player.block(true); },
            () => { if (this.player) this.player.block(false); }
        );

        bindButton('btn-sp1', 
            () => { if (this.player && this.opponent) this.player.special1(this.opponent); },
            null
        );

        bindButton('btn-sp2', 
            () => { if (this.player && this.opponent) this.player.special2(this.opponent); },
            null
        );

        bindButton('btn-super', 
            () => { if (this.player && this.opponent) this.player.ultimate(this.opponent); },
            null
        );

        // Prevent accidental gesture pinch/zoom on mobile screen
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('dblclick', (e) => e.preventDefault());
    }
}

window.ControlsManager = ControlsManager;
