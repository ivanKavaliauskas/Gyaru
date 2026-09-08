// ==========================================
// MATRICES DE DISEÑO PIXEL ART (16x16 / 12x12)
// ==========================================

// Chica Samurái Gyaru
const gyaruPixelArt = [
  "....YYYYYYYY....",
  "...YYYYYYYYYY...",
  "..YYYTTTTTTYYY..",
  "..YYTTWTTWTTYY..",
  "..YTTTBBTTBBTTY.",
  "..YTTTTTTTTTTTY.",
  "...TTTPPPPPPPT..",
  "....PPPPPPPPP...",
  "....PPPPPPPPP...",
  "...PPPPPPPPPPP..",
  "...PPYPPPPPYPP..",
  "...YYYY...YYYY..",
  "..YYYY.....YYYY.",
  "..YY.........YY.",
  "..TT.........TT.",
  "..BB.........BB.",
];

// Enemigo Monótono Común (Estilo Snow Bros)
const enemyPixelArt = [
  "....GGGGGGGG....",
  "...GGGGGGGGGG...",
  "..GGWGGGGGGWGG..",
  "..GWBBGGGGBBWG..",
  "..GGGGGGGGGGGG..",
  "..GGGGGGGGGGGG..",
  "...GGGGGGGGGG...",
  "....GGGGGGGG...",
  "..GGGGGGGGGGGG..",
  ".GGGGGGGGGGGGGG.",
  ".GGGGGGGGGGGGGG.",
  ".GG..GGGGGG..GG.",
  ".....GGGGGG.....",
  "....GG....GG....",
  "....GG....GG....",
  "...GGG....GGG...",
];

// Item de Recompensa: Té de Boba (Bubble Tea)
const bobaPixelArt = [
  "....WWWWWW......",
  "....W....W......",
  "...PPPPPPPP.....",
  "...P......P.....",
  "...P......P.....",
  "...P.B..B.P.....",
  "...P......P.....",
  "...P.B..B.P.....",
  "...P......P.....",
  "...PPPPPPPP.....",
  "....PPPPPP......",
  "................",
];

// El Crítico de Moda Aburrido (Jefe Final Gigante)
const bossPixelArt = [
  "....GGGGGGGG....",
  "...GGGGGGGGGG...",
  "..GGWGGGGGGWGG..",
  "..GWBBGGGGBBWG..",
  "..GGGGGGGGGGGG..",
  "..GGGGGGGGGGGG..",
  "...GGGGGGGGGG...",
  "....GGGGGGGG...",
  "..GGGGGGGGGGGG..",
  ".GGGGGGGGGGGGGG.",
  ".GGGGGGGGGGGGGG.",
  ".GG..GGGGGG..GG.",
  ".....GGGGGG.....",
  "....GG....GG....",
  "....GG....GG....",
  "...GGG....GGG...",
];

// Fruta de Bonificación: Cereza Arcade (12x12)
const cerezaPixelArt = [
  "......RR....",
  ".....R..R...",
  "....R....R..",
  "...R......R.",
  "..PPPP..PPPP",
  ".PPBPP..PPBPP",
  ".PPPP...PPPP",
  "..PP.....PP.",
];

// ==========================================
// PALETAS DE COLORES HEXADECIMALES
// ==========================================
const colorMapGyaru = {
  ".": null,
  Y: "#f1c40f",
  T: "#e0a96d",
  W: "#ffffff",
  B: "#000000",
  P: "#ff007f",
};
const colorMapEnemy = { ".": null, G: "#7f8c8d", W: "#ffffff", B: "#000000" };
const colorMapBoba = { ".": null, W: "#ffffff", P: "#ff99c8", B: "#000000" };
const colorMapCereza = { ".": null, R: "#8b4513", P: "#ff0055", B: "#ffffff" };

// =========================================================================
// 🌟 FUNCIONES DE GENERACIÓN DE TEXTURAS PHASER
// =========================================================================

// Convierte las matrices de texto en texturas de imagen reales en la memoria de Phaser
function crearTexturaPixelArt(
  scene,
  key,
  matrix,
  colorMap,
  width,
  height,
  scale,
) {
  if (!scene || !scene.textures) return;
  let canvasTexture = scene.textures.createCanvas(
    key,
    width * scale,
    height * scale,
  );
  let ctx = canvasTexture.context;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      let char = matrix[r][c];
      let color = colorMap[char];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    }
  }
  canvasTexture.refresh();
}

// Inyecta los sprites especiales cuando se cambia de escenario
function cargarTexturasExtra(scene) {
  if (!scene || !scene.textures) return;

  if (!scene.textures.exists("boss_critic")) {
    crearTexturaPixelArt(
      scene,
      "boss_critic",
      bossPixelArt,
      colorMapEnemy,
      16,
      16,
      8,
    );
  }
  if (!scene.textures.exists("boredom_shot")) {
    let shot = scene.make
      .graphics({ x: 0, y: 0, add: false })
      .fillStyle(0x7f8c8d, 1)
      .fillCircle(12, 12, 12);
    shot.generateTexture("boredom_shot", 24, 24);
  }

  // Pasar la escena de forma explícita para evitar errores de herencia
  cargarTexturaFruta(scene);
}

// Genera de forma segura la textura de la cereza de bonificación
function cargarTexturaFruta(scene) {
  if (!scene || !scene.textures) return;

  if (!scene.textures.exists("cherry_fruit")) {
    crearTexturaPixelArt(
      scene,
      "cherry_fruit",
      cerezaPixelArt,
      colorMapCereza,
      12,
      12,
      2.5,
    );
  }
}
