// /src/hooks/useGameRules.js
import { useContext } from 'react';
import { GameRulesContext } from '../context/GameRulesContext';
export const useGameRules = () => {
  return useContext(GameRulesContext);
};