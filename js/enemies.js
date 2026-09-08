function actualizarEnemigos(scene) {
  // --- LÓGICA DEL JEFE FINAL (Nivel 4 o Nivel 8) ---
  if ((currentLevel === 4 || currentLevel === 8) && boss && boss.active) {
    // En el nivel 8 (Hard Boss), el jefe se mueve a velocidad 250 (Mucho más veloz)
    let bossSpeed = currentLevel === 8 ? 250 : 150;

    if (boss.body.blocked.left) {
      boss.setVelocityX(bossSpeed);
      boss.flipX = false;
    } else if (boss.body.blocked.right) {
      boss.setVelocityX(-bossSpeed);
      boss.flipX = true;
    }

    // El jefe dispara ráfagas grises aleatoriamente (Más frecuente en nivel 8)
    let fireChance = currentLevel === 8 ? 3 : 5;
    if (Phaser.Math.Between(1, 100) <= fireChance) {
      let bShot = bossProjectiles.create(boss.x, boss.y + 20, "boredom_shot");
      bShot.body.allowGravity = false;
      let angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
      scene.physics.velocityFromRotation(angle, 350, bShot.body.velocity);
    }
  }

  // --- LÓGICA DE ENEMIGOS COMUNES ---
  enemies.getChildren().forEach((enemy) => {
    let freeze = enemy.getData("freezeCount");
    let rolling = enemy.getData("isRolling");

    if (rolling) {
      enemy.angle += enemy.body.velocity.x > 0 ? 12 : -12;

      enemies.getChildren().forEach((otherEnemy) => {
        if (otherEnemy !== enemy && otherEnemy.getData("freezeCount") < 3) {
          if (
            Phaser.Geom.Intersects.RectangleToRectangle(
              enemy.getBounds(),
              otherEnemy.getBounds(),
            )
          ) {
            AudioGame.freeze();
            items
              .create(otherEnemy.x, otherEnemy.y - 10, "boba_item")
              .setCollideWorldBounds(true)
              .setBounce(0.2);
            otherEnemy.destroy();
            score += 100;
            scoreText.setText("SCORE: " + score);
          }
        }
      });

      if (enemy.body.blocked.left || enemy.body.blocked.right) {
        let bounces = enemy.getData("bounceCount") + 1;
        enemy.setData("bounceCount", bounces);
        enemy
          .setVelocityX(enemy.body.blocked.left ? 450 : -450)
          .setVelocityY(-450);

        if (bounces >= 4) {
          AudioGame.kick();
          items
            .create(enemy.x, enemy.y - 10, "boba_item")
            .setCollideWorldBounds(true)
            .setBounce(0.2);
          enemy.destroy();
          score += 300;
          scoreText.setText("SCORE: " + score);
        }
      }
      return;
    }

    // --- 🌟 NUEVO: DISPARO DE ENEMIGOS COMUNES (Solo niveles 5, 6 y 7) ---
    // Si el enemigo no está congelado, tiene una pequeña probabilidad de disparar una bolita gris
    if (currentLevel >= 5 && currentLevel <= 7 && freeze === 0) {
      if (Phaser.Math.Between(1, 150) === 10) {
        let eShot = enemyProjectiles
          .create(enemy.x, enemy.y, "glitter_shot")
          .setTint(0x7f8c8d); // Esfera gris
        eShot.body.allowGravity = false;
        eShot.setVelocityX(enemy.flipX ? -200 : 200); // Dispara en la dirección en la que camina
        scene.time.delayedCall(1500, () => {
          if (eShot.active) eShot.destroy();
        });
      }
    }

    if (freeze > 0 && scene.time.now - enemy.getData("lastHitTime") > 3000) {
      freeze--;
      enemy
        .setData("freezeCount", freeze)
        .setData("lastHitTime", scene.time.now);
      if (freeze === 2) {
        enemy.setTexture("enemy_arcade");
        enemy.setTint(0xff66b2);
      } else if (freeze === 1) {
        enemy.setTint(0xffadd6);
      } else if (freeze === 0) {
        enemy.clearTint();
        enemy.setVelocityX(enemy.flipX ? -100 : 100);
      }
    }

    if (freeze < 3) {
      let normalSpeed = freeze === 1 ? 50 : freeze === 2 ? 20 : 100;
      if (enemy.body.blocked.left) {
        enemy.setVelocityX(normalSpeed).flipX = false;
      } else if (enemy.body.blocked.right) {
        enemy.setVelocityX(-normalSpeed).flipX = true;
      }
      if (enemy.body.velocity.x > 0) {
        enemy.setVelocityX(normalSpeed).flipX = false;
      } else if (enemy.body.velocity.x < 0) {
        enemy.setVelocityX(-normalSpeed).flipX = true;
      }
    }
  });
}
