// /src/utils/validationService.js

const toList = (input) => {
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  if (input === undefined || input === null) {
    return [];
  }
  return String(input)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const isNumericString = (str, len) => {
  const regex = new RegExp(`^\\d{${len}}$`);
  return regex.test(str);
};

const isGrupoValido = (groupStr) => {
  if (!/^\d+$/.test(groupStr)) return false;
  const groupInt = parseInt(groupStr, 10);
  return groupInt >= 1 && groupInt <= 25;
};

const areGruposValidos = (groupsInput, count) => {
  const groups = toList(groupsInput);
  if (groups.length !== count) {
    return `deve conter ${count} grupos separados por vírgula.`;
  }
  if (!groups.every(isGrupoValido)) {
    return 'contém um ou mais grupos inválidos (deve ser 1-25).';
  }
  return true;
};

const ensureSingleGrupo = (values, label) => {
  const first = values[0];
  if (values.length !== 1 || !isGrupoValido(first)) {
    return `${label} deve ser um único número de 1 a 25 (ex: '15').`;
  }
  return true;
};

const ensureSingleNumeric = (values, len, label) => {
  const first = values[0];
  if (values.length !== 1 || !isNumericString(first, len)) {
    return `${label} deve ser um número de ${len} dígitos.`;
  }
  return true;
};

const ensureNumericList = (values, len, count, label) => {
  if (values.length !== count) {
    return `${label} deve conter exatamente ${count} valores (${len} dígitos cada).`;
  }
  if (!values.every((item) => isNumericString(item, len))) {
    return `${label} deve conter apenas números de ${len} dígitos.`;
  }
  return true;
};

const ensureGrupoList = (values, count, label) => {
  const result = areGruposValidos(values, count);
  if (result !== true) {
    return `${label} ${result}`;
  }
  return true;
};

function validateBet(betTypeName, numbersBetted) {
  const type = (betTypeName || '').toUpperCase();
  const values = toList(numbersBetted);

  if (!values.length) {
    return 'O campo de números da aposta não pode estar vazio.';
  }

  // Tipos simples (um único valor)
  if (
    (type === 'GRUPO' || type === 'GRUPO ESQ' || type === 'GRUPO MEIO') ||
    (type.startsWith('GRUPO') && !type.includes('DUQUE') && !type.includes('TERNO') &&
      !type.includes('QUADRA') && !type.includes('QUINA') && !type.includes('SENA') &&
      !type.includes('PASSE'))
  ) {
    return ensureSingleGrupo(values, 'Aposta de Grupo');
  }

  if (type.startsWith('DEZENA') && !type.includes('DUQUE') && !type.includes('TERNO')) {
    return ensureSingleNumeric(values, 2, 'Aposta de Dezena');
  }

  if (type.startsWith('CENTENA INV')) {
    return ensureSingleNumeric(values, 3, 'Aposta de Centena Invertida');
  }

  if (type.startsWith('CENTENA')) {
    return ensureSingleNumeric(values, 3, 'Aposta de Centena');
  }

  if (type.startsWith('MILHAR INV')) {
    return ensureSingleNumeric(values, 4, 'Aposta de Milhar Invertida');
  }

  if (type.startsWith('MILHAR E CT')) {
    return ensureSingleNumeric(values, 4, 'Aposta de Milhar e Centena');
  }

  if (type.startsWith('MILHAR')) {
    return ensureSingleNumeric(values, 4, 'Aposta de Milhar');
  }

  if (type.startsWith('UNIDADE')) {
    return ensureSingleNumeric(values, 1, 'Aposta de Unidade');
  }

  // Combinações de grupo
  if (type.startsWith('DUQUE GP')) {
    return ensureGrupoList(values, 2, 'Duque de Grupo');
  }

  if (type.startsWith('TERNO GP')) {
    return ensureGrupoList(values, 3, 'Terno de Grupo');
  }

  if (type.startsWith('QUADRA GP')) {
    return ensureGrupoList(values, 4, 'Quadra de Grupo');
  }

  if (type.startsWith('QUINA GP')) {
    return ensureGrupoList(values, 5, 'Quina de Grupo');
  }

  if (type.startsWith('SENA GP')) {
    return ensureGrupoList(values, 6, 'Sena de Grupo');
  }

  if (type.startsWith('PASSE VAI')) {
    return ensureGrupoList(values, 2, 'Passe');
  }

  // Combinações de dezena
  if (type.startsWith('DUQUE DEZ')) {
    return ensureNumericList(values, 2, 2, 'Duque de Dezena');
  }

  if (type.startsWith('TERNO DEZ SECO')) {
    return ensureNumericList(values, 2, 3, 'Terno de Dezena Seco');
  }

  if (type.startsWith('TERNO DEZ')) {
    return ensureNumericList(values, 2, 3, 'Terno de Dezena');
  }

  // Outros tipos ainda sem validação específica (ex: PALPITAO)
  return true;
}

module.exports = {
  validateBet,
};
