function update() {
    if (isGameOver || currentLevel === 9) return;

    // Movimiento horizontal Gyaru
    if (wasd.left.isDown) { player.setVelocityX(-250).flipX = true; }
    else if (wasd.right.isDown) { player.setVelocityX(250).flipX = false; }
    else { player.setVelocityX(0); }

    // Salto árcade
    if (wasd.up.isDown && player.body.touching.down) { player.setVelocityY(-620); }

    // Disparos de purpurina rosa
    if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        AudioGame.shoot(); let shot = projectiles.create(player.x + (player.flipX ? -20 : 20), player.y, 'glitter_shot');
        shot.body.allowGravity = false; shot.setVelocityX(player.flipX ? -400 : 400);
        this.time.delayedCall(600, () => { if(shot.active) shot.destroy(); });
    }

    // Actualización modular de IA enemiga
    actualizarEnemigos(this);

    // Sistema automático para avanzar de pantalla
    if (currentLevel < 8 && currentLevel !== 4 && enemies.countActive(true) === 0 && levelActive) {
        levelActive = false; AudioGame.item();
        this.add.text(400, 250, 'NIVEL COMPLETADO', { fontSize: '36px', fill: '#ffff00', fontFamily: 'monospace', fontWeight: 'bold' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => { currentLevel++; this.scene.restart(); });
    }
}

// 🌟 VINCULACIÓN AL MOTOR Y INICIALIZACIÓN DIFERIDA COMPLETA
config.scene = { preload: preload, create: create, update: update };

window.onload = () => {
    const game = new Phaser.Game(config);
};
