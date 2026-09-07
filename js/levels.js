// Lista temporal para almacenar dónde hay plataformas en el nivel actual
let posiblesPlataformas = [];

// 🌟 CORREGIDO: Ahora usa scene.platforms para asociarlo correctamente al motor gráfico
function agregarBloque(scene, x, y, ancho, color) {
    scene.platforms.create(x, y, 'block_texture')
                   .setDisplaySize(ancho, 24)
                   .setTint(color)
                   .refreshBody();
             
    posiblesPlataformas.push({ x: x, y: y, ancho: ancho });
}

function construirPlataformas(scene) {
    // 🌟 CORREGIDO: Vinculamos el grupo estático directamente a la escena activa
    scene.platforms = scene.physics.add.staticGroup();
    platforms = scene.platforms; // Mantenemos la referencia global por compatibilidad
    posiblesPlataformas = []; 
    
    // Suelo base permanente asociado a la escena
    scene.platforms.create(400, 568, 'block_texture').setDisplaySize(800, 64).setTint(0x222222).refreshBody(); 

    // --- MUNDO 1 (Niveles 1 al 4) ---
    if (currentLevel === 1) { 
        agregarBloque(scene, 400, 420, 500, 0x9400d3);
        agregarBloque(scene, 150, 290, 220, 0x9400d3);
        agregarBloque(scene, 650, 290, 220, 0x9400d3);
        agregarBloque(scene, 400, 150, 400, 0x9400d3);
    } 
    else if (currentLevel === 2) { 
        agregarBloque(scene, 250, 430, 400, 0x00f5ff);
        agregarBloque(scene, 550, 300, 400, 0x00f5ff);
        agregarBloque(scene, 250, 170, 400, 0x00f5ff);
    } 
    else if (currentLevel === 3) { 
        agregarBloque(scene, 150, 380, 200, 0xff00ff);
        agregarBloque(scene, 400, 260, 250, 0xff00ff);
        agregarBloque(scene, 650, 380, 200, 0xff00ff);
    } 
    else if (currentLevel === 4) { 
        agregarBloque(scene, 200, 350, 250, 0xff3333);
        agregarBloque(scene, 600, 350, 250, 0xff3333);
    }

    // --- MUNDO 2 (Niveles 5 al 8) ---
    else if (currentLevel === 5) { 
        agregarBloque(scene, 120, 420, 200, 0xff4500);
        agregarBloque(scene, 680, 420, 200, 0xff4500);
        agregarBloque(scene, 400, 290, 300, 0xffd700); 
        agregarBloque(scene, 120, 160, 200, 0xff4500);
        agregarBloque(scene, 680, 160, 200, 0xff4500);
    } 
    else if (currentLevel === 6) { 
        agregarBloque(scene, 400, 440, 200, 0xffd700);
        agregarBloque(scene, 200, 310, 250, 0xffd700);
        agregarBloque(scene, 600, 310, 250, 0xffd700);
        agregarBloque(scene, 400, 180, 500, 0xffd700);
    } 
    else if (currentLevel === 7) { 
        agregarBloque(scene, 200, 440, 150, 0xff4500);
        agregarBloque(scene, 600, 440, 150, 0xff4500);
        agregarBloque(scene, 400, 320, 180, 0xff4500);
        agregarBloque(scene, 200, 200, 150, 0xff4500);
        agregarBloque(scene, 600, 200, 150, 0xff4500);
    } 
    else if (currentLevel === 8) { 
        agregarBloque(scene, 400, 400, 350, 0xff0033);
        agregarBloque(scene, 150, 240, 180, 0xff0033);
        agregarBloque(scene, 650, 240, 180, 0xff0033);
    }

    // GENERAR LA FRUTA EN UNA PLATAFORMA RANDOM (Evitando niveles de Boss 4 y 8)
    if (currentLevel !== 4 && currentLevel !== 8 && posiblesPlataformas.length > 0) {
        let platElegida = posiblesPlataformas[Phaser.Math.Between(0, posiblesPlataformas.length - 1)];
        let margen = 20;
        let randomX = Phaser.Math.Between(platElegida.x - (platElegida.ancho/2) + margen, platElegida.x + (platElegida.ancho/2) - margen);
        
        // 🌟 CORREGIDO: Añadimos "scene." antes de "items" para usar el grupo correcto de la escena activa
        let cherry = scene.items.create(randomX, platElegida.y - 25, 'cherry_fruit');
        cherry.body.allowGravity = false; 
        cherry.setData('esFruta', true);  
    }
}

function recibirDano(p, origin) {
    if (!isInvincible && !isGameOver) {
        lives--;
        let hearts = ''; for(let i=0; i<lives; i++) hearts += '💖';
        livesText.setText('LIVES: ' + (hearts || '💀'));

        if (lives <= 0) {
            AudioGame.gameOver(); isGameOver = true; player.setTint(0x555555);
            player.scene.physics.pause();
            player.scene.add.text(400, 300, 'GAME OVER\nPresiona R para reiniciar', { fontSize: '40px', fill: '#ff007f', fontFamily: 'monospace', align: 'center', fontWeight: 'bold' }).setOrigin(0.5);
        } else {
            AudioGame.hit(); isInvincible = true;
            p.setVelocityY(-300).setVelocityX(p.x < origin.x ? -250 : 250).setTint(0xffffff);
            player.scene.tweens.add({ targets: player, alpha: 0.3, duration: 100, yoyo: true, repeat: 6, onComplete: () => { player.alpha = 1; player.clearTint(); isInvincible = false; } });
        }
    }
}
