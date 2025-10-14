// /src/controllers/betController.js
const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library'); // Usaremos para somar/subtrair

const prisma = new PrismaClient();

exports.createBet = async (req, res) => {
  // 1. Obter dados da Requisição
  // req.user vem do middleware verifyToken
  const { userId } = req.user; 
  
  // req.body vem do JSON que o usuário envia
  const {
    game_type_id,
    bet_type_id,
    prize_tier_id,
    draw_schedule_id, // ID do horário (ex: 1 para PTM)
    numbers_betted,   // String ou JSON String. Ex: "123" ou "['5', '10']"
    amount_wagered,   // Valor da aposta
  } = req.body;

  const wagerAmount = new Decimal(amount_wagered || 0);

  // --- 2. VALIDAÇÕES (Fora da Transação) ---

  // Validação básica de entrada
  if (!game_type_id || !bet_type_id || !prize_tier_id || !draw_schedule_id || !numbers_betted || wagerAmount.lte(0)) {
    return res.status(400).json({ error: 'Dados da aposta incompletos ou inválidos.' });
  }

  try {
    // Validação 1: O usuário existe e tem saldo?
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    if (user.virtual_credits.lt(wagerAmount)) { // .lt() = Less Than
      return res.status(400).json({ error: 'Saldo insuficiente.' });
    }

    // Validação 2: A combinação de aposta é válida? (Existe PayoutRule?)
    const payoutRule = await prisma.payoutRule.findFirst({
      where: { bet_type_id, prize_tier_id },
    });
    if (!payoutRule) {
      return res.status(400).json({ error: 'Combinação de modalidade e prêmio inválida.' });
    }

    // Validação 3: O horário de apostas ainda está aberto?
    const schedule = await prisma.drawSchedule.findUnique({ where: { id: draw_schedule_id } });
    const [closeHour, closeMinute] = schedule.bet_close_time.split(':').map(Number);
    
    const now = new Date(); // Horário local do servidor
    const closeTime = new Date();
    closeTime.setHours(closeHour, closeMinute, 0, 0); // Define o horário de fechamento para HOJE

    if (now.getTime() > closeTime.getTime()) {
      return res.status(400).json({ error: `Horário de apostas para ${schedule.name} já encerrou.` });
    }

    // --- 3. A TRANSAÇÃO (O Coração da Lógica) ---
    // Isso garante que as duas operações (debitar e criar aposta)
    // aconteçam, ou nenhuma delas acontece.
    
    const newBet = await prisma.$transaction(async (tx) => {
      // 3a. Encontrar ou Criar o Sorteio do Dia (DrawResult)
      // Precisamos do ID do sorteio de HOJE para o horário PTM (por ex.)
      const today = new Date(new Date().setHours(0, 0, 0, 0)); // Data de hoje, à meia-noite

      let drawResult = await tx.drawResult.findFirst({
        where: {
          draw_schedule_id: draw_schedule_id,
          draw_date: today,
        },
      });

      // Se o sorteio de hoje (ex: PTM de 14/Out) ainda não existe, crie-o
      if (!drawResult) {
        drawResult = await tx.drawResult.create({
          data: {
            draw_schedule_id: draw_schedule_id,
            draw_date: today,
            status: 'PENDING',
          },
        });
      }

      // 3b. Debitar o saldo do usuário
      // (Fazemos isso de novo aqui dentro caso o usuário tenha feito 2 apostas ao mesmo tempo)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          virtual_credits: {
            decrement: wagerAmount, // Operação atômica de decremento
          },
        },
      });

      // Checagem de segurança (raro, mas pode acontecer em concorrência)
      if (updatedUser.virtual_credits.lt(0)) {
        throw new Error('Saldo insuficiente durante a transação.'); // Isso vai causar o rollback
      }

      // 3c. Criar a Aposta (Bet)
      const createdBet = await tx.bet.create({
        data: {
          user_id: userId,
          game_type_id: game_type_id,
          bet_type_id: bet_type_id,
          prize_tier_id: prize_tier_id,
          draw_result_id: drawResult.id, // Vinculamos ao sorteio do dia/hora
          numbers_betted: String(numbers_betted), // Garantir que é string
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