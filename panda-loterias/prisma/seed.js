// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const upsertManyByName = async (model, data) => {
  for (const entry of data) {
    await model.upsert({
      where: { name: entry.name },
      update: entry,
      create: entry,
    });
  }
};

async function main() {
  console.log('Iniciando o seeding...');

  // --- 1. GameTypes (Tipos de Jogo) ---
  console.log('Criando/atualizando Tipos de Jogo...');
  await upsertManyByName(prisma.gameType, [
    { name: 'TRADICIONAL' },
    { name: 'TRADICIONAL 1/10' },
    { name: 'LOT. URUGUAIA' },
    { name: 'QUININHA' },
    { name: 'SENINHA' },
    { name: 'SUPER15' },
  ]);

  // --- 2. DrawSchedules (Horários dos Sorteios) ---
  console.log('Criando/atualizando Horários de Sorteio...');
  const schedulesData = [
    { name: 'PTM', draw_time: '11:20:00', bet_close_time: '11:15:00' },
    { name: 'PT', draw_time: '14:20:00', bet_close_time: '14:15:00' },
    { name: 'PTV', draw_time: '16:20:00', bet_close_time: '16:15:00' },
    { name: 'PTN', draw_time: '18:20:00', bet_close_time: '18:15:00' },
    { name: 'COR', draw_time: '21:20:00', bet_close_time: '21:15:00' },
  ];
  await upsertManyByName(prisma.drawSchedule, schedulesData);


  // --- 3. BetTypes (Modalidades de Aposta) ---
  console.log('Criando Modalidades de Aposta...');
  const betTypesData = [
    { name: 'GRUPO' },
    { name: 'GRUPO ESQ' },
    { name: 'GRUPO MEIO' },
    { name: 'DEZENA' },
    { name: 'DEZENA ESQ' },
    { name: 'DEZENA MEIO' },
    { name: 'CENTENA' },
    { name: 'CENTENA 3X' },
    { name: 'CENTENA ESQUERDA' },
    { name: 'CENTENA INV' },
    { name: 'CENTENA INV ESQ' },
    { name: 'MILHAR' },
    { name: 'MILHAR INV' },
    { name: 'MILHAR E CT' },
    { name: 'UNIDADE' },
    { name: 'DUQUE GP' },
    { name: 'DUQUE GP ESQ' },
    { name: 'DUQUE GP MEIO' },
    { name: 'TERNO GP' },
    { name: 'TERNO GP ESQ' },
    { name: 'TERNO GP MEIO' },
    { name: 'QUADRA GP' },
    { name: 'QUADRA GP ESQ' },
    { name: 'QUADRA GP MEIO' },
    { name: 'QUINA GP 8/5' },
    { name: 'QUINA GP 8/5 ESQ' },
    { name: 'QUINA GP 8/5 MEIO' },
    { name: 'SENA GP 10/6' },
    { name: 'SENA GP 10/6 ESQ' },
    { name: 'SENA GP 10/6 MEIO' },
    { name: 'DUQUE DEZ' },
    { name: 'DUQUE DEZ ESQ' },
    { name: 'DUQUE DEZ MEIO' },
    { name: 'TERNO DEZ' },
    { name: 'TERNO DEZ ESQ' },
    { name: 'TERNO DEZ MEIO' },
    { name: 'TERNO DEZ SECO' },
    { name: 'TERNO DEZ SECO ESQ' },
    { name: 'TERNO DEZ SECO MEIO' },
    { name: 'PALPITAO' },
    { name: 'PASSE VAI' },
    { name: 'PASSE VAI VEM' },
  ];
  await upsertManyByName(prisma.betType, betTypesData);
  
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
  await upsertManyByName(prisma.prizeTier, prizeTiersData);

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

  const payoutRulesData = [];

  const addTierRates = (betTypes, tierRates) => {
    betTypes.forEach((betType) => {
      Object.entries(tierRates).forEach(([tierName, rate]) => {
        payoutRulesData.push(getRule(betType, tierName, rate));
      });
    });
  };

  const mirrored = (base) => [`${base}`, `${base} ESQ`, `${base} MEIO`];

  addTierRates(mirrored('GRUPO'), {
    '1 PRÊMIO': 18.0,
    '1/5 PRÊMIO': 3.6,
  });

  addTierRates(mirrored('DEZENA'), {
    '1 PRÊMIO': 60.0,
    '1/5 PRÊMIO': 12.0,
  });

  addTierRates(['CENTENA', 'CENTENA 3X', 'CENTENA ESQUERDA'], {
    '1 PRÊMIO': 600.0,
    '1/5 PRÊMIO': 120.0,
  });

  addTierRates(['UNIDADE'], { '1 PRÊMIO': 8.0 });

  addTierRates(['MILHAR'], {
    '1 PRÊMIO': 4200.0,
    '1/5 PRÊMIO': 840.0,
  });

  addTierRates(['CENTENA INV', 'CENTENA INV ESQ'], {
    '1 PRÊMIO': 110.0,
    '1/5 PRÊMIO': 22.0,
  });

  addTierRates(['MILHAR INV'], {
    '1 PRÊMIO': 360.0,
    '1/5 PRÊMIO': 72.0,
  });

  addTierRates(['MILHAR E CT'], {
    '1 PRÊMIO': 4200.0,
    '1/5 PRÊMIO': 840.0,
  });

  addTierRates(mirrored('DUQUE GP'), { '1/5 PRÊMIO': 20.0 });
  addTierRates(mirrored('TERNO GP'), { '1/5 PRÊMIO': 140.0 });
  addTierRates(mirrored('QUADRA GP'), { '1/5 PRÊMIO': 450.0 });
  addTierRates(mirrored('QUINA GP 8/5'), { '1/5 PRÊMIO': 900.0 });
  addTierRates(mirrored('SENA GP 10/6'), { '1/5 PRÊMIO': 1350.0 });

  addTierRates(['PASSE VAI', 'PASSE VAI VEM'], { '1/5 PRÊMIO': 24.0 });

  addTierRates(mirrored('DUQUE DEZ'), { '1/5 PRÊMIO': 320.0 });
  addTierRates(mirrored('TERNO DEZ'), { '1/5 PRÊMIO': 3200.0 });
  addTierRates(mirrored('TERNO DEZ SECO'), { '1/5 PRÊMIO': 6500.0 });

  addTierRates(['PALPITAO'], { '1 PRÊMIO': 1800.0 });

  // Filtramos regras nulas (caso algo dê errado no getRule)
  const validRules = payoutRulesData.filter(Boolean);

  await prisma.payoutRule.deleteMany({});

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
