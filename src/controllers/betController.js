// /src/controllers/betController.js (COM A TAREFA 4.3)
const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');
const prisma = new PrismaClient();
const { validateBet } = require('../utils/validationService'); // <-- 1. IMPORTAR O "SEGURANÇA"

exports.createBet = async (req, res) => {
  // 1. Obter dados da Requisição
  const { userId } = req.user;
  const {
    game_type_id,
    bet_type_id,
    prize_tier_id,
    draw_schedule_id,
    numbers_betted,
    amount_wagered,
  } = req.body;

  const wagerAmount = new Decimal(amount_wagered || 0);

  // --- 2. VALIDAÇÕES (Fora da Transação) ---

  if (!game_type_id || !bet_type_id || !prize_tier_id || !draw_schedule_id || !numbers_betted || wagerAmount.lte(0)) {
    return res.status(400).json({ error: 'Dados da aposta incompletos ou inválidos.' });
  }

  try {
    // Validação 1: O usuário existe e tem saldo?
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    if (user.virtual_credits.lt(wagerAmount)) {
      return res.status(400).json({ error: 'Saldo insuficiente.' });
    }

    // Validação 2: A combinação de aposta é válida?
    const payoutRule = await prisma.payoutRule.findFirst({
      where: { bet_type_id, prize_tier_id },
      // Precisamos do nome do tipo de aposta para o validador
      include: {
        bet_type: { select: { name: true } },
      },
    });
    if (!payoutRule) {
      return res.status(400).json({ error: 'Combinação de modalidade e prêmio inválida.' });
    }

    // --- TAREFA 4.3: VALIDAÇÃO DE ENTRADA ---
    // Chamamos o "Segurança"
    const validationResult = validateBet(
      payoutRule.bet_type.name, // Ex: "DUQUE GP"
      numbers_betted             // Ex: "10,15"
    );

    if (validationResult !== true) {
      // Se a validação falhar, rejeitamos a aposta com a mensagem de erro.
      return res.status(400).json({ error: validationResult });
    }
    // --- FIM DA VALIDAÇÃO 4.3 ---


    // --- TAREFA 4.2: LÓGICA DE DATA "ROLL-OVER" ---
    const schedule = await prisma.drawSchedule.findUnique({ where: { id: draw_schedule_id } });
    if (!schedule) {
      return res.status(404).json({ error: 'Horário de sorteio não encontrado.' });
    }

    const [closeHour, closeMinute] = schedule.bet_close_time.split(':').map(Number);
    const now = new Date(); // Horário atual (Ex: 21:50)

    const closeTimeForToday = new Date();
    closeTimeForToday.setHours(closeHour, closeMinute, 0, 0); // Ex: 11:15:00 de hoje

    let betDate = new Date();
    if (now.getTime() > closeTimeForToday.getTime()) {
      betDate.setDate(betDate.getDate() + 1); // Aposta para amanhã
    }
    betDate.setHours(0, 0, 0, 0);
    // --- FIM DA LÓGICA DE DATA ---


    // --- 3. A TRANSAÇÃO (O Coração da Lógica) ---
    const newBet = await prisma.$transaction(async (tx) => {
      // (O restante do código da transação é idêntico ao anterior)
      let drawResult = await tx.drawResult.findFirst({
        where: {
          draw_schedule_id: draw_schedule_id,
          draw_date: betDate,
        },
      });
      if (!drawResult) {
        drawResult = await tx.drawResult.create({
          data: {
            draw_schedule_id: draw_schedule_id,
            draw_date: betDate,
            status: 'PENDING',
          },
        });
      }
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { virtual_credits: { decrement: wagerAmount } },
      });
      if (updatedUser.virtual_credits.lt(0)) {
        throw new Error('Saldo insuficiente durante a transação.');
      }
      const createdBet = await tx.bet.create({
        data: {
          user_id: userId,
          game_type_id: game_type_id,
          bet_type_id: bet_type_id,
          prize_tier_id: prize_tier_id,
          draw_result_id: drawResult.id,
          numbers_betted: String(numbers_betted), // Salva o número validado
          amount_wagered: wagerAmount,
          status: 'PENDING',
        },
      });
      return createdBet;
    });

    // --- 4. SUCESSO ---
    res.status(201).json({ message: 'Aposta realizada com sucesso!', bet: newBet });

  } catch (error) {
    // --- 5. ERRO ---
    console.error("Erro ao criar aposta:", error);
    if (error.message.includes('Saldo insuficiente')) {
      return res.status(400).json({ error: 'Saldo insuficiente.' });
    }
    res.status(500).json({ error: 'Erro interno ao processar aposta.' });
  }
};