// /src/context/NewBetProvider.jsx
import React, { useState } from 'react';
import { NewBetContext } from './NewBetContext';

export const NewBetProvider = ({ children }) => {
  const [betInProgress, setBetInProgress] = useState({});

  // Função para definir/atualizar a aposta em andamento
  const updateBet = (field, value, text) => {
    setBetInProgress(prevBet => ({
      ...prevBet,
      [field]: value, // ex: 'game_type_id': 1
      [`${field}_text`]: text, // ex: 'game_type_id_text': "TRADICIONAL"
    }));
  };

  // Função para limpar a aposta (quando for para o carrinho)
  const clearBet = () => {
    setBetInProgress({});
  };

  const value = {
    betInProgress,
    updateBet,
    clearBet,
  };

  return (
    <NewBetContext.Provider value={value}>
      {children}
    </NewBetContext.Provider>
  );
};