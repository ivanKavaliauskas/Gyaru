// Motor de audio sintetizado nativo para evitar archivos externos (.mp3)
const AudioGame = {
    ctx: null,
    musicInterval: null,

    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },

    playTone(frequency, type, duration, volume = 0.15) {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();

        osc.type = type; 
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    // --- EFECTOS DE SONIDO ---
    shoot() { this.playTone(600, 'square', 0.1); },
    hit() { this.playTone(180, 'sawtooth', 0.15); },
    freeze() { this.playTone(900, 'triangle', 0.3); },
    kick() { this.playTone(120, 'square', 0.4); },
    item() { this.playTone(800, 'square', 0.1); setTimeout(() => this.playTone(1200, 'square', 0.15), 80); },
    gameOver() { 
        if (this.musicInterval) { clearInterval(this.musicInterval); this.musicInterval = null; }
        this.playTone(300, 'sawtooth', 0.5); setTimeout(() => this.playTone(150, 'sawtooth', 0.5), 200); 
    },

    // VOZ SINTETIZADA GYARU - "¡YATTA!" (やった！)
    gyaruVictoryVoice() {
        this.playTone(880, 'square', 0.08, 0.2); // "Ya-"
        setTimeout(() => {
            this.playTone(1200, 'square', 0.25, 0.2); // "-tta!"
        }, 80);
    },

    // FANFARRIA TRIUNFAL DE VICTORIA
    playVictoryMusic() {
        if (this.musicInterval) { clearInterval(this.musicInterval); this.musicInterval = null; }
        
        // Notas alegres en hercios (Frecuencias reales para la melodía final)
        const victoryNotes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; 
        let step = 0;
        
        let victoryInterval = setInterval(() => {
            if (step >= victoryNotes.length) {
                clearInterval(victoryInterval);
                return;
            }
            this.playTone(victoryNotes[step], 'triangle', 0.25, 0.2);
            this.playTone(victoryNotes[step] / 2, 'square', 0.15, 0.1); 
            step++;
        }, 150);
    },

    // MÚSICA DE FONDO RETRO
    startMusic() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        if (this.musicInterval) return; 

        // Frecuencias para una melodía pegajosa en bucle (Gyaru-Pop de 8 bits)
        const melody = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23];
        let step = 0;

        this.musicInterval = setInterval(() => {
            if (isGameOver || currentLevel === 5) return; 
            
            this.playTone(melody[step % melody.length], 'triangle', 0.2);
            if (step % 2 === 0) {
                this.playTone(110, 'square', 0.08, 0.08); 
            }
            step++;
        }, 220); 
    }
};
