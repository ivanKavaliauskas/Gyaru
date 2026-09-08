// ==========================================
// 🌟 ESCENA 1: PANTALLA DE INICIO (TITLE SCENE)
// ==========================================
class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: "TitleScene" });
  }

  preload() {
    // Aseguramos la textura base de Gyaru para mostrarla de decoración
    if (!this.textures.exists("gyaru_samurai")) {
      crearTexturaPixelArt(
        this,
        "gyaru_samurai",
        gyaruPixelArt,
        colorMapGyaru,
        16,
        16,
        3,
      );
    }
  }

  create() {
    // Fondo elegante oscuro neón con gradiente
    let bg = this.add.graphics();
    bg.fillGradientStyle(0x1a000c, 0x1a000c, 0x050005, 0x050005, 1);
    bg.fillRect(0, 0, 800, 600);

    // Decoración de líneas de neón estilo rejilla arcade
    let grid = this.add.graphics();
    grid.lineStyle(1, 0xff007f, 0.25);
    for (let i = 0; i < 800; i += 40) {
      grid.lineBetween(i, 0, i, 600);
      grid.lineBetween(0, i, 800, i);
    }

    // TÍTULO PRINCIPAL GIGANTE (Efecto neón rosa)
    let txtTitulo = this.add
      .text(400, 180, "GYARU SAMURAI", {
        fontSize: "64px",
        fill: "#ff007f",
        fontFamily: "Impact, Courier New, monospace",
        fontWeight: "bold",
        stroke: "#ffffff",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    txtTitulo.setShadow(0, 0, "#ff007f", 20, true, true);

    // Subtítulo en japonés estilizado (Amarillo)
    let txtSub = this.add
      .text(400, 260, "ギャル・サムライ ARCADE", {
        fontSize: "28px",
        fill: "#ffff00",
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    txtSub.setShadow(0, 3, "#ffaa00", 5, true, true);

    // Sprite gigante decorativo flotante en el centro
    let logoPlayer = this.add
      .sprite(400, 380, "gyaru_samurai")
      .setOrigin(0.5)
      .setScale(4);
    this.tweens.add({
      targets: logoPlayer,
      y: 395,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // TEXTO: PRESS SPACE TO PLAY
    let txtJugar = this.add
      .text(400, 500, "PRESS SPACE TO PLAY", {
        fontSize: "26px",
        fill: "#00f5ff",
        fontFamily: "monospace",
        fontWeight: "bold",
      })
      .setOrigin(0.5);
    txtJugar.setShadow(1, 2, "#000000", 2, false, true);

    // Efecto parpadeante clásico
    this.tweens.add({
      targets: txtJugar,
      alpha: 0.1,
      duration: 650,
      yoyo: true,
      repeat: -1,
    });

    // Mostrar High-Score actual mediante el sistema modular
    if (typeof HighScoreSystem !== "undefined") {
      let record = HighScoreSystem.get();
      this.add
        .text(400, 30, "HI-SCORE: " + record, {
          fontSize: "20px",
          fill: "#ffaa00",
          fontFamily: "monospace",
          fontWeight: "bold",
        })
        .setOrigin(0.5);
    }

    // CAPTURA DE ESPACIO PARA INICIAR JUEGO
    this.input.keyboard.once("keydown-SPACE", () => {
      if (typeof AudioGame !== "undefined") {
        AudioGame.playTone(587.33, "square", 0.1, 0.15);
        setTimeout(() => AudioGame.playTone(880.0, "square", 0.2, 0.15), 80);
      }

      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("GameScene");
      });
    });
  }
}

// ==========================================
// 🌟 ESCENA 2: ESCENA DE JUEGO PRINCIPAL
// ==========================================
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  // 🌟 MUDAMOS TU FUNCIÓN PRELOAD AQUÍ ADENTRO:
  preload() {
    if (!this.textures.exists("gyaru_samurai")) {
      crearTexturaPixelArt(
        this,
        "gyaru_samurai",
        gyaruPixelArt,
        colorMapGyaru,
        16,
        16,
        3,
      );
    }
    if (!this.textures.exists("enemy_arcade")) {
      crearTexturaPixelArt(
        this,
        "enemy_arcade",
        enemyPixelArt,
        colorMapEnemy,
        16,
        16,
        3,
      );
    }
    if (!this.textures.exists("boba_item")) {
      crearTexturaPixelArt(
        this,
        "boba_item",
        bobaPixelArt,
        colorMapBoba,
        16,
        12,
        2.5,
      );
    }
    if (!this.textures.exists("block_texture")) {
      this.make
        .graphics({ x: 0, y: 0, add: false })
        .fillStyle(0xffffff, 1)
        .fillRect(0, 0, 32, 32)
        .generateTexture("block_texture", 32, 32);
    }
    if (!this.textures.exists("glitter_shot")) {
      this.make
        .graphics({ x: 0, y: 0, add: false })
        .fillStyle(0xff007f, 1)
        .fillCircle(8, 8, 8)
        .generateTexture("glitter_shot", 16, 16);
    }
    if (!this.textures.exists("glitter_ball")) {
      let ball = this.make
        .graphics({ x: 0, y: 0, add: false })
        .fillStyle(0xff007f, 1)
        .fillCircle(24, 24, 22)
        .fillStyle(0xffff00, 1)
        .fillRect(12, 12, 6, 6)
        .fillRect(30, 30, 6, 6);
      ball.generateTexture("glitter_ball", 48, 48);
    }
    cargarTexturasExtra(this);
  }

  // 🌟 MUDAMOS TU FUNCIÓN CREATE AQUÍ ADENTRO CON TODO TU CÓDIGO DEL BOSS COMPLETO:
  create() {
    isGameOver = false;
    levelActive = true;
    boss = null;
    bossLives = currentLevel === 8 ? 15 : 10;

    if (AudioGame.musicInterval) {
      clearInterval(AudioGame.musicInterval);
      AudioGame.musicInterval = null;
    }

    this.input.keyboard.once("keydown", () => {
      if (currentLevel >= 5) {
        AudioGame.musicInterval = setInterval(() => {
          if (isGameOver || isGameWon) return;
          const melody = [
            261.63, 329.63, 392.0, 329.63, 293.66, 349.23, 440.0, 349.23,
          ];
          let step = Math.floor(Date.now() / 150);
          AudioGame.playTone(
            melody[step % melody.length],
            "triangle",
            0.12,
            0.15,
          );
          if (step % 2 === 0) AudioGame.playTone(110, "square", 0.06, 0.08);
        }, 150);
      } else {
        AudioGame.startMusic();
      }
    });

    this.items = this.physics.add.group();
    items = this.items;
    projectiles = this.physics.add.group();
    bossProjectiles = this.physics.add.group();
    enemyProjectiles = this.physics.add.group();
    enemies = this.physics.add.group();

    construirPlataformas(this);

    scoreText = this.add.text(16, 16, "SCORE: " + score, {
      fontSize: "24px",
      fill: "#ff007f",
      fontFamily: "monospace",
      fontWeight: "bold",
    });

    if (typeof HighScoreSystem !== "undefined") {
      let recordActual = HighScoreSystem.get();
      highScoreText = this.add.text(240, 16, "HI-SCORE: " + recordActual, {
        fontSize: "24px",
        fill: "#ffaa00",
        fontFamily: "monospace",
        fontWeight: "bold",
      });
    }

    let hearts = "";
    for (let i = 0; i < lives; i++) hearts += "💖";
    livesText = this.add.text(16, 45, "LIVES: " + hearts, {
      fontSize: "24px",
      fill: "#ff007f",
      fontFamily: "monospace",
      fontWeight: "bold",
    });

    let mundoVisual = "";
    if (currentLevel <= 4) {
      mundoVisual = currentLevel === 4 ? "1-4 (BOSS)" : "1-" + currentLevel;
    } else {
      let nivelMundo2 = currentLevel - 4;
      mundoVisual = nivelMundo2 === 4 ? "2-4 (FINAL BOSS)" : "2-" + nivelMundo2;
    }
    levelText = this.add.text(540, 16, "LEVEL: " + mundoVisual, {
      fontSize: "24px",
      fill: "#ffff00",
      fontFamily: "monospace",
      fontWeight: "bold",
    });

    player = this.physics.add
      .sprite(100, 450, "gyaru_samurai")
      .setCollideWorldBounds(true);

    let checkLvl = currentLevel > 4 ? currentLevel - 4 : currentLevel;
    if (checkLvl < 4) {
      let spawnPoints = [
        { x: 300, y: 350 },
        { x: 500, y: 350 },
        { x: 400, y: 80 },
      ];
      if (checkLvl === 2) spawnPoints.push({ x: 550, y: 200 });
      if (checkLvl === 3)
        spawnPoints.push({ x: 150, y: 200 }, { x: 650, y: 200 });

      spawnPoints.forEach((pos) => {
        let enemy = enemies
          .create(pos.x, pos.y, "enemy_arcade")
          .setCollideWorldBounds(true)
          .setBounce(0.1);
        let enemySpeed = currentLevel >= 5 ? 150 : 120;
        enemy.setVelocityX(
          Phaser.Math.Between(0, 1) === 0 ? enemySpeed : -enemySpeed,
        );
        enemy
          .setData("freezeCount", 0)
          .setData("isRolling", false)
          .setData("bounceCount", 0)
          .setData("lastHitTime", 0);
      });
    } else {
      let bossSpeed = currentLevel === 8 ? 250 : 150;
      boss = this.physics.add
        .sprite(400, 150, "boss_critic")
        .setCollideWorldBounds(true)
        .setBounce(0.1)
        .setVelocityX(bossSpeed);
    }

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(items, platforms);
    this.physics.add.collider(projectiles, platforms, (shot) => {
      shot.destroy();
    });
    this.physics.add.collider(bossProjectiles, platforms, (bShot) => {
      bShot.destroy();
    });
    this.physics.add.collider(enemyProjectiles, platforms, (eShot) => {
      eShot.destroy();
    });

    this.physics.add.overlap(
      player,
      items,
      (p, item) => {
        AudioGame.item();
        if (item.getData("esFruta")) {
          score += 500;
        } else {
          score += 200;
        }
        item.destroy();
        scoreText.setText("SCORE: " + score);
      },
      null,
      this,
    );

    this.physics.add.overlap(player, enemyProjectiles, (p, eShot) => {
      eShot.destroy();
      recibirDano(p, eShot);
    });

    if (boss) {
      this.physics.add.collider(boss, platforms);
      this.physics.add.collider(player, boss, (p, b) => {
        recibirDano(p, b);
      });
      this.physics.add.overlap(player, bossProjectiles, (p, bShot) => {
        bShot.destroy();
        recibirDano(p, bShot);
      });

      this.physics.add.overlap(projectiles, boss, (b, shot) => {
        shot.destroy();
        bossLives--;
        AudioGame.hit();
        boss.setTint(0xff007f);
        this.time.delayedCall(100, () => {
          if (boss && boss.active) boss.clearTint();
        });

        if (bossLives <= 0) {
          levelActive = false;
          AudioGame.playVictoryMusic();

          // Lluvia de Boba Items del Boss derrotado
          for (let i = 0; i < 12; i++) {
            let boba = items
              .create(
                boss.x + Phaser.Math.Between(-80, 80),
                boss.y - 20,
                "boba_item",
              )
              .setCollideWorldBounds(true)
              .setBounce(0.4)
              .setVelocityX(Phaser.Math.Between(-250, 250))
              .setVelocityY(Phaser.Math.Between(-400, -150));
            boba.body.setGravityY(300);
          }

          boss.destroy();
          score += 5000;
          scoreText.setText("SCORE: " + score);

          if (currentLevel === 8) {
            isGameWon = true;

            // 5 segundos de recolección libre para que el jugador se mueva por las plataformas
            this.time.delayedCall(5000, () => {
              this.physics.pause();
              if (player && player.active) player.setVelocity(0, 0);

              let bgOverlay = this.add.graphics();
              bgOverlay.fillStyle(0x11000a, 0.85);
              bgOverlay.fillRect(0, 0, 800, 600);

              AudioGame.gyaruVictoryVoice();

              if (typeof HighScoreSystem !== "undefined") {
                let esNuevoRecord = HighScoreSystem.checkAndSave(score);
                if (esNuevoRecord && highScoreText) {
                  highScoreText.setText("HI-SCORE: " + score);
                }
              }

              let txtTitulo = this.add
                .text(400, 110, "¡SUPREME VICTORY", {
                  fontSize: "42px",
                  fill: "#ff007f",
                  fontFamily: "Impact, Courier New, monospace",
                  fontWeight: "bold",
                  stroke: "#ffffff",
                  strokeThickness: 2,
                })
                .setOrigin(0.5);
              txtTitulo.setShadow(0, 0, "#ff007f", 15, true, true);

              this.add
                .text(400, 180, "You have mastered Hard Mode", {
                  fontSize: "24px",
                  fill: "#ffffff",
                  fontFamily: "Courier New, monospace",
                  fontWeight: "bold",
                })
                .setOrigin(0.5);
              this.add
                .text(400, 240, "伝説의ギャル (Legendary Samurái)", {
                  fontSize: "28px",
                  fill: "#ffff00",
                  fontFamily: "Arial, sans-serif",
                  fontWeight: "bold",
                  stroke: "#000000",
                  strokeThickness: 4,
                })
                .setOrigin(0.5);

              this.add
                .text(400, 340, "FINAL SCORE: " + score, {
                  fontSize: "26px",
                  fill: "#00f5ff",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                })
                .setOrigin(0.5);

              let txtReiniciar = this.add
                .text(400, 450, "Press R to play again", {
                  fontSize: "24px",
                  fill: "#ffffff",
                  fontFamily: "monospace",
                  align: "center",
                  fontWeight: "bold",
                })
                .setOrigin(0.5);
              this.tweens.add({
                targets: txtReiniciar,
                alpha: 0.2,
                duration: 600,
                yoyo: true,
                repeat: -1,
              });
            });
          } else {
            this.time.delayedCall(400, () => {
              AudioGame.gyaruVictoryVoice();
            });
            currentLevel = 5;
            this.time.delayedCall(5000, () => {
              this.scene.restart();
            });
          }
        }
      });
    }

    // Colisión de purpurina contra enemigos comunes
    this.physics.add.overlap(projectiles, enemies, (shot, enemy) => {
      shot.destroy();
      if (enemy.getData("isRolling")) return;
      let freeze = enemy.getData("freezeCount");
      if (freeze < 3) {
        freeze++;
        enemy
          .setData("freezeCount", freeze)
          .setData("lastHitTime", this.time.now);
        score += 10;
        scoreText.setText("SCORE: " + score);
        if (freeze === 1) {
          AudioGame.hit();
          enemy.setTint(0xffadd6).setVelocityX(enemy.body.velocity.x * 0.5);
        } else if (freeze === 2) {
          AudioGame.hit();
          enemy.setTint(0xff66b2).setVelocityX(enemy.body.velocity.x * 0.2);
        } else if (freeze === 3) {
          AudioGame.freeze();
          enemy.setTexture("glitter_ball").clearTint().setVelocityX(0);
        }
      }
    });

    // Jugador colisiona contra enemigos comunes o empuja esferas congeladas
    this.physics.add.collider(player, enemies, (p, enemy) => {
      let freeze = enemy.getData("freezeCount"),
        rolling = enemy.getData("isRolling");
      if (freeze === 3 && !rolling) {
        enemy
          .setData("isRolling", true)
          .setBounce(1, 0.4)
          .setVelocityX(p.x < enemy.x ? 450 : -450)
          .setVelocityY(-200);
        AudioGame.kick();
        score += 50;
        scoreText.setText("SCORE: " + score);
      } else if (!rolling && freeze < 3) {
        recibirDano(p, enemy);
      }
    });

    wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  } // Cierre nativo del método create() de la escena

  update() {
    if (Phaser.Input.Keyboard.JustDown(rKey)) {
      if (isGameOver || (isGameWon && this.physics.world.isPaused)) {
        reiniciarJuegoCompleto(this);
        return;
      }
    }

    if (isGameOver || (isGameWon && this.physics.world.isPaused)) return;

    if (wasd.left.isDown) {
      player.setVelocityX(-250).flipX = true;
    } else if (wasd.right.isDown) {
      player.setVelocityX(250).flipX = false;
    } else {
      player.setVelocityX(0);
    }

    if (wasd.up.isDown && player.body.touching.down) {
      player.setVelocityY(-620);
    }

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

    actualizarEnemigos(this);

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
} // Cierre nativo de la clase GameScene

// ==========================================
// FUNCIÓN DE REINICIO CENTRALIZADA (HACIA EL TITULO)
// ==========================================
function reiniciarJuegoCompleto(scene) {
  if (AudioGame.musicInterval) {
    clearInterval(AudioGame.musicInterval);
    AudioGame.musicInterval = null;
  }

  score = 0;
  lives = VIDAS_MAXIMAS;
  currentLevel = 1;
  bossLives = 10;
  isGameOver = false;
  isGameWon = false;
  levelActive = true;

  scene.scene.start("TitleScene");
}

// ==========================================
// VINCULACIÓN E INICIALIZACIÓN FINAL DE PHASER
// ==========================================
config.scene = [TitleScene, GameScene];

window.onload = () => {
  const game = new Phaser.Game(config);
};
