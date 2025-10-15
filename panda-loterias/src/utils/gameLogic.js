// /src/utils/gameLogic.js

// --- Funções Auxiliares de Extração ---

function getUnidade(prizeNumber) {
  if (!prizeNumber || prizeNumber.length < 1) {
    return null;
  }
  return prizeNumber.slice(-1);
}

function getDezena(prizeNumber) {
  if (!prizeNumber || prizeNumber.length < 2) {
    return null;
  }
  return prizeNumber.slice(-2);
}

function getGrupo(prizeNumber) {
  const dezenaStr = getDezena(prizeNumber);
  if (dezenaStr === null) {
    return null;
  }

  if (dezenaStr === '00') {
    return '25';
  }

  const dezenaInt = parseInt(dezenaStr, 10);
  const grupo = Math.ceil(dezenaInt / 4);

  return String(grupo);
}

function getCentena(prizeNumber) {
  if (!prizeNumber || prizeNumber.length < 3) {
    return null;
  }
  return prizeNumber.slice(-3);
}

function getMilhar(prizeNumber) {
  if (!prizeNumber || prizeNumber.length < 4) {
    return null;
  }
  return prizeNumber.slice(-4);
}

// --- Funções Auxiliares de Lógica ---

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (value === undefined || value === null) {
    return [];
  }
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

function getPermutations(str) {
  if (str.length <= 1) return [str];
  const perms = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (str.indexOf(char) !== i) continue;
    const remainingStr = str.slice(0, i) + str.slice(i + 1);
    for (const subPerm of getPermutations(remainingStr)) {
      perms.push(char + subPerm);
    }
  }
  return perms;
}

function factorial(num) {
  if (num < 0) return -1;
  if (num === 0) return 1;
  return num * factorial(num - 1);
}

function combinations(n, k) {
  if (k > n || k < 0) {
    return 0;
  }
  return factorial(n) / (factorial(k) * factorial(n - k));
}

// --- A FUNÇÃO PRINCIPAL (CHECK-WIN) ---

function checkWin(bet, betTypeName, prizeTier, prizeNumbers) {
  const normalizedType = (betTypeName || '').toUpperCase();
  const values = toArray(bet.numbers_betted);
  if (!values.length) return 0;

  const primaryValue = values[0] || '';
  const { start_prize, end_prize } = prizeTier;
  const numbersToCheck = prizeNumbers.slice(start_prize - 1, end_prize);

  const simpleTypes = ['GRUPO', 'GRUPO ESQ', 'GRUPO MEIO', 'DEZENA', 'DEZENA ESQ', 'DEZENA MEIO', 'CENTENA', 'CENTENA 3X', 'CENTENA ESQUERDA', 'MILHAR', 'UNIDADE'];

  if (simpleTypes.includes(normalizedType) || (normalizedType.startsWith('GRUPO') && !normalizedType.includes('DUQUE') && !normalizedType.includes('TERNO') && !normalizedType.includes('QUADRA') && !normalizedType.includes('QUINA') && !normalizedType.includes('SENA') && !normalizedType.includes('PASSE'))) {
    let extractionFunc;
    if (normalizedType.startsWith('GRUPO')) extractionFunc = getGrupo;
    else if (normalizedType.startsWith('DEZENA')) extractionFunc = getDezena;
    else if (normalizedType.startsWith('CENTENA')) extractionFunc = getCentena;
    else if (normalizedType.startsWith('MILHAR')) extractionFunc = getMilhar;
    else extractionFunc = getUnidade;

    const extracted = numbersToCheck.map((num) => extractionFunc(num));
    return extracted.filter((prize) => prize === primaryValue).length;
  }

  if (normalizedType.startsWith('CENTENA INV')) {
    const permutations = getPermutations(primaryValue);
    const extracted = numbersToCheck.map((num) => getCentena(num));
    return extracted.filter((prize) => permutations.includes(prize)).length;
  }

  if (normalizedType.startsWith('MILHAR INV')) {
    const permutations = getPermutations(primaryValue);
    const extracted = numbersToCheck.map((num) => getMilhar(num));
    return extracted.filter((prize) => permutations.includes(prize)).length;
  }

  if (normalizedType.startsWith('MILHAR E CT')) {
    const bettedMilhar = primaryValue.length === 4 ? primaryValue : null;
    const bettedCentena = primaryValue.slice(-3);
    const milhares = numbersToCheck.map(getMilhar);
    const centenas = numbersToCheck.map(getCentena);
    const milharHits = milhares.filter((value) => value && value === bettedMilhar).length;
    const centenaHits = centenas.filter((value) => value && value === bettedCentena).length;
    return milharHits + centenaHits;
  }

  const groupCombinations = [
    { match: (type) => type.startsWith('DUQUE GP'), k: 2 },
    { match: (type) => type.startsWith('TERNO GP'), k: 3 },
    { match: (type) => type.startsWith('QUADRA GP'), k: 4 },
    { match: (type) => type.startsWith('QUINA GP'), k: 5 },
    { match: (type) => type.startsWith('SENA GP'), k: 6 },
  ];

  const grupoCombo = groupCombinations.find((combo) => combo.match(normalizedType));
  if (grupoCombo) {
    const { k } = grupoCombo;
    const bettedItems = values;
    const drawnItems = [...new Set(numbersToCheck.map((num) => getGrupo(num)))];
    const matches = bettedItems.filter((item) => drawnItems.includes(item));
    return combinations(matches.length, k);
  }

  const dezenaCombinations = [
    { match: (type) => type.startsWith('DUQUE DEZ'), k: 2 },
    { match: (type) => type.startsWith('TERNO DEZ'), k: 3 },
  ];

  const dezenaCombo = dezenaCombinations.find((combo) => combo.match(normalizedType));
  if (dezenaCombo) {
    const { k } = dezenaCombo;
    const bettedItems = values;
    const drawnItems = [...new Set(numbersToCheck.map((num) => getDezena(num)))];
    const matches = bettedItems.filter((item) => drawnItems.includes(item));
    return combinations(matches.length, k);
  }

  if (normalizedType.startsWith('PASSE VAI')) {
    if (values.length !== 2) return 0;
    const firstPrizeGroup = getGrupo(prizeNumbers[0]);
    const otherGroups = prizeNumbers.slice(1, 5).map(getGrupo);
    const [g1, g2] = values;
    const vaiWin = firstPrizeGroup === g1 && otherGroups.includes(g2);
    const vemWin = firstPrizeGroup === g2 && otherGroups.includes(g1);
    if (normalizedType === 'PASSE VAI VEM') {
      return vaiWin || vemWin ? 1 : 0;
    }
    return vaiWin ? 1 : 0;
  }

  console.warn(`[gameLogic] Tipo de aposta não implementado: ${betTypeName}`);
  return 0;
}

module.exports = {
  getUnidade,
  getDezena,
  getGrupo,
  getCentena,
  getMilhar,
  checkWin,
};
