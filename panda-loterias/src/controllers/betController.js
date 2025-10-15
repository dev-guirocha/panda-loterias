// /src/controllers/betController.js
const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');
const prisma = new PrismaClient();
// Importa nosso validador (da Sprint 4)
const { validateBet } = require('../utils/validationService'); 

const normalizeNumbers = (raw) => {
  if (Array.isArray(raw)) {
    return raw.map((value) => String(value).trim()).filter(Boolean);
  }

  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value !== '');
  }

  if (raw === undefined || raw === null) {
    return [];
  }

  return [String(raw).trim()].filter(Boolean);
};

async function findOrCreateDrawResult(tx, scheduleId) {
  const schedule = await tx.drawSchedule.findUnique({ where: { id: scheduleId } });
  if (!schedule) {
    throw new Error(`Horário de sorteio (ID: ${scheduleId}) não encontrado.`);
  }

  const [closeHour, closeMinute] = schedule.bet_close_time.split(':').map(Number);
  const now = new Date();
  const closeTimeForToday = new Date();
  closeTimeForToday.setHours(closeHour, closeMinute, 0, 0);

  let betDate = new Date();
  if (now.getTime() > closeTimeForToday.getTime()) {
    betDate.setDate(betDate.getDate() + 1);
  }
  betDate.setHours(0, 0, 0, 0);

  let drawResult = await tx.drawResult.findFirst({
    where: {
      draw_schedule_id: scheduleId,
      draw_date: betDate,
    },
  });

  if (!drawResult) {
    drawResult = await tx.drawResult.create({
      data: {
        draw_schedule_id: scheduleId,
        draw_date: betDate,
        status: 'PENDING',
      },
    });
  }

  return drawResult;
}

/**
 * Rota: POST /api/bets
 * Cria UMA aposta única.
 * (Esta é a função que fizemos nas Sprints anteriores)
 */
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

  const normalizedNumbers = normalizeNumbers(numbers_betted);

  const wagerAmount = new Decimal(amount_wagered || 0);

  // --- 2. VALIDAÇÕES (Fora da Transação) ---

  if (!game_type_id || !bet_type_id || !prize_tier_id || !draw_schedule_id || !normalizedNumbers.length || wagerAmount.lte(0)) {
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
      include: {
        bet_type: { select: { name: true } },
      },
    });
    if (!payoutRule) {
      return res.status(400).json({ error: 'Combinação de modalidade e prêmio inválida.' });
    }

    // Validação 3 (Tarefa 4.3): Validação de Entrada (Números)
    const validationResult = validateBet(
      payoutRule.bet_type.name,
      normalizedNumbers.join(',')
    );
    if (validationResult !== true) {
      return res.status(400).json({ error: validationResult });
    }

    // --- 3. A TRANSAÇÃO ---
    const newBet = await prisma.$transaction(async (tx) => {
      const drawResult = await findOrCreateDrawResult(tx, draw_schedule_id);
      // 3b. Debitar o saldo do usuário
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { virtual_credits: { decrement: wagerAmount } },
      });
      if (updatedUser.virtual_credits.lt(0)) {
        throw new Error('Saldo insuficiente durante a transação.');
      }
      // 3c. Criar a Aposta (Bet)
      const createdBet = await tx.bet.create({
        data: {
          user_id: userId,
          game_type_id: game_type_id,
          bet_type_id: bet_type_id,
          prize_tier_id: prize_tier_id,
          draw_result_id: drawResult.id,
          numbers_betted: normalizedNumbers,
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


/**
 * Rota: POST /api/bets/slip
 * Cria MÚLTIPLAS apostas de um "carrinho" (bet slip).
 * Recebe um array de objetos de aposta.
 * (Esta é a nova função da Tarefa 7.3)
 */
exports.createBetSlip = async (req, res) => {
  const { userId } = req.user;
  const bets = req.body; // Espera um array: [bet1, bet2, ...]

  if (!Array.isArray(bets) || bets.length === 0) {
    return res.status(400).json({ error: 'Nenhuma aposta recebida.' });
  }

  // --- 1. Calcular o Custo Total ---
  let totalCost = new Decimal(0);
  for (const bet of bets) {
    // Validamos se os dados essenciais estão presentes
    const normalizedNumbers = normalizeNumbers(bet.numbers_betted);
    if (!bet.game_type_id || !bet.bet_type_id || !bet.prize_tier_id || !bet.draw_schedule_id || !normalizedNumbers.length || !bet.amount_wagered) {
      return res.status(400).json({ error: 'Uma ou mais apostas no carrinho estão incompletas.' });
    }
    totalCost = totalCost.add(new Decimal(bet.amount_wagered));
    bet.normalizedNumbers = normalizedNumbers; // armazenamos para reutilizar depois
  }
  
  if (totalCost.lte(0)) {
     return res.status(400).json({ error: 'O valor total das apostas deve ser positivo.' });
  }

  try {
    // --- 2. Transação "TUDO OU NADA" ---
    const createdBets = await prisma.$transaction(async (tx) => {
      
      // 2a. Verificar Saldo (APENAS 1 VEZ)
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user.virtual_credits.lt(totalCost)) {
        // (Usamos 'throw' para cancelar a transação)
        throw new Error('Saldo insuficiente para cobrir todas as apostas.');
      }

      // 2b. Debitar o valor total (APENAS 1 VEZ)
      await tx.user.update({
        where: { id: userId },
        data: { virtual_credits: { decrement: totalCost } },
      });

      let newBets = []; // Array para guardar as apostas criadas

      // 2c. Fazer um loop e criar cada aposta
      for (const bet of bets) {
        const normalizedNumbers = bet.normalizedNumbers || normalizeNumbers(bet.numbers_betted);
        // 2c-a. Revalidar combinação e palpites
        const payoutRule = await tx.payoutRule.findFirst({
          where: { bet_type_id: bet.bet_type_id, prize_tier_id: bet.prize_tier_id },
          include: {
            bet_type: { select: { name: true } },
          },
        });

        if (!payoutRule) {
          throw new Error('Combinação de modalidade e prêmio inválida.');
        }

        const validationResult = validateBet(
          payoutRule.bet_type.name,
          normalizedNumbers.join(',')
        );
        if (validationResult !== true) {
          throw new Error(validationResult);
        }
        
        // (Re-usamos a lógica de 'roll-over' do createBet)
        const drawResult = await findOrCreateDrawResult(tx, bet.draw_schedule_id);

        // Criar a aposta
        const createdBet = await tx.bet.create({
          data: {
            user_id: userId,
            game_type_id: bet.game_type_id,
            bet_type_id: bet.bet_type_id,
            prize_tier_id: bet.prize_tier_id,
            draw_result_id: drawResult.id,
            numbers_betted: normalizedNumbers,
            amount_wagered: new Decimal(bet.amount_wagered),
            status: 'PENDING',
          },
        });
        newBets.push(createdBet);
      } // Fim do loop

      return newBets; // Retorna as apostas criadas
    }); // Fim da Transação

    // --- 3. SUCESSO ---
    res.status(201).json({ message: 'Apostas realizadas com sucesso!', bets: createdBets });

  } catch (error) {
    console.error("Erro ao criar carrinho de apostas:", error);
    if (error.message.includes('Saldo insuficiente')) {
      return res.status(400).json({ error: error.message });
    }
    // Retorna a mensagem de erro específica (ex: Horário não encontrado)
    res.status(500).json({ error: error.message || 'Erro interno ao processar o carrinho.' });
  }
};
