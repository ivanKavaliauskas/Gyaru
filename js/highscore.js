// =========================================================================
// SISTEMA DE HIGH SCORE AUTOMÁTICO (LOCAL STORAGE)
// =========================================================================

const HighScoreSystem = {
    // Clave de almacenamiento en el navegador
    STORAGE_KEY: 'gyaru_samurai_highscore',

    // Lee el récord actual guardado
    get() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            console.warn("LocalStorage not available:", e);
            return 0;
        }
    },

    // Intenta guardar una nueva puntuación y devuelve true si es un nuevo récord
    checkAndSave(currentScore) {
        try {
            const currentHigh = this.get();
            if (currentScore > currentHigh) {
                localStorage.setItem(this.STORAGE_KEY, currentScore);
                return true; 
            }
        } catch (e) {
            console.warn("Can't save HighScore:", e);
        }
        return false;
    }
};
