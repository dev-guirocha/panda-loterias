// /src/hooks/useBetSlip.js
import { useContext } from 'react';
import { BetSlipContext } from '../context/BetSlipContext'; // Importa o contexto do arquivo .js

// Este arquivo exporta apenas o hook
export const useBetSlip = () => {
  return useContext(BetSlipContext);
};