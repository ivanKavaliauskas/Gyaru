// 🌟 CONFIGURACIÓN UNIFICADA DE PARTIDA
const VIDAS_MAXIMAS = 3; // 👈 ¡Cambiando este número controlás todo el juego!

// Variables globales accesibles por todos los módulos
let player,
  enemies,
  projectiles,
  bossProjectiles,
  enemyProjectiles,
  items,
  wasd,
  spaceKey,
  rKey,
  platforms,
  scoreText,
  livesText,
  levelText;
let score = 0;
let lives = VIDAS_MAXIMAS;
let isInvincible = false;
let isGameOver = false;
let isGameWon = false;
let enPantallaDeInicio = true;
let highScoreText;

// Variables de Control de Niveles y Jefe
let currentLevel = 1;
let boss;
let bossLives = 10;
let levelActive = true;

// Configuración técnica base del motor Phaser
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      debug: false,
    },
  },
};
