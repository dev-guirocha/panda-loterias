// /src/services/payoutService.js
const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library'); // Para cálculos monetários
const gameLogic = require('../utils/gameLogic'); // O "Cérebro" que acabamos de criar!

const prisma = new PrismaClient();

/**
 * Processa todas as apostas pendentes para um determinado resultado de sorteio.
 * Este é o "Executor" principal.
 * @param {number} drawResultId - O ID do DrawResult que foi publicado.
 */
async function processarSorteio(drawResultId) {
  console.log(`[PayoutService] Iniciando apuração para o Sorteio ID: ${drawResultId}`);

  try {
    // --- 1. Buscar TODOS os dados necessários ---
    
    // É muito mais rápido buscar todas as regras 1x do que buscar no loop.
    const allPayoutRules = await prisma.payoutRule.findMany();

    // Buscamos o sorteio, e aninhado nele, TODAS as apostas pendentes,
    // já incluindo os dados que o gameLogic precisa (bet_type e prize_tier).
    const drawToProcess = await prisma.drawResult.findUnique({
      where: { id: drawResultId },
      include: {
        bets: {
          where: { status: 'PENDING' },
          include: {
            bet_type: true,   // Precisamos do 'name' (ex: "GRUPO")
            prize_tier: true, // Precisamos de 'start_prize' e 'end_prize'
          },
        },
      },
    });

    if (!drawToProcess) {
      console.error(`[PayoutService] Sorteio ${drawResultId} não encontrado.`);
      return;
    }

    if (drawToProcess.bets.length === 0) {
      console.log(`[PayoutService] Sorteio ${drawResultId} não possui apostas pendentes.`);
      return;
    }

    // Criamos um array simples com os números sorteados
    const prizeNumbers = [
      drawToProcess.prize1_number,
      drawToProcess.prize2_number,
      drawToProcess.prize3_number,
      drawToProcess.prize4_number,
      drawToProcess.prize5_number,
      drawToProcess.prize6_number,
      drawToProcess.prize7_number,
    ].filter(Boolean); // .filter(Boolean) remove os nulos (caso prêmio 6 e 7 não existam)


    // --- 2. O Loop Principal (O "Executor") ---
    
    let totalBetsProcessed = 0;
    let totalWon = new Decimal(0);

    for (const bet of drawToProcess.bets) {
      try {
        // 2a. Encontrar a regra de pagamento para esta aposta
        const rule = allPayoutRules.find(r => 
          r.bet_type_id === bet.bet_type_id && 
          r.prize_tier_id === bet.prize_tier_id
        );

        if (!rule) {
          console.warn(`[PayoutService] Nenhuma regra de pagamento encontrada para a aposta ID: ${bet.id}. Marcando como perdida.`);
          await prisma.bet.update({ where: { id: bet.id }, data: { status: 'LOST' } });
          continue;
        }

        // 2b. Perguntar ao "Cérebro" (gameLogic) se esta aposta ganhou
        // (Aqui está a mágica do trabalho em equipe!)
        const hitCount = gameLogic.checkWin(
          bet,
          bet.bet_type.name, // O nome (ex: "DUQUE GP")
          bet.prize_tier,    // O objeto (ex: { start_prize: 1, end_prize: 5 })
          prizeNumbers
        );

        // 2c. Pagar o vencedor ou marcar como perdedor
        if (hitCount > 0) {
          // GANHOU!
          const amountWagered = new Decimal(bet.amount_wagered);
          const payoutRate = new Decimal(rule.payout_rate);
          const amountWon = amountWagered.times(payoutRate).times(hitCount);
          
          totalWon = totalWon.add(amountWon);

          // --- TRANSAÇÃO SEGURA ---
          // Ou ambos (atualizar aposta E pagar usuário) funcionam, ou nenhum funciona.
          await prisma.$transaction(async (tx) => {
            // 1. Atualiza a aposta
            await tx.bet.update({
              where: { id: bet.id },
              data: {
                status: 'WON',
                amount_won: amountWon,
              },
            });
            // 2. Paga o usuário
            await tx.user.update({
              where: { id: bet.user_id },
              data: {
                virtual_credits: {
                  increment: amountWon, // Adiciona o prêmio ao saldo
                },
              },
            });
          });

        } else {
          // PERDEU!
          await prisma.bet.update({
            where: { id: bet.id },
            data: { status: 'LOST' },
          });
        }
        
        totalBetsProcessed++;

      } catch (betError) {
        console.error(`[PayoutService] Erro ao processar Aposta ID: ${bet.id}. Erro: ${betError.message}. Pulando...`);
      }
    } // --- Fim do Loop ---

    console.log(`[PayoutService] Apuração CONCLUÍDA para o Sorteio ID: ${drawResultId}.`);
    console.log(`> Total de Apostas Processadas: ${totalBetsProcessed}`);
    console.log(`> Valor Total Pago: ${totalWon.toString()}`);

  } catch (error) {
    console.error(`[PayoutService] Erro CRÍTICO ao processar Sorteio ID: ${drawResultId}. Erro: ${error.message}`);
  }
}

// Exportamos nossa função principal
module.exports = {
  processarSorteio,
};