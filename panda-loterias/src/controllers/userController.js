// /src/controllers/userController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Rota: GET /api/user/me
 * Busca os detalhes do usuário logado (saldo, nome, email).
 */
exports.getMyProfile = async (req, res) => {
  // req.user.userId é injetado pelo middleware verifyToken
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Usamos 'select' para NUNCA retornar o hash da senha
      select: {
        id: true,
        name: true,
        email: true,
        virtual_credits: true,
        is_admin: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json(user);

  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).json({ error: 'Erro interno ao buscar perfil.' });
  }
};

/**
 * Rota: GET /api/user/bets
 * Busca o histórico de apostas do usuário logado.
 */
exports.getMyBets = async (req, res) => {
  const { userId } = req.user;

  try {
    // Buscamos todas as apostas deste usuário
    const bets = await prisma.bet.findMany({
      where: { user_id: userId },
      // Ordenamos pela mais recente primeiro
      orderBy: { created_at: 'desc' },
      // Usamos 'include' para trazer os nomes e datas (contexto)
      include: {
        bet_type: {
          select: { name: true }, // "GRUPO", "DEZENA"
        },
        prize_tier: {
          select: { name: true }, // "1 PRÊMIO", "1/5 PRÊMIO"
        },
        draw_result: {
          include: {
            draw_schedule: {
              select: { name: true }, // "PTM", "COR"
            },
          },
        },
      },
    });

    // Formatamos a resposta para ser mais limpa para o front-end
    const formattedBets = bets.map(bet => ({
      bet_id: bet.id,
      status: bet.status,
      amount_wagered: bet.amount_wagered,
      amount_won: bet.amount_won,
      numbers_betted: bet.numbers_betted,
      bet_type: bet.bet_type.name,
      prize_tier: bet.prize_tier.name,
      draw_schedule: bet.draw_result.draw_schedule.name,
      draw_date: bet.draw_result.draw_date,
      created_at: bet.created_at,
    }));

    res.json(formattedBets);

  } catch (error) {
    console.error('Erro ao buscar histórico de apostas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar histórico.' });
  }
};