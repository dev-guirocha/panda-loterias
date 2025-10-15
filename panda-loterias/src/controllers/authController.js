// /src/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Nosso "segredo" para o JWT. Em produção, isso deve vir do .env
const JWT_SECRET = process.env.JWT_SECRET; 

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validação básica
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    // 1. Fazer o Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Usar o Prisma para criar o usuário
    // O Prisma Client (prisma.user.create) já está disponível!
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // virtual_credits e is_admin já têm valores default no schema.prisma
      },
    });

    // Não retornar a senha no JSON
    delete user.password;
    res.status(201).json(user); // 201 = Created

  } catch (error) {
    // 3. Lidar com erros (ex: email já existe)
    if (error.code === 'P2002') { // Código de erro do Prisma para 'unique constraint violation'
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // 2. Comparar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // 3. Gerar o Token JWT
    const token = jwt.sign(
      { userId: user.id, isAdmin: user.is_admin, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    res.json({
      message: 'Login bem-sucedido!',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
};