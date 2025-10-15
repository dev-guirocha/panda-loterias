// /src/routes/betRoutes.js
const express = require('express');
const router = express.Router();
const betController = require('../controllers/betController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota para CRIAR uma nova aposta
// Note que usamos o middleware: ele roda ANTES do betController.createBet
router.post(
  '/', // A rota será POST /api/bets
  authMiddleware.verifyToken, 
  betController.createBet
);

router.post('/', authMiddleware.verifyToken, betController.createBet);

// Rota para CRIAR VÁRIAS apostas (o carrinho)
router.post(
  '/slip',
  authMiddleware.verifyToken,
  betController.createBetSlip
);

module.exports = router;