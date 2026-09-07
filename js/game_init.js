function preload() {
    if (!this.textures.exists('gyaru_samurai')) { crearTexturaPixelArt(this, 'gyaru_samurai', gyaruPixelArt, colorMapGyaru, 16, 16, 3); }
    if (!this.textures.exists('enemy_arcade')) { crearTexturaPixelArt(this, 'enemy_arcade', enemyPixelArt, colorMapEnemy, 16, 16, 3); }
    if (!this.textures.exists('boba_item')) { crearTexturaPixelArt(this, 'boba_item', bobaPixelArt, colorMapBoba, 16, 12, 2.5); }
    if (!this.textures.exists('block_texture')) { this.make.graphics({ x: 0, y: 0, add: false }).fillStyle(0xffffff, 1).fillRect(0, 0, 32, 32).generateTexture('block_texture', 32, 32); }
    if (!this.textures.exists('glitter_shot')) { this.make.graphics({ x: 0, y: 0, add: false }).fillStyle(0xff007f, 1).fillCircle(8, 8, 8).generateTexture('glitter_shot', 16, 16); }
    if (!this.textures.exists('glitter_ball')) {
        let ball = this.make.graphics({ x: 0, y: 0, add: false }).fillStyle(0xff007f, 1).fillCircle(24, 24, 22).fillStyle(0xffff00, 1).fillRect(12, 12, 6, 6).fillRect(30, 30, 6, 6);
        ball.generateTexture('glitter_ball', 48, 48);
    }
    cargarTexturasExtra(this);
}

