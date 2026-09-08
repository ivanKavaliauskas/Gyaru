// Motor de audio sintetizado nativo para evitar archivos externos (.mp3)
const AudioGame = {
  ctx: null,
  musicInterval: null,

  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },

  playTone(frequency, type, duration, volume = 0.15) {
    if (!this.ctx) this.init();
    if (this.ctx.state === "suspended") this.ctx.resume();

    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      this.ctx.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  // --- EFECTOS DE SONIDO ---
  shoot() {
    this.playTone(600, "square", 0.1);
  },
  hit() {
    this.playTone(180, "sawtooth", 0.15);
  },
  freeze() {
    this.playTone(900, "triangle", 0.3);
  },
  kick() {
    this.playTone(120, "square", 0.4);
  },
  item() {
    this.playTone(800, "square", 0.1);
    setTimeout(() => this.playTone(1200, "square", 0.15), 80);
  },
  gameOver() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.playTone(300, "sawtooth", 0.5);
    setTimeout(() => this.playTone(150, "sawtooth", 0.5), 200);
  },

  // VOZ SINTETIZADA GYARU - "¡YATTA!" (やった！)
  gyaruVictoryVoice() {
    this.playTone(880, "square", 0.08, 0.2); // "Ya-"
    setTimeout(() => {
      this.playTone(1200, "square", 0.25, 0.2); // "-tta!"
    }, 80);
  },

  // ==========================================
  // NUEVA FANFARRIA Y MÚSICA DE VICTORIA EN BUCLE
  // ==========================================
  playVictoryMusic() {
    // Limpiamos de inmediato cualquier intervalo de música previo
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }

    // Frecuencias para una melodía de celebración brillante y retro en bucle
    // Notas: Do, Mi, Sol, Do (Agudo), Sol, La, Do (Muy Agudo), Si...
    const victoryMelody = [
      523.25, 659.25, 783.99, 1046.5, 783.99, 880.0, 1046.5, 987.77,
    ];
    // Línea de bajo retro complementaria
    const victoryBass = [
      261.63, 261.63, 349.23, 349.23, 392.0, 392.0, 523.25, 392.0,
    ];

    let step = 0;

    // Creamos el loop musical exclusivo de la pantalla de campeones (ritmo rápido: 130ms por nota)
    this.musicInterval = setInterval(() => {
      // Si el jugador ya reseteó el juego, detenemos este loop de inmediato
      if (!isGameWon) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
        return;
      }

      // Voz principal (Onda triangular para que suene dulce)
      this.playTone(
        victoryMelody[step % victoryMelody.length],
        "triangle",
        0.12,
        0.15,
      );

      // Acompañamiento armónico / Bajo (Cada dos pasos, onda cuadrada arcade)
      if (step % 2 === 0) {
        this.playTone(
          victoryBass[(step / 2) % victoryBass.length],
          "square",
          0.08,
          0.06,
        );
      }

      step++;
    }, 130);
  },

  // MÚSICA DE FONDO RETRO
  startMusic() {
    if (!this.ctx) this.init();
    if (this.ctx.state === "suspended") this.ctx.resume();
    if (this.musicInterval) return;

    // Frecuencias para una melodía pegajosa en bucle (Gyaru-Pop de 8 bits)
    const melody = [
      261.63, 329.63, 392.0, 329.63, 293.66, 349.23, 440.0, 349.23,
    ];
    let step = 0;

    this.musicInterval = setInterval(() => {
      if (isGameOver || currentLevel === 5) return;

      this.playTone(melody[step % melody.length], "triangle", 0.2);
      if (step % 2 === 0) {
        this.playTone(110, "square", 0.08, 0.08);
      }
      step++;
    }, 220);
  },
};
