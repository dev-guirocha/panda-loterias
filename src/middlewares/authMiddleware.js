// /src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Para carregar o JWT_SECRET

const JWT_SECRET = process.env.JWT_SECRET; 

exports.verifyToken = (req, res, next) => {
  // 1. Buscar o token. Padrão: 'Bearer <token>'
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Pega só o <token>

  if (token == null) {
    return res.status(401).json({ error: 'Acesso não autorizado: Token não fornecido.' });
  }

  // 2. Verificar o token
  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ error: 'Acesso proibido: Token inválido.' }); // 403 = Forbidden
    }

    // 3. Se o token for válido, anexamos o payload do usuário (userId, isAdmin, name)
    // ao objeto 'req' para que o próximo controller possa usá-lo.
    req.user = userPayload;

    // 4. Passa para a próxima função (o controller da rota)
    next();
  });
};
exports.isAdmin = (req, res, next) => {
  // Nós assumimos que verifyToken rodou ANTES e colocou req.user
  // (O token que criamos no login tem o payload { userId, isAdmin, name })

  if (req.user && req.user.isAdmin) {
    // Se req.user.isAdmin for true, continue!
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Rota exclusiva para administradores.' });
  }
};