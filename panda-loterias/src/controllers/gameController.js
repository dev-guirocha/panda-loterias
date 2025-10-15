// /src/controllers/gameController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Rota: GET /api/game/rules
 * Busca todas as regras de jogo (horários, tipos de aposta, condições)
 * para preencher os formulários do front-end.
 */
exports.getGameRules = async (req, res) => {
  try {
    // Usamos $transaction para rodar todas as buscas em paralelo

    // --- MUDANÇA AQUI ---
    // Adicionamos gameTypes à lista de buscas
    const [schedules, betTypes, prizeTiers, payoutRules, gameTypes] = await prisma.$transaction([
      prisma.drawSchedule.findMany({
        orderBy: { draw_time: 'asc' }, 
      }),
      prisma.betType.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.prizeTier.findMany({
        orderBy: { id: 'asc' },
      }),
      prisma.payoutRule.findMany(),
      // 4. ADICIONAMOS A BUSCA DE TIPOS DE JOGO
      prisma.gameType.findMany({
        orderBy: { id: 'asc' },
      }),
    ]);
    // --- FIM DA MUDANÇA ---

    res.json({
      schedules,
      betTypes,
      prizeTiers,
      payoutRules,
      gameTypes, // 5. E ENVIAMOS NO JSON
    });

  } catch (error) {
    console.error("Erro ao buscar regras do jogo:", error);
    res.status(500).json({ error: 'Erro interno ao buscar regras.' });
  }
};