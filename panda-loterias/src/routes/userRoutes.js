// /src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// --- Rotas Protegidas ---
// Todas as rotas aqui exigem que o usuário esteja logado (verifyToken)

// Rota para buscar o perfil (saldo, nome, etc.) do usuário logado
router.get(
  '/me',
  authMiddleware.verifyToken,
  userController.getMyProfile
);

// Rota para buscar o histórico de apostas do usuário logado
router.get(
  '/bets',
  authMiddleware.verifyToken,
  userController.getMyBets
);

module.exports = router;