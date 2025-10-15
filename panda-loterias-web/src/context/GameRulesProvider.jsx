// /src/context/GameRulesProvider.jsx
import React, { useState, useEffect } from 'react';
import { GameRulesContext } from './GameRulesContext';
import api from '../api/api';

export const GameRulesProvider = ({ children }) => {
  const [rules, setRules] = useState({
    schedules: [],
    betTypes: [],
    prizeTiers: [],
    payoutRules: [],
    gameTypes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Este useEffect() roda UMA VEZ quando o app carrega
  useEffect(() => {
    api.get('/game/rules')
      .then(res => {
        setRules(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erro crítico ao carregar regras do jogo:", err);
        setError(err);
        setIsLoading(false);
      });
  }, []); // [] = Rode apenas uma vez!

  const value = {
    rules,
    isLoading,
    error,
  };

  return (
    <GameRulesContext.Provider value={value}>
      {children}
    </GameRulesContext.Provider>
  );
};