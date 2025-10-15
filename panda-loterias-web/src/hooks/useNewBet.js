// /src/hooks/useNewBet.js
import { useContext } from 'react';
import { NewBetContext } from '../context/NewBetContext';
// Exporta apenas o hook
export const useNewBet = () => {
  return useContext(NewBetContext);
};