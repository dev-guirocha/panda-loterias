// index.js (na raiz do projeto)
const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); // Carrega o .env

const app = express();
app.use(express.json());

// --- NOSSAS ROTAS ---
const authRoutes = require('./src/routes/authRoutes');
const betRoutes = require('./src/routes/betRoutes'); 
const adminRoutes = require('./src/routes/adminRoutes');
const userRoutes = require('./src/routes/userRoutes');
const drawRoutes = require('./src/routes/drawRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/draws', drawRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('🐼 Servidor da Panda Loterias está no ar!');
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🐼 Servidor rodando na porta ${PORT}`);
});