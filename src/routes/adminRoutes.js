// /src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota para publicar um resultado
// Note a ordem dos middlewares:
// 1. verifyToken: O usuário está logado?
// 2. isAdmin: Esse usuário logado é um admin?
// 3. adminController: Se sim para ambos, rode a lógica.

router.post(
  '/results/:id', // O :id é o ID do DrawResult (no nosso teste, foi 1)
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  adminController.publishResult
);

module.exports = router;