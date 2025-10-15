// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding...');

  // --- 1. GameTypes (Tipos de Jogo) ---
  console.log('Criando Tipos de Jogo...');
  await prisma.gameType.createMany({
    data: [
      { name: 'TRADICIONAL' },
      { name: 'TRADICIONAL 1/10' },
      { name: 'LOT. URUGUAIA' },
      { name: 'QUININHA' },
      { name: 'SENINHA' },
      { name: 'SUPER15' },
    ],
    // A linha 'skipDuplicates: true' foi removida
  });
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
  await prisma.drawSchedule.createMany({
    data: schedulesData,
    // A linha 'skipDuplicates: true' foi removida
  });
  console.log('Horários de Sorteio criados.');


  // --- 3. BetTypes (Modalidades de Aposta) ---
  console.log('Criando Modalidades de Aposta...');
  const betTypesData = [
    { name: 'GRUPO' }, { name: 'DEZENA' }, { name: 'CENTENA' }, { name: 'MILHAR' },
    { name: 'DUQUE GP' }, { name: 'TERNO GP' }, { name: 'DUQUE DEZ' }, { name: 'TERNO DEZ' },
    { name: 'CENTENA INV' }, { name: 'MILHAR INV' }, { name: 'MILHAR E CT' }, { name: 'UNIDADE' },
    { name: 'PASSE VAI' }, { name: 'PASSE VAI VEM' }, { name: 'QUADRA GP' }, { name: 'QUINA GP 8/5' },
    { name: 'SENA GP 10/6' }, { name: 'PALPITAO' }
  ];
  await prisma.betType.createMany({
    data: betTypesData,
    // A linha 'skipDuplicates: true' foi removida
  });
  
  // Buscar TODOS os BetTypes que acabamos de criar
  const betTypes = await prisma.betType.findMany({
    where: { name: { in: betTypesData.map(bt => bt.name) } }
  });
  // Criar um "mapa" para fácil acesso, ex: betTypeMap.get('GRUPO').id
  const betTypeMap = new Map(betTypes.map(bt => [bt.name, bt]));
  
  console.log('Modalidades de Aposta criadas e buscadas.');


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
  await prisma.prizeTier.createMany({
    data: prizeTiersData,
    // A linha 'skipDuplicates: true' foi removida
  });

  // Buscar TODOS os PrizeTiers
  const prizeTiers = await prisma.prizeTier.findMany({
    where: { name: { in: prizeTiersData.map(pt => pt.name) } }
  });
  // Criar um "mapa"
  const prizeTierMap = new Map(prizeTiers.map(pt => [pt.name, pt]));
  
  console.log('Condições de Prêmio criadas e buscadas.');


  // --- 5. PayoutRules (Regras de Pagamento) ---
  console.log('Criando Regras de Pagamento...');

  // Helper para garantir que temos os IDs (evita crashar se algo não for encontrado)
  const getRule = (btName, ptName, rate) => {
    const betType = betTypeMap.get(btName);
    const prizeTier = prizeTierMap.get(ptName);
    if (!betType || !prizeTier) {
      console.warn(`Não foi possível criar regra para ${btName} @ ${ptName}. Tipo ou Nível não encontrado.`);
      return null;
    }
    return {
      bet_type_id: betType.id,
      prize_tier_id: prizeTier.id,
      payout_rate: rate,
    };
  };

  const payoutRulesData = [
    // --- REGRAS BÁSICAS (Que já tínhamos) ---
    getRule('GRUPO', '1 PRÊMIO', 18.00),
    getRule('GRUPO', '1/5 PRÊMIO', 3.60), // 18 / 5
    getRule('DEZENA', '1 PRÊMIO', 60.00),
    getRule('DEZENA', '1/5 PRÊMIO', 12.00), // 60 / 5
    getRule('CENTENA', '1 PRÊMIO', 600.00),
    getRule('CENTENA', '1/5 PRÊMIO', 120.00), // 600 / 5
    getRule('MILHAR', '1 PRÊMIO', 4000.00),
    getRule('MILHAR', '1/5 PRÊMIO', 800.00), // 4000 / 5
    getRule('UNIDADE', '1 PRÊMIO', 8.00),

    // --- NOVAS REGRAS (Combinadas) - Ajuste os valores! ---
    // (O `payout_rate` aqui é POR COMBINAÇÃO VENCEDORA)
    getRule('DUQUE GP', '1/5 PRÊMIO', 18.00),  // Duque de Grupo (1/5)
    getRule('TERNO GP', '1/5 PRÊMIO', 130.00), // Terno de Grupo (1/5)
    getRule('DUQUE DEZ', '1/5 PRÊMIO', 300.00), // Duque de Dezena (1/5)
    getRule('TERNO DEZ', '1/5 PRÊMIO', 3000.00), // Terno de Dezena (1/5)

    // --- NOVAS REGRAS (Invertidas) - Ajuste os valores! ---
    // (Invertida geralmente paga menos que a "seca")
    getRule('CENTENA INV', '1 PRÊMIO', 100.00), // Ex: 600 / 6 (permutações)
    getRule('CENTENA INV', '1/5 PRÊMIO', 20.00),  // Ex: 100 / 5
    getRule('MILHAR INV', '1 PRÊMIO', 350.00), // Ex: 4000 / ~11 (permutações com repetição)
    getRule('MILHAR INV', '1/5 PRÊMIO', 70.00),  // Ex: 350 / 5
  ];

  // Filtramos regras nulas (caso algo dê errado no getRule)
  const validRules = payoutRulesData.filter(Boolean);

  await prisma.payoutRule.createMany({
    data: validRules,
    // A linha 'skipDuplicates: true' foi removida
  });

  console.log('Regras de Pagamento criadas/atualizadas.');
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