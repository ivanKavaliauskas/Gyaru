// ==========================================
// FUNCIÓN DE REINICIO ABSOLUTO DEL JUEGO
// ==========================================
function reiniciarJuegoCompleto(scene) {
  if (AudioGame.musicInterval) {
    clearInterval(AudioGame.musicInterval);
    AudioGame.musicInterval = null;
  }

  // Reseteo absoluto de estados globales
  score = 0;
  lives = VIDAS_MAXIMAS;
  currentLevel = 1;
  bossLives = 10;
  isGameOver = false;
  isGameWon = false; // Limpiamos el estado de victoria
  levelActive = true;

  scene.scene.restart();
}

// ==========================================
// BUCLE DE ACTUALIZACIÓN DEL MOTOR (UPDATE)
// ==========================================
function update() {
  // 🌟 ARREGLADO: Si presionas R estando en Game Over o habiendo Ganado, el juego reinicia de inmediato
  if (Phaser.Input.Keyboard.JustDown(rKey)) {
    if (isGameOver || isGameWon) {
      reiniciarJuegoCompleto(this);
      return;
    }
  }

  // 🌟 ARREGLADO: Si estás en tiempo de recolección (isGameWon es true pero el motor físico sigue corriendo),
  // no bloqueamos el update para que el teclado responda y puedas juntar los ítems.
  if (isGameOver || (isGameWon && this.physics.world.isPaused)) return;

  // Movimiento horizontal Gyaru
  if (wasd.left.isDown) {
    player.setVelocityX(-250).flipX = true;
  } else if (wasd.right.isDown) {
    player.setVelocityX(250).flipX = false;
  } else {
    player.setVelocityX(0);
  }

  // Salto árcade
  if (wasd.up.isDown && player.body.touching.down) {
    player.setVelocityY(-620);
  }

  // Disparos de purpurina rosa
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    AudioGame.shoot();
    let shot = projectiles.create(
      player.x + (player.flipX ? -20 : 20),
      player.y,
      "glitter_shot",
    );
    shot.body.allowGravity = false;
    shot.setVelocityX(player.flipX ? -400 : 400);
    this.time.delayedCall(600, () => {
      if (shot.active) shot.destroy();
    });
  }

  // Actualización modular de IA enemiga
  actualizarEnemigos(this);

  // Sistema automático para avanzar de pantalla
  if (
    currentLevel < 8 &&
    currentLevel !== 4 &&
    enemies.countActive(true) === 0 &&
    levelActive
  ) {
    levelActive = false;
    AudioGame.item();
    this.add
      .text(400, 250, "LEVEL COMPLETE", {
        fontSize: "36px",
        fill: "#ffff00",
        fontFamily: "monospace",
        fontWeight: "bold",
      })
      .setOrigin(0.5);
    this.time.delayedCall(2000, () => {
      currentLevel++;
      this.scene.restart();
    });
  }
}

// Vinculación al motor
config.scene = { preload: preload, create: create, update: update };
window.onload = () => {
  const game = new Phaser.Game(config);
};