function create() {
    isGameOver = false; levelActive = true;
    boss = null; 
    bossLives = currentLevel === 8 ? 15 : 10;

    // Reinicio absoluto de intervalos de música para evitar bloqueos
    if (AudioGame.musicInterval) {
        clearInterval(AudioGame.musicInterval);
        AudioGame.musicInterval = null;
    }

    // Encendido dinámico del sintetizador con el primer botón presionado
    this.input.keyboard.once('keydown', () => { 
        if (currentLevel >= 5) {
            AudioGame.musicInterval = setInterval(() => {
                if (isGameOver || currentLevel === 9) return;
                const melody = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23];
                let step = Math.floor(Date.now() / 150);
                AudioGame.playTone(melody[step % melody.length], 'triangle', 0.12, 0.15);
                if (step % 2 === 0) AudioGame.playTone(110, 'square', 0.06, 0.08);
            }, 150);
        } else {
            AudioGame.startMusic(); 
        }
    });

    // 🌟 1. CREAR GRUPOS DE FÍSICAS PRIMERO (Así levels.js ya los encuentra listos en memoria)
    this.items = this.physics.add.group(); 
    items = this.items; // Referencia global compartida
    projectiles = this.physics.add.group(); 
    bossProjectiles = this.physics.add.group();
    enemyProjectiles = this.physics.add.group(); 
    enemies = this.physics.add.group();

    // 🌟 2. AHORA SÍ CONSTRUIMOS LAS PLATAFORMAS Y LA FRUTA RANDOM
    construirPlataformas(this);

    // 3. Texto de interfaz
    scoreText = this.add.text(16, 16, 'SCORE: ' + score, { fontSize: '24px', fill: '#ff007f', fontFamily: 'monospace', fontWeight: 'bold' });
    let hearts = ''; for(let i=0; i<lives; i++) hearts += '💖';
    livesText = this.add.text(16, 45, 'LIVES: ' + hearts, { fontSize: '24px', fill: '#ff007f', fontFamily: 'monospace', fontWeight: 'bold' });
    
    let mundoVisual = "";
    if (currentLevel <= 4) {
        mundoVisual = (currentLevel === 4) ? "1-4 (BOSS)" : "1-" + currentLevel;
    } else {
        let nivelMundo2 = currentLevel - 4;
        mundoVisual = (nivelMundo2 === 4) ? "2-4 (FINAL BOSS)" : "2-" + nivelMundo2;
    }
    levelText = this.add.text(500, 16, 'LEVEL: ' + mundoVisual, { fontSize: '24px', fill: '#ffff00', fontFamily: 'monospace', fontWeight: 'bold' });

    // 4. Instanciar al Jugador y al Jefe
    player = this.physics.add.sprite(100, 450, 'gyaru_samurai').setCollideWorldBounds(true);

    let checkLvl = currentLevel > 4 ? currentLevel - 4 : currentLevel;
    if (checkLvl < 4) {
        let spawnPoints = [{ x: 300, y: 350 }, { x: 500, y: 350 }, { x: 400, y: 80 }];
        if (checkLvl === 2) spawnPoints.push({ x: 550, y: 200 });
        if (checkLvl === 3) spawnPoints.push({ x: 150, y: 200 }, { x: 650, y: 200 });

        spawnPoints.forEach(pos => {
            let enemy = enemies.create(pos.x, pos.y, 'enemy_arcade').setCollideWorldBounds(true).setBounce(0.1);
            let enemySpeed = currentLevel >= 5 ? 150 : 120;
            enemy.setVelocityX(Phaser.Math.Between(0, 1) === 0 ? enemySpeed : -enemySpeed); 
            enemy.setData('freezeCount', 0).setData('isRolling', false).setData('bounceCount', 0).setData('lastHitTime', 0);
        });
    } else {
        let bossSpeed = currentLevel === 8 ? 250 : 150;
        boss = this.physics.add.sprite(400, 150, 'boss_critic').setCollideWorldBounds(true).setBounce(0.1).setVelocityX(bossSpeed);
    }

    // 5. Configurar Colisiones fijas vinculadas de forma segura al motor
    this.physics.add.collider(player, platforms); 
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(items, platforms);
    this.physics.add.collider(projectiles, platforms, (shot) => { shot.destroy(); });
    this.physics.add.collider(bossProjectiles, platforms, (bShot) => { bShot.destroy(); });
    this.physics.add.collider(enemyProjectiles, platforms, (eShot) => { eShot.destroy(); });
    
    // Recolección de premios
    this.physics.add.overlap(player, items, (p, item) => { 
        AudioGame.item(); 
        if (item.getData('esFruta')) {
            score += 500;
        } else {
            score += 200;
        }
        item.destroy(); 
        scoreText.setText('SCORE: ' + score); 
    }, null, this);

    this.physics.add.overlap(player, enemyProjectiles, (p, eShot) => { eShot.destroy(); recibirDano(p, eShot); });

    // Lógicas dinámicas contra el Jefe Final de Mundo
    if (boss) {
        this.physics.add.collider(boss, platforms);
        this.physics.add.collider(player, boss, (p, b) => { recibirDano(p, b); });
        this.physics.add.overlap(player, bossProjectiles, (p, bShot) => { bShot.destroy(); recibirDano(p, bShot); });
        
        this.physics.add.overlap(projectiles, boss, (b, shot) => {
            shot.destroy(); bossLives--; AudioGame.hit(); boss.setTint(0xff007f);
            this.time.delayedCall(100, () => { if (boss && boss.active) boss.clearTint(); });
            
            if (bossLives <= 0) {
                levelActive = false; 
                AudioGame.playVictoryMusic();
                this.time.delayedCall(400, () => { AudioGame.gyaruVictoryVoice(); });

                for(let i = 0; i < 12; i++) { 
                    let boba = items.create(boss.x + Phaser.Math.Between(-80, 80), boss.y - 20, 'boba_item').setCollideWorldBounds(true).setBounce(0.4).setVelocityX(Phaser.Math.Between(-250, 250)).setVelocityY(Phaser.Math.Between(-400, -150));
                    boba.body.setGravityY(300);
                }
                
                boss.destroy(); score += 5000; scoreText.setText('SCORE: ' + score);

                if (currentLevel === 8) {
                    currentLevel = 9; 
                    this.time.delayedCall(5000, () => {
                        this.physics.pause();
                        
                        let bgOverlay = this.add.graphics();
                        bgOverlay.fillStyle(0x11000a, 0.85);
                        bgOverlay.fillRect(0, 0, 800, 600);

                        let txtTitulo = this.add.text(400, 110, '¡VICTORIA SUPREMA!', { fontSize: '52px', fill: '#ff007f', fontFamily: 'Impact, Courier New, monospace', fontWeight: 'bold', stroke: '#ffffff', strokeThickness: 2 }).setOrigin(0.5);
                        txtTitulo.setShadow(0, 0, '#ff007f', 15, true, true);

                        let txtSubtitulo = this.add.text(400, 190, 'Has dominado el Hard Mode', { fontSize: '28px', fill: '#ffffff', fontFamily: 'Courier New, monospace', fontWeight: 'bold' }).setOrigin(0.5);
                        txtSubtitulo.setShadow(2, 2, '#000000', 4, false, true);

                        let txtJapones = this.add.text(400, 280, '伝説의ギャル (Samurái Legendaria)', { fontSize: '34px', fill: '#ffff00', fontFamily: 'Comic Sans MS, Arial, sans-serif', fontWeight: 'bold', stroke: '#000000', strokeThickness: 6 }).setOrigin(0.5);
                        txtJapones.setShadow(0, 4, '#ff007f', 10, true, true);
                    });
                } else {
                    currentLevel = 5; 
                    this.time.delayedCall(5000, () => { this.scene.restart(); });
                }
            }
        });
    }

    // Purpurina impacta enemigo regular
    this.physics.add.overlap(projectiles, enemies, (shot, enemy) => {
        shot.destroy(); if (enemy.getData('isRolling')) return;
        let freeze = enemy.getData('freezeCount');
        if (freeze < 3) {
            freeze++; enemy.setData('freezeCount', freeze).setData('lastHitTime', this.time.now);
            score += 10; scoreText.setText('SCORE: ' + score);
            if (freeze === 1) { AudioGame.hit(); enemy.setTint(0xffadd6).setVelocityX(enemy.body.velocity.x * 0.5); }
            else if (freeze === 2) { AudioGame.hit(); enemy.setTint(0xff66b2).setVelocityX(enemy.body.velocity.x * 0.2); }
            else if (freeze === 3) { AudioGame.freeze(); enemy.setTexture('glitter_ball').clearTint().setVelocityX(0); }
        }
    });

    // Jugador colisiona contra enemigos
    this.physics.add.collider(player, enemies, (p, enemy) => {
        let freeze = enemy.getData('freezeCount'), rolling = enemy.getData('isRolling');
        if (freeze === 3 && !rolling) {
            enemy.setData('isRolling', true).setBounce(1, 0.4).setVelocityX(p.x < enemy.x ? 450 : -450).setVelocityY(-200);
            AudioGame.kick(); score += 50; scoreText.setText('SCORE: ' + score);
        } else if (!rolling && freeze < 3) { recibirDano(p, enemy); }
    });

    wasd = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S, left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D });
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    rKey.on('down', () => { if (isGameOver) { score = 0; lives = 3; currentLevel = 1; bossLives = 10; this.scene.restart(); } });
}
