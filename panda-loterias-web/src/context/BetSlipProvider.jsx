// /src/context/BetSlipProvider.jsx
import React, { useState } from 'react';
// 1. Importamos o CONTEXTO do arquivo .js
import { BetSlipContext } from './BetSlipContext';

// 2. Este arquivo .jsx exporta APENAS o Componente Provedor
export const BetSlipProvider = ({ children }) => {
  const [bets, setBets] = useState([]); // O "carrinho"

  // Adiciona uma aposta ao carrinho
  const addBet = (bet) => {
    setBets((prevBets) => [...prevBets, { ...bet, id: Date.now() }]);
  };

  // Remove uma aposta do carrinho
  const removeBet = (betId) => {
    setBets((prevBets) => prevBets.filter(b => b.id !== betId));
  };

  // Limpa o carrinho
  const clearSlip = () => {
    setBets([]);
  };

  const value = {
    bets,
    addBet,
    removeBet,
    clearSlip,
    betCount: bets.length,
  };

  return <BetSlipContext.Provider value={value}>{children}</BetSlipContext.Provider>;
};