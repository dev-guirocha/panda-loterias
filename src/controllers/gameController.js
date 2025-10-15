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
    // É muito mais rápido do que fazer 3 'await' separados.
    const [schedules, betTypes, prizeTiers, payoutRules] = await prisma.$transaction([
      prisma.drawSchedule.findMany({
        orderBy: { draw_time: 'asc' }, // Ordena por hora
      }),
      prisma.betType.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.prizeTier.findMany({
        orderBy: { id: 'asc' },
      }),
      prisma.payoutRule.findMany(), // Também enviamos as regras!
    ]);

    // O front-end precisará saber qual combinação é válida.
    // Enviar as PayoutRules permite ao front-end filtrar dinamicamente
    // os menus dropdown.
    // (Ex: Se o usuário clica em "GRUPO", o front-end só mostra os PrizeTiers
    // que têm uma regra para "GRUPO").

    res.json({
      schedules,
      betTypes,
      prizeTiers,
      payoutRules, // Nossas regras de pagamento
    });

  } catch (error) {
    console.error("Erro ao buscar regras do jogo:", error);
    res.status(500).json({ error: 'Erro interno ao buscar regras.' });
  }
};