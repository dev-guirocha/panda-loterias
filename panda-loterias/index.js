// index.js (do Back-end)

// --- 1. TODOS OS IMPORTS PRIMEIRO ---
const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); 
const cors = require('cors'); // <--- Importe o cors aqui em cima

// Importe suas rotas (como você já tinha)
const authRoutes = require('./src/routes/authRoutes');
const betRoutes = require('./src/routes/betRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const userRoutes = require('./src/routes/userRoutes');
const drawRoutes = require('./src/routes/drawRoutes');
const gameRoutes = require('./src/routes/gameRoutes');

// --- 2. CRIE O APP (A ORDEM CRÍTICA) ---
const app = express(); // <--- CRIE O 'app' PRIMEIRO

// --- 3. CONFIGURE OS MIDDLEWARES (app.use) ---
app.use(express.json()); // <--- (Você já tinha isso)
app.use(cors());         // <--- COLOQUE O 'app.use(cors())' AQUI!

// --- 4. CONFIGURE AS ROTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/game', gameRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('🐼 Servidor da Panda Loterias está no ar!');
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500
    ? 'Erro interno do servidor.'
    : err.message || 'Erro inesperado.';

  const payload = { statusCode, message };

  if (err.details) {
    payload.details = Array.isArray(err.details) ? err.details : [err.details];
  }

  return res.status(statusCode).json(payload);
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🐼 Servidor rodando na porta ${PORT}`);
});
