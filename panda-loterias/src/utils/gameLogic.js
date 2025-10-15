// --- Funções Auxiliares de Extração ---

/**
 * Retorna a Unidade (o último dígito) de um número.
 * Ex: "4360" -> "0"
 * @param {string} prizeNumber - O número do prêmio.
 * @returns {string|null} - A unidade.
 */
function getUnidade(prizeNumber) {
    if (!prizeNumber || prizeNumber.length < 1) {
      return null;
    }
    return prizeNumber.slice(-1);
  }
  
  
  /**
   * Retorna a Dezena (os dois últimos dígitos) de um número de 4 dígitos.
   * Ex: "4360" -> "60"
   * @param {string} prizeNumber - O número do prêmio (ex: "4360")
   * @returns {string|null} - A dezena (ex: "60")
   */
  function getDezena(prizeNumber) {
    if (!prizeNumber || prizeNumber.length < 2) {
      return null;
    }
    return prizeNumber.slice(-2); // Pega os 2 últimos caracteres
  }
  
  /**
   * Retorna o Grupo de um número de 4 dígitos, baseado na sua dezena.
   * Ex: "4360" -> Dezena 60 -> Grupo 15
   * Ex: "1200" -> Dezena 00 -> Grupo 25 (Bugre)
   * @param {string} prizeNumber - O número do prêmio (ex: "4360")
   * @returns {string|null} - O número do grupo (ex: "15")
   */
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
  
  /**
   * Retorna a Centena (os três últimos dígitos) de um número de 4 dígitos.
   * Ex: "4360" -> "360"
   * @param {string} prizeNumber - O número do prêmio (ex: "4360")
   * @returns {string|null} - A centena (ex: "360")
   */
  function getCentena(prizeNumber) {
    if (!prizeNumber || prizeNumber.length < 3) {
      return null;
    }
    return prizeNumber.slice(-3); // Pega os 3 últimos caracteres
  }
  
  /**
   * Retorna a Milhar (todos os 4 dígitos).
   * Ex: "4360" -> "4360"
   * @param {string} prizeNumber - O número do prêmio (ex: "4360")
   * @returns {string|null} - A milhar (ex: "4360")
   */
  function getMilhar(prizeNumber) {
    if (!prizeNumber || prizeNumber.length < 4) {
      return null;
    }
    return prizeNumber.slice(-4); // Pega os 4 últimos caracteres
  }
  
  
  // --- Funções Auxiliares de Lógica ---
  
  /**
   * Gera todas as permutações únicas dos caracteres de uma string.
   * Usado para apostas 'Invertidas'.
   * Ex: "123" -> ["123", "132", "213", "231", "312", "321"]
   * @param {string} str - A string para permutar.
   * @returns {string[]} - Um array de strings com todas as permutações.
   */
  function getPermutations(str) {
      if (str.length <= 1) return [str];
      let perms = [];
      for (let i = 0; i < str.length; i++) {
          const char = str[i];
          // Evita permutar o mesmo caractere mais de uma vez
          if (str.indexOf(char) !== i) continue;
          const remainingStr = str.slice(0, i) + str.slice(i + 1);
          for (let subPerm of getPermutations(remainingStr)) {
              perms.push(char + subPerm);
          }
      }
      return perms;
  }
  
  /**
   * Calcula o fatorial de um número.
   * @param {number} num - O número.
   * @returns {number} - O fatorial.
   */
  function factorial(num) {
    if (num < 0) return -1;
    else if (num === 0) return 1;
    else return (num * factorial(num - 1));
  }
  
  /**
   * Calcula o número de combinações (n escolhe k).
   * Usado para Duque, Terno, etc.
   * @param {number} n - O número total de itens.
   * @param {number} k - O número de itens a serem escolhidos.
   * @returns {number} - O número de combinações possíveis.
   */
  function combinations(n, k) {
    if (k > n || k < 0) {
      return 0;
    }
    return factorial(n) / (factorial(k) * factorial(n - k));
  }
  
  
  // --- A FUNÇÃO PRINCIPAL (CHECK-WIN) ---
  
  /**
   * Verifica se uma aposta é vencedora com base nos resultados.
   * @param {object} bet - O objeto da aposta.
   * @param {string} betTypeName - O nome do tipo de aposta (ex: "GRUPO", "DUQUE DEZ")
   * @param {object} prizeTier - O objeto do nível do prêmio (com start_prize e end_prize)
   * @param {array} prizeNumbers - Um array com os números sorteados.
   * @returns {number} - O número de "acertos" (hits).
   */
  function checkWin(bet, betTypeName, prizeTier, prizeNumbers) {
    const { numbers_betted } = bet;
    const { start_prize, end_prize } = prizeTier;
  
    if (!numbers_betted) return 0;
  
    const numbersToCheck = prizeNumbers.slice(start_prize - 1, end_prize);
  
    // --- LÓGICA DE APOSTA SIMPLES (Grupo, Dezena, etc.) ---
    if (['GRUPO', 'DEZENA', 'CENTENA', 'MILHAR', 'UNIDADE'].includes(betTypeName)) {
      let extractionFunc;
      switch (betTypeName) {
        case 'GRUPO':   extractionFunc = getGrupo; break;
        case 'DEZENA':  extractionFunc = getDezena; break;
        case 'CENTENA': extractionFunc = getCentena; break;
        case 'MILHAR':  extractionFunc = getMilhar; break;
        case 'UNIDADE': extractionFunc = getUnidade; break;
      }
      const extractedPrizes = numbersToCheck.map(num => extractionFunc(num));
      return extractedPrizes.filter(prize => prize === numbers_betted).length;
    }
  
    // --- LÓGICA DE APOSTA INVERTIDA (Centena Inv, Milhar Inv) ---
    if (['CENTENA INV', 'MILHAR INV'].includes(betTypeName)) {
      const betPermutations = getPermutations(numbers_betted);
      const extractionFunc = betTypeName === 'CENTENA INV' ? getCentena : getMilhar;
      const extractedPrizes = numbersToCheck.map(num => extractionFunc(num));
      return extractedPrizes.filter(prize => betPermutations.includes(prize)).length;
    }
  
    // --- LÓGICA DE APOSTA COMBINADA (Duque, Terno, etc.) ---
    const combinationTypes = {
      'DUQUE GP':   { k: 2, func: getGrupo },
      'TERNO GP':   { k: 3, func: getGrupo },
      'QUADRA GP':  { k: 4, func: getGrupo },
      'QUINA GP 8/5': { k: 5, func: getGrupo },
      'SENA GP 10/6': { k: 6, func: getGrupo },
      'DUQUE DEZ':  { k: 2, func: getDezena },
      'TERNO DEZ':  { k: 3, func: getDezena },
    };
  
    if (combinationTypes[betTypeName]) {
      const { k, func } = combinationTypes[betTypeName];
      const bettedItems = numbers_betted.split(',').map(item => item.trim());
      const drawnItems = [...new Set(numbersToCheck.map(num => func(num)))];
      const matches = bettedItems.filter(item => drawnItems.includes(item));
      return combinations(matches.length, k);
    }
  
    // --- LÓGICA DE APOSTAS ESPECIAIS ---
    switch (betTypeName) {
      case 'MILHAR E CT': {
        const drawnMilhares = numbersToCheck.map(getMilhar);
        const drawnCentenas = numbersToCheck.map(getCentena);
        const bettedMilhar = numbers_betted.length === 4 ? numbers_betted : null;
        const bettedCentena = numbers_betted.slice(-3);
        
        const milharHits = drawnMilhares.filter(m => m && m === bettedMilhar).length;
        const centenaHits = drawnCentenas.filter(c => c && c === bettedCentena).length;
        return milharHits + centenaHits;
      }
      
      case 'PASSE VAI VEM':
      case 'PASSE VAI': {
        const bettedGroups = numbers_betted.split(',').map(item => item.trim());
        if (bettedGroups.length !== 2) return 0;
  
        const firstPrizeGroup = getGrupo(prizeNumbers[0]);
        const otherPrizeGroups = prizeNumbers.slice(1, 5).map(getGrupo);
        const [g1, g2] = bettedGroups;
        
        const vaiWin = (firstPrizeGroup === g1 && otherPrizeGroups.includes(g2));
        const vemWin = (firstPrizeGroup === g2 && otherPrizeGroups.includes(g1));
  
        if (betTypeName === 'PASSE VAI VEM') {
          return (vaiWin || vemWin) ? 1 : 0;
        }
        return vaiWin ? 1 : 0;
      }
    }
  
    console.warn(`[gameLogic] Tipo de aposta não implementado: ${betTypeName}`);
    return 0;
  }
  
  
  // --- Exportamos as funções ---
  module.exports = {
    getUnidade,
    getDezena,
    getGrupo,
    getCentena,
    getMilhar,
    checkWin,
  };
  