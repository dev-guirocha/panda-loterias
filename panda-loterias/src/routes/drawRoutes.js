// /src/routes/drawRoutes.js
const express = require('express');
const router = express.Router();
const drawController = require('../controllers/drawController');

// --- Rota Pública ---
// Esta rota não precisa de authMiddleware.verifyToken

// Rota para buscar os resultados publicados (filtrável por data)
router.get(
  '/results',
  drawController.getPublishedResults
);

module.exports = router;