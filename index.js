// index.js

// 1. Importar o Express e o Prisma Client
const express = require('express');
const { PrismaClient } = require('@prisma/client');

// 2. Inicializar o Express e o Prisma
const app = express();
const prisma = new PrismaClient();

// 3. Configurar o Express para ler JSON
app.use(express.json());

// 4. Criar uma rota de teste
app.get('/', (req, res) => {
  res.send('🐼 Servidor da Panda Loterias está no ar!');
});

// 5. Criar uma rota de teste para o banco de dados
// (Vamos tentar buscar todos os usuários)
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// 6. Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🐼 Servidor rodando na porta ${PORT}`);
});