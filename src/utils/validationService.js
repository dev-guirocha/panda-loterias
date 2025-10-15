// /src/utils/validationService.js

// --- Funções Auxiliares de Validação ---

// Verifica se é uma string numérica de um tamanho exato
// Ex: "123" com len=3 -> true
// Ex: "12" com len=3 -> false
// Ex: "abc" com len=3 -> false
const isNumericString = (str, len) => {
    const regex = new RegExp(`^\\d{${len}}$`); // Ex: /^\d{3}$/
    return regex.test(str);
  };
  
  // Verifica se é um número de Grupo válido (1-25)
  const isGrupoValido = (groupStr) => {
    if (!/^\d+$/.test(groupStr)) return false; // Não é numérico
    const groupInt = parseInt(groupStr, 10);
    return groupInt >= 1 && groupInt <= 25;
  };
  
  // Verifica uma lista de grupos (ex: "10,15,20")
  const areGruposValidos = (groupsStr, count) => {
    const groups = groupsStr.split(',').map(g => g.trim());
    if (groups.length !== count) {
      return `deve conter ${count} grupos separados por vírgula.`;
    }
    if (!groups.every(isGrupoValido)) {
      return "contém um ou mais grupos inválidos (deve ser 1-25).";
    }
    return true;
  };
  
  // --- A Função Principal de Validação ---
  
  /**
   * Valida o campo 'numbers_betted' com base no tipo de aposta.
   * @param {string} betTypeName - O nome da aposta (ex: "GRUPO", "DUQUE GP")
   * @param {string} numbersBetted - O que o usuário digitou (ex: "15", "10,15")
   * @returns {true|string} - Retorna 'true' se for válido, ou uma 'string de erro' se for inválido.
   */
  function validateBet(betTypeName, numbersBetted) {
    if (!numbersBetted || numbersBetted.trim() === '') {
      return "O campo de números da aposta não pode estar vazio.";
    }
  
    // Usamos um switch para aplicar a regra de cada jogo
    switch (betTypeName) {
      case 'GRUPO':
        if (!isGrupoValido(numbersBetted)) {
          return "Aposta de Grupo deve ser um único número de 1 a 25 (ex: '15').";
        }
        break;
  
      case 'DEZENA':
        if (!isNumericString(numbersBetted, 2)) {
          return "Aposta de Dezena deve ser um número de 2 dígitos (ex: '05', '60').";
        }
        break;
  
      case 'CENTENA':
      case 'CENTENA INV':
        if (!isNumericString(numbersBetted, 3)) {
          return `Aposta de ${betTypeName} deve ser um número de 3 dígitos (ex: '123').`;
        }
        break;
  
      case 'MILHAR':
      case 'MILHAR INV':
      case 'MILHAR E CT': // Milhar e Centena usa a Milhar como base
        if (!isNumericString(numbersBetted, 4)) {
          return `Aposta de ${betTypeName} deve ser um número de 4 dígitos (ex: '4360').`;
        }
        break;
        
      case 'UNIDADE':
        if (!isNumericString(numbersBetted, 1)) {
          return "Aposta de Unidade deve ser um número de 1 dígito (ex: '7').";
        }
        break;
  
      // --- Validação de Combinações ---
  
      case 'DUQUE GP': {
        const result = areGruposValidos(numbersBetted, 2);
        if (result !== true) return `Duque de Grupo ${result}`;
        break;
      }
  
      case 'TERNO GP': {
        const result = areGruposValidos(numbersBetted, 3);
        if (result !== true) return `Terno de Grupo ${result}`;
        break;
      }
        
      case 'QUADRA GP': {
        const result = areGruposValidos(numbersBetted, 4);
        if (result !== true) return `Quadra de Grupo ${result}`;
        break;
      }
        
      case 'QUINA GP 8/5': {
        const result = areGruposValidos(numbersBetted, 5); // O seu gameLogic usa k=5
        if (result !== true) return `Quina de Grupo ${result}`;
        break;
      }
        
      // (Podemos adicionar DUQUE DEZ, TERNO DEZ, etc. depois, seguindo o mesmo padrão)
  
      default:
        // Se não reconhecermos o tipo, pulamos a validação por segurança
        // (Isso permite 'PALPITAO', etc. que não definimos)
        break;
    }
  
    // Se passou por tudo, a aposta é válida!
    return true;
  }
  
  module.exports = {
    validateBet,
  };