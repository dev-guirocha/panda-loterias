// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding...');

  // --- 1. GameTypes (Tipos de Jogo) ---
  console.log('Criando Tipos de Jogo...');
  const [
    tradicional,
    tradicional10,
    uruguaia,
    quininha,
    seninha,
    super15,
  ] = await Promise.all([
    prisma.gameType.create({ data: { name: 'TRADICIONAL' } }),
    prisma.gameType.create({ data: { name: 'TRADICIONAL 1/10' } }),
    prisma.gameType.create({ data: { name: 'LOT. URUGUAIA' } }),
    prisma.gameType.create({ data: { name: 'QUININHA' } }),
    prisma.gameType.create({ data: { name: 'SENINHA' } }),
    prisma.gameType.create({ data: { name: 'SUPER15' } }),
  ]);
  console.log('Tipos de Jogo criados.');

  // --- 2. DrawSchedules (Horários dos Sorteios) ---
  console.log('Criando Horários de Sorteio...');
  const schedulesData = [
    { name: 'PTM', draw_time: '11:20:00', bet_close_time: '11:15:00' },
    { name: 'PT', draw_time: '14:20:00', bet_close_time: '14:15:00' },
    { name: 'PTV', draw_time: '16:20:00', bet_close_time: '16:15:00' },
    { name: 'PTN', draw_time: '18:20:00', bet_close_time: '18:15:00' },
    { name: 'COR', draw_time: '21:20:00', bet_close_time: '21:15:00' },
  ];
  await prisma.drawSchedule.createMany({ data: schedulesData });
  console.log('Horários de Sorteio criados.');


  // --- 3. BetTypes (Modalidades de Aposta) ---
  console.log('Criando Modalidades de Aposta...');
  // Criar individualmente os tipos que precisamos do ID para as PayoutRules
  const grupo = await prisma.betType.create({ data: { name: 'GRUPO' } });
  const dezena = await prisma.betType.create({ data: { name: 'DEZENA' } });
  const centena = await prisma.betType.create({ data: { name: 'CENTENA' } });
  const milhar = await prisma.betType.create({ data: { name: 'MILHAR' } });

  // Criar os demais tipos em lote
  const remainingBetTypesData = [
    { name: 'DUQUE GP' }, { name: 'TERNO GP' }, { name: 'DUQUE DEZ' }, { name: 'TERNO DEZ' },
    { name: 'CENTENA INV' }, { name: 'MILHAR INV' }, { name: 'MILHAR E CT' }, { name: 'UNIDADE' },
    { name: 'PASSE VAI' }, { name: 'PASSE VAI VEM' }, { name: 'QUADRA GP' }, { name: 'QUINA GP 8/5' },
    { name: 'SENA GP 10/6' }, { name: 'PALPITAO' }
    // Adicione outras variações como "ESQ", "MEIO", "SECO" conforme necessário
  ];
  await prisma.betType.createMany({ data: remainingBetTypesData });
  console.log('Modalidades de Aposta criadas.');


  // --- 4. PrizeTiers (Condições de Prêmio) ---
  console.log('Criando Condições de Prêmio...');
  const prizeTiersData = [
    { name: '1 PRÊMIO', start_prize: 1, end_prize: 1, description: 'Válido apenas para o 1º prêmio.' },
    { name: '1/5 PRÊMIO', start_prize: 1, end_prize: 5, description: 'Válido do 1º ao 5º prêmio.' },
    { name: '1/7 PRÊMIO', start_prize: 1, end_prize: 7, description: 'Válido do 1º ao 7º prêmio.' },
    { name: '1 e 1/5 PRÊMIO', start_prize: 1, end_prize: 5, description: 'Aposta dividida entre o 1º e do 1º ao 5º.' },
    { name: '6 PRÊMIO', start_prize: 6, end_prize: 6, description: 'Válido apenas para o 6º prêmio.' },
    { name: '7 PRÊMIO', start_prize: 7, end_prize: 7, description: 'Válido apenas para o 7º prêmio.' },
  ];
  await prisma.prizeTier.createMany({ data: prizeTiersData });
   // Buscar os IDs para usar nas regras de pagamento
  const tier1 = await prisma.prizeTier.findFirst({ where: { name: '1 PRÊMIO' } });
  const tier1a5 = await prisma.prizeTier.findFirst({ where: { name: '1/5 PRÊMIO' } });
  console.log('Condições de Prêmio criadas.');


  // --- 5. PayoutRules (Regras de Pagamento) ---
  console.log('Criando Regras de Pagamento...');
  const payoutRulesData = [
    // Regras para Grupo
    { bet_type_id: grupo.id, prize_tier_id: tier1.id, payout_rate: 18.00 },
    { bet_type_id: grupo.id, prize_tier_id: tier1a5.id, payout_rate: 3.60 }, // 18 / 5

    // Regras para Dezena
    { bet_type_id: dezena.id, prize_tier_id: tier1.id, payout_rate: 60.00 },
    { bet_type_id: dezena.id, prize_tier_id: tier1a5.id, payout_rate: 12.00 }, // 60 / 5

    // Regras para Centena
    { bet_type_id: centena.id, prize_tier_id: tier1.id, payout_rate: 600.00 },
    { bet_type_id: centena.id, prize_tier_id: tier1a5.id, payout_rate: 120.00 }, // 600 / 5
    
    // Regras para Milhar
    { bet_type_id: milhar.id, prize_tier_id: tier1.id, payout_rate: 4000.00 },
    { bet_type_id: milhar.id, prize_tier_id: tier1a5.id, payout_rate: 800.00 }, // 4000 / 5
  ];
  await prisma.payoutRule.createMany({ data: payoutRulesData });
  console.log('Regras de Pagamento criadas.');

  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

