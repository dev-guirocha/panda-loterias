// /src/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// --- Rota Pública ---
// (Não precisa de authMiddleware)

// Rota para buscar todas as regras do jogo (preencher formulários)
router.get(
  '/rules',
  gameController.getGameRules
);

module.exports = router;