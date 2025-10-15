// /src/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const prisma = new PrismaClient();

// Nosso "segredo" para o JWT. Em produção, isso deve vir do .env
const JWT_SECRET = process.env.JWT_SECRET; 

const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(120).required()
    .messages({
      'string.empty': 'O nome é obrigatório.',
      'string.min': 'O nome precisa ter pelo menos 3 caracteres.',
    }),
  email: Joi.string().trim().lowercase().email().required()
    .messages({
      'string.email': 'Forneça um email válido.',
      'string.empty': 'O email é obrigatório.',
    }),
  password: Joi.string().min(6).pattern(passwordComplexity)
    .required()
    .messages({
      'string.empty': 'A senha é obrigatória.',
      'string.min': 'A senha precisa ter pelo menos 6 caracteres.',
      'string.pattern.base': 'A senha precisa conter ao menos uma letra maiúscula, uma minúscula e um número.',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required()
    .messages({
      'string.email': 'Forneça um email válido.',
      'string.empty': 'O email é obrigatório.',
    }),
  password: Joi.string().required()
    .messages({
      'string.empty': 'A senha é obrigatória.',
    }),
});

const sendError = (res, statusCode, message, details) => {
  const payload = { statusCode, message };
  if (details && details.length) {
    payload.details = details;
  }
  return res.status(statusCode).json(payload);
};

exports.register = async (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return sendError(res, 400, messages[0], messages);
  }

  const { name, email, password } = value;

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
      return sendError(res, 409, 'Email já cadastrado.');
    }
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return sendError(res, 400, messages[0], messages);
  }

  const { email, password } = value;

  try {
    // 1. Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return sendError(res, 401, 'Credenciais inválidas.');
    }

    // 2. Comparar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendError(res, 401, 'Credenciais inválidas.');
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
    return next(error);
  }
};
